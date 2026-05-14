/**
 * POST /api/analysis/chat
 * Field-aware AI chatbot for follow-up questions about a specific field's analysis.
 */
export const runtime = 'nodejs';

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEYS: string[] = [
  process.env.GEMINI_API_KEY_1 ?? '',
  process.env.GEMINI_API_KEY_2 ?? '',
  process.env.GEMINI_API_KEY_3 ?? '',
  process.env.GEMINI_API_KEY_4 ?? '',
  process.env.GEMINI_API_KEY_5 ?? '',
].filter(k => k.length > 0 && k !== 'placeholder');

let keyIdx = 0;
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite'];

const SYSTEM = `You are Krishi Mitra (कृषि मित्र), an expert FEMALE Indian agriculture advisor specialized in precision farming.

STRICT RULES:
1. ONLY answer questions about: farming, crops, soil, fertilizer, irrigation, yield, pests, seeds, weather impact on crops, mandi prices.
2. If the question is NOT farming-related, reply: "Bhai, yeh sawaal mera topic nahi hai 😅 Main sirf kheti aur fasal ke baare mein baat karti hun. Farming ka sawaal pucho! 🌾"
3. Answer in HINGLISH (Hindi + English mix) by default.
4. If the user asks in pure Hindi or says "Hindi mein batao", answer in pure Hindi.
5. If the user asks in English, answer in English.
6. Keep answers under 3-4 sentences. Be direct and actionable.
7. Use the FIELD DATA provided to give location-specific, personalized advice.
8. ALWAYS use FEMININE Hindi — "karti hun", "deti hun", "dikhati hun" etc.
9. When suggesting fertilizer quantities, always specify per hectare rates.
10. Reference real Indian brands when suggesting products (e.g., IFFCO DAP, Coromandel Gromor, Tata Rallis).`;

export async function POST(req: Request) {
  try {
    const body = await req.json() as { 
      question: string; 
      fieldContext?: string;
      history?: { role: string; text: string }[];
    };
    
    if (!body.question?.trim()) return Response.json({ error: 'question required' }, { status: 400 });

    const question = body.question.trim();
    const fieldCtx = body.fieldContext || '';
    const history = body.history || [];

    // Build conversation with context
    const contextBlock = fieldCtx ? `\nFIELD DATA (use this for personalized advice):\n${fieldCtx}\n` : '';
    
    const historyText = history.map(h => `${h.role === 'user' ? 'FARMER' : 'ADVISOR'}: ${h.text}`).join('\n');
    
    const userPrompt = `${contextBlock}${historyText ? `\nPREVIOUS CONVERSATION:\n${historyText}\n` : ''}\nFARMER ASKS: "${question}"\n\nGive a helpful, actionable answer:`;

    // Try Gemini with rotation
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const ki = (keyIdx + i) % GEMINI_KEYS.length;
      for (const model of MODELS) {
        try {
          const genAI = new GoogleGenerativeAI(GEMINI_KEYS[ki]);
          const m = genAI.getGenerativeModel({ model });
          const result = await m.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: SYSTEM,
            generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
          });
          keyIdx = (ki + 1) % GEMINI_KEYS.length;
          const text = result.response.text().trim();
          if (text) return Response.json({ answer: text, source: 'gemini' });
        } catch { continue; }
      }
    }

    return Response.json({ answer: 'Maaf kijiye, abhi thoda busy hun. Thodi der baad phir poochiye! 🙏', source: 'fallback' });

  } catch (err) {
    console.error('[Field Chat]', err instanceof Error ? err.message : err);
    return Response.json({ error: 'Chat failed' }, { status: 500 });
  }
}
