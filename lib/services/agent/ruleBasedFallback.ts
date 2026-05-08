/**
 * Rule-based intent fallback — works with ZERO API calls.
 * Used when all Gemini keys, Groq, and OpenRouter are exhausted.
 * Supports Hindi + Hinglish input for 12 farmer voice intents.
 */

export interface IntentResult {
  intent: string;
  params: Record<string, unknown>;
  confidence: number;
}

// ── Crop name mapping (Hindi/Hinglish → English) ──────────────────────────
const CROP_MAP: Record<string, string> = {
  gehun: 'Wheat', gehu: 'Wheat', wheat: 'Wheat',
  pyaz: 'Onion', pyaaz: 'Onion', onion: 'Onion',
  tamatar: 'Tomato', tomato: 'Tomato',
  aalu: 'Potato', aalo: 'Potato', potato: 'Potato',
  chawal: 'Rice', rice: 'Rice', paddy: 'Rice', dhan: 'Rice',
  makka: 'Maize', maize: 'Maize', corn: 'Maize', bhutta: 'Maize',
  mirch: 'Chili', chili: 'Chili', chilli: 'Chili',
  sarson: 'Mustard', mustard: 'Mustard',
  jau: 'Barley', barley: 'Barley',
};

// ── Hindi number words ─────────────────────────────────────────────────────
const HINDI_NUMBERS: Record<string, number> = {
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5,
  chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
  bees: 20, tees: 30, chalis: 40, pachas: 50,
  saath: 70, assi: 80, nabbe: 90,
  sau: 100, hazaar: 1000,
};

function parseNumber(text: string): number | null {
  // Check digit numbers first
  const digitMatch = text.match(/\d+(\.\d+)?/);
  if (digitMatch) return parseFloat(digitMatch[0]);

  // Check Hindi words
  for (const [word, value] of Object.entries(HINDI_NUMBERS)) {
    if (text.includes(word)) return value;
  }
  return null;
}

function normalizeCrop(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(CROP_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

// ── Main rule-based parser ─────────────────────────────────────────────────
export function ruleBasedIntent(input: string): IntentResult {
  const text = input.toLowerCase().trim();

  if (!text) {
    return { intent: 'HELP', params: {}, confidence: 0 };
  }

  // ── CREATE_LISTING ────────────────────────────────────────────────────────
  const isListing =
    text.includes('bech') ||
    text.includes('sale') ||
    text.includes('listing') ||
    text.includes('daalna') ||
    text.includes('upload');

  if (isListing) {
    const crop = normalizeCrop(text);
    const qtyKg = extractQuantityKg(text);
    const pricePerKg = extractPricePerKg(text);

    return {
      intent: 'CREATE_LISTING',
      params: {
        crop_name: crop ?? undefined,
        quantity_kg: qtyKg ?? undefined,
        price_per_kg: pricePerKg ?? undefined,
      },
      confidence: crop ? 0.85 : 0.6,
    };
  }

  // ── CHECK_MANDI_PRICE ─────────────────────────────────────────────────────
  const isMandi =
    text.includes('mandi') ||
    text.includes('bhav') ||
    text.includes('rate') ||
    text.includes('daam') ||
    text.includes('price') ||
    text.includes('kitne ka');

  if (isMandi) {
    const crop = normalizeCrop(text);
    return {
      intent: 'CHECK_MANDI_PRICE',
      params: { crop_name: crop ?? undefined },
      confidence: crop ? 0.9 : 0.7,
    };
  }

  // ── VIEW_ORDERS ───────────────────────────────────────────────────────────
  if (
    text.includes('order') ||
    text.includes('kharida') ||
    text.includes('booking')
  ) {
    return { intent: 'VIEW_ORDERS', params: {}, confidence: 0.85 };
  }

  // ── MARK_OUT_FOR_DELIVERY ─────────────────────────────────────────────────
  if (
    text.includes('nikal') ||
    text.includes('delivery') ||
    text.includes('pahunch') ||
    text.includes('ja raha')
  ) {
    return { intent: 'MARK_OUT_FOR_DELIVERY', params: {}, confidence: 0.8 };
  }

  // ── VIEW_INCOME ───────────────────────────────────────────────────────────
  if (
    text.includes('kamai') ||
    text.includes('income') ||
    text.includes('kamaya') ||
    text.includes('paise') ||
    text.includes('earnings')
  ) {
    return { intent: 'VIEW_INCOME', params: {}, confidence: 0.85 };
  }

  // ── VIEW_SCORE ────────────────────────────────────────────────────────────
  if (
    text.includes('score') ||
    text.includes('rating') ||
    text.includes('review')
  ) {
    return { intent: 'VIEW_SCORE', params: {}, confidence: 0.85 };
  }

  // ── PAUSE_LISTING ─────────────────────────────────────────────────────────
  if (text.includes('band') || text.includes('pause') || text.includes('rok')) {
    return { intent: 'PAUSE_LISTING', params: {}, confidence: 0.75 };
  }

  // ── RESUME_LISTING ────────────────────────────────────────────────────────
  if (text.includes('shuru') || text.includes('resume') || text.includes('chalu')) {
    return { intent: 'RESUME_LISTING', params: {}, confidence: 0.75 };
  }

  // ── EDIT_PRICE ────────────────────────────────────────────────────────────
  if (
    (text.includes('price') || text.includes('rate') || text.includes('daam')) &&
    (text.includes('change') || text.includes('badal') || text.includes('update'))
  ) {
    const price = extractPricePerKg(text);
    const crop = normalizeCrop(text);
    return {
      intent: 'EDIT_PRICE',
      params: { crop_name: crop ?? undefined, price_per_kg: price ?? undefined },
      confidence: 0.75,
    };
  }

  // ── HELP (default) ────────────────────────────────────────────────────────
  return { intent: 'HELP', params: {}, confidence: 0.2 };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function extractQuantityKg(text: string): number | null {
  // quintal → kg conversion
  const quintalMatch = text.match(/(\d+|[a-z]+)\s*quintal/);
  if (quintalMatch) {
    const num = parseNumber(quintalMatch[1]);
    return num !== null ? num * 100 : null;
  }

  // Direct kg
  const kgMatch = text.match(/(\d+(\.\d+)?)\s*(kg|kilo|kilogram)/);
  if (kgMatch) return parseFloat(kgMatch[1]);

  // Hindi number + kilo
  for (const [word, value] of Object.entries(HINDI_NUMBERS)) {
    if (text.includes(`${word} kilo`) || text.includes(`${word} kg`)) {
      return value;
    }
  }

  return null;
}

function extractPricePerKg(text: string): number | null {
  // per-quintal price → per-kg
  const quintalPriceMatch = text.match(/(\d+)\s*(rupay|rupye|rs\.?|rupe)?\s*quintal/);
  if (quintalPriceMatch) {
    return parseFloat(quintalPriceMatch[1]) / 100;
  }

  // per-kg price
  const kgPriceMatch = text.match(/(\d+(\.\d+)?)\s*(rupay|rupye|rs\.?|rupe|rupee)?\s*(kilo|kg|per kg)?/);
  if (kgPriceMatch) return parseFloat(kgPriceMatch[1]);

  return null;
}
