"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { DiseaseRiskResult } from "@/lib/types";
import { ShieldAlert, Loader2, Thermometer, Droplets, CloudRain, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

export default function DiseaseRiskPage() {
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
        headers: { "Content-Type": "application/json" },
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

  const riskColors: Record<string, { bg: string; text: string; ring: string }> = {
    Low: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
    Medium: { bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-200" },
    High: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-orange-500" />
          Disease Risk Forecasting
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predict disease probability for the next 7-10 days using weather data and crop type.
          Simulated LSTM/GRU time-series model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Weather & Crop Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Crop</label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Region</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Season</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Thermometer className="h-3 w-3" /> Temperature (°C)
              </label>
              <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" /> Humidity (%)
              </label>
              <Input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CloudRain className="h-3 w-3" /> Rainfall (mm/day)
              </label>
              <Input type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} />
            </div>

            <Button
              onClick={forecast}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Forecasting...</> : "Forecast Disease Risk"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {result && (
          <div className="lg:col-span-2 space-y-4">
            {/* Risk Gauge */}
            <Card className={`${riskColors[result.riskLevel].bg} border-2 ${riskColors[result.riskLevel].ring}`}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Disease Risk (Next {result.forecastDays} Days)</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-5xl font-bold ${riskColors[result.riskLevel].text}`}>{result.riskPercentage}%</span>
                      <Badge className={`${riskColors[result.riskLevel].text} ${riskColors[result.riskLevel].bg} border`}>
                        {result.riskLevel} Risk
                      </Badge>
                    </div>
                  </div>
                  <div className="h-24 w-24 rounded-full border-8 border-current flex items-center justify-center" style={{ borderColor: result.riskLevel === "High" ? "#ef4444" : result.riskLevel === "Medium" ? "#eab308" : "#10b981" }}>
                    <span className={`text-2xl font-bold ${riskColors[result.riskLevel].text}`}>{result.riskPercentage}</span>
                  </div>
                </div>

                {/* Risk bar */}
                <div className="mt-4">
                  <div className="h-3 bg-white/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${result.riskPercentage}%`,
                        backgroundColor: result.riskLevel === "High" ? "#ef4444" : result.riskLevel === "Medium" ? "#eab308" : "#10b981",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0% Safe</span>
                    <span>50%</span>
                    <span>100% Critical</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Disease Threats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Top Disease Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.topDiseases.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-muted-foreground">{d.probability}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-orange-400"
                            style={{ width: `${Math.min(d.probability, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contributing Factors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Contributing Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {f.impact === "Negative" ? (
                        <TrendingUp className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="font-medium">{f.factor}: </span>
                        <span className="text-muted-foreground">{f.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-800">AI Recommendation</p>
                    <p className="text-sm text-emerald-700 mt-1">{result.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
