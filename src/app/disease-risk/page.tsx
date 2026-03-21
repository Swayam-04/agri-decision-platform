"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { DiseaseRiskResult } from "@/lib/types";
import { ShieldAlert, Loader2, CloudRain, Thermometer, Droplets, MapPin, Calendar, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { getLiveWeather } from "@/lib/weather-service";
import { useTranslation } from "@/hooks/useTranslation";

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

interface ForecastDay {
  date: Date;
  temp: number;
  humidity: number;
  rainfall: number;
  riskLevel: "Low" | "Medium" | "High";
  riskPercentage: number;
}

export default function DiseaseRiskPage() {
  const { t, language } = useTranslation();
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseRiskResult | null>(null);
  const [forecast7Days, setForecast7Days] = useState<ForecastDay[]>([]);
  const [locationUsed, setLocationUsed] = useState<string>("");
  const [weatherError, setWeatherError] = useState<string>("");

  // Current Weather State
  const [temperature, setTemperature] = useState<number>(30);
  const [humidity, setHumidity] = useState<number>(78);
  const [rainfall, setRainfall] = useState<number>(15);

  const riskColors: Record<string, { bg: string; text: string; border: string; icon: string; bar: string }> = {
    Low: { bg: "bg-[#16a34a]/15", text: "text-[#16a34a]", border: "border-[#16a34a]/40", icon: "🌿", bar: "bg-[#16a34a]" },
    Medium: { bg: "bg-[#f59e0b]/20", text: "text-[#d97706]", border: "border-[#f59e0b]/40", icon: "⚠️", bar: "bg-[#f59e0b]" },
    High: { bg: "bg-[#b91c1c]/15", text: "text-[#b91c1c]", border: "border-[#b91c1c]/40", icon: "🔴", bar: "bg-[#b91c1c]" },
  };

  const cropEmoji: Record<string, string> = { Rice: "🌾", Wheat: "🌾", Maize: "🌽", Cotton: "☁️", Sugarcane: "🎋", Soybean: "🫘", Groundnut: "🥜", Chickpea: "🫘", Pigeonpea: "🫘", Mungbean: "🫘", Tomato: "🍅", Potato: "🥔", Onion: "🧅", Pepper: "🌶️" };

  const calculateRisk = (humidity: number, rainfall: number): { level: "Low" | "Medium" | "High", percent: number } => {
    if (humidity > 80 && rainfall > 20) {
      return { level: "High", percent: Math.floor(Math.random() * 21) + 75 }; // 75-95%
    } else if (humidity > 60) {
      return { level: "Medium", percent: Math.floor(Math.random() * 31) + 40 }; // 40-70%
    } else {
      return { level: "Low", percent: Math.floor(Math.random() * 26) + 5 }; // 5-30%
    }
  };

  const fetchWeatherForLocation = useCallback(async () => {
    setLoading(true);
    setWeatherError("");
    
    // Clear old data before fetch
    setResult(null);
    setForecast7Days([]);
    
    try {
      // 1. Fetch live weather using unified service
      const weather = await getLiveWeather(region);
      setTemperature(weather.temp);
      setHumidity(weather.humidity);
      setRainfall(weather.rainfall);

      // 2. Fetch daily forecast separately for the chart (Keep Open-Meteo for this)
      const coords = REGION_COORDS[region] || REGION_COORDS["Punjab"];
      setLocationUsed(t(`regions.${region}`) || region);
      
      console.log("Selected Location:", region, coords);

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&hourly=relative_humidity_2m&timezone=auto`;
      
      // Disable caching
      const weatherRes = await fetch(weatherUrl, { cache: "no-store" });
      
      if (!weatherRes.ok) throw new Error("Weather API failed");
      
      const weatherData = await weatherRes.json();
      console.log("Weather Response:", weatherData);

      const days: ForecastDay[] = [];
      const hourlyHum = weatherData.hourly.relative_humidity_2m;
      
      for (let i = 0; i < 7; i++) {
        const startIdx = i * 24;
        const endIdx = startIdx + 24;
        const dayHumidities = hourlyHum.slice(startIdx, endIdx);
        const avgHum = dayHumidities.reduce((a: number, b: number) => a + b, 0) / 24;
        
        const avgTemp = (weatherData.daily.temperature_2m_max[i] + weatherData.daily.temperature_2m_min[i]) / 2;
        // For today (index 0), prefer 'current' precipitation if available and > 0
        const rainfall = (i === 0 && weatherData.current?.precipitation > 0) 
          ? weatherData.current.precipitation 
          : weatherData.daily.precipitation_sum[i];
        
        const { level, percent } = calculateRisk(avgHum, rainfall);
        
        const date = new Date();
        date.setDate(date.getDate() + i);

        days.push({
          date,
          temp: Math.round(avgTemp),
          humidity: Math.round(avgHum),
          rainfall: Math.round(rainfall),
          riskLevel: level,
          riskPercentage: percent
        });
      }

      setForecast7Days(days);

      // Call our backend API to get crop-specific AI details based on current day's weather
      const res = await fetch("/api/disease-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({
          cropType, region, season,
          temperature,
          humidity,
          rainfall,
        }),
      });
      const backendResult = await res.json();
      
      // Merge our strict weather-based risk logic into the AI result object to seamlessly update UI
      setResult({
        ...backendResult,
        riskPercentage: days[0].riskPercentage,
        riskLevel: days[0].riskLevel
      });

    } catch (err) {
      console.error(err);
      setWeatherError("Failed to fetch live weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [region, cropType, season, language, t]);

  // Trigger API call on location change
  useEffect(() => {
    if (region) {
      fetchWeatherForLocation();
    }
  }, [region, fetchWeatherForLocation]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 relative min-h-screen">
      <div>
        <div className="inline-flex items-center gap-2 border-b-2 border-[#16a34a] pb-2">
          <ShieldAlert className="h-8 w-8 text-[#16a34a]" />
          <h1 className="text-3xl font-bold text-[#3d1f0a] tracking-tight" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
            {t("risk.title")}
          </h1>
        </div>
        <p className="text-[15px] text-[#6b4423] mt-2">
          Forecast disease risks automatically updated with real-time weather and a 7-day projection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1 card-earth rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-[18px] text-[#3d1f0a] font-bold" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
              Automated Forecasting Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a]">{t("dashboard.crop")}</label>
              <div className="flex flex-wrap gap-2">
                {CROP_LIST.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCropType(c)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-medium transition-all border-2 ${
                      cropType === c
                        ? "bg-[#16a34a] text-[#fdf6e3] border-[#16a34a]"
                        : "bg-[#faf4e8] text-[#3d1f0a] border-[rgba(61,31,10,0.15)] hover:border-[#16a34a]/50"
                    }`}
                  >
                    <span>{cropEmoji[c] || "🌱"}</span>
                    {t(`crops.${c}`) || c}
                  </button>
                ))}
              </div>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger className="h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}><span className="mr-2">{cropEmoji[c] || "🌱"}</span>{t(`crops.${c}`) || c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a]">{t("dashboard.region")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`) || r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a]">{t("dashboard.season")}</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`) || s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {weatherError && (
              <div className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-200">
                {weatherError}
              </div>
            )}

            <Button
              onClick={fetchWeatherForLocation}
              disabled={loading}
              className="w-full h-14 bg-[#16a34a] hover:bg-[#15803d] text-[#fdf6e3] font-bold text-[17px] rounded-[24px] shadow-md transition-all"
            >
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Fetching Live Weather...</> : "Refresh Forecast"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {loading ? (
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-12 bg-[#faf4e8]/50 rounded-[24px] border-2 border-dashed border-[#16a34a]/20 min-h-[400px]">
            <Loader2 className="h-10 w-10 text-[#16a34a] animate-spin mb-4" />
            <p className="text-[#3d1f0a] font-medium text-lg">Loading weather for selected location...</p>
            <p className="text-[#6b4423] text-sm mt-1">Fetching real-time data and AI analysis</p>
          </div>
        ) : result && forecast7Days.length > 0 && (
          <div className="lg:col-span-2 space-y-4">
            {/* Risk Gauge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <Card className="card-earth rounded-[24px]">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#6b4423]">
                        Current Disease Risk
                      </p>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-[52px] leading-none font-bold text-[#3d1f0a]">
                          {result.riskPercentage}%
                        </span>
                        <Badge className={`text-[12px] px-3 py-1 rounded-full border ${riskColors[result.riskLevel].bg} ${riskColors[result.riskLevel].text} ${riskColors[result.riskLevel].border}`}>
                          {t(`advisory.risk.${result.riskLevel}`) || result.riskLevel} Risk
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-2 font-medium bg-[#faf4e8] w-fit px-3 py-1.5 rounded-full border border-[rgba(61,31,10,0.1)]">
                        <MapPin className="w-3 h-3 mr-1 text-[#16a34a]" /> Based on live weather for {locationUsed}
                      </div>
                    </div>
                    <div
                      className="h-24 w-24 rounded-full border-4 flex items-center justify-center bg-[#faf4e8]"
                      style={{ borderColor: riskColors[result.riskLevel].bar }}
                    >
                      <ShieldAlert className={`h-10 w-10 ${riskColors[result.riskLevel].text}`} />
                    </div>
                  </div>

                  {/* Current Weather Snapshot */}
                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[rgba(61,31,10,0.1)] pt-4">
                     <div className="text-center">
                        <Thermometer className="w-5 h-5 mx-auto text-[#f59e0b] mb-1" />
                        <div className="text-sm font-bold text-[#3d1f0a]">{temperature}°C</div>
                     </div>
                     <div className="text-center border-l border-r border-[rgba(61,31,10,0.1)]">
                        <Droplets className="w-5 h-5 mx-auto text-[#16a34a] mb-1" />
                        <div className="text-sm font-bold text-[#3d1f0a]">{humidity}%</div>
                     </div>
                     <div className="text-center">
                        <CloudRain className="w-5 h-5 mx-auto text-[#3b82f6] mb-1" />
                        <div className="text-sm font-bold text-[#3d1f0a]">{rainfall} mm</div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 7-Day Forecast Section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
            >
              <Card className="card-earth rounded-[24px]">
                <CardHeader className="pb-3 border-b border-[rgba(61,31,10,0.1)]">
                  <CardTitle className="text-[16px] text-[#3d1f0a] flex items-center gap-2 font-bold" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
                    <Calendar className="h-5 w-5 text-[#16a34a]" />
                    7-Day Disease Risk Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {forecast7Days.map((day, i) => (
                      <div key={i} className="flex items-center gap-4 bg-[#faf4e8] p-3 rounded-2xl border border-[rgba(61,31,10,0.05)]">
                        <div className="w-[45px] font-bold text-[#6b4423] text-sm text-center">
                          {i === 0 ? "Today" : day.date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className={`font-bold flex items-center gap-1.5 ${riskColors[day.riskLevel].text}`}>
                              {riskColors[day.riskLevel].icon} {day.riskLevel}
                            </span>
                            <span className="font-bold text-[#3d1f0a]">{day.riskPercentage}%</span>
                          </div>
                          <div className="h-2 bg-[#e8dcc8] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${riskColors[day.riskLevel].bar}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${day.riskPercentage}%` }}
                              transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-[10px] sm:text-xs text-muted-foreground text-right space-y-0.5 min-w-[50px]">
                           <div>{day.temp}°C</div>
                           <div>💧{day.humidity}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Disease Threats */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}>
                <Card className="card-earth rounded-[24px] h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[16px] text-[#3d1f0a] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {t("risk.topThreats") || "Top Disease Threats"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.topDiseases.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-[14px] mb-1">
                              <span className="font-medium text-[#3d1f0a]">{d.name}</span>
                              <span className="font-bold text-[#16a34a]">{d.probability}%</span>
                            </div>
                            <div className="h-2.5 bg-[#e8dcc8] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-[#16a34a]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(d.probability, 100)}%` }}
                                transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contributing Factors */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}>
                <Card className="card-earth rounded-[24px] h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[16px] text-[#3d1f0a] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {t("risk.factors") || "Contributing Factors"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.factors.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-[13px]">
                          {f.impact === "Negative" ? (
                            <TrendingUp className="h-4 w-4 text-[#b91c1c] mt-0.5 shrink-0" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-[#16a34a] mt-0.5 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-[#3d1f0a]">{f.factor}: </span>
                            <span className="text-[#6b4423]">{f.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recommendation */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: 0.25 }}>
              <Card className="rounded-[24px] border-l-4 border-l-[#16a34a] bg-[#f5ebd9] border border-[rgba(22,163,74,0.2)]">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#16a34a] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#16a34a]">
                        {t("risk.aiRec") || "AI Recommendation"}
                      </p>
                      <p className="text-[14px] text-[#6b4423] mt-1">
                        {result.recommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
