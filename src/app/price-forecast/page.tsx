"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST } from "@/lib/types";
import type { PriceForecastResult } from "@/lib/types";
import { Store, Loader2, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function PriceForecastPage() {
  const [cropType, setCropType] = useState("Tomato");
  const [region, setRegion] = useState("Maharashtra");
  const [currentPrice, setCurrentPrice] = useState("1800");
  const [quantity, setQuantity] = useState("50");
  const [storageCost, setStorageCost] = useState("8");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceForecastResult | null>(null);

  async function forecast() {
    setLoading(true);
    try {
      const res = await fetch("/api/price-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType, region,
          currentPrice: parseFloat(currentPrice),
          quantityQuintals: parseFloat(quantity),
          storageCostPerDay: parseFloat(storageCost),
        }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const TrendIcon = result?.priceTrend === "Rising" ? TrendingUp : result?.priceTrend === "Falling" ? TrendingDown : Minus;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-6 w-6 text-purple-500" />
          Price Forecast & Sell/Store Decision
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Should you sell now or store your harvest? AI compares storage cost, spoilage risk, and price trends to decide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Market Details</CardTitle>
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
              <label className="text-xs font-medium text-muted-foreground">Current Market Price (Rs/quintal)</label>
              <Input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quantity (quintals)</label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Storage Cost (Rs/quintal/day)</label>
              <Input type="number" value={storageCost} onChange={(e) => setStorageCost(e.target.value)} />
            </div>

            <Button
              onClick={forecast}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Forecasting...</> : "Get Sell/Store Advice"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        {result && (
          <div className="lg:col-span-2 space-y-4">
            {/* Decision Banner */}
            <Card className={`border-2 ${result.decision === "Store" ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50"}`}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">AI Decision</p>
                    <h2 className={`text-3xl font-bold mt-1 ${result.decision === "Store" ? "text-emerald-700" : "text-red-700"}`}>
                      {result.decision === "Store" ? `Store for ${result.storeDays} Days` : "Sell Now"}
                    </h2>
                  </div>
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ${result.decision === "Store" ? "bg-emerald-100" : "bg-red-100"}`}>
                    {result.decision === "Store" ? (
                      <Package className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <Store className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Price Trend" value={result.priceTrend} icon={<TrendIcon className="h-4 w-4" />} />
              <MetricCard label="Price Change" value={`${result.priceChange > 0 ? "+" : ""}${result.priceChange}%`} />
              <MetricCard label="Storage Cost" value={`Rs ${result.storageCost.toLocaleString("en-IN")}`} />
              <MetricCard label="Spoilage Risk" value={result.spoilageRisk} badge />
            </div>

            {/* Price Timeline Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">30-Day Price Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.priceTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: "Days", position: "insideBottom", offset: -5, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: "Rs/quintal", angle: -90, position: "insideLeft", fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`Rs ${value}`, "Price"]}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <ReferenceLine y={result.currentPrice} stroke="#6b7280" strokeDasharray="5 5" label={{ value: "Current", position: "right", fontSize: 10 }} />
                      {result.decision === "Store" && (
                        <ReferenceLine x={result.storeDays} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Sell Day", position: "top", fontSize: 10 }} />
                      )}
                      <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Value ({quantity} quintals × Rs {result.currentPrice})</span>
                    <span className="font-medium">Rs {(parseFloat(quantity) * result.currentPrice).toLocaleString("en-IN")}</span>
                  </div>
                  {result.decision === "Store" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forecasted Value ({quantity} quintals × Rs {result.forecastedPrice})</span>
                        <span className="font-medium">Rs {(parseFloat(quantity) * result.forecastedPrice).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Storage Cost ({result.storeDays} days)</span>
                        <span>- Rs {result.storageCost.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Net {result.expectedGainLoss >= 0 ? "Gain" : "Loss"}</span>
                    <span className={result.expectedGainLoss >= 0 ? "text-emerald-600" : "text-red-600"}>
                      Rs {result.expectedGainLoss.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reasoning */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-purple-800">AI Reasoning</p>
                    <p className="text-sm text-purple-700 mt-1">{result.reasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.spoilageRisk !== "Low" && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800">Spoilage Warning</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {cropType} is a perishable crop. Extended storage increases spoilage risk. Ensure proper cold storage or
                        ventilated warehousing to minimize losses.
                      </p>
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

function MetricCard({ label, value, icon, badge }: { label: string; value: string; icon?: React.ReactNode; badge?: boolean }) {
  const badgeColors: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardContent className="pt-3 pb-3 px-3">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1 mt-1">
          {icon}
          {badge ? (
            <Badge className={`text-xs ${badgeColors[value] || ""}`}>{value}</Badge>
          ) : (
            <span className="text-sm font-medium">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
