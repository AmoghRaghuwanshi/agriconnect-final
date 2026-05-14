/**
 * GET /api/weather?lat=XX&lon=XX&city=XX
 * Free weather data via Open-Meteo (no API key needed).
 * Returns current + 7-day forecast with farming-relevant fields.
 */

export const runtime = 'nodejs';

export interface WeatherDay {
  date: string;
  day: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  rain_mm: number;
  rain_prob: number;
  wind_kmh: number;
  wind_dir: string;
  uv: number;
  condition: string;
  icon: string;
  farming_tip: string;
}

export interface WeatherResponse {
  city: string;
  lat: number;
  lon: number;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_kmh: number;
    wind_dir: string;
    rain_mm: number;
    uv: number;
    condition: string;
    icon: string;
  };
  daily: WeatherDay[];
  farming_summary: string;
  farming_summary_hi: string;
  rain_48h: { hour: string; prob: number; rain_mm: number }[];
  rain_48h_max_prob: number;
  rain_48h_total_mm: number;
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

const WIND_DIR = ['N','NE','E','SE','S','SW','W','NW'];
function windDirection(deg: number): string {
  return WIND_DIR[Math.round(deg / 45) % 8];
}

function weatherCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
  if (code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code <= 48) return { condition: 'Foggy', icon: '🌫️' };
  if (code <= 57) return { condition: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { condition: 'Rain', icon: '🌧️' };
  if (code <= 77) return { condition: 'Snow', icon: '❄️' };
  if (code <= 82) return { condition: 'Heavy Rain', icon: '⛈️' };
  if (code <= 86) return { condition: 'Snow Showers', icon: '🌨️' };
  if (code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };
  return { condition: 'Unknown', icon: '🌤️' };
}

const DAYS_HI = ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'];

function farmingTip(rain: number, tempMax: number, humidity: number, uv: number): string {
  if (rain > 20) return 'Heavy rain expected — avoid spraying pesticides. Check field drainage.';
  if (rain > 5) return 'Light to moderate rain — good for crops. Delay irrigation.';
  if (tempMax > 42) return 'Extreme heat — irrigate early morning/late evening. Mulch crops.';
  if (tempMax > 38) return 'Hot day — ensure adequate irrigation. Avoid midday field work.';
  if (humidity > 85) return 'High humidity — watch for fungal diseases. Ensure air circulation.';
  if (uv > 8) return 'Very high UV — protect nursery plants with shade nets.';
  if (tempMax < 10) return 'Cold conditions — protect crops with plastic mulch or row covers.';
  return 'Good conditions for field work. Ideal for sowing, spraying, or harvesting.';
}

function generateFarmingSummary(daily: WeatherDay[]): { en: string; hi: string } {
  const totalRain = daily.slice(0, 7).reduce((s, d) => s + d.rain_mm, 0);
  const avgTemp = Math.round(daily.slice(0, 7).reduce((s, d) => s + (d.temp_max + d.temp_min) / 2, 0) / Math.min(7, daily.length));
  const rainyDays = daily.slice(0, 7).filter(d => d.rain_mm > 2).length;

  let en = `7-day outlook: ${rainyDays} rainy day(s), total ${Math.round(totalRain)}mm rain, avg temp ${avgTemp}°C. `;
  let hi = `7 दिन: ${rainyDays} बारिश वाले दिन, कुल ${Math.round(totalRain)}mm बारिश, औसत तापमान ${avgTemp}°C। `;

  if (totalRain > 50) {
    en += 'Heavy rainfall week — postpone sowing, ensure drainage, avoid spraying.';
    hi += 'भारी बारिश — बुवाई टालें, जल निकासी सुनिश्चित करें।';
  } else if (totalRain > 15) {
    en += 'Moderate rain expected — good for standing crops, skip irrigation.';
    hi += 'मध्यम बारिश — खड़ी फसल के लिए अच्छा, सिंचाई न करें।';
  } else if (avgTemp > 40) {
    en += 'Heat wave conditions — irrigate frequently, use mulching to conserve moisture.';
    hi += 'लू की स्थिति — बार-बार सिंचाई करें, मल्चिंग से नमी बचाएं।';
  } else {
    en += 'Favorable conditions for most farm activities.';
    hi += 'खेती के अधिकांश कार्यों के लिए अनुकूल मौसम।';
  }
  return { en, hi };
}

/* ── Geocoding (city → lat/lon) ────────────────────────────────────────────── */

async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const data = await res.json();
    if (data.results?.length > 0) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name };
    }
    return null;
  } catch { return null; }
}

/* ── API Handler ───────────────────────────────────────────────────────────── */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let lat = parseFloat(url.searchParams.get('lat') || '');
    let lon = parseFloat(url.searchParams.get('lon') || '');
    let city = url.searchParams.get('city') || '';

    if (!isNaN(lat) && !isNaN(lon) && !city) {
      // Reverse geocode: lat/lon → city name
      try {
        const rg = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`);
        const rgd = await rg.json();
        city = rgd.results?.[0]?.name || 'Your Location';
      } catch {
        // Fallback: use Nominatim for reverse geocoding
        try {
          const nom = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`);
          const nomd = await nom.json();
          city = nomd.address?.city || nomd.address?.town || nomd.address?.village || nomd.address?.county || 'Your Location';
        } catch { city = 'Your Location'; }
      }
    } else if (isNaN(lat) || isNaN(lon)) {
      // Forward geocode: city → lat/lon
      if (!city) city = 'Bhopal';
      const geo = await geocodeCity(city);
      if (geo) { lat = geo.lat; lon = geo.lon; city = geo.name; }
      else { lat = 23.26; lon = 77.41; city = 'Bhopal'; }
    }

    // Fetch weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,rain,weather_code,uv_index,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max,relative_humidity_2m_max&hourly=precipitation_probability,rain&timezone=Asia/Kolkata&forecast_days=7`;

    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error('Weather API failed');
    const w = await res.json();

    const current = w.current;
    const d = w.daily;

    const daily: WeatherDay[] = d.time.map((date: string, i: number) => {
      const dayDate = new Date(date);
      const dayName = dayDate.toLocaleDateString('en-IN', { weekday: 'short' });
      const cond = weatherCondition(d.weather_code[i]);
      const rain = d.rain_sum[i] || 0;
      const tempMax = d.temperature_2m_max[i];
      const hum = d.relative_humidity_2m_max[i] || 70;
      const uv = d.uv_index_max[i] || 0;

      return {
        date,
        day: dayName,
        temp_max: Math.round(tempMax),
        temp_min: Math.round(d.temperature_2m_min[i]),
        humidity: Math.round(hum),
        rain_mm: Math.round(rain * 10) / 10,
        rain_prob: d.precipitation_probability_max[i] || 0,
        wind_kmh: Math.round(d.wind_speed_10m_max[i] || 0),
        wind_dir: windDirection(d.wind_direction_10m_dominant[i] || 0),
        uv: Math.round(uv),
        ...cond,
        farming_tip: farmingTip(rain, tempMax, hum, uv),
      };
    });

    const cCond = weatherCondition(current.weather_code);
    const summary = generateFarmingSummary(daily);

    // Build 48-hour rain probability timeline
    const h = w.hourly;
    const rain48h = (h?.time || []).slice(0, 48).map((t: string, i: number) => ({
      hour: new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true }),
      prob: h.precipitation_probability?.[i] || 0,
      rain_mm: Math.round((h.rain?.[i] || 0) * 10) / 10,
    }));
    const rain48hMaxProb = Math.max(0, ...rain48h.map((r: { prob: number }) => r.prob));
    const rain48hTotalMm = Math.round(rain48h.reduce((s: number, r: { rain_mm: number }) => s + r.rain_mm, 0) * 10) / 10;

    const response: WeatherResponse = {
      city,
      lat, lon,
      current: {
        temp: Math.round(current.temperature_2m),
        feels_like: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        wind_kmh: Math.round(current.wind_speed_10m),
        wind_dir: windDirection(current.wind_direction_10m),
        rain_mm: current.rain || 0,
        uv: Math.round(current.uv_index || 0),
        ...cCond,
      },
      daily,
      farming_summary: summary.en,
      farming_summary_hi: summary.hi,
      rain_48h: rain48h,
      rain_48h_max_prob: rain48hMaxProb,
      rain_48h_total_mm: rain48hTotalMm,
    };

    return Response.json(response);
  } catch (err) {
    console.error('[Weather API]', err instanceof Error ? err.message : err);
    return Response.json({ error: 'Weather data unavailable' }, { status: 500 });
  }
}
