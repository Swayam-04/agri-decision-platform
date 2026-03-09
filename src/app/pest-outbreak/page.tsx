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

export default function PestOutbreakPage() {
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [temperature, setTemperature] = useState(30);
  const [humidity, setHumidity] = useState(72);
  const [rainfall, setRainfall] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PestOutbreakResult | null>(null);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/pest-outbreak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, season, temperature, humidity, recentRainfall: rainfall }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const zoneColors: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Moderate: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pest & Disease Outbreak Forecasting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Regional outbreak risk prediction with district-level alerts. Predict before it spreads.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Region</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REGION_LIST.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Season</label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Temperature: {temperature}°C</label>
              <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={10} max={48} step={1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Humidity: {humidity}%</label>
              <Slider value={[humidity]} onValueChange={([v]) => setHumidity(v)} min={20} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Recent Rainfall: {rainfall}mm</label>
              <Slider value={[rainfall]} onValueChange={([v]) => setRainfall(v)} min={0} max={100} step={1} />
            </div>
          </div>
          <Button onClick={analyze} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Forecasting...</> : "Forecast Pest Outbreak"}
          </Button>
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
                <p className="text-xs text-muted-foreground mt-1">Outbreak Probability</p>
                <Progress value={result.outbreakProbability} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5 text-center">
                <ShieldAlert className="h-7 w-7 mx-auto text-red-500 mb-2" />
                <Badge className={`text-sm px-3 py-1 ${zoneColors[result.riskZone]}`}>
                  {result.riskZone} Risk Zone
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Regional Classification</p>
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
                  Crops at Risk
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
                  District-Level Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.districtAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-2 border-b last:border-0">
                      <span className="font-medium">{alert.district}</span>
                      <span className="text-muted-foreground">{alert.pest}</span>
                      <Badge className={`text-[10px] ${zoneColors[alert.level]}`}>{alert.level}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preventive Advisory */}
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Preventive Advisory</CardTitle>
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
