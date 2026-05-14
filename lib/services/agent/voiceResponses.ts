/**
 * Hindi voice response strings for each intent.
 * Used by SpeechSynthesis (TTS) to speak back to the farmer.
 *
 * Design goals:
 *  - Use Hindi crop names (गेहूं not Wheat) so TTS sounds natural
 *  - 2–3 variants per intent to avoid sounding scripted
 *  - Warm, conversational feminine Hindi ("रही हूं", "करती हूं")
 */

// ── Hindi crop name map (English → Devanagari) ─────────────────────────────
const CROP_HI: Record<string, string> = {
  Wheat: 'गेहूं', Onion: 'प्याज', Tomato: 'टमाटर',
  Potato: 'आलू', Rice: 'चावल', Maize: 'मक्का',
  'Green Chili': 'मिर्च', Chili: 'मिर्च', Mustard: 'सरसों',
  Barley: 'जौ', Soybean: 'सोयाबीन', Cotton: 'कपास',
  Sugarcane: 'गन्ना', Turmeric: 'हल्दी',
};

/** Convert English crop name to Hindi. Falls back to original if unknown. */
function hi(crop: string): string {
  return CROP_HI[crop] || crop;
}

/** Pick a random item from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getVoiceResponse(
  intent: string,
  params: Record<string, unknown>
): string {
  const crop = (params.crop_name as string) || '';
  const variety = (params.variety as string) || '';
  const qty = params.quantity_kg as number | undefined;
  const price = params.price_per_kg as number | undefined;

  const cropHi = crop ? hi(crop) : '';
  const cropLabel = variety ? `${variety} ${cropHi}` : cropHi;

  switch (intent) {
    case 'CREATE_LISTING':
      if (crop && qty && price) {
        return pick([
          `जी, ${qty} किलो ${cropLabel}, ₹${price} किलो — आपकी listing अभी बन रही है!`,
          `${qty} किलो ${cropLabel}, ₹${price} प्रति किलो — listing बना रही हूं।`,
          `चलिए, ${qty} किलो ${cropLabel} ₹${price} किलो पर — listing तैयार कर रही हूं!`,
        ]);
      }
      if (crop) {
        return pick([
          `${cropLabel} की listing बनाती हूं — कितने किलो और क्या भाव रखें?`,
          `${cropLabel} बेचना है? बताइए — कितनी मात्रा और कितने रुपए किलो?`,
        ]);
      }
      return pick([
        'कौन सी फसल बेचनी है? फसल का नाम, मात्रा, और भाव बताइए।',
        'Listing बनाती हूं — बताइए कौन सी फसल, कितने किलो, और क्या दाम?',
      ]);

    case 'CHECK_MANDI_PRICE':
      return crop
        ? pick([
            `${cropHi} का आज का मंडी भाव देखती हूं।`,
            `${cropHi} का मंडी रेट दिखा रही हूं।`,
          ])
        : pick([
            'कौन सी फसल का भाव चाहिए? बताइए — मैं दिखाती हूं।',
            'मंडी भाव देखती हूं — कौन सी फसल का रेट चाहिए?',
          ]);

    case 'PRICE_FORECAST':
      return crop
        ? pick([
            `${cropLabel} का भाव आगे क्या होगा — देखती हूं।`,
            `${cropLabel} के भविष्य के भाव का अनुमान दिखा रही हूं।`,
          ])
        : pick([
            'आगे भाव क्या होगा — देखती हूं। कौन सी फसल?',
            'भाव का अनुमान दिखाती हूं — कौन सी फसल का?',
          ]);

    case 'CHECK_WEATHER':
      return pick([
        'मौसम की जानकारी दिखा रही हूं — खेती की सलाह भी मिलेगी।',
        'आपके इलाके का मौसम देखती हूं — बारिश, धूप, सब बताऊंगी।',
      ]);

    case 'NAVIGATE_DASHBOARD':
      return pick([
        'जी, मुख्य पेज पर ले चलती हूं।',
        'डैशबोर्ड खोल रही हूं।',
      ]);

    case 'NAVIGATE_LISTINGS':
      return pick([
        'आपकी सारी listing दिखा रही हूं।',
        'जी, आपकी फसल की listing खोल रही हूं।',
      ]);

    case 'VIEW_ORDERS':
      return pick([
        'आपके ऑर्डर दिखा रही हूं।',
        'जी, ऑर्डर खोल रही हूं — देखिए कौन-कौन से आए हैं।',
      ]);

    case 'MARK_OUT_FOR_DELIVERY':
      return pick([
        'डिलीवरी के लिए भेज रही हूं।',
        'जी, माल भेजने की तैयारी कर रही हूं।',
      ]);

    case 'VIEW_INCOME':
      return pick([
        'आपकी कमाई दिखा रही हूं।',
        'जी, आपकी आमदनी का हिसाब खोल रही हूं।',
      ]);

    case 'VIEW_SCORE':
      return pick([
        'आपकी रेटिंग दिखा रही हूं।',
        'जी, आपका स्कोर देखती हूं।',
      ]);

    case 'PAUSE_LISTING':
      return pick([
        'Listing रोक रही हूं — जब चाहें फिर चालू कर दूंगी।',
        'जी, listing अभी बंद कर रही हूं।',
      ]);

    case 'RESUME_LISTING':
      return pick([
        'Listing फिर से चालू कर रही हूं!',
        'जी, listing दोबारा शुरू कर रही हूं।',
      ]);

    case 'EDIT_PRICE':
      if (price && crop) {
        return pick([
          `${cropLabel} का भाव ₹${price} किलो कर रही हूं।`,
          `जी, ${cropLabel} का दाम ₹${price} प्रति किलो अपडेट कर रही हूं।`,
        ]);
      }
      return price
        ? `भाव ₹${price} कर रही हूं।`
        : 'नया भाव बताइए — कितने रुपए किलो?';

    case 'OUT_OF_SCOPE':
      return pick([
        'माफ़ करना, मैं सिर्फ खेती-बाड़ी में मदद कर सकती हूं। फसल, मंडी भाव, या मौसम पूछें।',
        'जी, मैं केवल किसानी के काम में मदद करती हूं — फसल बेचना हो, भाव पूछना हो, तो बताइए।',
        'यह मेरे दायरे से बाहर है — मैं खेती, मंडी, और मौसम की बातें कर सकती हूं।',
      ]);

    case 'HELP':
    default:
      return pick([
        'बोलिए — फसल बेचनी हो, मंडी भाव पूछना हो, या मौसम देखना हो — मैं हाज़िर हूं!',
        'मैं आपकी खेती-बाड़ी की सहायक हूं। बोलें — listing बनाओ, भाव दिखाओ, या ऑर्डर दिखाओ।',
        'क्या करना है? बोलें — फसल बेचो, मंडी भाव, मौसम, या ऑर्डर देखो।',
      ]);
  }
}
