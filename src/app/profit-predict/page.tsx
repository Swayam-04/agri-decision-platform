"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { ProfitPredictionResult } from "@/lib/types";
import { TrendingUp, Loader2, IndianRupee, AlertTriangle, BarChart3 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfitPredictPage() {
  const { t, language } = useTranslation();
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [acreage, setAcreage] = useState("5");
  const [irrigationType, setIrrigationType] = useState("Canal");
  const [soilType, setSoilType] = useState("Alluvial");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfitPredictionResult | null>(null);

  async function predict() {
    setLoading(true);
    try {
      const res = await fetch("/api/profit-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({ cropType, region, acreage: parseFloat(acreage), season, irrigationType, soilType }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          {t("profit.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("profit.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">{t("profit.farmDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("detect.cropType")}</label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}>{t(`crops.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.regionLabel")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.seasonLabel")}</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("profit.acreage")}</label>
              <Input type="number" value={acreage} onChange={(e) => setAcreage(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("profit.irrigation")}</label>
              <Select value={irrigationType} onValueChange={setIrrigationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Canal", "Drip", "Sprinkler", "Rain-fed"].map((tItem) => <SelectItem key={tItem} value={tItem}>{t(`irrigationType.${tItem}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("profit.soil")}</label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Alluvial", "Black", "Red", "Laterite"].map((tItem) => <SelectItem key={tItem} value={tItem}>{t(`soilType.${tItem}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={predict}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("profit.btnPredicting")}</> : t("profit.btnPredict")}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {result && (
          <div className="lg:col-span-2 space-y-4">
            {/* Profit Summary */}
            <Card className={`border-l-4 ${result.profitPerAcre >= 0 ? "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20" : "border-l-red-500 bg-red-50/50 dark:bg-red-900/20"}`}>
              <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profit.revAcre")}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs {result.grossRevenuePerAcre.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profit.costAcre")}</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">Rs {result.inputCostPerAcre.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profit.profitAcre")}</p>
                    <p className={`text-2xl font-bold ${result.profitPerAcre >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      Rs {result.profitPerAcre.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {/* Prominent Profit Range & Total */}
                <div className="mt-6 pt-6 border-t border-[rgba(61,31,10,0.1)]">
                  <div className="bg-white/40 dark:bg-black/20 rounded-2xl p-4 border border-[rgba(61,31,10,0.05)] shadow-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-[#6b4423] dark:text-emerald-200/80">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">{t("profit.profitRange")}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium text-muted-foreground">Rs</span>
                        <span className="text-2xl font-bold text-[#3d1f0a] dark:text-white">
                          {result.profitRange.low.toLocaleString("en-IN")} — {result.profitRange.high.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">/{t("profit.perAcre")}</span>
                      </div>

                      <div className="w-full h-px bg-[rgba(61,31,10,0.1)] my-2" />

                      <div className="flex flex-col items-center">
                        <p className="text-xs font-bold text-[#6b4423] dark:text-white uppercase tracking-wider opacity-80">
                          {t("profit.for")} {acreage} {t("profit.acres")} {t("profit.totalEst")}
                        </p>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          Rs {(result.profitPerAcre * parseFloat(acreage)).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <Badge variant="outline" className="mt-3 px-3 py-1 bg-white/60 dark:bg-emerald-950/40 border-emerald-200/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold tracking-widest uppercase">
                        {Math.round(result.confidenceScore * 100)}% {t("profit.modelConf")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yield & Price */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    {t("profit.expYield")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{result.expectedYieldPerAcre} <span className="text-sm font-normal text-muted-foreground">{result.yieldUnit}/{t("profit.perAcre")}</span></p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-emerald-500" />
                    {t("profit.marketPrice")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Rs {result.expectedMarketPrice.toLocaleString("en-IN")} <span className="text-sm font-normal text-muted-foreground">/{t(`crops.${cropType}`) || "quintal"}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("profit.range")} Rs {result.marketPriceRange.low.toLocaleString("en-IN")} - Rs {result.marketPriceRange.high.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t("profit.costBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.costBreakdown.map((item) => {
                    const pct = Math.round((item.cost / result.inputCostPerAcre) * 100);
                    return (
                      <div key={item.item} className="flex items-center gap-3">
                        <span className="text-xs w-40 shrink-0">{item.item}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-20 text-right">Rs {item.cost.toLocaleString("en-IN")}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-sm font-medium">
                  <span>{t("profit.totalInput")}</span>
                  <span>Rs {result.inputCostPerAcre.toLocaleString("en-IN")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {result.riskFactors.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800">{t("profit.riskFactors")}</p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        {result.riskFactors.map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-yellow-500">-</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
