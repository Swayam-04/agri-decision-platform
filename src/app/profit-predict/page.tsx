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

export default function ProfitPredictPage() {
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
        headers: { "Content-Type": "application/json" },
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
          Yield & Profit Prediction
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estimate expected yield, market price, input costs, and profit per acre.
          Simulated Random Forest / XGBoost regression model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Farm Details</CardTitle>
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
              <label className="text-xs font-medium text-muted-foreground">Acreage</label>
              <Input type="number" value={acreage} onChange={(e) => setAcreage(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Irrigation Type</label>
              <Select value={irrigationType} onValueChange={setIrrigationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Canal", "Drip", "Sprinkler", "Rain-fed"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Soil Type</label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Alluvial", "Black", "Red", "Laterite"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={predict}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Predicting...</> : "Predict Profit"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {result && (
          <div className="lg:col-span-2 space-y-4">
            {/* Profit Summary */}
            <Card className={`border-l-4 ${result.profitPerAcre >= 0 ? "border-l-emerald-500 bg-emerald-50/50" : "border-l-red-500 bg-red-50/50"}`}>
              <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue / Acre</p>
                    <p className="text-2xl font-bold text-blue-600">Rs {result.grossRevenuePerAcre.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost / Acre</p>
                    <p className="text-2xl font-bold text-orange-600">Rs {result.inputCostPerAcre.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit / Acre</p>
                    <p className={`text-2xl font-bold ${result.profitPerAcre >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      Rs {result.profitPerAcre.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Profit Range: Rs {result.profitRange.low.toLocaleString("en-IN")} to Rs {result.profitRange.high.toLocaleString("en-IN")} per acre
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    For {acreage} acres: Rs {(result.profitPerAcre * parseFloat(acreage)).toLocaleString("en-IN")} total estimated profit
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {Math.round(result.confidenceScore * 100)}% Model Confidence
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Yield & Price */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Expected Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{result.expectedYieldPerAcre} <span className="text-sm font-normal text-muted-foreground">{result.yieldUnit}/acre</span></p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-emerald-500" />
                    Market Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Rs {result.expectedMarketPrice.toLocaleString("en-IN")} <span className="text-sm font-normal text-muted-foreground">/quintal</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Range: Rs {result.marketPriceRange.low.toLocaleString("en-IN")} - Rs {result.marketPriceRange.high.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Input Cost Breakdown (Per Acre)</CardTitle>
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
                  <span>Total Input Cost</span>
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
                      <p className="text-xs font-medium text-yellow-800">Risk Factors</p>
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
