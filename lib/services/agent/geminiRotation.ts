/**
 * Gemini rotation + Groq fallback + rule-based fallback chain.
 * Tries 3 Gemini keys in round-robin, then Groq, then local regex.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { AGENT_SYSTEM_PROMPT, type AgentResponse } from '@/lib/constants/agentPrompt';
import { ruleBasedIntent } from './ruleBasedFallback';

// ── Gemini Keys (server-side only) ─────────────────────────────────────────
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

// ── Try Gemini (round-robin) ───────────────────────────────────────────────
async function tryGemini(transcript: string): Promise<(AgentResponse & { source: string }) | null> {
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const keyIndex = (currentKeyIndex + i) % GEMINI_KEYS.length;
    const key = GEMINI_KEYS[keyIndex];

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: transcript }] }],
        systemInstruction: AGENT_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 300,
          temperature: 0.1,
        },
      });

      currentKeyIndex = (keyIndex + 1) % GEMINI_KEYS.length;
      const raw = result.response.text();
      const cleaned = stripJsonFences(raw);
      const parsed = JSON.parse(cleaned) as AgentResponse;
      return { ...parsed, source: `gemini-${keyIndex + 1}` };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number }).status;

      if (status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        console.warn(`[Agent] Gemini key ${keyIndex + 1} rate limited — trying next`);
        continue;
      }
      console.error(`[Agent] Gemini key ${keyIndex + 1} error:`, msg);
      continue;
    }
  }
  return null;
}

// ── Try Groq ───────────────────────────────────────────────────────────────
async function tryGroq(transcript: string): Promise<(AgentResponse & { source: string }) | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'placeholder') return null;

  try {
    const groq = new Groq({ apiKey });
    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: AGENT_SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.1,
    });

    const raw = chat.choices[0]?.message?.content ?? '';
    const cleaned = stripJsonFences(raw);
    const parsed = JSON.parse(cleaned) as AgentResponse;
    return { ...parsed, source: 'groq' };

  } catch (err: unknown) {
    console.warn('[Agent] Groq failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ── Rule-based fallback (always works, 0 API cost) ────────────────────────
function tryRuleBased(transcript: string): AgentResponse & { source: string } {
  const result = ruleBasedIntent(transcript);
  return {
    intent: result.intent,
    confidence: result.confidence,
    params: result.params as AgentResponse['params'],
    response_hi: getResponseHi(result.intent, result.params),
    source: 'rule-based',
  };
}

function getResponseHi(intent: string, params: Record<string, unknown>): string {
  const crop = (params.crop_name as string) || '';
  const variety = (params.variety as string) || '';
  const qty = params.quantity_kg as number | undefined;
  const price = params.price_per_kg as number | undefined;

  const cropLabel = variety ? `${variety} ${crop}` : crop;

  switch (intent) {
    case 'CREATE_LISTING':
      if (crop && qty && price) return `${qty} किलो ${cropLabel}, ₹${price}/किलो — listing बना रही हूं।`;
      if (crop) return `${cropLabel} की listing बनाते हैं। quantity और price बताइए।`;
      return 'Listing बनाते हैं। Crop, variety, quantity, और price बताइए।';
    case 'CHECK_MANDI_PRICE':
      return crop ? `${cropLabel} का mandi भाव दिखा रही हूं।` : 'Mandi भाव दिखा रही हूं।';
    case 'PRICE_FORECAST':
      return crop ? `${cropLabel} का price forecast दिखा रही हूं — आगे क्या भाव होगा।` : 'Price forecast दिखा रही हूं।';
    case 'CHECK_WEATHER':
      return 'मौसम की जानकारी दिखा रही हूं — खेती के लिए सलाह भी मिलेगी।';
    case 'NAVIGATE_DASHBOARD':
      return 'Dashboard पे ले जा रही हूं।';
    case 'NAVIGATE_LISTINGS':
      return 'आपकी listings दिखा रही हूं।';
    case 'VIEW_ORDERS':
      return 'आपके orders दिखा रही हूं।';
    case 'VIEW_INCOME':
      return 'आपकी कमाई दिखा रही हूं।';
    case 'VIEW_SCORE':
      return 'आपका score दिखा रही हूं।';
    case 'MARK_OUT_FOR_DELIVERY':
      return 'Delivery mark कर रही हूं।';
    case 'PAUSE_LISTING':
      return 'Listing band कर रही हूं।';
    case 'RESUME_LISTING':
      return 'Listing चालू कर रही हूं।';
    case 'EDIT_PRICE':
      if (price && crop) return `${cropLabel} का price ₹${price} कर रही हूं।`;
      return price ? `Price ₹${price} कर रही हूं।` : 'नया price बताइए।';
    default:
      return 'बोलें: listing बनाओ, mausam dikhao, price forecast, mandi bhav, orders dikhao, या dashboard।';
  }
}

// ── Main Entry Point ──────────────────────────────────────────────────────
export async function processAgentRequest(
  transcript: string,
  language: string = 'hi'
): Promise<AgentResponse & { source: string }> {
  const text = transcript.trim();
  if (!text) {
    return {
      intent: 'HELP',
      confidence: 0,
      params: {},
      response_hi: 'कुछ बोलें।',
      source: 'rule-based',
    };
  }

  // Prefix with language hint for better Gemini accuracy
  const prefixed = language === 'en' ? text : `[lang=${language}] ${text}`;

  // 1-3: Try Gemini keys
  const geminiResult = await tryGemini(prefixed);
  if (geminiResult && geminiResult.confidence >= 0.5) return geminiResult;

  // 4: Try Groq
  const groqResult = await tryGroq(prefixed);
  if (groqResult && groqResult.confidence >= 0.5) return groqResult;

  // 5: Rule-based fallback (always works)
  return tryRuleBased(text);
}
