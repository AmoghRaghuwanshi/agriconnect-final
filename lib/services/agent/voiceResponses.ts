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
        return `${qty} किलो ${cropLabel}, ${price} रुपए किलो — listing बना रहा हूं।`;
      }
      if (crop) {
        return `${cropLabel} की listing बनाते हैं। quantity और price बताइए।`;
      }
      return 'Listing बनाते हैं। Crop, variety, quantity, और price बताइए।';

    case 'CHECK_MANDI_PRICE':
      return crop
        ? `${crop} का mandi भाव दिखा रहा हूं।`
        : 'Mandi भाव दिखा रहा हूं।';

    case 'VIEW_ORDERS':
      return 'आपके orders दिखा रहा हूं।';

    case 'MARK_OUT_FOR_DELIVERY':
      return 'Delivery mark कर रहा हूं।';

    case 'VIEW_INCOME':
      return 'आपकी कमाई दिखा रहा हूं।';

    case 'VIEW_SCORE':
      return 'आपका score दिखा रहा हूं।';

    case 'PAUSE_LISTING':
      return 'Listing band कर रहा हूं।';

    case 'RESUME_LISTING':
      return 'Listing चालू कर रहा हूं।';

    case 'EDIT_PRICE':
      if (price && crop) {
        return `${cropLabel} का price ${price} रुपए कर रहा हूं।`;
      }
      return price
        ? `Price ${price} रुपए कर रहा हूं।`
        : 'Price बदलने के लिए नया price बताइए।';

    case 'HELP':
    default:
      return 'बोलें: "100 kilo gehun, 21 rupye kilo" — या "meri orders dikhao"।';
  }
}
