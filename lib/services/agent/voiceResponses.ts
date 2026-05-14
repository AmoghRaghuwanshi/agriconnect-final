/**
 * Hindi voice response strings for each intent.
 * Used by SpeechSynthesis (TTS) to speak back to the farmer.
 */

export function getVoiceResponse(
  intent: string,
  params: Record<string, unknown>
): string {
  const crop = (params.crop_name as string) || '';
  const variety = (params.variety as string) || '';
  const qty = params.quantity_kg as number | undefined;
  const price = params.price_per_kg as number | undefined;

  const cropLabel = variety ? `${variety} ${crop}` : crop;

  switch (intent) {
    case 'CREATE_LISTING':
      if (crop && qty && price) {
        return `${qty} किलो ${cropLabel}, ${price} रुपए किलो — listing बना रही हूं।`;
      }
      if (crop) {
        return `${cropLabel} की listing बनाते हैं। quantity और price बताइए।`;
      }
      return 'Listing बनाते हैं। Crop, variety, quantity, और price बताइए।';

    case 'CHECK_MANDI_PRICE':
      return crop
        ? `${crop} का mandi भाव दिखा रही हूं।`
        : 'Mandi भाव दिखा रही हूं।';

    case 'PRICE_FORECAST':
      return crop
        ? `${cropLabel} का price forecast दिखा रही हूं — आगे क्या भाव होगा।`
        : 'Price forecast दिखा रही हूं।';

    case 'CHECK_WEATHER':
      return 'मौसम की जानकारी दिखा रही हूं — खेती के लिए सलाह भी मिलेगी।';

    case 'NAVIGATE_DASHBOARD':
      return 'Dashboard पे ले जा रही हूं।';

    case 'NAVIGATE_LISTINGS':
      return 'आपकी listings दिखा रही हूं।';

    case 'VIEW_ORDERS':
      return 'आपके orders दिखा रही हूं।';

    case 'MARK_OUT_FOR_DELIVERY':
      return 'Delivery mark कर रही हूं।';

    case 'VIEW_INCOME':
      return 'आपकी कमाई दिखा रही हूं।';

    case 'VIEW_SCORE':
      return 'आपका score दिखा रही हूं।';

    case 'PAUSE_LISTING':
      return 'Listing band कर रही हूं।';

    case 'RESUME_LISTING':
      return 'Listing चालू कर रही हूं।';

    case 'EDIT_PRICE':
      if (price && crop) {
        return `${cropLabel} का price ${price} रुपए कर रही हूं।`;
      }
      return price
        ? `Price ${price} रुपए कर रही हूं।`
        : 'Price बदलने के लिए नया price बताइए।';

    case 'HELP':
    default:
      return 'बोलें: listing बनाओ, mausam dikhao, price forecast, mandi bhav, orders dikhao, या dashboard।';
  }
}
