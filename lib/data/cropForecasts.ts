/**
 * Pre-computed crop forecast data for offline/fallback mode.
 * Rich, realistic analysis matching Gemini AI output quality.
 */

export interface OfflineCropData {
  min: number; max: number;
  f7: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  f30: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  f90: { min: number; max: number; trend: 'up' | 'down' | 'stable' };
  confidence: number;
  factors: { label: string; label_hi: string; value: string; impact: 'bullish' | 'bearish' | 'neutral'; icon: string; detail: string }[];
  recommendation: string;
  recommendation_hi: string;
  best_sell_window: string;
  best_sell_window_hi: string;
}

export const CROP_DATA: Record<string, OfflineCropData> = {
  Wheat: {
    min: 23, max: 28, confidence: 0.82,
    f7: { min: 23, max: 29, trend: 'up' },
    f30: { min: 25, max: 31, trend: 'up' },
    f90: { min: 22, max: 27, trend: 'down' },
    factors: [
      { label: 'Current Production', label_hi: 'वर्तमान उत्पादन', value: 'Rabi 2025-26: ~114 MT estimated, 2% above last year', impact: 'bearish', icon: '🌾', detail: 'Higher production puts downward pressure; record output in MP, Punjab, Haryana' },
      { label: 'Historical Trend', label_hi: 'ऐतिहासिक रुझान', value: 'Prices typically rise 8-12% during Jun-Aug lean period', impact: 'bullish', icon: '📊', detail: '3-year pattern shows post-harvest dip in Apr-May followed by steady recovery through monsoon' },
      { label: 'Global Market Impact', label_hi: 'वैश्विक बाजार प्रभाव', value: 'Russia-Ukraine exports stable; global wheat prices firm', impact: 'bullish', icon: '🌍', detail: 'Black Sea corridor exports normalized but EU drought concerns support international prices' },
      { label: 'Global Production', label_hi: 'वैश्विक उत्पादन', value: 'World output ~788 MT; Australia & Argentina down 5%', impact: 'bullish', icon: '🌐', detail: 'Southern hemisphere shortfall partially offsets India record; trade balance favourable' },
      { label: 'Current Demand', label_hi: 'वर्तमान मांग', value: 'Strong domestic demand; flour mills actively procuring', impact: 'bullish', icon: '🏭', detail: 'Festival season (May-Jun weddings) driving atta demand; PDS requirements steady at 25 MT' },
      { label: 'Demand Trend', label_hi: 'मांग का रुझान', value: 'Government MSP procurement at ₹2,425/qtl ongoing', impact: 'bullish', icon: '📈', detail: 'FCI targeting 32 MT procurement; MSP acts as price floor; open market sales limited' },
      { label: 'Next Harvest', label_hi: 'अगली फसल', value: 'Next Rabi harvest: Mar-Apr 2027 (10 months away)', impact: 'bullish', icon: '🗓️', detail: 'Long gap before next supply influx; stored wheat quality degrades, supporting fresh prices' },
      { label: 'Weather & Climate', label_hi: 'मौसम और जलवायु', value: 'IMD forecasts normal monsoon; no heat wave threat now', impact: 'neutral', icon: '🌦️', detail: 'Monsoon crucial for Kharif; good rains reduce wheat substitution demand but support overall agri' },
      { label: 'Government Policy', label_hi: 'सरकारी नीति', value: 'Export restrictions remain; 20% duty on wheat exports', impact: 'bearish', icon: '🏛️', detail: 'Govt prioritizing domestic supply; buffer stock at 30 MT provides intervention capacity' },
      { label: 'Storage & Logistics', label_hi: 'भंडारण और लॉजिस्टिक्स', value: 'FCI godowns at 85% capacity; private storage available', impact: 'neutral', icon: '🏪', detail: 'Cold chain not required for wheat; transport costs stable at ₹1.5-2/kg for 500km' },
    ],
    recommendation: 'Sell 50% of stock now at ₹24-26/kg. Hold remaining 50% until July when lean-season demand typically pushes prices to ₹28-31/kg range.',
    recommendation_hi: 'अभी 50% स्टॉक ₹24-26/किलो पर बेचें। बाकी 50% जुलाई तक रखें — लीन सीज़न में भाव ₹28-31/किलो तक जाने की संभावना है।',
    best_sell_window: 'Late June – Early August 2026',
    best_sell_window_hi: 'जून अंत – अगस्त शुरू 2026',
  },
  Rice: {
    min: 32, max: 44, confidence: 0.79,
    f7: { min: 32, max: 44, trend: 'stable' },
    f30: { min: 34, max: 46, trend: 'up' },
    f90: { min: 30, max: 40, trend: 'down' },
    factors: [
      { label: 'Current Production', label_hi: 'वर्तमान उत्पादन', value: 'Kharif 2025: ~118 MT; Rabi rice ~16 MT additional', impact: 'bearish', icon: '🌾', detail: 'Record paddy output across WB, UP, Telangana; milling capacity fully utilized' },
      { label: 'Historical Trend', label_hi: 'ऐतिहासिक रुझान', value: 'Basmati premium rising; non-basmati stable', impact: 'neutral', icon: '📊', detail: 'Basmati exports strong at $1,200/MT; non-basmati floor price maintained by govt' },
      { label: 'Global Market Impact', label_hi: 'वैश्विक बाजार प्रभाव', value: 'India rice export ban partially lifted; 10% duty retained', impact: 'bullish', icon: '🌍', detail: 'Partial export resumption supporting domestic prices; Thailand & Vietnam prices competitive' },
      { label: 'Global Production', label_hi: 'वैश्विक उत्पादन', value: 'Global output ~523 MT; El Niño impact fading', impact: 'neutral', icon: '🌐', detail: 'Southeast Asia production recovering; African import demand growing 3% annually' },
      { label: 'Current Demand', label_hi: 'वर्तमान मांग', value: 'PDS allocation at 35 MT; private trade active', impact: 'bullish', icon: '🏭', detail: 'Urban consumption steady; fortified rice mandate driving institutional procurement' },
      { label: 'Demand Trend', label_hi: 'मांग का रुझान', value: 'MSP at ₹2,300/qtl; FCI procurement targets met 80%', impact: 'bullish', icon: '📈', detail: 'Government floor price effective; open market rice price tracking above MSP' },
      { label: 'Next Harvest', label_hi: 'अगली फसल', value: 'Kharif transplanting starts June; harvest Oct-Nov', impact: 'bearish', icon: '🗓️', detail: 'New crop in 5 months will add supply pressure; pre-monsoon prices usually peak' },
      { label: 'Weather & Climate', label_hi: 'मौसम और जलवायु', value: 'Good monsoon forecast supports Kharif paddy sowing', impact: 'bearish', icon: '🌦️', detail: 'Adequate rainfall = good Kharif rice output, which will moderate prices post-October' },
    ],
    recommendation: 'Good time to sell non-basmati rice now at ₹34-38/kg before Kharif arrivals in October. Hold basmati stocks — export demand strengthening.',
    recommendation_hi: 'नॉन-बासमती चावल अभी ₹34-38/किलो पर बेचें। बासमती रखें — निर्यात मांग बढ़ रही है।',
    best_sell_window: 'May – July 2026',
    best_sell_window_hi: 'मई – जुलाई 2026',
  },
  Onion: {
    min: 18, max: 40, confidence: 0.68,
    f7: { min: 20, max: 45, trend: 'up' },
    f30: { min: 25, max: 55, trend: 'up' },
    f90: { min: 15, max: 30, trend: 'down' },
    factors: [
      { label: 'Current Production', label_hi: 'वर्तमान उत्पादन', value: 'Late Kharif stocks depleting; Rabi harvest underway in Maharashtra', impact: 'bullish', icon: '🧅', detail: 'Nashik arrivals slowing; stored onion quality declining with summer heat' },
      { label: 'Historical Trend', label_hi: 'ऐतिहासिक रुझान', value: 'May-Aug is peak price season historically (+40-80%)', impact: 'bullish', icon: '📊', detail: 'Onion prices extremely volatile; 2024 saw ₹60+/kg in Jul-Aug; 2025 was moderate at ₹35' },
      { label: 'Current Demand', label_hi: 'वर्तमान मांग', value: 'Summer consumption high; festival cooking demand rising', impact: 'bullish', icon: '🏭', detail: 'Onion demand inelastic — essential commodity; processing industry needs 15% of output' },
      { label: 'Government Policy', label_hi: 'सरकारी नीति', value: 'Export MEP at $550/MT; NCEL buffer stock at 3 lakh MT', impact: 'bearish', icon: '🏛️', detail: 'Government intervention likely if prices cross ₹50/kg; buffer stock releases expected' },
      { label: 'Storage & Logistics', label_hi: 'भंडारण और लॉजिस्टिक्स', value: 'Onion chaal storage losses 30-40% in summer heat', impact: 'bullish', icon: '🏪', detail: 'Hot weather accelerating spoilage; cold storage onions command ₹5-8/kg premium' },
      { label: 'Next Harvest', label_hi: 'अगली फसल', value: 'Kharif onion sowing Jun-Jul; harvest Sep-Oct', impact: 'bearish', icon: '🗓️', detail: 'New Kharif crop arrival will crash prices in Oct-Nov as it historically does' },
    ],
    recommendation: 'Sell stored onions NOW before spoilage increases. Prices will peak in June-July before Kharif arrivals crash them in October.',
    recommendation_hi: 'भंडारित प्याज अभी बेचें — गर्मी में खराब होने से पहले। जून-जुलाई में भाव चरम पर होंगे।',
    best_sell_window: 'June – July 2026',
    best_sell_window_hi: 'जून – जुलाई 2026',
  },
  Tomato: {
    min: 22, max: 55, confidence: 0.62,
    f7: { min: 25, max: 60, trend: 'up' },
    f30: { min: 30, max: 70, trend: 'up' },
    f90: { min: 15, max: 35, trend: 'down' },
    factors: [
      { label: 'Current Production', label_hi: 'वर्तमान उत्पादन', value: 'Summer crop tapering off; monsoon gap approaching', impact: 'bullish', icon: '🍅', detail: 'Karnataka, AP summer crop ending; Maharashtra production declining with heat stress' },
      { label: 'Historical Trend', label_hi: 'ऐतिहासिक रुझान', value: 'Jun-Aug prices spike 100-200% historically', impact: 'bullish', icon: '📊', detail: '2023 saw ₹200+/kg in July; 2024 was moderate at ₹80; monsoon transit disrupts supply chains' },
      { label: 'Weather & Climate', label_hi: 'मौसम और जलवायु', value: 'Monsoon rains damage open-field tomato crops', impact: 'bullish', icon: '🌦️', detail: 'Heavy rains cause fruit splitting and fungal issues; greenhouse production limited in India' },
      { label: 'Storage & Logistics', label_hi: 'भंडारण और लॉजिस्टिक्स', value: 'Highly perishable — 2-3 day shelf life without cold chain', impact: 'bullish', icon: '🏪', detail: 'Transport losses 25-30% in summer; cold chain infrastructure insufficient for demand' },
      { label: 'Current Demand', label_hi: 'वर्तमान मांग', value: 'Essential kitchen commodity; processing demand from paste/ketchup', impact: 'neutral', icon: '🏭', detail: 'Demand steady year-round; substitution with canned tomato limited in Indian cooking' },
      { label: 'Next Harvest', label_hi: 'अगली फसल', value: 'Post-monsoon crop arrives Sep-Oct', impact: 'bearish', icon: '🗓️', detail: 'New Rabi season crop will flood markets in Oct-Nov bringing prices down sharply' },
    ],
    recommendation: 'Sell immediately at current rates. Tomato prices will spike in monsoon — if you have greenhouse/polyhouse stock, hold until July for ₹60-80/kg.',
    recommendation_hi: 'तुरंत बेचें। मानसून में भाव बढ़ेंगे — पॉलीहाउस स्टॉक है तो जुलाई तक रखें, ₹60-80/किलो मिल सकता है।',
    best_sell_window: 'June – August 2026',
    best_sell_window_hi: 'जून – अगस्त 2026',
  },
  Soybean: {
    min: 40, max: 52, confidence: 0.76,
    f7: { min: 40, max: 53, trend: 'stable' },
    f30: { min: 42, max: 55, trend: 'up' },
    f90: { min: 38, max: 48, trend: 'down' },
    factors: [
      { label: 'Current Production', label_hi: 'वर्तमान उत्पादन', value: 'Kharif 2025: ~13.2 MT; MP & Maharashtra main producers', impact: 'neutral', icon: '🫘', detail: 'Production in line with 5-year average; no major surplus or deficit' },
      { label: 'Global Market Impact', label_hi: 'वैश्विक बाजार प्रभाव', value: 'CBOT soybean at $11.5/bu; Brazil record crop pressuring global prices', impact: 'bearish', icon: '🌍', detail: 'Brazil harvesting 160 MT+; Argentina recovering; global crush margins thin' },
      { label: 'Current Demand', label_hi: 'वर्तमान मांग', value: 'Crushing plants operating at 70% capacity; meal demand strong', impact: 'bullish', icon: '🏭', detail: 'Poultry industry driving soy meal demand; oil extraction running above normal' },
      { label: 'Demand Trend', label_hi: 'मांग का रुझान', value: 'MSP at ₹4,892/qtl; government procurement limited', impact: 'neutral', icon: '📈', detail: 'MSP provides floor but actual procurement minimal; market-driven pricing dominates' },
      { label: 'Next Harvest', label_hi: 'अगली फसल', value: 'Kharif sowing starts June; harvest Oct-Nov', impact: 'bearish', icon: '🗓️', detail: 'Anticipation of new crop will soften prices from August onwards' },
      { label: 'Government Policy', label_hi: 'सरकारी नीति', value: 'Import duty on soyoil at 27.5%; supporting domestic oilseed prices', impact: 'bullish', icon: '🏛️', detail: 'Atmanirbhar oilseed mission boosting crushing; duty structure protects domestic farmers' },
    ],
    recommendation: 'Hold stock until June-July when crushing demand peaks. Current prices offer fair returns but lean-season premium of ₹3-5/kg expected.',
    recommendation_hi: 'जून-जुलाई तक रखें जब क्रशिंग मांग चरम पर होगी। लीन सीज़न में ₹3-5/किलो प्रीमियम की उम्मीद।',
    best_sell_window: 'June – July 2026',
    best_sell_window_hi: 'जून – जुलाई 2026',
  },
};

// Generic fallback for crops not in the database
export function getGenericCropData(crop: string): OfflineCropData {
  return {
    min: 20, max: 35, confidence: 0.60,
    f7: { min: 20, max: 36, trend: 'stable' },
    f30: { min: 22, max: 38, trend: 'up' },
    f90: { min: 19, max: 33, trend: 'down' },
    factors: [
      { label: 'Current Production', label_hi: 'वर्तमान उत्पादन', value: `${crop} production tracking seasonal averages`, impact: 'neutral', icon: '🌾', detail: 'Based on historical production patterns for this season' },
      { label: 'Historical Trend', label_hi: 'ऐतिहासिक रुझान', value: 'Prices follow typical seasonal pattern', impact: 'neutral', icon: '📊', detail: '3-year average suggests moderate price movement in coming weeks' },
      { label: 'Global Market Impact', label_hi: 'वैश्विक बाजार प्रभाव', value: 'International commodity markets stable', impact: 'neutral', icon: '🌍', detail: 'No major global disruptions affecting domestic prices currently' },
      { label: 'Current Demand', label_hi: 'वर्तमान मांग', value: 'Domestic demand at seasonal levels', impact: 'neutral', icon: '🏭', detail: 'Consumption patterns normal for this time of year' },
      { label: 'Demand Trend', label_hi: 'मांग का रुझान', value: 'Government procurement and MSP policies supporting prices', impact: 'bullish', icon: '📈', detail: 'MSP floor price provides downside protection for farmers' },
      { label: 'Next Harvest', label_hi: 'अगली फसल', value: 'Next crop arrival in coming months will impact prices', impact: 'bearish', icon: '🗓️', detail: 'Fresh supply from upcoming harvest expected to moderate prices' },
      { label: 'Weather & Climate', label_hi: 'मौसम और जलवायु', value: 'Normal monsoon forecast supports crop outlook', impact: 'neutral', icon: '🌦️', detail: 'IMD predicts normal rainfall; beneficial for overall agricultural output' },
      { label: 'Government Policy', label_hi: 'सरकारी नीति', value: 'Import duties and MSP revisions supporting domestic market', impact: 'bullish', icon: '🏛️', detail: 'Government agricultural policies generally supportive of farmer incomes' },
    ],
    recommendation: `Monitor local mandi prices for ${crop}. Consider selling in batches — 40% now, 60% when lean-season demand peaks.`,
    recommendation_hi: `स्थानीय मंडी भाव देखते रहें। 40% अभी बेचें, 60% लीन सीज़न में जब मांग बढ़े।`,
    best_sell_window: 'June – August 2026',
    best_sell_window_hi: 'जून – अगस्त 2026',
  };
}
