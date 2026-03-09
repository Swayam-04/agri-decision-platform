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

  async function runFullAnalysis() {
    setLoading(true);
    try {
      const [diseaseRiskRes, profitRes, priceRes, advisoryRes, irrigationRes, pestRes, smsRes] = await Promise.all([
        fetch("/api/disease-risk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cropType, region, temperature: 30, humidity: 78, rainfall: 15, season }),
        }),
        fetch("/api/profit-predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cropType, region, acreage: 5, season, irrigationType: "Canal", soilType: "Alluvial" }),
        }),
        fetch("/api/price-forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cropType, region, currentPrice: 2500, quantityQuintals: 50, storageCostPerDay: 5 }),
        }),
        fetch("/api/risk-advisory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ region, season }),
        }),
        fetch("/api/irrigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cropType, region, soilType: "Alluvial", temperature: 30, humidity: 78, recentRainfall: 15, season }),
        }),
        fetch("/api/pest-outbreak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ region, season, temperature: 30, humidity: 78, recentRainfall: 15 }),
        }),
        fetch("/api/sms-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Decision Intelligence Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unified AI analysis: disease, profit, irrigation, pest, market advice, and SMS alerts in one view.
        </p>
      </div>

      {/* Quick Analysis Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Crop</label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Region</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Season</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runFullAnalysis}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing All Modules...</> : "Run Full Analysis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links when no results */}
      {!results && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLinkCard icon={<ShieldAlert className="h-5 w-5 text-orange-500" />} title="Disease Risk Forecast" description="Predict disease probability for the next 7-10 days" href="/disease-risk" />
          <QuickLinkCard icon={<TrendingUp className="h-5 w-5 text-blue-500" />} title="Profit Per Acre" description="Estimate yield, market price, costs, and profit range" href="/profit-predict" />
          <QuickLinkCard icon={<Store className="h-5 w-5 text-purple-500" />} title="Sell or Store Decision" description="AI-powered price forecasts and sell/store advice" href="/price-forecast" />
          <QuickLinkCard icon={<AlertTriangle className="h-5 w-5 text-red-500" />} title="Crop Risk Advisory" description="Find out which crops to avoid this season" href="/risk-advisory" />
          <QuickLinkCard icon={<Droplets className="h-5 w-5 text-blue-500" />} title="Smart Irrigation" description="Soil moisture prediction and pump automation" href="/irrigation" />
          <QuickLinkCard icon={<Bug className="h-5 w-5 text-orange-500" />} title="Pest Outbreak" description="Regional pest forecasting with district alerts" href="/pest-outbreak" />
          <QuickLinkCard icon={<MessageSquare className="h-5 w-5 text-emerald-500" />} title="SMS Alerts" description="Event-based alerts for low-end device farmers" href="/sms-alerts" />
          <QuickLinkCard icon={<Bot className="h-5 w-5 text-violet-500" />} title="AI Assistant" description="Chat with AI about your farm in simple language" href="/chatbot" />
        </div>
      )}

      {/* Unified Results */}
      {results && (
        <div className="space-y-5">
          {/* Row 1: Core Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Disease Risk */}
            {results.diseaseRisk && (
              <Card className="border-l-4 border-l-orange-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-orange-500" />
                      Disease Risk
                    </CardTitle>
                    <RiskBadge level={results.diseaseRisk.riskLevel} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold">{results.diseaseRisk.riskPercentage}%</div>
                    <div className="text-xs text-muted-foreground">next {results.diseaseRisk.forecastDays} days</div>
                  </div>
                  {results.diseaseRisk.topDiseases.slice(0, 2).map((d) => (
                    <div key={d.name} className="flex justify-between text-xs">
                      <span>{d.name}</span><span className="font-medium">{d.probability}%</span>
                    </div>
                  ))}
                  <Link href="/disease-risk" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 pt-1">
                    Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Profit */}
            {results.profit && (
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Profit Estimate
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{Math.round(results.profit.confidenceScore * 100)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={`text-3xl font-bold ${results.profit.profitPerAcre >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    Rs {results.profit.profitPerAcre.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground">per acre | Range: Rs {results.profit.profitRange.low.toLocaleString("en-IN")} - {results.profit.profitRange.high.toLocaleString("en-IN")}</div>
                  <Link href="/profit-predict" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 pt-1">
                    Cost breakdown <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Sell/Store */}
            {results.priceForecast && (
              <Card className="border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Store className="h-4 w-4 text-purple-500" />
                      Sell / Store
                    </CardTitle>
                    <Badge className={results.priceForecast.decision === "Sell Now" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                      {results.priceForecast.decision}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    {results.priceForecast.decision === "Store" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <span className="text-sm font-medium">
                      {results.priceForecast.decision === "Store" ? `Store ${results.priceForecast.storeDays} days` : "Sell now"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Trend: {results.priceForecast.priceTrend} | Gain: Rs {results.priceForecast.expectedGainLoss.toLocaleString("en-IN")}</div>
                  <Link href="/price-forecast" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 pt-1">
                    Price timeline <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Row 2: New Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Irrigation */}
            {results.irrigation && (
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      Irrigation
                    </CardTitle>
                    <Badge className={
                      results.irrigation.irrigationNeed === "No Irrigation" ? "bg-emerald-100 text-emerald-700" :
                      results.irrigation.irrigationNeed === "Light Irrigation" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }>{results.irrigation.irrigationNeed}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-muted/50 rounded p-2">
                      <div className="font-bold text-base">{results.irrigation.soilMoisturePercent}%</div>
                      <span className="text-muted-foreground">Moisture</span>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <Power className={`h-4 w-4 mx-auto ${results.irrigation.pumpStatus === "ON" ? "text-emerald-500" : "text-gray-400"}`} />
                      <span className="text-muted-foreground">Pump {results.irrigation.pumpStatus}</span>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <div className="font-bold text-base text-emerald-600">{results.irrigation.waterSaved_percent}%</div>
                      <span className="text-muted-foreground">Saved</span>
                    </div>
                  </div>
                  <Link href="/irrigation" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 pt-1">
                    Full schedule <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Pest Outbreak */}
            {results.pestOutbreak && (
              <Card className="border-l-4 border-l-orange-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Bug className="h-4 w-4 text-orange-500" />
                      Pest Outbreak
                    </CardTitle>
                    <Badge className={
                      results.pestOutbreak.riskZone === "Low" ? "bg-emerald-100 text-emerald-700" :
                      results.pestOutbreak.riskZone === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }>{results.pestOutbreak.riskZone}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold">{results.pestOutbreak.outbreakProbability}%</div>
                  <div className="text-xs text-muted-foreground">outbreak probability</div>
                  {results.pestOutbreak.affectedCrops.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>{c.crop} ({c.pest})</span><span className="font-medium">{c.riskPercent}%</span>
                    </div>
                  ))}
                  <Link href="/pest-outbreak" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 pt-1">
                    District alerts <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* SMS Alerts */}
            {results.smsAlerts && (
              <Card className="border-l-4 border-l-emerald-400">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-emerald-500" />
                      SMS Alerts
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700">{results.smsAlerts.totalSent} sent</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs">
                    <span className="text-red-600 font-medium">{results.smsAlerts.criticalCount} critical</span>
                    <span className="text-muted-foreground"> alerts triggered</span>
                  </div>
                  {results.smsAlerts.alerts.slice(0, 2).map((a) => (
                    <div key={a.id} className="text-[11px] bg-muted/50 rounded p-2">
                      <Badge className={`text-[9px] mb-1 ${a.priority === "Critical" ? "bg-red-100 text-red-700" : a.priority === "High" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                        {a.priority}
                      </Badge>
                      <p className="text-muted-foreground line-clamp-2">{a.message}</p>
                    </div>
                  ))}
                  <Link href="/sms-alerts" className="text-xs text-emerald-600 hover:underline flex items-center gap-1 pt-1">
                    All alerts <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Crop Advisory */}
          {results.advisory && (
            <Card className="border-l-4 border-l-red-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Crops to Avoid This Season
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {results.advisory.cropsToAvoid.slice(0, 4).map((crop) => (
                    <div key={crop.cropName} className="flex items-center justify-between text-xs bg-red-50 rounded-lg p-2">
                      <div className="flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                        <span className="font-medium">{crop.cropName}</span>
                      </div>
                      <RiskBadge level={crop.riskLevel === "Very High" ? "High" : crop.riskLevel} />
                    </div>
                  ))}
                </div>
                {results.advisory.safeCrops.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Safe:</span>
                    {results.advisory.safeCrops.map((c) => (
                      <Badge key={c.name} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{c.name}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800 space-y-1">
              <p className="font-medium">About This Platform</p>
              <p>
                CropIntel AI uses simulated ML models (CNN, LSTM, XGBoost, Random Forest) for decision intelligence.
                Includes disease detection, risk forecasting, profit prediction, irrigation optimization, pest outbreak forecasting,
                SMS alerts, and an AI chatbot assistant. All predictions include confidence scores and uncertainty ranges.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLinkCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
              <span className="text-xs text-emerald-600 mt-2 inline-flex items-center gap-1">
                Get started <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };
  return <Badge className={`text-[10px] ${colors[level] || colors.Medium}`}>{level} Risk</Badge>;
}
