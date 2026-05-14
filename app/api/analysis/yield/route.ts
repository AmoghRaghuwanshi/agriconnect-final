import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { getSoilData } from '@/lib/services/gis/soilService';
import { getWeatherData } from '@/lib/services/gis/weatherService';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { fieldId, refresh } = await request.json();
    if (!fieldId) return NextResponse.json({ error: 'fieldId required' }, { status: 400 });

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("No database URL");
    const sql = neon(databaseUrl);

    // 1. Fetch field from DB
    const fieldRows = await sql`SELECT * FROM fields WHERE id = ${fieldId}`;
    if (fieldRows.length === 0) return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    const field = fieldRows[0];

    // 2. Check for cached analysis (unless refresh is requested)
    if (!refresh) {
      const cached = await sql`SELECT * FROM field_analyses WHERE field_id = ${fieldId} ORDER BY created_at DESC LIMIT 1`;
      if (cached.length > 0) {
        console.log(`[Yield] ✅ Serving cached analysis for ${fieldId}`);
        return NextResponse.json({
          success: true,
          cached: true,
          cachedAt: cached[0].created_at,
          context: { soil: cached[0].soil_data, weather: cached[0].weather_data, field },
          analysis: cached[0].analysis,
        });
      }
    }

    // 3. Fetch parallel live data
    const lat = Number(field.center_lat);
    const lng = Number(field.center_lng);
    
    const [soil, weather] = await Promise.all([
      getSoilData(lat, lng),
      getWeatherData(lat, lng)
    ]);

    // 4. Build comprehensive prompt
    const prompt = `You are an expert Indian agronomist with 30+ years of experience in precision agriculture. Analyze this live field data and provide a comprehensive JSON report.
    
    FIELD INFO:
    Name: ${field.name}
    Area: ${field.area_ha} hectares
    Location (Lat/Lng): ${lat}, ${lng}

    SOIL DATA (SoilGrids API — real data):
    pH: ${soil.pH}
    Organic Carbon: ${soil.organicCarbon_gkg} g/kg
    Nitrogen: ${soil.nitrogen_gkg} g/kg
    Clay/Sand/Silt: ${soil.clay_pct}% / ${soil.sand_pct}% / ${soil.silt_pct}%
    CEC: ${soil.cec} cmol/kg

    WEATHER DATA (Open-Meteo 14-day forecast — real data):
    Max Temp: ${weather.maxTempNextWeek}°C
    Min Temp: ${weather.minTempNextWeek}°C
    Total Rainfall (14d): ${weather.totalRainfallNext14Days}mm
    Avg Humidity: ${weather.avgHumidity}%
    Heat Stress Days (>35°C): ${weather.heatStressDays}
    Drought Risk: ${weather.droughtRisk}
    ET0 (Evapotranspiration): ${weather.totalET0}mm
    
    VEGETATION (Simulated NDVI):
    Current NDVI: ${weather.simulatedNDVI} (${weather.ndviStatus})

    Provide a JSON response ONLY with exactly this structure (all fields mandatory):
    {
      "predictedYieldQtlHa": 45.5,
      "confidenceRange": "40-50",
      "scores": {
        "overall": 85,
        "soil": 80,
        "weather": 90,
        "vegetation": 85
      },
      "limitingFactors": ["Low nitrogen levels", "High heat stress risk"],
      "bestCrops": [
        {"name": "Wheat", "reason": "Ideal soil pH and winter temps", "expectedYield": "42-48 qtl/ha"},
        {"name": "Mustard", "reason": "Low water requirement suits current drought risk", "expectedYield": "18-22 qtl/ha"},
        {"name": "Chickpea", "reason": "Fixes nitrogen naturally, good for this soil", "expectedYield": "15-20 qtl/ha"}
      ],
      "avoidCrops": [
        {"name": "Rice", "reason": "Insufficient rainfall and high water demand"}
      ],
      "fertilizerPlan": {
        "basal": "Apply 50kg DAP + 25kg MOP per hectare before sowing",
        "firstTopDress": "After 21 days: Apply 30kg Urea per hectare",
        "secondTopDress": "After 45 days: Apply 25kg Urea per hectare",
        "micronutrients": "Apply ZnSO4 at 25kg/ha if zinc deficiency observed",
        "organic": "Add 2-3 tonnes FYM or vermicompost per hectare to improve organic carbon"
      },
      "pestWarnings": [
        {"pest": "Aphids", "risk": "Medium", "prevention": "Apply Imidacloprid 17.8% SL at 0.5ml/L if colonies appear"},
        {"pest": "Yellow rust", "risk": "High", "prevention": "Apply Propiconazole 25% EC at 1ml/L as preventive spray"}
      ],
      "irrigationAdvisory": "Schedule first irrigation at crown root initiation stage (21 DAS). Use 6cm water depth per irrigation.",
      "fertilizerRecommendation": "Total NPK requirement: 120:60:40 kg/ha. Split nitrogen in 3 doses for maximum efficiency.",
      "advisoryHindi": "इस खेत में गेहूं की बुवाई के लिए 50 किलो DAP और 25 किलो MOP प्रति हेक्टेयर डालें। 21 दिन बाद 30 किलो यूरिया की पहली टॉप ड्रेसिंग करें। सिंचाई 21 दिन बाद करें।",
      "soilHealthTips": "Your soil has low organic carbon. Add FYM or green manure crops like dhaincha in summer to improve soil structure and water retention."
    }`;

    // 5. Call Gemini using Rotation Strategy
    const GEMINI_KEYS = [
      process.env.GEMINI_API_KEY_1 ?? '',
      process.env.GEMINI_API_KEY_2 ?? '',
      process.env.GEMINI_API_KEY_3 ?? '',
      process.env.GEMINI_API_KEY_4 ?? '',
      process.env.GEMINI_API_KEY_5 ?? '',
    ].filter(k => k.length > 0 && k !== 'placeholder');

    if (GEMINI_KEYS.length === 0) throw new Error("No Gemini keys found");
    const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

    let analysisJson = null;
    let success = false;

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const key = GEMINI_KEYS[i];
      for (const modelName of MODELS) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });

          const result = await model.generateContent(prompt);
          const analysisText = result.response.text();
          analysisJson = JSON.parse(analysisText);
          success = true;
          console.log(`[Yield] ✅ Success with key ${i + 1}, model ${modelName}`);
          break;
        } catch (err: any) {
          console.warn(`[Yield] ⚠️ Failed with key ${i + 1}, model ${modelName}:`, err.message);
        }
      }
      if (success) break;
    }

    if (!success || !analysisJson) {
      throw new Error("All Gemini keys and models failed or quota exceeded.");
    }

    // 6. Cache the result in the database
    try {
      const analysisId = `A${Date.now().toString(36).toUpperCase()}`;
      await sql`
        INSERT INTO field_analyses (id, field_id, analysis, soil_data, weather_data)
        VALUES (${analysisId}, ${fieldId}, ${JSON.stringify(analysisJson)}, ${JSON.stringify(soil)}, ${JSON.stringify(weather)})
      `;
      console.log(`[Yield] 💾 Cached analysis ${analysisId} for field ${fieldId}`);
    } catch (cacheErr) {
      console.warn('[Yield] ⚠️ Failed to cache analysis:', cacheErr);
    }

    return NextResponse.json({
      success: true,
      cached: false,
      context: { soil, weather, field },
      analysis: analysisJson
    });

  } catch (error) {
    console.error("Yield Analysis Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
