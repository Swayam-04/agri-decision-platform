/**
 * Weather Service Utility
 * Bridges Open-Meteo (Keyless) and WeatherAPI.com (Key-based)
 */

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  isLive: boolean;
  provider: "open-meteo" | "weatherapi" | "fallback";
}

const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  Punjab: { lat: 31.1471, lon: 75.3412 },
  Haryana: { lat: 29.0588, lon: 76.0856 },
  "Uttar Pradesh": { lat: 26.8467, lon: 80.9462 },
  "Madhya Pradesh": { lat: 22.9734, lon: 78.6569 },
  Rajasthan: { lat: 27.0238, lon: 74.2179 },
  Maharashtra: { lat: 19.7515, lon: 75.7139 },
  Gujarat: { lat: 22.2587, lon: 71.1924 },
  Karnataka: { lat: 15.3173, lon: 75.7139 },
  "Andhra Pradesh": { lat: 15.9129, lon: 79.7400 },
  Telangana: { lat: 18.1124, lon: 79.0193 },
  "Tamil Nadu": { lat: 11.1271, lon: 78.6569 },
  "West Bengal": { lat: 22.9868, lon: 87.8550 },
  Bihar: { lat: 25.0961, lon: 85.3131 },
  Odisha: { lat: 20.9517, lon: 85.0985 },
  Kerala: { lat: 10.8505, lon: 76.2711 },
  Assam: { lat: 26.2006, lon: 92.9376 },
  Jharkhand: { lat: 23.6102, lon: 85.2799 },
  Chhattisgarh: { lat: 21.2787, lon: 81.8661 },
  Uttarakhand: { lat: 30.0668, lon: 79.0193 },
  "Himachal Pradesh": { lat: 31.1048, lon: 77.1734 },
  "Jammu & Kashmir": { lat: 33.7782, lon: 76.5762 }
};

export async function getLiveWeather(region: string): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";
  const coords = REGION_COORDS[region] || REGION_COORDS["Punjab"];

  // 1. Try WeatherAPI.com if key is provided (Higher accuracy for rainfall)
  if (apiKey) {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${coords.lat},${coords.lon}`);
      if (res.ok) {
        const data = await res.json();
        return {
          temp: Math.round(data.current.temp_c),
          humidity: Math.round(data.current.humidity),
          rainfall: Math.round(data.current.precip_mm), // Precision rainfall
          isLive: true,
          provider: "weatherapi"
        };
      }
    } catch (e) {
      console.error("WeatherAPI failed, falling back to Open-Meteo", e);
    }
  }

  // 2. Default: Open-Meteo (Keyless)
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=auto`);
    if (res.ok) {
      const data = await res.json();
      return {
        temp: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        // Prefer current precipitation if available, else today's sum
        rainfall: Math.round(data.current.precipitation > 0 ? data.current.precipitation : (data.daily?.precipitation_sum?.[0] || 0)),
        isLive: true,
        provider: "open-meteo"
      };
    }
  } catch (e) {
    console.error("Open-Meteo failed, using hardcoded fallback", e);
  }

  // 3. Last Resort: Hardcoded Fallback
  return {
    temp: 30,
    humidity: 78,
    rainfall: 15,
    isLive: false,
    provider: "fallback"
  };
}
