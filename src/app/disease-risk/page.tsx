"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { DiseaseRiskResult } from "@/lib/types";
import { ShieldAlert, Loader2, Thermometer, Droplets, CloudRain, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function DiseaseRiskPage() {
  const { t, language } = useTranslation();
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [temperature, setTemperature] = useState("32");
  const [humidity, setHumidity] = useState("82");
  const [rainfall, setRainfall] = useState("25");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseRiskResult | null>(null);

  async function forecast() {
    setLoading(true);
    try {
      const res = await fetch("/api/disease-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({
          cropType, region, season,
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          rainfall: parseFloat(rainfall),
        }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const riskColors: Record<string, { bg: string; text: string; border: string }> = {
    Low: { bg: "bg-[#16a34a]/15", text: "text-[#16a34a]", border: "border-[#16a34a]/40" },
    Medium: { bg: "bg-[#f59e0b]/20", text: "text-[#6b4423]", border: "border-[#f59e0b]/40" },
    High: { bg: "bg-[#b91c1c]/15", text: "text-[#b91c1c]", border: "border-[#b91c1c]/40" },
  };

  const cropEmoji: Record<string, string> = { Rice: "🌾", Wheat: "🌾", Maize: "🌽", Cotton: "☁️", Sugarcane: "🎋", Soybean: "🫘", Groundnut: "🥜", Chickpea: "🫘", Pigeonpea: "🫘", Mungbean: "🫘" };

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
          {t("risk.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1 card-earth rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-[18px] text-[#3d1f0a] font-bold" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
              {t("risk.inputCard")}
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
                    {t(`crops.${c}`)}
                  </button>
                ))}
              </div>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger className="h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}><span className="mr-2">{cropEmoji[c] || "🌱"}</span>{t(`crops.${c}`)}</SelectItem>)}
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
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}
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
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a] flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1">
                  <Thermometer className="h-4 w-4 text-[#f59e0b]" /> {t("risk.tempLabel")}
                </span>
                <span className="text-[#6b4423] font-bold">{temperature}°C</span>
              </label>
              <Slider
                min={15}
                max={45}
                value={[parseFloat(temperature)]}
                onValueChange={([v]) => setTemperature(String(v))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a] flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-[#16a34a]" /> {t("risk.humidityLabel")}
                </span>
                <span className="text-[#6b4423] font-bold">{humidity}%</span>
              </label>
              <Slider
                min={20}
                max={100}
                value={[parseFloat(humidity)]}
                onValueChange={([v]) => setHumidity(String(v))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a] flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1">
                  <CloudRain className="h-4 w-4 text-[#16a34a]" /> {t("risk.rainfallLabel")}
                </span>
                <span className="text-[#6b4423] font-bold">{rainfall} mm</span>
              </label>
              <Slider
                min={0}
                max={100}
                value={[parseFloat(rainfall)]}
                onValueChange={([v]) => setRainfall(String(v))}
              />
            </div>

            <Button
              onClick={forecast}
              disabled={loading}
              className="w-full h-14 bg-[#16a34a] hover:bg-[#15803d] text-[#fdf6e3] font-bold text-[17px] rounded-[24px] shadow-md"
            >
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t("risk.btnForecasting")}</> : t("risk.btnForecast")}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {result && (
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
                        {t("risk.riskCard")} {result.forecastDays} {t("risk.daysSuffix")}
                      </p>
                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-[52px] leading-none font-bold text-[#3d1f0a]">
                          {result.riskPercentage}%
                        </span>
                        <Badge className={`text-[12px] px-3 py-1 rounded-full border ${riskColors[result.riskLevel].bg} ${riskColors[result.riskLevel].text} ${riskColors[result.riskLevel].border}`}>
                          {t(`advisory.risk.${result.riskLevel}`) || result.riskLevel}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="h-24 w-24 rounded-full border-4 flex items-center justify-center bg-[#faf4e8]"
                      style={{
                        borderColor:
                          result.riskLevel === "High"
                            ? "#b91c1c"
                            : result.riskLevel === "Medium"
                              ? "#f59e0b"
                              : "#16a34a",
                      }}
                    >
                      <span className={`text-2xl font-bold ${riskColors[result.riskLevel].text}`}>
                        {result.riskPercentage}
                      </span>
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="mt-5">
                    <div className="h-3 bg-[#e8dcc8] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${result.riskPercentage}%`,
                          backgroundColor:
                            result.riskLevel === "High"
                              ? "#b91c1c"
                              : result.riskLevel === "Medium"
                                ? "#f59e0b"
                                : "#16a34a",
                        }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-[12px] text-[#6b4423] mt-1.5">
                      <span>0% {t("risk.safe")}</span>
                      <span>50%</span>
                      <span>100% {t("risk.critical")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Disease Threats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
            >
              <Card className="card-earth rounded-[24px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[16px] text-[#3d1f0a] font-bold" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
                    {t("risk.topThreats")}
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
                              transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeOut" }}
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
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
            >
              <Card className="card-earth rounded-[24px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[16px] text-[#3d1f0a] font-bold" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
                    {t("risk.factors")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.factors.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-[14px]">
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

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
            >
              <Card className="rounded-[24px] border-l-4 border-l-[#16a34a] bg-[#f5ebd9] border border-[rgba(22,163,74,0.2)]">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#16a34a] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#16a34a]">
                        {t("risk.aiRec")}
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
