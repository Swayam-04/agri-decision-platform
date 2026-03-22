"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { DiseaseRiskResult, ProfitPredictionResult, PriceForecastResult, RiskAdvisoryResult, IrrigationResult, PestOutbreakResult, SmsAlertResult } from "@/lib/types";
import {
  ShieldAlert,
  TrendingUp,
  Store,
  AlertTriangle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Droplets,
  Bug,
  MessageSquare,
  Bot,
  Power,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { Mic } from "lucide-react";

import { getLiveWeather } from "@/lib/weather-service";

interface FullResults {
  diseaseRisk: DiseaseRiskResult | null;
  profit: ProfitPredictionResult | null;
  priceForecast: PriceForecastResult | null;
  advisory: RiskAdvisoryResult | null;
  irrigation: IrrigationResult | null;
  pestOutbreak: PestOutbreakResult | null;
  smsAlerts: SmsAlertResult | null;
}

export default function DashboardPage() {
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FullResults | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { t, language } = useTranslation();

  async function runFullAnalysis() {
    setLoading(true);
    try {
      // 1. Fetch live weather using unified service
      const weather = await getLiveWeather(region);
      const { temp, humidity, rainfall: rain } = weather;

      const [diseaseRiskRes, profitRes, priceRes, advisoryRes, irrigationRes, pestRes, smsRes] = await Promise.all([
        fetch("/api/disease-risk", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ cropType, region, temperature: temp, humidity, rainfall: rain, season }),
        }),
        fetch("/api/profit-predict", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ cropType, region, acreage: 5, season, irrigationType: "Canal", soilType: "Alluvial" }),
        }),
        fetch("/api/price-forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ cropType, region, currentPrice: 2500, quantityQuintals: 50, storageCostPerDay: 5 }),
        }),
        fetch("/api/risk-advisory", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ region, season }),
        }),
        fetch("/api/irrigation", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ cropType, region, soilType: "Alluvial", temperature: temp, humidity, recentRainfall: rain, season }),
        }),
        fetch("/api/pest-outbreak", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ region, district: "Ludhiana", localArea: "Mullanpur", season, temperature: temp, humidity, recentRainfall: rain }),
        }),
        fetch("/api/sms-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-language": language },
          body: JSON.stringify({ cropType, region, season }),
        }),
      ]);

      setResults({
        diseaseRisk: await diseaseRiskRes.json(),
        profit: await profitRes.json(),
        priceForecast: await priceRes.json(),
        advisory: await advisoryRes.json(),
        irrigation: await irrigationRes.json(),
        pestOutbreak: await pestRes.json(),
        smsAlerts: await smsRes.json(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const cropEmoji: Record<string, string> = { Rice: "🌾", Wheat: "🌾", Maize: "🌽", Cotton: "☁️", Sugarcane: "🎋", Soybean: "🫘", Groundnut: "🥜", Chickpea: "🫘", Pigeonpea: "🫘", Mungbean: "🫘" };

  return (
    <div className={`dashboard-root ${theme} p-6 w-full space-y-6 relative min-h-screen`}>
      {/* Hero: farm scene */}
      <div className="relative rounded-[28px] overflow-hidden border border-[rgba(61,31,10,0.1)] shadow-lg hero-shell">
        <div className="h-44 sm:h-52 hero-bg flex items-center transition-all duration-1000 ease-in-out">
          <div className="hero-orb-wrapper">
            <div className="hero-sun sun-with-rays">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className={`sun-ray sun-ray-${i}`} />
              ))}
            </div>
            <div className="hero-moon">
              <div className="moon-main" />
              <div className="moon-cutout" />
            </div>
            <div className="hero-stars">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className={`star-dot star-dot-${i}`} />
              ))}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="hero-toggle"
            >
              <span className="hero-toggle-icon">
                {theme === "night" ? "☀️" : "🌙"}
              </span>
              <span className="hero-toggle-label">
                {theme === "night" ? t("dashboard.dayMode") : t("dashboard.nightMode")}
              </span>
            </button>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fef9e3" /><stop offset="100%" stopColor="#f5ebd9" /></linearGradient>
              <linearGradient id="hill1" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#16a34a" stopOpacity="0.4" /><stop offset="100%" stopColor="#16a34a" stopOpacity="0.1" /></linearGradient>
              <linearGradient id="hill2" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#6b4423" stopOpacity="0.25" /><stop offset="100%" stopColor="#6b4423" stopOpacity="0.05" /></linearGradient>
            </defs>
            <path d="M0 200 Q200 120 400 140 T800 100 L800 200 Z" fill="url(#hill1)" />
            <path d="M0 200 Q300 140 600 160 T800 120 L800 200 Z" fill="url(#hill2)" />
            <text x="400" y="170" textAnchor="middle" fill="rgba(61,31,10,0.08)" fontSize="72" fontFamily="'Playfair Display', serif" fontWeight="700">🌾 🌽 🌾</text>
          </svg>
          <div className="relative z-10 w-full px-6 pb-6 pt-4 text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#3d1f0a] tracking-tight" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
              {t("dashboard.title")}
            </h1>
            <p className="text-[#6b4423] text-base sm:text-lg mt-1 max-w-xl">
              {t("dashboard.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Analysis Form */}
      <Card className="card-earth rounded-[24px] overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a]">
                {t("dashboard.crop")}
              </label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger className="w-[200px] h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}><span className="mr-2">{cropEmoji[c] || "🌱"}</span>{t(`crops.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a]">
                {t("dashboard.region")}
              </label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[200px] h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#3d1f0a]">
                {t("dashboard.season")}
              </label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="w-[180px] h-12 rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(61,31,10,0.15)] text-[#3d1f0a] text-[15px] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={runFullAnalysis}
              disabled={loading}
              className="h-14 w-full rounded-[24px] bg-[#16a34a] hover:bg-[#15803d] text-[#fdf6e3] font-bold text-[17px] shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t("dashboard.analyzing")}
                </>
              ) : (
                t("dashboard.runAnalysis")
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links when no results */}
      {!results && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <QuickLinkCard icon={<ShieldAlert className="h-6 w-6 text-[#16a34a]" />} title={t("card.diseaseRisk.title")} description={t("card.diseaseRisk.desc")} href="/disease-risk" watermark="🌾" />
          <QuickLinkCard icon={<TrendingUp className="h-6 w-6 text-[#16a34a]" />} title={t("card.profitPredict.title")} description={t("card.profitPredict.desc")} href="/profit-predict" watermark="🌽" />
          <QuickLinkCard icon={<Store className="h-6 w-6 text-[#f59e0b]" />} title={t("card.sellStore.title")} description={t("card.sellStore.desc")} href="/price-forecast" watermark="🌾" />
          <QuickLinkCard icon={<AlertTriangle className="h-6 w-6 text-[#b91c1c]" />} title={t("card.cropAdvisory.title")} description={t("card.cropAdvisory.desc")} href="/risk-advisory" watermark="🌱" />
          <QuickLinkCard icon={<Droplets className="h-6 w-6 text-[#16a34a]" />} title={t("card.smartIrrigation.title")} description={t("card.smartIrrigation.desc")} href="/irrigation" watermark="💧" />
          <QuickLinkCard icon={<Bug className="h-6 w-6 text-[#6b4423]" />} title={t("card.pestOutbreak.title")} description={t("card.pestOutbreak.desc")} href="/pest-outbreak" watermark="🌽" />
          <QuickLinkCard icon={<MessageSquare className="h-6 w-6 text-[#16a34a]" />} title={t("card.smsAlerts.title")} description={t("card.smsAlerts.desc")} href="/sms-alerts" watermark="📱" />
          <QuickLinkCard icon={<Bot className="h-6 w-6 text-[#f59e0b]" />} title={t("card.aiAssistant.title")} description={t("card.aiAssistant.desc")} href="/chatbot" watermark="🌾" />
          <QuickLinkCard icon={<Mic className="h-6 w-6 text-[#16a34a]" />} title={t("card.voiceAssistant.title")} description={t("card.voiceAssistant.desc")} href="/voice-assistant" watermark="🎤" />
        </div>
      )}

      {/* Unified Results */}
      {results && (
        <div className="space-y-5">
          {/* Row 1: Core Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Disease Risk */}
            {results.diseaseRisk && (
              <Card className="card-earth rounded-[24px] relative overflow-hidden">
                <span className="absolute right-4 top-4 text-7xl opacity-[0.08] pointer-events-none">🌾</span>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                      <ShieldAlert className="h-4 w-4 text-[#16a34a]" />
                      {t("dashboard.diseaseRisk")}
                    </CardTitle>
                    <RiskBadge level={results.diseaseRisk.riskLevel} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-[48px] leading-none font-bold text-[#3d1f0a] tracking-tight">
                      {results.diseaseRisk.riskPercentage}%
                    </div>
                    <div className="text-[13px] text-[#6b4423]">
                      {t("dashboard.nextDays").replace("{days}", (results.diseaseRisk.forecastDays || 7).toString())}
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#e8dcc8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full transition-all duration-700" style={{ width: `${results.diseaseRisk.riskPercentage}%` }} />
                  </div>
                  {results.diseaseRisk.topDiseases?.slice(0, 2).map((d) => (
                    <div key={d.name} className="flex justify-between text-[13px] text-[#6b4423]">
                      <span>{d.name}</span><span className="font-bold text-[#3d1f0a]">{d.probability}%</span>
                    </div>
                  ))}
                  <Link href="/disease-risk" className="text-sm text-[#16a34a] hover:underline font-medium flex items-center gap-1 pt-1">
                    {t("dashboard.details")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Profit */}
            {results.profit && (
              <Card className="card-earth rounded-[24px] relative overflow-hidden">
                <span className="absolute right-4 top-4 text-7xl opacity-[0.08] pointer-events-none">🌽</span>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                      <TrendingUp className="h-4 w-4 text-[#16a34a]" />
                      {t("dashboard.profitEstimate")}
                    </CardTitle>
                    <Badge className="text-[10px] bg-[#f59e0b]/20 text-[#6b4423] border-[#f59e0b]/40">{Math.round(results.profit.confidenceScore * 100)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`text-[40px] leading-none font-bold ${results.profit.profitPerAcre >= 0 ? "text-[#16a34a]" : "text-[#b91c1c]"}`}>
                    Rs {results.profit.profitPerAcre.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[13px] text-[#6b4423]">
                    {t("dashboard.perAcre")} · {t("dashboard.range")}: Rs {results.profit.profitRange?.low.toLocaleString("en-IN")}–{results.profit.profitRange?.high.toLocaleString("en-IN")}
                  </div>
                  <Link href="/profit-predict" className="text-sm text-[#16a34a] hover:underline font-medium flex items-center gap-1 pt-1">
                    {t("dashboard.costBreakdown")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Sell/Store */}
            {results.priceForecast && (
              <Card className="card-earth rounded-[24px] relative overflow-hidden">
                <span className="absolute right-4 top-4 text-7xl opacity-[0.08] pointer-events-none">🌾</span>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                      <Store className="h-4 w-4 text-[#16a34a]" />
                      {t("dashboard.sellStore")}
                    </CardTitle>
                    <Badge className={results.priceForecast.decision === "Sell Now" ? "bg-[#b91c1c]/15 text-[#b91c1c] border-[#b91c1c]/30" : "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30"}>
                      {results.priceForecast.decision === "Store" ? t("dashboard.store") : t("price.sellNow")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {results.priceForecast.decision === "Store" ? <CheckCircle2 className="h-5 w-5 text-[#16a34a]" /> : <XCircle className="h-5 w-5 text-[#b91c1c]" />}
                    <span className="text-sm font-semibold text-[#3d1f0a]">
                      {results.priceForecast.decision === "Store" ? t("dashboard.storeDays").replace("{days}", (results.priceForecast.storeDays || 0).toString()) : t("dashboard.sellNow")}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#6b4423]">
                    {t("dashboard.trend")}: {results.priceForecast.priceTrend === "Rising" ? t("price.rising") : results.priceForecast.priceTrend === "Falling" ? t("price.falling") : t("price.stable")} · {results.priceForecast.expectedGainLoss >= 0 ? t("dashboard.gain") : t("dashboard.loss")}: Rs {Math.abs(results.priceForecast.expectedGainLoss).toLocaleString("en-IN")}
                  </div>
                  
                  {/* Strategic Comparison */}
                  <div className="pt-2 border-t border-[rgba(61,31,10,0.1)] space-y-2">
                    <p className="text-[11px] font-bold text-[#16a34a] uppercase tracking-wider">{t("price.strategicSelling") || "Strategic Selling"}</p>
                    <p className="text-[12px] text-[#6b4423] leading-relaxed italic border-l-2 border-[#16a34a]/30 pl-2">
                      {results.priceForecast.alternativeReasoning}
                    </p>
                    
                    {results.priceForecast.decision === "Store" && results.priceForecast.coldStorageOptions && (
                      <div className="space-y-1.5 mt-2">
                         <p className="text-[11px] font-bold text-[#3d1f0a]">{t("price.nearbyStorage") || "Nearby Cold Storage"}</p>
                         {results.priceForecast.coldStorageOptions.slice(0, 2).map((option, idx) => (
                           <div key={idx} className="flex justify-between items-center text-[12px] bg-[#faf4e8] p-1.5 rounded-lg border border-[rgba(61,31,10,0.05)]">
                             <div className="flex flex-col">
                               <span className="font-semibold text-[#3d1f0a]">{option.name}</span>
                               <span className="text-[10px] text-muted-foreground">{option.distance} · Rs {option.costPerDay}/q/day</span>
                             </div>
                             <div className="text-[#16a34a] font-bold">Rs {option.totalCost.toLocaleString("en-IN")}</div>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>

                  <Link href="/price-forecast" className="text-sm text-[#16a34a] hover:underline font-medium flex items-center gap-1 pt-1">
                    {t("dashboard.priceTimeline")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Row 2: New Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Irrigation */}
            {results.irrigation && (
              <Card className="card-earth rounded-[24px] relative overflow-hidden">
                <span className="absolute right-4 top-4 text-7xl opacity-[0.08] pointer-events-none">💧</span>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                      <Droplets className="h-4 w-4 text-[#16a34a]" />
                      {t("dashboard.irrigation")}
                    </CardTitle>
                    <Badge className={
                      results.irrigation.irrigationNeed === "No Irrigation" ? "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30" :
                      results.irrigation.irrigationNeed === "Light Irrigation" ? "bg-[#f59e0b]/20 text-[#6b4423] border-[#f59e0b]/40" :
                      "bg-[#b91c1c]/15 text-[#b91c1c] border-[#b91c1c]/30"
                    }>{results.irrigation.irrigationNeed === "No Irrigation" ? t("irrigation.statusNoOption") : results.irrigation.irrigationNeed === "Light Irrigation" ? t("irrigation.statusLightOption") : t("irrigation.statusHeavyOption")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-[12px] text-center">
                    <div className="bg-[#faf4e8] rounded-[16px] p-3 border border-[rgba(61,31,10,0.1)]">
                      <div className="font-bold text-xl text-[#3d1f0a]">{results.irrigation.soilMoisturePercent}%</div>
                      <span className="text-[#6b4423]">{t("dashboard.moisture")}</span>
                    </div>
                    <div className="bg-[#faf4e8] rounded-[16px] p-3 border border-[rgba(61,31,10,0.1)]">
                      <Power className={`h-5 w-5 mx-auto ${results.irrigation.pumpStatus === "ON" ? "text-[#16a34a]" : "text-[#6b4423]"}`} />
                      <span className="text-[#6b4423]">{t("dashboard.pump")} {results.irrigation.pumpStatus}</span>
                    </div>
                    <div className="bg-[#faf4e8] rounded-[16px] p-3 border border-[rgba(61,31,10,0.1)]">
                      <div className="font-bold text-xl text-[#3d1f0a]">{results.irrigation.waterSaved_percent}%</div>
                      <span className="text-[#6b4423]">{t("dashboard.saved")}</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-[#e8dcc8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full transition-all duration-700" style={{ width: `${results.irrigation.soilMoisturePercent}%` }} />
                  </div>
                  <Link href="/irrigation" className="text-sm text-[#16a34a] hover:underline font-medium flex items-center gap-1 pt-1">
                    {t("dashboard.fullSchedule")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Pest Outbreak */}
            {results.pestOutbreak && (
              <Card className="card-earth rounded-[24px] relative overflow-hidden">
                <span className="absolute right-4 top-4 text-7xl opacity-[0.08] pointer-events-none">🌽</span>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                      <Bug className="h-4 w-4 text-[#16a34a]" />
                      {t("dashboard.pestOutbreak")}
                    </CardTitle>
                    <Badge className={
                      results.pestOutbreak.riskZone === "Low" ? "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30" :
                      results.pestOutbreak.riskZone === "Moderate" ? "bg-[#f59e0b]/20 text-[#6b4423] border-[#f59e0b]/40" :
                      "bg-[#b91c1c]/15 text-[#b91c1c] border-[#b91c1c]/30"
                    }>{results.pestOutbreak.riskZone === "Low" ? t("price.riskLow") : results.pestOutbreak.riskZone === "Moderate" ? t("price.riskMedium") : t("price.riskHigh")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-[48px] leading-none font-bold text-[#3d1f0a]">
                    {results.pestOutbreak.outbreakProbability}%
                  </div>
                  <div className="text-[13px] text-[#6b4423]">{t("dashboard.outbreakProbability")}</div>
                  <div className="h-2.5 w-full bg-[#e8dcc8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full transition-all duration-700" style={{ width: `${results.pestOutbreak.outbreakProbability}%` }} />
                  </div>
                  {results.pestOutbreak.affectedCrops?.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex justify-between text-[13px] text-[#6b4423]">
                      <span>{t(`crops.${c.crop}`)} ({c.pest})</span><span className="font-bold text-[#3d1f0a]">{c.riskPercent}%</span>
                    </div>
                  ))}
                  <Link href="/pest-outbreak" className="text-sm text-[#16a34a] hover:underline font-medium flex items-center gap-1 pt-1">
                    {t("dashboard.districtAlerts")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* SMS Alerts */}
            {results.smsAlerts && (
              <Card className="card-earth rounded-[24px] relative overflow-hidden">
                <span className="absolute right-4 top-4 text-7xl opacity-[0.08] pointer-events-none">📱</span>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                      <MessageSquare className="h-4 w-4 text-[#16a34a]" />
                      {t("dashboard.smsAlerts")}
                    </CardTitle>
                    <Badge className="bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30">{results.smsAlerts.totalSent} {t("dashboard.sent")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-[13px] text-[#6b4423]">
                    <span className="text-[#b91c1c] font-semibold">{results.smsAlerts.criticalCount} {t("dashboard.critical")}</span>
                    <span> {t("dashboard.alertsTriggered")}</span>
                  </div>
                  {results.smsAlerts.alerts?.slice(0, 2).map((a) => (
                    <div key={a.id} className="text-[13px] bg-[#faf4e8] rounded-[16px] p-3 border border-[rgba(61,31,10,0.1)]">
                      <Badge className={`text-[9px] mb-1 ${a.priority === "Critical" ? "bg-[#b91c1c]/15 text-[#b91c1c]" : a.priority === "High" ? "bg-[#f59e0b]/20 text-[#6b4423]" : "bg-[#16a34a]/15 text-[#16a34a]"}`}>
                        {a.priority === "Critical" ? t("price.riskHigh") : a.priority === "High" ? t("price.riskMedium") : t("price.riskLow")}
                      </Badge>
                      <p className="text-[#6b4423] line-clamp-2">{a.message}</p>
                    </div>
                  ))}
                  <Link href="/sms-alerts" className="text-sm text-[#16a34a] hover:underline font-medium flex items-center gap-1 pt-1">
                    {t("dashboard.allAlerts")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Crop Advisory */}
          {results.advisory && (
            <Card className="card-earth rounded-[24px] border-l-4 border-l-[#b91c1c]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px] font-semibold flex items-center gap-2 text-[#3d1f0a]">
                  <AlertTriangle className="h-4 w-4 text-[#b91c1c]" />
                  {t("dashboard.cropsToAvoid")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {results.advisory.cropsToAvoid?.slice(0, 4).map((crop) => (
                    <div key={crop.cropName} className="flex items-center justify-between text-xs bg-[#faf4e8] rounded-[16px] p-2.5 border border-[rgba(185,28,28,0.2)]">
                      <div className="flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-[#b91c1c]" />
                        <span className="font-medium text-[#3d1f0a]">{t(`crops.${crop.cropName}`)}</span>
                      </div>
                      <RiskBadge level={crop.riskLevel === "Very High" ? "High" : crop.riskLevel} />
                    </div>
                  ))}
                </div>
                {results.advisory.safeCrops.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#6b4423]">{t("dashboard.safe")}</span>
                    {results.advisory.safeCrops.map((c) => (
                      <Badge key={c.name} className="text-[10px] bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30">{t(`crops.${c.name}`)}</Badge>
                    ))}
                  </div>
                )}
                
                {/* Intercropping Section */}
                {results.advisory.recommendedCombinations && results.advisory.recommendedCombinations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[rgba(61,31,10,0.1)] space-y-3">
                    <p className="text-[12px] font-bold text-[#3d1f0a] border-l-3 border-[#16a34a] pl-2 uppercase tracking-wide">
                      {t("advisory.smartIntercropping") || "Smart Intercropping Strategy"}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {results.advisory.recommendedCombinations.map((combo, idx) => (
                        <div key={idx} className="bg-[#faf4e8] p-3 rounded-2xl border border-[rgba(22,163,74,0.15)] relative overflow-hidden group hover:border-[#16a34a]/40 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {combo.crops.map((c, i) => (
                                <span key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-[11px] font-bold text-[#3d1f0a] shadow-sm">
                                  {t(`crops.${c}`)}
                                </span>
                              ))}
                            </div>
                            <Badge className="bg-[#16a34a] text-white text-[10px]">+{combo.profitBoost}% {t("dashboard.profit")}</Badge>
                          </div>
                          <p className="text-[12px] text-[#6b4423] leading-relaxed italic">
                            {combo.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Info Banner */}
      <Card className="card-earth rounded-[24px]">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#16a34a] mt-0.5 shrink-0" />
            <div className="text-[14px] text-[#6b4423] space-y-1">
              <p className="font-semibold text-[#3d1f0a]">{t("dashboard.aboutPlatform")}</p>
              <p>
                {t("dashboard.aboutDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLinkCard({ icon, title, description, href, watermark = "🌾", onClick }: { icon: React.ReactNode; title: string; description: string; href: string; watermark?: string; onClick?: (e: React.MouseEvent) => void }) {
  const { t } = useTranslation();
  return (
    <Link href={href} onClick={onClick}>
      <Card className="card-earth rounded-[24px] hover:shadow-md transition-all cursor-pointer h-full relative overflow-hidden group">
        <span className="absolute right-2 top-2 text-6xl opacity-[0.12] pointer-events-none group-hover:opacity-20 transition-opacity">{watermark}</span>
        <CardContent className="pt-5 pb-5 relative">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#faf4e8] border-2 border-[rgba(22,163,74,0.3)] text-[#16a34a]">
              <div className="scale-125">{icon}</div>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#3d1f0a]" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>{title}</h3>
              <p className="text-[13px] text-[#6b4423] mt-1">{description}</p>
              <span className="text-sm text-[#16a34a] font-medium mt-2 inline-flex items-center gap-1">
                {t("card.getStarted")} <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RiskBadge({ level }: { level: string }) {
  const { t } = useTranslation();
  const colors: Record<string, string> = {
    Low: "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30",
    Medium: "bg-[#f59e0b]/20 text-[#6b4423] border-[#f59e0b]/40",
    High: "bg-[#b91c1c]/15 text-[#b91c1c] border-[#b91c1c]/30",
  };
  return <Badge variant="outline" className={`text-[10px] border ${colors[level] || colors.Medium}`}>{level === "High" ? t("dashboard.riskHigh") : level === "Medium" ? t("dashboard.riskMedium") : t("dashboard.riskLow")}</Badge>;
}
