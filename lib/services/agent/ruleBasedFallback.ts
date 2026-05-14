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

// ── Off-topic keyword detector ─────────────────────────────────────────────
// Catches common non-farming queries BEFORE any farming intent check.
// Covers English, Hindi, and Hinglish.
export function isOutOfScopeQuery(input: string): boolean {
  const t = input.toLowerCase();

  const foodKeywords = [
    'recipe', 'recipes', 'kaise banate', 'kaise banta', 'kaise banaye', 'kaise pakaye',
    'pakane ka tarika', 'banane ka tarika', 'pasta', 'pizza', 'burger', 'noodles',
    'biryani recipe', 'cake recipe', 'chai recipe', 'khana banao', 'khana banana',
    'khana pakana', 'cook', 'cooking', 'ingredient', 'masala recipe', 'sweet recipe',
  ];

  const entertainmentKeywords = [
    'cricket', 'football', 'match score', 'ipl', 'world cup score',
    'movie', 'film', 'web series', 'netflix', 'youtube video', 'song',
    'gaana', 'singer', 'actor', 'actress', 'celebrity',
    'game', 'gaming', 'pubg', 'free fire',
  ];

  const generalKnowledgeKeywords = [
    'capital of', 'history of', 'who is', 'who was', 'what is the president',
    'prime minister', 'pm kya', 'cm kya', 'election', 'vote', 'party',
    'politics', 'rajniti', 'राजनीति', 'gk question', 'general knowledge', 'current affairs',
  ];

  const techKeywords = [
    'phone battery', 'mobile', 'laptop', 'computer', 'software', 'app install',
    'wifi', 'internet', 'password', 'hack', 'coding', 'programming',
  ];

  const nonFarmFinanceKeywords = [
    'stock market', 'share bazaar', 'bitcoin', 'crypto', 'sensex', 'nifty',
    'mutual fund', 'emi', 'home loan', 'car loan', 'credit card',
  ];

  const lifestyleKeywords = [
    'hotel', 'train ticket', 'flight', 'tour', 'travel', 'trip',
    'relationship', 'love', 'marriage', 'shaadi', 'divorce',
    'health problem', 'doctor', 'hospital', 'medicine', 'dawai',
  ];

  const allOffTopicKeywords = [
    ...foodKeywords, ...entertainmentKeywords, ...generalKnowledgeKeywords,
    ...techKeywords, ...nonFarmFinanceKeywords, ...lifestyleKeywords,
  ];

  return allOffTopicKeywords.some(kw => t.includes(kw));
}

// ── Crop name mapping (Hindi/Hinglish → English) ──────────────────────────
const CROP_MAP: Record<string, string> = {
  // Romanized Hindi / Hinglish
  gehun: 'Wheat', gehu: 'Wheat', wheat: 'Wheat',
  pyaz: 'Onion', pyaaz: 'Onion', onion: 'Onion',
  tamatar: 'Tomato', tomato: 'Tomato',
  aalu: 'Potato', aalo: 'Potato', potato: 'Potato',
  chawal: 'Rice', rice: 'Rice', paddy: 'Rice', dhan: 'Rice',
  makka: 'Maize', maize: 'Maize', corn: 'Maize', bhutta: 'Maize',
  mirch: 'Chili', chili: 'Chili', chilli: 'Chili',
  sarson: 'Mustard', mustard: 'Mustard',
  jau: 'Barley', barley: 'Barley',
  soyabean: 'Soybean', soya: 'Soybean',
  kapas: 'Cotton', cotton: 'Cotton',
  ganna: 'Sugarcane', sugarcane: 'Sugarcane',
  haldi: 'Turmeric', turmeric: 'Turmeric',
  // Devanagari Hindi (from Web Speech API with lang='hi-IN')
  'गेहूं': 'Wheat', 'गेहू': 'Wheat', 'गेहुं': 'Wheat',
  'प्याज': 'Onion', 'प्याज़': 'Onion',
  'टमाटर': 'Tomato',
  'आलू': 'Potato',
  'चावल': 'Rice', 'धान': 'Rice',
  'मक्का': 'Maize', 'भुट्टा': 'Maize',
  'मिर्च': 'Chili', 'मिर्ची': 'Chili',
  'सरसों': 'Mustard',
  'जौ': 'Barley',
  'सोयाबीन': 'Soybean', 'कपास': 'Cotton', 'गन्ना': 'Sugarcane',
  'हल्दी': 'Turmeric',
};

// ── Variety mapping (Hindi/Hinglish/English → English) ───────────────────
const VARIETY_MAP: Record<string, string> = {
  // Wheat varieties
  sharbati: 'Sharbati', शरबती: 'Sharbati',
  lokwan: 'Lokwan', लोकवान: 'Lokwan', lokvan: 'Lokwan',
  desi: 'Desi', देसी: 'Desi',
  sona: 'Sona', सोना: 'Sona',
  tukdi: 'Tukdi', तुकड़ी: 'Tukdi',
  malwi: 'Malwi', मालवी: 'Malwi',
  // Onion varieties
  nashik: 'Nashik', नाशिक: 'Nashik', nasik: 'Nashik',
  red: 'Red', लाल: 'Red', laal: 'Red',
  white: 'White', सफेद: 'White', safed: 'White',
  // Rice varieties
  basmati: 'Basmati', बासमती: 'Basmati',
  parmal: 'Parmal', परमल: 'Parmal',
  'sona masoori': 'Sona Masoori', mansoori: 'Sona Masoori', masoori: 'Sona Masoori',
  // Tomato varieties
  hybrid: 'Hybrid', हाइब्रिड: 'Hybrid',
  'desi tamatar': 'Desi Tamatar',
  // Potato varieties
  jyoti: 'Jyoti', ज्योति: 'Jyoti',
  chipsona: 'Chipsona', चिप्सोना: 'Chipsona',
  // Chili varieties
  teja: 'Teja', तेजा: 'Teja',
  byadgi: 'Byadgi', ब्याडगी: 'Byadgi',
  // Cotton varieties
  bt: 'BT Cotton',
  // Sugarcane varieties
  co: 'CO',
  // Generic quality descriptors
  organic: 'Organic', जैविक: 'Organic', jaivik: 'Organic',
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
  // Convert Devanagari digits (०-९) to Arabic (0-9)
  const normalized = text.replace(/[०-९]/g, (d) =>
    String('०१२३४५६७८९'.indexOf(d))
  );

  // Check digit numbers first
  const digitMatch = normalized.match(/\d+(\.\d+)?/);
  if (digitMatch) return parseFloat(digitMatch[0]);

  // Check Hindi words (romanized + Devanagari)
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

function extractVariety(text: string, crop?: string | null): string | null {
  const lower = text.toLowerCase();

  // Find all variety matches in the text
  const matches: { key: string; value: string; index: number }[] = [];
  for (const [key, val] of Object.entries(VARIETY_MAP)) {
    const idx = lower.indexOf(key);
    if (idx !== -1) {
      matches.push({ key, value: val, index: idx });
    }
  }

  if (matches.length === 0) return null;

  // Sort by position in text — prefer earlier matches
  matches.sort((a, b) => a.index - b.index);

  // If crop is known, look for variety near the crop name
  if (crop) {
    const cropLower = crop.toLowerCase();
    const cropIdx = lower.indexOf(cropLower);
    if (cropIdx === -1) {
      // Try the Hindi key for the crop
      for (const [key, val] of Object.entries(CROP_MAP)) {
        if (val.toLowerCase() === cropLower) {
          const hiIdx = lower.indexOf(key);
          if (hiIdx !== -1) {
            // Find variety closest to this crop mention
            let bestMatch: typeof matches[0] | null = null;
            let bestDist = Infinity;
            for (const m of matches) {
              const dist = Math.abs(m.index - hiIdx);
              if (dist < bestDist && dist < 40) {
                bestDist = dist;
                bestMatch = m;
              }
            }
            if (bestMatch) return bestMatch.value;
          }
        }
      }
    } else {
      // Find variety closest to crop mention in text
      let bestMatch: typeof matches[0] | null = null;
      let bestDist = Infinity;
      for (const m of matches) {
        const dist = Math.abs(m.index - cropIdx);
        if (dist < bestDist && dist < 40) {
          bestDist = dist;
          bestMatch = m;
        }
      }
      if (bestMatch) return bestMatch.value;
    }
  }

  // Fallback: return the first variety match
  return matches[0].value;
}

// ── All quintal spelling variants ─────────────────────────────────────────
const QUINTAL_PATTERN = /quintal|quintl|quintle|kuntal|क्विंटल|क्विन्टल|कुंतल|कुन्तल|कुंटल|क़ुंतल|क़्विंटल/;
const QUINTAL_RE_SRC = 'quintal|quintl|quintle|kuntal|क्विंटल|क्विन्टल|कुंतल|कुन्तल|कुंटल|क़ुंतल|क़्विंटल';

// ── Helper: check if text contains "view/show/tell" intent words ──────────
function hasViewIntent(text: string): boolean {
  return /(?:dikha|dekho|dekha|dekhe|batao|bata|bataye|दिखाओ|दिखाना|देखो|देखना|देखें|बताओ|बताना|बताएं|show|check|dekh)\b/i.test(text);
}

// ── Main rule-based parser ─────────────────────────────────────────────────
export function ruleBasedIntent(input: string): IntentResult {
  const text = input.toLowerCase().trim();

  if (!text) {
    return { intent: 'HELP', params: {}, confidence: 0 };
  }

  // Guard: reject non-farming queries immediately
  if (isOutOfScopeQuery(text)) {
    return { intent: 'OUT_OF_SCOPE', params: {}, confidence: 1.0 };
  }

  const isViewVerb = hasViewIntent(text);

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATE_DASHBOARD — go home / dashboard
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('dashboard') ||
    text.includes('home') ||
    text.includes('ghar') ||
    text.includes('घर') ||
    text.includes('डैशबोर्ड') ||
    text.includes('होम') ||
    (text.includes('main') && text.includes('page'))
  ) {
    return { intent: 'NAVIGATE_DASHBOARD', params: {}, confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATE_LISTINGS — view my listings
  // ═══════════════════════════════════════════════════════════════════════
  if (
    (isViewVerb && (
      text.includes('listing') || text.includes('लिस्टिंग') ||
      text.includes('meri') || text.includes('मेरी') ||
      text.includes('fasal') || text.includes('फसल')
    )) ||
    text.includes('meri listing') ||
    text.includes('मेरी लिस्टिंग') ||
    text.includes('listing dikhao') ||
    text.includes('लिस्टिंग दिखाओ')
  ) {
    return { intent: 'NAVIGATE_LISTINGS', params: {}, confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHECK_WEATHER — weather, rain, mausam queries
  // ═══════════════════════════════════════════════════════════════════════
  const isWeather =
    text.includes('weather') ||
    text.includes('mausam') ||
    text.includes('मौसम') ||
    text.includes('baarish') ||
    text.includes('barish') ||
    text.includes('बारिश') ||
    text.includes('rain') ||
    text.includes('temperature') ||
    text.includes('taapman') ||
    text.includes('तापमान') ||
    text.includes('dhoop') ||
    text.includes('धूप') ||
    text.includes('garmi') ||
    text.includes('गर्मी') ||
    text.includes('thand') ||
    text.includes('ठंड') ||
    text.includes('monsoon') ||
    text.includes('मानसून') ||
    text.includes('spray') ||
    text.includes('स्प्रे') ||
    text.includes('boni') ||
    text.includes('बोनी') ||
    text.includes('hawa') ||
    text.includes('हवा') ||
    text.includes('badal') ||
    text.includes('बादल') ||
    text.includes('toofan') ||
    text.includes('तूफान') ||
    text.includes('ola') ||
    text.includes('ओला') ||
    text.includes('kaisa hai mausam') ||
    text.includes('mausam kaisa');

  if (isWeather) {
    return {
      intent: 'CHECK_WEATHER',
      params: {},
      confidence: 0.85,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRICE_FORECAST — checked BEFORE mandi to catch future-price queries
  // ═══════════════════════════════════════════════════════════════════════
  const isForecast =
    text.includes('forecast') ||
    text.includes('prediction') ||
    text.includes('predict') ||
    text.includes('future') ||
    text.includes('trend') ||
    text.includes('aage') ||
    text.includes('agla') ||
    text.includes('baad') ||
    text.includes('hoga') ||
    text.includes('होगा') ||
    text.includes('आगे') ||
    text.includes('अगला') ||
    text.includes('भविष्य') ||
    text.includes('पूर्वानुमान') ||
    text.includes('अनुमान') ||
    text.includes('ट्रेंड') ||
    text.includes('badhega') ||
    text.includes('बढ़ेगा') ||
    text.includes('girega') ||
    text.includes('गिरेगा') ||
    text.includes('price prediction') ||
    text.includes('bhav prediction') ||
    text.includes('rate badhega') ||
    text.includes('rate girega') ||
    text.includes('daam badhega') ||
    text.includes('daam girega') ||
    // "kya hoga bhav" / "rate kya hoga" patterns
    (text.includes('kya hog') && (text.includes('bhav') || text.includes('rate') || text.includes('price') || text.includes('daam'))) ||
    (text.includes('क्या होग') && (text.includes('भाव') || text.includes('रेट') || text.includes('दाम')));

  if (isForecast) {
    const crop = normalizeCrop(text);
    return {
      intent: 'PRICE_FORECAST',
      params: { crop_name: crop ?? undefined },
      confidence: crop ? 0.9 : 0.75,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHECK_MANDI_PRICE — checked FIRST to avoid overlap with CREATE_LISTING
  // ═══════════════════════════════════════════════════════════════════════
  const isMandi =
    text.includes('mandi') ||
    text.includes('मंडी') ||
    text.includes('bajar') ||
    text.includes('बाजार') ||
    text.includes('market') ||
    text.includes('मार्केट') ||
    // Price inquiry with show/tell intent (NOT sell/create intent)
    (isViewVerb && (
      text.includes('bhav') ||
      text.includes('भाव') ||
      text.includes('daam') ||
      text.includes('दाम') ||
      text.includes('rate') ||
      text.includes('रेट') ||
      text.includes('price') ||
      text.includes('kitne ka') ||
      text.includes('कितने का') ||
      text.includes('kya bhav') ||
      text.includes('क्या भाव') ||
      text.includes('kya rate') ||
      text.includes('क्या रेट')
    ));

  if (isMandi) {
    const crop = normalizeCrop(text);
    return {
      intent: 'CHECK_MANDI_PRICE',
      params: { crop_name: crop ?? undefined },
      confidence: crop ? 0.9 : 0.75,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW_ORDERS
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('order') ||
    text.includes('kharida') ||
    text.includes('booking') ||
    text.includes('khareed') ||
    text.includes('खरीद') ||
    // Devanagari
    text.includes('ऑर्डर') ||
    text.includes('आर्डर') ||
    text.includes('खरीदा') ||
    text.includes('बुकिंग') ||
    text.includes('order dikhao') ||
    text.includes('ऑर्डर दिखाओ')
  ) {
    return { intent: 'VIEW_ORDERS', params: {}, confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW_INCOME
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('kamai') ||
    text.includes('income') ||
    text.includes('kamaya') ||
    text.includes('paise') ||
    text.includes('earnings') ||
    text.includes('aamdani') ||
    text.includes('नफा') ||
    text.includes('profit') ||
    // Devanagari
    text.includes('कमाई') ||
    text.includes('पैसे') ||
    text.includes('आमदनी') ||
    text.includes('कितना पैसा') ||
    text.includes('कितना कमाया') ||
    text.includes('nikala') ||
    text.includes('निकाला')
  ) {
    return { intent: 'VIEW_INCOME', params: {}, confidence: 0.88 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW_SCORE
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('score') ||
    text.includes('rating') ||
    text.includes('review') ||
    text.includes('star') ||
    text.includes('point') ||
    text.includes('ank') ||
    text.includes('feedback') ||
    // Devanagari
    text.includes('स्कोर') ||
    text.includes('रेटिंग') ||
    text.includes('तारा') ||
    text.includes('अंक') ||
    text.includes('फीडबैक')
  ) {
    return { intent: 'VIEW_SCORE', params: {}, confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MARK_OUT_FOR_DELIVERY
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('nikal') ||
    text.includes('delivery') ||
    text.includes('pahunch') ||
    text.includes('ja raha') ||
    text.includes('dispatch') ||
    text.includes('bhejna') ||
    text.includes('ready') ||
    // Devanagari
    text.includes('भेजना') ||
    text.includes('भेज') ||
    text.includes('डिस्पैच') ||
    text.includes('रेडी') ||
    text.includes('निकालना')
  ) {
    return { intent: 'MARK_OUT_FOR_DELIVERY', params: {}, confidence: 0.8 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PAUSE_LISTING
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('band') ||
    text.includes('pause') ||
    text.includes('rok') ||
    text.includes('रोक') ||
    text.includes('बंद')
  ) {
    return { intent: 'PAUSE_LISTING', params: {}, confidence: 0.75 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RESUME_LISTING
  // ═══════════════════════════════════════════════════════════════════════
  if (
    text.includes('shuru') ||
    text.includes('resume') ||
    text.includes('chalu') ||
    text.includes('शुरू') ||
    text.includes('चालू') ||
    text.includes('शुरु')
  ) {
    return { intent: 'RESUME_LISTING', params: {}, confidence: 0.75 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EDIT_PRICE — must come before CREATE_LISTING since it has price words
  // ═══════════════════════════════════════════════════════════════════════
  if (
    (text.includes('price') || text.includes('rate') || text.includes('daam') ||
      text.includes('दाम') || text.includes('रेट')) &&
    (text.includes('change') || text.includes('badal') || text.includes('badhao') ||
      text.includes('ghatao') || text.includes('update') ||
      text.includes('बदल') || text.includes('बढ़ाओ') || text.includes('घटाओ') ||
      text.includes('बदलाव'))
  ) {
    const price = extractPricePerKg(text);
    const crop = normalizeCrop(text);
    return {
      intent: 'EDIT_PRICE',
      params: { crop_name: crop ?? undefined, price_per_kg: price ?? undefined },
      confidence: 0.78,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CREATE_LISTING — only when strong sell/create signals present
  // ═══════════════════════════════════════════════════════════════════════
  const isListing =
    text.includes('bech') ||
    text.includes('bach') ||      // voice misrecognition of bechna
    text.includes('sell') ||
    text.includes('sale') ||
    text.includes('listing') ||
    text.includes('daalna') ||
    text.includes('upload') ||
    text.includes('laga') ||      // lagana = to list
    text.includes('bejna') ||     // alt spelling
    // Devanagari
    text.includes('बेच') ||
    text.includes('बच') ||        // voice often hears बचना instead of बेचना
    text.includes('बिक्री') ||
    text.includes('डालना') ||
    text.includes('लिस्टिंग') ||
    text.includes('लगा');         // लगाना

  // Also detect listing intent when crop+qty/price present without view intent
  const crop = normalizeCrop(text);
  const hasCropAndDetails = crop !== null && (
    extractQuantityKg(text) !== null ||
    extractPricePerKg(text) !== null
  );

  if (isListing || (hasCropAndDetails && !isViewVerb && !text.includes('mandi') && !text.includes('मंडी'))) {
    const qtyKg = extractQuantityKg(text);
    const pricePerKg = extractPricePerKg(text);
    const variety = extractVariety(text, crop);

    return {
      intent: 'CREATE_LISTING',
      params: {
        crop_name: crop ?? undefined,
        variety: variety ?? undefined,
        quantity_kg: qtyKg ?? undefined,
        price_per_kg: pricePerKg ?? undefined,
      },
      confidence: crop ? (variety ? 0.9 : 0.82) : 0.55,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEFAULT: Guess CREATE_LISTING if crop or quantity present
  // ═══════════════════════════════════════════════════════════════════════
  if (crop || extractQuantityKg(text) || extractPricePerKg(text)) {
    const qtyKg = extractQuantityKg(text);
    const pricePerKg = extractPricePerKg(text);
    const variety = extractVariety(text, crop);

    return {
      intent: 'CREATE_LISTING',
      params: {
        crop_name: crop ?? undefined,
        variety: variety ?? undefined,
        quantity_kg: qtyKg ?? undefined,
        price_per_kg: pricePerKg ?? undefined,
      },
      confidence: crop ? 0.7 : 0.5,
    };
  }

  // ── HELP (default) ────────────────────────────────────────────────────────
  return { intent: 'HELP', params: {}, confidence: 0.2 };

}

// ── Helpers ────────────────────────────────────────────────────────────────
function normalizeDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) =>
    String('०१२३४५६७८९'.indexOf(d))
  );
}

function extractQuantityKg(text: string): number | null {
  const norm = normalizeDigits(text);

  // Strip ₹-prefixed numbers so "₹100 किलो" doesn't match as 100 kg
  const safe = norm.replace(/₹\s*\d+(\.\d+)?/g, '___PRICE___');

  // quintal → kg (all spelling variants)
  const quintalMatch = safe.match(new RegExp('(\\d+|[a-z]+)\\s*(' + QUINTAL_RE_SRC + ')'));
  if (quintalMatch) {
    const num = parseNumber(quintalMatch[1]);
    return num !== null ? num * 100 : null;
  }

  // bori/katta → 50 kg
  const boriMatch = safe.match(/(\d+|[a-z]+)\s*(bori|बोरी|katta|कट्टा)/);
  if (boriMatch) {
    const num = parseNumber(boriMatch[1]);
    return num !== null ? num * 50 : null;
  }

  // peti → 20 kg
  const petiMatch = safe.match(/(\d+|[a-z]+)\s*(peti|पेटी)/);
  if (petiMatch) {
    const num = parseNumber(petiMatch[1]);
    return num !== null ? num * 20 : null;
  }

  // Direct kg
  const kgMatch = safe.match(/(\d+(\.\d+)?)\s*(kg|kilo|kilogram|किलो|किलोग्राम)/);
  if (kgMatch) return parseFloat(kgMatch[1]);

  // Hindi number + kilo
  for (const [word, value] of Object.entries(HINDI_NUMBERS)) {
    if (text.includes(`${word} kilo`) || text.includes(`${word} kg`) || text.includes(`${word} किलो`)) {
      return value;
    }
  }

  return null;
}

function extractPricePerKg(text: string): number | null {
  const norm = normalizeDigits(text);

  // ── Per-quintal price → divide by 100 to get per-kg ────────────────────
  // REQUIRES a currency marker or "per/प्रति" to distinguish from quantity.
  // Without this, "2 क्विंटल" (quantity) would be misread as price=0.02.

  // Pattern 1: NUMBER + CURRENCY_WORD + (per/प्रति)? + QUINTAL
  //   "2000 रुपए प्रति क्विंटल", "2100 rupye quintal"
  const qp1 = norm.match(new RegExp('(\\d+)\\s*(?:rupay|rupye|rs\\.?|rupe|rupees?|रुपए|रुपये)\\s*(?:per|प्रति|preti)?\\s*(?:' + QUINTAL_RE_SRC + ')'));
  if (qp1) return parseFloat(qp1[1]) / 100;

  // Pattern 2: ₹NUMBER + (per/प्रति)? + QUINTAL
  //   "₹2100 क्विंटल", "₹2100 प्रति कुंतल"
  const qp2 = norm.match(new RegExp('₹\\s*(\\d+)\\s*(?:per|प्रति|preti)?\\s*(?:' + QUINTAL_RE_SRC + ')'));
  if (qp2) return parseFloat(qp2[1]) / 100;

  // Pattern 3: NUMBER + "per/प्रति" + QUINTAL (no currency, but explicit "per")
  //   "2100 per quintal", "2100 प्रति कुंतल"
  const qp3 = norm.match(new RegExp('(\\d+)\\s+(?:per|प्रति)\\s+(?:' + QUINTAL_RE_SRC + ')'));
  if (qp3) return parseFloat(qp3[1]) / 100;

  // ── Per-kg price with ₹ symbol ────────────────────────────────────────
  //   "₹100 किलो के भाव", "₹30 per kilo", "₹25"
  const rupeeMatch = norm.match(/₹\s*(\d+(\.\d+)?)/);
  if (rupeeMatch) return parseFloat(rupeeMatch[1]);

  // ── Per-kg price with currency word ───────────────────────────────────
  //   "30 rupees per kilo", "25 रुपए"
  //   Guard: if followed by quintal word, divide by 100
  const currMatch = norm.match(/(\d+(\.\d+)?)\s*(?:rupay|rupye|rs\.?|rupe|rupees?|रुपए|रुपये)/);
  if (currMatch) {
    const after = norm.slice(norm.indexOf(currMatch[0]) + currMatch[0].length);
    if (new RegExp('^\\s*(?:per|प्रति|preti)?\\s*(?:' + QUINTAL_RE_SRC + ')').test(after)) {
      return parseFloat(currMatch[1]) / 100;
    }
    return parseFloat(currMatch[1]);
  }

  // ── Per-kg with explicit "per kg" / "किलो के भाव" ─────────────────────
  const pkMatch = norm.match(/(\d+(\.\d+)?)\s*(?:per kilo|per kg|\/kg|\/kilo|प्रति किलो|किलो के भाव|किलो भाव)/i);
  if (pkMatch) return parseFloat(pkMatch[1]);

  return null;
}