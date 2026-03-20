"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { PestOutbreakResult } from "@/lib/types";
import { Bug, Loader2, MapPin, ShieldAlert, AlertTriangle, History } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useEffect } from "react";

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

export default function PestOutbreakPage() {
  const { t, language } = useTranslation();
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [temperature, setTemperature] = useState(30);
  const [humidity, setHumidity] = useState(72);
  const [rainfall, setRainfall] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PestOutbreakResult | null>(null);

  async function analyze(weather?: { temp: number; humidity: number; rainfall: number }) {
    setLoading(true);
    try {
      const res = await fetch("/api/pest-outbreak", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({ 
          region, 
          season, 
          temperature: weather?.temp ?? temperature, 
          humidity: weather?.humidity ?? humidity, 
          recentRainfall: weather?.rainfall ?? rainfall 
        }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const fetchWeatherForLocation = useCallback(async () => {
    setLoading(true);
    try {
      const coords = REGION_COORDS[region] || REGION_COORDS["Punjab"];
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=auto`;
      const weatherRes = await fetch(weatherUrl, { cache: "no-store" });
      if (!weatherRes.ok) throw new Error("Weather API failed");
      const weatherData = await weatherRes.json();
      
      const current = {
        temp: Math.round(weatherData.current.temperature_2m),
        humidity: Math.round(weatherData.current.relative_humidity_2m),
        rainfall: Math.round(weatherData.daily.precipitation_sum[0] || 0)
      };

      setTemperature(current.temp);
      setHumidity(current.humidity);
      setRainfall(current.rainfall);

      // Auto analyze with new weather
      await analyze(current);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [region, language]);

  useEffect(() => {
    fetchWeatherForLocation();
  }, [region, fetchWeatherForLocation]);

  const zoneColors: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Moderate: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("pest.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("pest.subtitle")}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.regionLabel")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.seasonLabel")}</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-center justify-around bg-orange-50/50 dark:bg-orange-950/10 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/20">
               <div className="text-center">
                  <p className="text-[10px] font-bold text-orange-600/60 uppercase">Temp</p>
                  <p className="text-lg font-black text-orange-700 dark:text-orange-400">{temperature}°C</p>
               </div>
               <div className="text-center border-l border-r border-orange-200 dark:border-orange-800/30 px-6">
                  <p className="text-[10px] font-bold text-orange-600/60 uppercase">Humidity</p>
                  <p className="text-lg font-black text-orange-700 dark:text-orange-400">{humidity}%</p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-bold text-orange-600/60 uppercase">Rainfall</p>
                  <p className="text-lg font-black text-orange-700 dark:text-orange-400">{rainfall}mm</p>
               </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
             <p className="text-xs text-muted-foreground italic">Current conditions synced from real-time weather stations.</p>
             <Button onClick={fetchWeatherForLocation} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-orange-600/20">
               {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing...</> : "Refresh Data"}
             </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-5">
          {/* Outbreak Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-orange-400">
              <CardContent className="pt-5 pb-5 text-center">
                <Bug className="h-7 w-7 mx-auto text-orange-500 mb-2" />
                <div className="text-3xl font-bold">{result.outbreakProbability}%</div>
                <p className="text-xs text-muted-foreground mt-1">{t("pest.prob")}</p>
                <Progress value={result.outbreakProbability} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <ShieldAlert className="h-7 w-7 mx-auto text-red-500 mb-2" />
                <Badge className={`text-sm px-3 py-1 ${zoneColors[result.riskZone]}`}>
                  {result.riskZone} {t("pest.riskZone")}
                </Badge>
                <div className="mt-3 text-left">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-1">Reasoning</p>
                  <ul className="space-y-1">
                    {result.reasoning?.map((r, i) => (
                      <li key={i} className="text-[11px] font-bold text-orange-900/70 dark:text-orange-300/70 flex items-center gap-1.5">
                        <div className="h-1 w-1 rounded-full bg-orange-400" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <History className="h-7 w-7 mx-auto text-blue-500 mb-2" />
                <p className="text-xs text-muted-foreground mt-1">{result.historicalComparison}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Affected Crops */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {t("pest.cropsAtRisk")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.affectedCrops.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.crop}</span>
                        <span className="text-muted-foreground">({item.pest})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.riskPercent} className="w-20 h-1.5" />
                        <span className="font-medium w-10 text-right">{item.riskPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* District Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {t("pest.distAlerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.districtAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b last:border-0">
                      <span className="font-medium">{alert.district}</span>
                      <span className="text-muted-foreground">{alert.pest}</span>
                      <Badge className={`text-[10px] ${zoneColors[alert.level]}`}>{t(`common.status.${alert.level}`)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preventive Advisory */}
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">{t("pest.prevAdvisory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.preventiveAdvisory.map((advice, i) => (
                  <li key={i} className="text-xs text-orange-800 flex items-start gap-2">
                    <span className="font-bold mt-0.5">{i + 1}.</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
