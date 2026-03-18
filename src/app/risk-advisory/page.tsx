"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { RiskAdvisoryResult } from "@/lib/types";
import { AlertTriangle, Loader2, XCircle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function RiskAdvisoryPage() {
  const { t, language } = useTranslation();
  const [region, setRegion] = useState("Rajasthan");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskAdvisoryResult | null>(null);

  async function getAdvisory() {
    setLoading(true);
    try {
      const res = await fetch("/api/risk-advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({ region, season }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const riskColors: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    High: "bg-red-100 text-red-700 border-red-200",
    "Very High": "bg-red-200 text-red-800 border-red-300",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          {t("advisory.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("advisory.pageSubtitle")}
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.regionLabel")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.seasonLabel")}</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={getAdvisory}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("advisory.analyzing")}</> : t("advisory.getButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Seasonal Insight */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">{t("advisory.seasonalInsight")}</p>
                  <p className="text-sm text-blue-700 mt-1">{result.seasonalInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crops to Avoid */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-red-500" />
              {t("advisory.cropsToAvoid")} {t(`regions.${region}`)} ({t(`seasons.${season}`)} {t("advisory.seasonSuffix")}
            </h2>
            <div className="space-y-4">
              {result.cropsToAvoid.map((crop) => (
                <Card key={crop.cropName} className="border-l-4 border-l-red-400">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        <h3 className="text-base font-semibold">{t(`crops.${crop.cropName}`)}</h3>
                      </div>
                      <Badge className={riskColors[crop.riskLevel]}>
                        {t(`advisory.risk.${crop.riskLevel}`)} ({crop.riskScore}/100)
                      </Badge>
                    </div>

                    {/* Risk Breakdown */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <RiskBar label={t("advisory.diseaseRisk")} value={crop.diseaseRisk} />
                      <RiskBar label={t("advisory.profitVolatility")} value={crop.profitVolatility} />
                      <RiskBar label={t("advisory.climateMismatch")} value={crop.climateMismatch} />
                    </div>

                    {/* Reasons */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t("advisory.whyToAvoid")}</p>
                      {crop.reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Safe Crops */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              {t("advisory.recommendedCrops")} {t(`regions.${region}`)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.safeCrops.map((crop) => (
                <Card key={crop.name} className="border-l-4 border-l-emerald-400 bg-emerald-50/30">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-medium text-sm">{t(`crops.${crop.name}`)}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{crop.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskBar({ label, value }: { label: string; value: number }) {
  const color = value > 70 ? "bg-red-400" : value > 40 ? "bg-yellow-400" : "bg-emerald-400";
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
