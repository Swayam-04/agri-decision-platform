"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { IrrigationResult } from "@/lib/types";
import { Droplets, Loader2, Power, TrendingDown, Calendar, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/useTranslation";

const SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Loamy", "Clay"];

export default function IrrigationPage() {
  const { t } = useTranslation();
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [soilType, setSoilType] = useState("Alluvial");
  const [season, setSeason] = useState("Kharif");
  const [temperature, setTemperature] = useState(30);
  const [humidity, setHumidity] = useState(65);
  const [rainfall, setRainfall] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IrrigationResult | null>(null);
  const [pumpOverride, setPumpOverride] = useState<"auto" | "on" | "off">("auto");

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropType, region, soilType, temperature, humidity, recentRainfall: rainfall, season }),
      });
      setResult(await res.json());
      setPumpOverride("auto");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const effectivePump = pumpOverride === "auto" ? result?.pumpStatus : pumpOverride === "on" ? "ON" : "OFF";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("irrig.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("irrig.subtitle")}
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("detect.cropType")}</label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CROP_LIST.map((c) => <SelectItem key={c} value={c}>{t(`crops.${c}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.regionLabel")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("profit.soil")}</label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOIL_TYPES.map((s) => <SelectItem key={s} value={s}>{t(`soilType.${s}`) || s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("advisory.seasonLabel")}</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t("risk.tempLabel")}: {temperature}°C</label>
              <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={10} max={48} step={1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t("risk.humidityLabel")}: {humidity}%</label>
              <Slider value={[humidity]} onValueChange={([v]) => setHumidity(v)} min={20} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t("risk.rainfallLabel")}: {rainfall}mm</label>
              <Slider value={[rainfall]} onValueChange={([v]) => setRainfall(v)} min={0} max={100} step={1} />
            </div>
          </div>

          <Button onClick={analyze} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("irrig.btnAnalyzing")}</> : t("irrig.btnAnalyze")}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-5">
          {/* Top Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <Droplets className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{result.soilMoisturePercent}%</div>
                <p className="text-xs text-muted-foreground mt-1">{t("irrig.moisture")}</p>
                <Progress value={result.soilMoisturePercent} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <Power className={`h-6 w-6 mx-auto mb-2 ${effectivePump === "ON" ? "text-emerald-500" : "text-gray-400"}`} />
                <div className={`text-2xl font-bold ${effectivePump === "ON" ? "text-emerald-600" : "text-gray-500"}`}>
                  {effectivePump}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("irrig.pumpStatus")}</p>
                {result.pumpDurationMinutes > 0 && (
                  <p className="text-[10px] text-muted-foreground">{result.pumpDurationMinutes} min cycle</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <TrendingDown className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                <div className="text-2xl font-bold text-emerald-600">{result.waterSaved_percent}%</div>
                <p className="text-xs text-muted-foreground mt-1">{t("irrig.waterSaved")}</p>
                <p className="text-[10px] text-muted-foreground">{t("irrig.vsFlood")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <Gauge className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                <div className="text-2xl font-bold">{result.overIrrigationScore}</div>
                <p className="text-xs text-muted-foreground mt-1">{t("irrig.overRisk")}</p>
                <p className="text-[10px] text-muted-foreground">{t("irrig.scoreOut")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Irrigation Recommendation */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{t("irrig.decision")}</CardTitle>
                  <Badge className={
                    result.irrigationNeed === "No Irrigation" ? "bg-emerald-100 text-emerald-700" :
                    result.irrigationNeed === "Light Irrigation" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }>
                    {result.irrigationNeed}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{result.recommendation}</p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <span className="text-muted-foreground">{t("irrig.waterReq")}</span>
                    <div className="font-semibold text-base mt-1">{result.waterRequired_liters} L/acre</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <span className="text-muted-foreground">{t("irrig.costSaving")}</span>
                    <div className="font-semibold text-base mt-1 text-emerald-600">Rs {result.costSaving_rs}</div>
                  </div>
                </div>

                {/* Manual Override */}
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t("irrig.pumpOverride")}</p>
                  <div className="flex gap-2">
                    {(["auto", "on", "off"] as const).map((mode) => (
                      <Button
                        key={mode}
                        size="sm"
                        variant={pumpOverride === mode ? "default" : "outline"}
                        className={pumpOverride === mode ? "bg-blue-600 text-white" : ""}
                        onClick={() => setPumpOverride(mode)}
                      >
                        {mode === "auto" ? t("irrig.auto") : mode === "on" ? t("irrig.forceOn") : t("irrig.forceOff")}
                      </Button>
                    ))}
                  </div>
                  {pumpOverride !== "auto" && (
                    <p className="text-[10px] text-orange-600 mt-1">{t("irrig.overrideActive")}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  {t("irrig.schedule")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.schedule.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b last:border-0">
                      <span className="font-medium w-20">{entry.day}</span>
                      <span className="text-muted-foreground flex-1">{entry.action}</span>
                      <span className="font-medium text-blue-600">
                        {entry.waterLiters > 0 ? `${entry.waterLiters} L` : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
