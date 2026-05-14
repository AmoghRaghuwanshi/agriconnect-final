import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { getSoilData } from '@/lib/services/gis/soilService';
import { getWeatherData } from '@/lib/services/gis/weatherService';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { fieldId, crop, refresh } = await request.json();
    if (!fieldId) return NextResponse.json({ error: 'fieldId required' }, { status: 400 });

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("No database URL");
    const sql = neon(databaseUrl);

    // 1. Fetch field
    const fieldRows = await sql`SELECT * FROM fields WHERE id = ${fieldId}`;
    if (fieldRows.length === 0) return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    const field = fieldRows[0];
    const selectedCrop = crop || 'Wheat';

    // 2. Ensure cache table exists
    await sql`CREATE TABLE IF NOT EXISTS field_calendars (
      id VARCHAR(50) PRIMARY KEY,
      field_id VARCHAR(50),
      crop VARCHAR(100),
      calendar JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;

    // 3. Check cache (unless refresh requested)
    if (!refresh) {
      const cached = await sql`SELECT * FROM field_calendars WHERE field_id = ${fieldId} AND crop = ${selectedCrop} ORDER BY created_at DESC LIMIT 1`;
      if (cached.length > 0) {
        console.log(`[Calendar] ✅ Serving cached calendar for ${fieldId}/${selectedCrop}`);
        return NextResponse.json({
          success: true, cached: true, cachedAt: cached[0].created_at,
          calendar: cached[0].calendar, field,
        });
      }
    }

    const lat = Number(field.center_lat);
    const lng = Number(field.center_lng);

    // 4. Fetch live data
    const [soil, weather] = await Promise.all([
      getSoilData(lat, lng),
      getWeatherData(lat, lng)
    ]);

    const today = new Date().toISOString().split('T')[0];

    // 3. Build prompt
    const prompt = `You are an expert Indian agronomist. Generate a detailed crop calendar for the following field and crop.

TODAY'S DATE: ${today}

FIELD:
Name: ${field.name}
Area: ${field.area_ha} hectares
Location: ${lat}, ${lng}

SOIL:
pH: ${soil.pH}, Nitrogen: ${soil.nitrogen_gkg} g/kg, OC: ${soil.organicCarbon_gkg} g/kg
Clay/Sand/Silt: ${soil.clay_pct}%/${soil.sand_pct}%/${soil.silt_pct}%

WEATHER (14-day):
Max Temp: ${weather.maxTempNextWeek}°C, Rainfall: ${weather.totalRainfallNext14Days}mm
Humidity: ${weather.avgHumidity}%, Drought Risk: ${weather.droughtRisk}

CROP: ${selectedCrop}

Generate a JSON response with this EXACT structure:
{
  "crop": "Wheat",
  "variety": "HD-2967 / Sharbati",
  "totalDurationDays": 150,
  "sowingWindow": "Nov 10 - Nov 25",
  "harvestWindow": "Apr 5 - Apr 20",
  "phases": [
    {
      "name": "Land Preparation",
      "startDay": 0,
      "endDay": 7,
      "startDate": "2026-11-10",
      "endDate": "2026-11-17",
      "color": "#8b5cf6",
      "tasks": [
        {"date": "2026-11-10", "task": "Deep ploughing with MB plough", "type": "tillage", "icon": "🚜"},
        {"date": "2026-11-12", "task": "Apply 2-3 tonnes FYM per hectare", "type": "fertilizer", "icon": "🧪"},
        {"date": "2026-11-15", "task": "Level field with laser leveller", "type": "tillage", "icon": "🚜"}
      ]
    },
    {
      "name": "Sowing",
      "startDay": 7,
      "endDay": 10,
      "startDate": "2026-11-17",
      "endDate": "2026-11-20",
      "color": "#22c55e",
      "tasks": [
        {"date": "2026-11-17", "task": "Seed treatment with Vitavax Power at 2g/kg", "type": "seed", "icon": "🌱"},
        {"date": "2026-11-18", "task": "Sow at 100 kg/ha, row spacing 20cm", "type": "sowing", "icon": "🌾"},
        {"date": "2026-11-18", "task": "Apply 50kg DAP + 25kg MOP per hectare as basal", "type": "fertilizer", "icon": "🧪"}
      ]
    },
    {
      "name": "Germination & Early Growth",
      "startDay": 10,
      "endDay": 25,
      "startDate": "2026-11-20",
      "endDate": "2026-12-05",
      "color": "#10b981",
      "tasks": [
        {"date": "2026-11-25", "task": "First light irrigation if no rain", "type": "irrigation", "icon": "💧"},
        {"date": "2026-12-01", "task": "Weed control with Sulfosulfuron 75% WG", "type": "pest", "icon": "🐛"}
      ]
    },
    {
      "name": "Crown Root Initiation (CRI)",
      "startDay": 21,
      "endDay": 28,
      "startDate": "2026-12-01",
      "endDate": "2026-12-08",
      "color": "#3b82f6",
      "tasks": [
        {"date": "2026-12-05", "task": "CRITICAL irrigation at CRI stage (6cm depth)", "type": "irrigation", "icon": "💧"},
        {"date": "2026-12-07", "task": "First top dress: 30kg Urea per hectare", "type": "fertilizer", "icon": "🧪"}
      ]
    },
    {
      "name": "Tillering",
      "startDay": 28,
      "endDay": 55,
      "startDate": "2026-12-08",
      "endDate": "2027-01-04",
      "color": "#06b6d4",
      "tasks": [
        {"date": "2026-12-20", "task": "Second irrigation", "type": "irrigation", "icon": "💧"},
        {"date": "2026-12-25", "task": "Second top dress: 25kg Urea per hectare", "type": "fertilizer", "icon": "🧪"},
        {"date": "2027-01-01", "task": "Scout for aphids. Spray Imidacloprid if found", "type": "pest", "icon": "🐛"}
      ]
    },
    {
      "name": "Jointing & Booting",
      "startDay": 55,
      "endDay": 85,
      "startDate": "2027-01-04",
      "endDate": "2027-02-03",
      "color": "#f59e0b",
      "tasks": [
        {"date": "2027-01-10", "task": "Third irrigation", "type": "irrigation", "icon": "💧"},
        {"date": "2027-01-20", "task": "Spray Propiconazole for yellow rust prevention", "type": "pest", "icon": "🐛"},
        {"date": "2027-01-30", "task": "Fourth irrigation", "type": "irrigation", "icon": "💧"}
      ]
    },
    {
      "name": "Flowering & Grain Filling",
      "startDay": 85,
      "endDay": 120,
      "startDate": "2027-02-03",
      "endDate": "2027-03-10",
      "color": "#ef4444",
      "tasks": [
        {"date": "2027-02-10", "task": "Fifth irrigation (critical for grain filling)", "type": "irrigation", "icon": "💧"},
        {"date": "2027-02-20", "task": "Spray micronutrient mix (Zn + Fe)", "type": "fertilizer", "icon": "🧪"},
        {"date": "2027-03-01", "task": "Sixth irrigation if no rain", "type": "irrigation", "icon": "💧"}
      ]
    },
    {
      "name": "Maturity & Harvest",
      "startDay": 120,
      "endDay": 150,
      "startDate": "2027-03-10",
      "endDate": "2027-04-09",
      "color": "#d97706",
      "tasks": [
        {"date": "2027-03-15", "task": "Stop irrigation. Let crop dry naturally", "type": "irrigation", "icon": "💧"},
        {"date": "2027-04-01", "task": "Check grain moisture (<14%). Ready for harvest", "type": "harvest", "icon": "🌾"},
        {"date": "2027-04-05", "task": "Harvest with combine harvester", "type": "harvest", "icon": "🚜"},
        {"date": "2027-04-09", "task": "Thresh, clean, and store in dry place", "type": "harvest", "icon": "📦"}
      ]
    }
  ],
  "summaryHindi": "गेहूं की बुवाई नवंबर में करें। बुवाई से पहले 50 किलो DAP और 25 किलो MOP डालें। 21 दिन पर पहली सिंचाई करें। कुल 6 सिंचाई की जरूरत है। यूरिया को 2 बार में डालें। अप्रैल में फसल तैयार हो जाएगी।",
  "totalIrrigations": 6,
  "totalFertilizerApplications": 4,
  "estimatedCostPerHa": "₹18,000 - ₹22,000",
  "expectedYield": "42-50 qtl/ha"
}

IMPORTANT: Use realistic dates based on today's date and the crop's natural season. If the crop is Rabi (wheat, mustard, chickpea), start from Nov. If Kharif (rice, soybean, cotton), start from June. Adjust based on the location's latitude.`;

    // 4. Call Gemini with rotation
    const GEMINI_KEYS = [
      process.env.GEMINI_API_KEY_1 ?? '',
      process.env.GEMINI_API_KEY_2 ?? '',
      process.env.GEMINI_API_KEY_3 ?? '',
      process.env.GEMINI_API_KEY_4 ?? '',
      process.env.GEMINI_API_KEY_5 ?? '',
    ].filter(k => k.length > 0 && k !== 'placeholder');

    if (GEMINI_KEYS.length === 0) throw new Error("No Gemini keys found");
    const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

    let calendarJson = null;
    let success = false;

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const key = GEMINI_KEYS[i];
      for (const modelName of MODELS) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await model.generateContent(prompt);
          calendarJson = JSON.parse(result.response.text());
          success = true;
          console.log(`[Calendar] ✅ Success with key ${i + 1}, model ${modelName}`);
          break;
        } catch (err: any) {
          console.warn(`[Calendar] ⚠️ Failed with key ${i + 1}, model ${modelName}:`, err.message);
        }
      }
      if (success) break;
    }

    if (!success || !calendarJson) throw new Error("All Gemini keys failed.");

    // 6. Cache the result
    try {
      const calId = `C${Date.now().toString(36).toUpperCase()}`;
      await sql`INSERT INTO field_calendars (id, field_id, crop, calendar) VALUES (${calId}, ${fieldId}, ${selectedCrop}, ${JSON.stringify(calendarJson)})`;
      console.log(`[Calendar] 💾 Cached calendar ${calId} for ${fieldId}/${selectedCrop}`);
    } catch (cacheErr) {
      console.warn('[Calendar] ⚠️ Cache write failed:', cacheErr);
    }

    return NextResponse.json({ success: true, cached: false, calendar: calendarJson, field });

  } catch (error) {
    console.error("Calendar Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
