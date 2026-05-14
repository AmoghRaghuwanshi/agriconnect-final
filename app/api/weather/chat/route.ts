/**
 * POST /api/weather/chat
 * Krishi Mitra — Weather-aware farming chatbot.
 * Strict: ONLY answers farming/weather questions. Rejects off-topic.
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
const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

const SYSTEM = `You are Krishi Mitra (कृषि मित्र), a FEMALE weather advisor ONLY for Indian farmers.

STRICT RULES:
1. ONLY answer questions about: weather, farming, crops, irrigation, spraying, sowing, harvesting, soil, seeds, pesticides, fertilizers, mandi, agriculture.
2. If the question is NOT about farming or weather (e.g. movies, politics, coding, general knowledge, jokes), reply EXACTLY: "Bhai, yeh sawaal mera topic nahi hai 😅 Main sirf mausam aur kheti ke baare mein baat karti hun. Farming ya weather ka sawaal pucho! 🌾"
3. Answer in HINGLISH (Hindi + English mix). Keep it under 2-3 short sentences.
4. Be direct and actionable — tell the farmer WHAT TO DO.
5. Use the weather data provided to give specific advice.
6. Never use complex English or jargon.
7. ALWAYS use FEMININE Hindi — say "karti hun", "rahi hun", "deti hun", "dikhati hun" (NOT "karta hun", "raha hun").`;

/* ── Topic detection ───────────────────────────────────────────────────────── */
const OFF_TOPIC_WORDS = [
  'movie', 'film', 'cricket', 'football', 'politics', 'neta', 'election',
  'code', 'programming', 'song', 'gana', 'joke', 'mazak', 'game', 'khel',
  'love', 'pyar', 'girlfriend', 'boyfriend', 'exam', 'school', 'college',
  'iphone', 'laptop', 'bitcoin', 'share market', 'stock', 'actor', 'actress',
  'bollywood', 'hollywood', 'hero', 'heroine', 'match', 'goal', 'team',
  'modi', 'congress', 'bjp', 'party', 'vote', 'story', 'kahani', 'poem',
  'shayari', 'recipe', 'cooking', 'car', 'bike', 'train', 'flight',
  'youtube', 'instagram', 'facebook', 'whatsapp', 'tiktok', 'reels',
  'shopping', 'amazon', 'flipkart', 'news', 'samachar',
  'prime minister', 'president', 'minister', 'mantri',
];

const ON_TOPIC_WORDS = [
  // Weather
  'weather', 'mausam', 'मौसम', 'rain', 'baarish', 'barish', 'बारिश', 'barsaat',
  'temp', 'temperature', 'taapman', 'तापमान', 'garmi', 'गर्मी', 'thand', 'ठंड',
  'dhoop', 'धूप', 'hawa', 'हवा', 'badal', 'बादल', 'monsoon', 'मानसून',
  'toofan', 'तूफान', 'ola', 'ओला', 'humidity', 'nami', 'नमी',
  // Farming activities
  'spray', 'स्प्रे', 'dawai', 'दवाई', 'keetnaashak', 'कीटनाशक', 'fungicide',
  'sow', 'buvaai', 'बुवाई', 'bona', 'बोना', 'plant', 'rop', 'रोप', 'lagana',
  'harvest', 'katai', 'कटाई', 'todna', 'तोड़ना',
  'irrigat', 'sinch', 'सिंचाई', 'pani', 'पानी', 'water',
  'khad', 'fertiliz', 'खाद', 'urea', 'यूरिया', 'dap',
  // Crops
  'fasal', 'फसल', 'crop', 'kheti', 'खेती', 'farm', 'kisan', 'किसान',
  'gehun', 'गेहूं', 'wheat', 'chawal', 'चावल', 'rice', 'dhan', 'धान',
  'pyaz', 'प्याज', 'onion', 'tamatar', 'टमाटर', 'tomato',
  'aalu', 'आलू', 'potato', 'makka', 'मक्का', 'maize', 'corn',
  'mirch', 'मिर्च', 'chili', 'sarson', 'सरसों', 'mustard',
  'soyabean', 'सोयाबीन', 'kapas', 'कपास', 'cotton', 'ganna', 'गन्ना',
  'haldi', 'हल्दी', 'turmeric',
  // Soil/seeds
  'mitti', 'मिट्टी', 'soil', 'beej', 'बीज', 'seed',
  'pest', 'keeda', 'कीड़ा', 'rog', 'रोग', 'disease',
  // General agri
  'mandi', 'मंडी', 'market', 'bhav', 'भाव', 'rate', 'daam', 'दाम',
  'agriculture', 'krishi', 'कृषि', 'field', 'khet', 'खेत',
  // Time/day queries tied to farming
  'aaj', 'आज', 'kal', 'कल', 'abhi', 'अभी',
  // Greeting (allow)
  'hello', 'namaste', 'नमस्ते', 'hi', 'hey',
];

function isOffTopic(q: string): boolean {
  const lower = q.toLowerCase();
  // Explicit off-topic words → instant reject
  if (OFF_TOPIC_WORDS.some(w => lower.includes(w))) return true;
  // Must contain at least one farming/weather keyword
  const hasOnTopic = ON_TOPIC_WORDS.some(w => lower.includes(w));
  if (!hasOnTopic) return true;
  return false;
}

const OFF_TOPIC_REPLY = 'Bhai, yeh sawaal mera topic nahi hai 😅 Main sirf mausam aur kheti ke baare mein baat karta hun. Farming ya weather ka sawaal pucho! 🌾';

/* ── Smart rule-based fallback ─────────────────────────────────────────────── */
function ruleBasedAnswer(q: string, ctx: string): string {
  const lower = q.toLowerCase();
  const rainMatch = ctx.match(/Rain[:\s]+(\d+\.?\d*)mm/);
  const rainMm = rainMatch ? parseFloat(rainMatch[1]) : 0;
  const probMatch = ctx.match(/(\d+)%/);
  const rainProb = probMatch ? parseInt(probMatch[1]) : 0;
  const tempMatch = ctx.match(/Current:\s*(\d+)°C/);
  const temp = tempMatch ? parseInt(tempMatch[1]) : 30;

  // Spray questions
  if (lower.match(/spray|dawai|दवाई|स्प्रे|keetnaashak|कीटनाशक|fungicide/)) {
    if (rainProb > 50 || rainMm > 2)
      return `Aaj spray mat karo — ${rainProb}% baarish ka chance hai aur ${rainMm}mm rain expected hai. Spray barbaad ho jayega. Jab 2 din dry forecast ho tab karna.`;
    if (temp > 38)
      return `Garmi bahut hai (${temp}°C) — dopahar mein spray mat karo, subah 6-9 baje ya shaam 4-6 baje karo. Tab dawai zyada effective hogi.`;
    return `Haan, aaj spray kar sakte ho! Mausam saaf hai, baarish ka chance kam hai. Subah 7 se 10 baje best time hai spray ke liye.`;
  }

  // Sowing / planting
  if (lower.match(/buv|sow|बुवाई|bona|बोना|lagana|लगाना|plant|rop|रोप/)) {
    if (rainProb > 60)
      return `Buvaai ke liye thoda ruko — ${rainProb}% baarish ka chance hai. Baarish ke baad jab mitti mein nami ho, tab buvaai karna. Perfect rahega!`;
    if (rainMm > 0 && rainMm < 10)
      return `Halki baarish aane wali hai — buvaai ka perfect time hai! Beej ko natural nami milegi. Main bolti hun aaj hi kar lo.`;
    return `Mausam theek hai buvaai ke liye. Mitti mein nami check karo — agar nami hai to aaj kar do, nahi to halki sinchai ke baad karo.`;
  }

  // Harvest
  if (lower.match(/katai|harvest|कटाई|todna|तोड़ना/)) {
    if (rainProb > 40)
      return `Jaldi katai karo! ${rainProb}% baarish ka chance hai — fasal bheeg gayi to nuksaan hoga. Aaj hi kaat lo aur surakshit jagah rakh do.`;
    return `Katai ke liye mausam accha hai — ${temp} degree aur dry forecast hai. 2-3 din dry rahega to dhoop mein sukha bhi sakte ho.`;
  }

  // Irrigation
  if (lower.match(/sinch|irrigat|सिंचाई|pani|पानी|water/)) {
    if (rainProb > 50)
      return `Sinchai ki zaroorat nahi — ${rainProb}% baarish aane wali hai. Paisa aur paani bachao! Baarish se kaam chal jayega.`;
    if (temp > 40)
      return `Garmi bahut hai (${temp} degree) — subah 5-7 baje ya shaam 6-8 baje sinchai karo. Dopahar mein paani bhap ban jaata hai.`;
    return `Haan, sinchai kar sakte ho. Baarish ka chance kam hai. Drip ya sprinkler use karo — paani bachega aur fasal ko zyada fayda hoga.`;
  }

  // Weather general
  if (lower.match(/mausam|weather|मौसम|kaisa|कैसा|aaj|आज|kal|कल|temp|garmi|गर्मी|thand|ठंड|dhoop|धूप/)) {
    return `Abhi ${temp} degree hai. Baarish ka chance ${rainProb} percent hai agle 48 ghante mein. ${temp > 38 ? 'Garmi zyada hai — field work subah ya shaam karo.' : temp < 15 ? 'Thand hai — fasal ko cover karo.' : 'Mausam theek hai field work ke liye.'}`;
  }

  // Rain specific
  if (lower.match(/baarish|barish|बारिश|rain|barsaat|बरसात/)) {
    if (rainProb > 60) return `Haan, ${rainProb} percent chance hai baarish ka agle 48 ghante mein. ${rainMm}mm rain expected hai. Spray aur katai plan accordingly karo.`;
    if (rainProb > 20) return `Halki baarish aa sakti hai, ${rainProb} percent chance hai. Major rain nahi lagti. Normal kaam kar sakte ho.`;
    return `Baarish ka chance bahut kam hai, sirf ${rainProb} percent. Dry period hai — spray, buvaai, katai sab kar sakte ho.`;
  }

  // Fertilizer
  if (lower.match(/khad|fertiliz|खाद|urea|यूरिया|dap/)) {
    if (rainProb > 50) return `Khad abhi mat dalo — baarish mein beh jayegi. Jab dry weather ho tab dalna, taaki mitti absorb kare.`;
    return `Khad dalne ka time accha hai — mausam dry hai. Subah dalo aur halki sinchai karo taaki mitti mein mix ho jaye.`;
  }

  // Default farming
  return `Abhi ${temp} degree hai, baarish ${rainProb} percent. ${rainProb > 50 ? 'Baarish aa sakti hai — outdoor kaam plan se karo.' : 'Mausam saaf hai — field work ke liye accha time hai.'} Koi specific sawaal ho to pucho!`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { question: string; weather_context?: string; city?: string };
    if (!body.question?.trim()) return Response.json({ error: 'question required' }, { status: 400 });

    const question = body.question.trim();
    const ctx = body.weather_context || '';
    const city = body.city || 'India';

    // Block off-topic immediately
    if (isOffTopic(question)) {
      return Response.json({ answer: OFF_TOPIC_REPLY, source: 'filter' });
    }

    // Try Gemini with multiple models
    const userPrompt = `WEATHER DATA:\n${ctx}\nCity: ${city}\n\nFARMER ASKS: "${question}"\n\nGive a 1-2 sentence actionable answer in Hinglish:`;

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const ki = (keyIdx + i) % GEMINI_KEYS.length;
      for (const model of MODELS) {
        try {
          const genAI = new GoogleGenerativeAI(GEMINI_KEYS[ki]);
          const m = genAI.getGenerativeModel({ model });
          const result = await m.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: SYSTEM,
            generationConfig: { maxOutputTokens: 150, temperature: 0.6 },
          });
          keyIdx = (ki + 1) % GEMINI_KEYS.length;
          const text = result.response.text().trim();
          if (text) return Response.json({ answer: text, source: 'gemini' });
        } catch { continue; }
      }
    }

    // Rule-based fallback with actual weather context
    const answer = ruleBasedAnswer(question, ctx);
    return Response.json({ answer, source: 'local' });

  } catch (err) {
    console.error('[Weather Chat]', err instanceof Error ? err.message : err);
    return Response.json({ error: 'Chat failed' }, { status: 500 });
  }
}
