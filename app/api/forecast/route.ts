/**
 * POST /api/forecast
 * AI-powered grain price forecasting for farmers.
 *
 * CACHING STRATEGY (saves Gemini quota):
 * ─────────────────────────────────────────────────────────────
 * 1. On request, check Neon DB for today's cached forecast (IST date)
 * 2. If cache HIT → return instantly (zero API cost)
 * 3. If cache MISS → call Gemini → store in DB → return
 * 4. Cache auto-expires at midnight IST (uses IST date as key)
 * 5. Next day: first request triggers fresh Gemini call, then cached
 *
 * Request:  { crop_name: string, variety?: string, region?: string }
 * Response: ForecastResponse
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getDb } from '@/lib/db';

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface ForecastFactor {
  label: string;
  label_hi: string;
  value: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  icon: string;
  detail: string;
}

export interface ForecastResponse {
  crop_name: string;
  variety: string | null;
  region: string;
  current_price_range: { min: number; max: number; unit: string };
  forecast_7d: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  forecast_30d: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  forecast_90d: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  confidence: number;
  factors: ForecastFactor[];
  recommendation: string;
  recommendation_hi: string;
  best_sell_window: string;
  best_sell_window_hi: string;
  source: string;
  cached?: boolean;
  cached_at?: string;
}

/* ── IST date helper ───────────────────────────────────────────────────────── */

function getTodayIST(): string {
  // Get current date in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5h 30m in ms
  const ist = new Date(now.getTime() + istOffset);
  return ist.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

/* ── DB Cache Layer ────────────────────────────────────────────────────────── */

async function getCachedForecast(crop: string): Promise<ForecastResponse | null> {
  try {
    const sql = getDb();
    const todayIST = getTodayIST();

    const rows = await sql`
      SELECT data, created_at
      FROM forecast_cache
      WHERE crop_name = ${crop}
        AND forecast_date = ${todayIST}::date
      LIMIT 1
    `;

    if (rows.length > 0) {
      const data = rows[0].data as ForecastResponse;
      return {
        ...data,
        cached: true,
        cached_at: rows[0].created_at,
        source: data.source + ' (cached)',
      };
    }
    return null;
  } catch (err) {
    console.warn('[Forecast] Cache read failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function storeForecast(crop: string, data: ForecastResponse): Promise<void> {
  try {
    const sql = getDb();
    const todayIST = getTodayIST();

    await sql`
      INSERT INTO forecast_cache (crop_name, forecast_date, data)
      VALUES (${crop}, ${todayIST}::date, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (crop_name, forecast_date)
      DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, created_at = NOW()
    `;
    console.log(`[Forecast] Cached ${crop} for ${todayIST}`);
  } catch (err) {
    console.warn('[Forecast] Cache write failed:', err instanceof Error ? err.message : err);
  }
}

/* ── Prompt ─────────────────────────────────────────────────────────────────── */

const FORECAST_PROMPT = `You are AgriConnect's market intelligence AI for Indian agriculture.
Given a crop name (and optional variety/region), provide a comprehensive price forecast.

ANALYZE these factors and include ALL of them in "factors" array:
1. CURRENT PRODUCTION — India's current season output for this crop (Kharif/Rabi/Zaid). Estimate volume.
2. HISTORICAL TREND — 3-year price pattern for this crop. Is it cyclically high/low right now?
3. GLOBAL MARKET IMPACT — How international commodity prices, export bans, tariffs affect Indian prices.
4. GLOBAL PRODUCTION — Major producing countries' output this season (e.g. wheat: Russia, Ukraine, USA, Australia).
5. CURRENT DEMAND — Domestic consumption, festival/wedding season demand, industrial use.
6. DEMAND TREND — Is demand growing, shrinking, or seasonal? Government procurement (MSP)?
7. NEXT HARVEST — When is the next harvest arriving? Will fresh supply push prices down?
8. WEATHER & CLIMATE — Monsoon forecast, drought/flood risk affecting supply.
9. GOVERNMENT POLICY — MSP changes, export restrictions, buffer stock releases.
10. STORAGE & LOGISTICS — Cold storage availability, transport costs, wastage rates.

INDIAN CROP REFERENCE PRICES (approximate ₹/kg, mid-2026):
Wheat: ₹22-28 | Rice: ₹30-42 | Maize: ₹18-24 | Barley: ₹18-22
Onion: ₹15-45 | Tomato: ₹20-60 | Potato: ₹12-25
Soybean: ₹38-52 | Mustard: ₹45-60 | Cotton: ₹55-70
Sugarcane: ₹3-4 | Turmeric: ₹80-150 | Chili: ₹100-200

Return ONLY valid JSON (no markdown, no wrapping):
{
  "crop_name": "Wheat",
  "variety": "Sharbati",
  "region": "Madhya Pradesh",
  "current_price_range": { "min": 22, "max": 26, "unit": "₹/kg" },
  "forecast_7d": { "min": 22, "max": 27, "trend": "up" },
  "forecast_30d": { "min": 24, "max": 29, "trend": "up" },
  "forecast_90d": { "min": 21, "max": 25, "trend": "down" },
  "confidence": 0.78,
  "factors": [
    {
      "label": "Current Production",
      "label_hi": "वर्तमान उत्पादन",
      "value": "112 MT estimated this Rabi season",
      "impact": "bearish",
      "icon": "🌾",
      "detail": "Record production expected, putting downward pressure on prices"
    },
    {
      "label": "Historical Trend",
      "label_hi": "ऐतिहासिक रुझान",
      "value": "Prices peaked in March, now correcting",
      "impact": "bearish",
      "icon": "📊",
      "detail": "Wheat typically drops 10-15% post-harvest in April-May"
    }
  ],
  "recommendation": "Consider selling 60% now and holding 40% for July when prices typically recover.",
  "recommendation_hi": "अभी 60% बेचें और 40% जुलाई तक रखें — दाम बढ़ने की संभावना है।",
  "best_sell_window": "Late June - Early July 2026",
  "best_sell_window_hi": "जून अंत - जुलाई शुरू 2026"
}

RULES:
1. Output ONLY the JSON object. No markdown fences, no text.
2. ALL prices must be in ₹ per KG (not per quintal).
3. Include 7-10 factors covering ALL the categories listed above.
4. Each factor must have impact as "bullish" (price up), "bearish" (price down), or "neutral".
5. confidence must be between 0.5 and 0.95.
6. recommendation_hi must be in Hindi (Devanagari).
7. Be realistic with Indian agricultural market data for 2026.
8. forecast trends: "up" if min increases, "down" if max decreases, "stable" if range stays similar.`;

/* ── Gemini Keys (all 5 in round-robin) ────────────────────────────────────── */

const GEMINI_KEYS: string[] = [
  process.env.GEMINI_API_KEY_1 ?? '',
  process.env.GEMINI_API_KEY_2 ?? '',
  process.env.GEMINI_API_KEY_3 ?? '',
  process.env.GEMINI_API_KEY_4 ?? '',
  process.env.GEMINI_API_KEY_5 ?? '',
].filter(k => k.length > 0 && k !== 'placeholder');

let currentKeyIndex = 0;

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

/* ── Try Gemini ────────────────────────────────────────────────────────────── */

async function tryGeminiForecast(crop: string, variety?: string, region?: string): Promise<ForecastResponse | null> {
  const userPrompt = `Forecast prices for: ${crop}${variety ? ` (variety: ${variety})` : ''}${region ? `, region: ${region}` : ', region: India (general)'}. Current date: ${getTodayIST()}.`;

  // Try multiple models per key — each model has its own quota
  const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-8b', 'gemini-1.5-flash'];

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const keyIndex = (currentKeyIndex + i) % GEMINI_KEYS.length;
    const key = GEMINI_KEYS[keyIndex];

    for (const modelName of MODELS) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: FORECAST_PROMPT,
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 1500,
            temperature: 0.3,
          },
        });

        currentKeyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
        const raw = result.response.text();
        const cleaned = stripJsonFences(raw);
        const parsed = JSON.parse(cleaned) as ForecastResponse;
        console.log(`[Forecast] ✅ Success with key ${keyIndex + 1}, model ${modelName}`);
        return { ...parsed, source: `gemini-${keyIndex + 1}` };

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const status = (err as { status?: number }).status;
        console.warn(`[Forecast] Key ${keyIndex + 1}/${modelName} FAILED (${status}): ${msg.slice(0, 150)}`);
        continue;
      }
    }
  }
  return null;
}

/* ── Try Groq ──────────────────────────────────────────────────────────────── */

async function tryGroqForecast(crop: string, variety?: string, region?: string): Promise<ForecastResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'placeholder') return null;

  const userPrompt = `Forecast prices for: ${crop}${variety ? ` (variety: ${variety})` : ''}${region ? `, region: ${region}` : ', region: India (general)'}. Current date: ${getTodayIST()}.`;

  try {
    const groq = new Groq({ apiKey });
    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: FORECAST_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.3,
    });

    const raw = chat.choices[0]?.message?.content ?? '';
    const cleaned = stripJsonFences(raw);
    const parsed = JSON.parse(cleaned) as ForecastResponse;
    return { ...parsed, source: 'groq' };

  } catch (err: unknown) {
    console.warn('[Forecast] Groq failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

/* ── Smart Analysis fallback (pre-computed) ────────────────────────────────── */

import { CROP_DATA, getGenericCropData } from '@/lib/data/cropForecasts';

function offlineForecast(crop: string, variety?: string): ForecastResponse {
  const data = CROP_DATA[crop] || getGenericCropData(crop);

  return {
    crop_name: crop,
    variety: variety || null,
    region: 'India',
    current_price_range: { min: data.min, max: data.max, unit: '₹/kg' },
    forecast_7d: data.f7,
    forecast_30d: data.f30,
    forecast_90d: data.f90,
    confidence: data.confidence,
    factors: data.factors,
    recommendation: data.recommendation,
    recommendation_hi: data.recommendation_hi,
    best_sell_window: data.best_sell_window,
    best_sell_window_hi: data.best_sell_window_hi,
    source: 'smart-analysis',
  };
}

/* ── API Handler ───────────────────────────────────────────────────────────── */

export async function POST(req: Request) {
  try {
    const body = await req.json() as { crop_name?: string; variety?: string; region?: string };

    if (!body.crop_name?.trim()) {
      return Response.json({ error: 'crop_name is required' }, { status: 400 });
    }

    const crop = body.crop_name.trim();
    const variety = body.variety?.trim();
    const region = body.region?.trim();

    // ── Step 1: Check DB cache (same crop + today IST) ────────────────────
    const cached = await getCachedForecast(crop);
    if (cached) {
      console.log(`[Forecast] Cache HIT for ${crop} (${getTodayIST()})`);
      return Response.json(cached);
    }
    console.log(`[Forecast] Cache MISS for ${crop} — calling AI...`);

    // ── Step 2: Fresh AI forecast ─────────────────────────────────────────
    // Try Gemini first
    const geminiResult = await tryGeminiForecast(crop, variety, region);
    if (geminiResult) {
      await storeForecast(crop, geminiResult); // cache for rest of day
      return Response.json(geminiResult);
    }

    // Try Groq
    const groqResult = await tryGroqForecast(crop, variety, region);
    if (groqResult) {
      await storeForecast(crop, groqResult); // cache for rest of day
      return Response.json(groqResult);
    }

    // Offline fallback (don't cache — not AI-generated)
    return Response.json(offlineForecast(crop, variety));

  } catch (err: unknown) {
    console.error('[Forecast API] Error:', err instanceof Error ? err.message : err);
    return Response.json(
      { error: 'Forecast generation failed. Try again.' },
      { status: 500 }
    );
  }
}
