export async function getWeatherData(lat: number, lng: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,et0_fao_evapotranspiration&forecast_days=14&timezone=Asia/Kolkata`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1h
    if (!res.ok) throw new Error("Failed to fetch weather data");
    
    const forecast = await res.json();
    const daily = forecast.daily;
    
    const temps = daily.temperature_2m_max;
    const rain = daily.precipitation_sum;
    
    const totalRainfallNext14Days = rain.reduce((a: number, b: number) => a + b, 0);
    const avgHumidity = daily.relative_humidity_2m_max.reduce((a: number, b: number) => a + b, 0) / 14;
    const totalET0 = daily.et0_fao_evapotranspiration.reduce((a: number, b: number) => a + b, 0);
    
    // Mathematically simulate NDVI based on recent/forecast weather since NASA API is unavailable
    // A simple heuristic: High ET0 and low rain = lower NDVI (stress). Moderate temps + good rain = high NDVI (0.7)
    let simulatedNDVI = 0.5; // Baseline
    if (totalRainfallNext14Days > 20 && totalET0 < 50) simulatedNDVI += 0.2;
    if (Math.max(...temps) > 38) simulatedNDVI -= 0.15;
    if (totalRainfallNext14Days < 5) simulatedNDVI -= 0.1;
    
    // Clamp between 0.2 and 0.85
    simulatedNDVI = Math.max(0.2, Math.min(0.85, simulatedNDVI));
    
    return {
      maxTempNextWeek: Math.max(...temps.slice(0, 7)),
      minTempNextWeek: Math.min(...daily.temperature_2m_min.slice(0, 7)),
      totalRainfallNext14Days: totalRainfallNext14Days.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      heatStressDays: temps.filter((t: number) => t > 35).length,
      droughtRisk: rain.filter((r: number) => r < 2).length > 10 ? "High" : "Low",
      totalET0: totalET0.toFixed(1),
      simulatedNDVI: simulatedNDVI.toFixed(2),
      ndviStatus: simulatedNDVI > 0.6 ? "Healthy" : simulatedNDVI > 0.4 ? "Moderate" : "Stressed",
      status: 'success'
    };
  } catch (error) {
    console.warn("Open-Meteo API failed", error);
    return {
      maxTempNextWeek: 34,
      minTempNextWeek: 22,
      totalRainfallNext14Days: "12.5",
      avgHumidity: "65.0",
      heatStressDays: 2,
      droughtRisk: "Medium",
      totalET0: "45.0",
      simulatedNDVI: "0.55",
      ndviStatus: "Moderate",
      status: 'fallback'
    };
  }
}
