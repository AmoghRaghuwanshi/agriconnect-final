export async function getSoilData(lat: number, lng: number) {
  try {
    const properties = ["phh2o", "soc", "nitrogen", "clay", "sand", "silt", "cec"].join(",");
    const depths = "0-5cm"; // Only topsoil for immediate analysis
    
    // SoilGrids REST API
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=${properties}&depth=${depths}&value=mean`;
    
    const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24h
    if (!res.ok) throw new Error("Failed to fetch soil data");
    
    const data = await res.json();
    
    return {
      pH: data.properties?.phh2o?.["0-5cm"]?.mean / 10 || 6.5, // stored as 10x
      organicCarbon_gkg: data.properties?.soc?.["0-5cm"]?.mean / 10 || 1.2,
      nitrogen_gkg: data.properties?.nitrogen?.["0-5cm"]?.mean / 100 || 0.15,
      clay_pct: data.properties?.clay?.["0-5cm"]?.mean / 10 || 30,
      sand_pct: data.properties?.sand?.["0-5cm"]?.mean / 10 || 40,
      silt_pct: data.properties?.silt?.["0-5cm"]?.mean / 10 || 30,
      cec: data.properties?.cec?.["0-5cm"]?.mean / 10 || 15, // Cation Exchange Capacity
      status: 'success'
    };
  } catch (error) {
    console.warn("SoilGrids API failed, using regional averages", error);
    // Fallback to reasonable Indian regional averages so the AI still works
    return {
      pH: 6.8,
      organicCarbon_gkg: 1.1,
      nitrogen_gkg: 0.12,
      clay_pct: 35,
      sand_pct: 45,
      silt_pct: 20,
      cec: 14,
      status: 'fallback'
    };
  }
}
