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
import { useTranslation } from "@/hooks/useTranslation";

export default function PriceForecastPage() {
  const { t } = useTranslation();
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
          {t("price.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("price.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">{t("price.marketDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("price.crop")}</label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}>{t(`crops.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("price.region")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("price.currentPrice")}</label>
              <Input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("price.quantity")}</label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("price.storageCost")}</label>
              <Input type="number" value={storageCost} onChange={(e) => setStorageCost(e.target.value)} />
            </div>

            <Button
              onClick={forecast}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("price.btnForecasting")}</> : t("price.btnAdvice")}
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
                    <p className="text-xs font-medium text-muted-foreground">{t("price.aiDecision")}</p>
                    <h2 className={`text-3xl font-bold mt-1 ${result.decision === "Store" ? "text-emerald-700" : "text-red-700"}`}>
                      {result.decision === "Store" ? `${t("price.storeFor")} ${result.storeDays} ${t("price.days")}` : t("price.sellNow")}
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
              <MetricCard label={t("price.priceTrend")} value={result.priceTrend === "Rising" ? t("price.rising") : result.priceTrend === "Falling" ? t("price.falling") : t("price.stable")} icon={<TrendIcon className="h-4 w-4" />} />
              <MetricCard label={t("price.priceChange")} value={`${result.priceChange > 0 ? "+" : ""}${result.priceChange}%`} />
              <MetricCard label={t("price.storageCostValue")} value={`Rs ${result.storageCost.toLocaleString("en-IN")}`} />
              <MetricCard label={t("price.spoilageRisk_label")} value={result.spoilageRisk === "Low" ? t("price.riskLow") : result.spoilageRisk === "Medium" ? t("price.riskMedium") : t("price.riskHigh")} badge rawValue={result.spoilageRisk} />
            </div>

            {/* Price Timeline Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t("price.30dayForecast")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.priceTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: t("price.daysChart"), position: "insideBottom", offset: -5, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: t("price.priceChart"), angle: -90, position: "insideLeft", fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => [`Rs ${value}`, t("price.priceChart")]}
                        labelFormatter={(label) => `${t("price.daysChart")} ${label}`}
                      />
                      <ReferenceLine y={result.currentPrice} stroke="#6b7280" strokeDasharray="5 5" label={{ value: t("price.current"), position: "right", fontSize: 10 }} />
                      {result.decision === "Store" && (
                        <ReferenceLine x={result.storeDays} stroke="#10b981" strokeDasharray="5 5" label={{ value: t("price.sellDay"), position: "top", fontSize: 10 }} />
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
                <CardTitle className="text-sm">{t("price.financialSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("price.currentValue")} ({quantity} x Rs {result.currentPrice})</span>
                    <span className="font-medium">Rs {(parseFloat(quantity) * result.currentPrice).toLocaleString("en-IN")}</span>
                  </div>
                  {result.decision === "Store" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("price.forecastedValue")} ({quantity} x Rs {result.forecastedPrice})</span>
                        <span className="font-medium">Rs {(parseFloat(quantity) * result.forecastedPrice).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>{t("price.storageCostValue")} ({result.storeDays} {t("price.days").toLowerCase()})</span>
                        <span>- Rs {result.storageCost.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>{result.expectedGainLoss >= 0 ? t("price.netGain") : t("price.netLoss")}</span>
                    <span className={result.expectedGainLoss >= 0 ? "text-emerald-600" : "text-red-600"}>
                      Rs {result.expectedGainLoss.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reasoning */}
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-purple-800 dark:text-purple-300">{t("price.aiReasoning")}</p>
                    <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">{result.reasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.spoilageRisk !== "Low" && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">{t("price.spoilageWarning")}</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                        {t(`crops.${cropType}`)} {t("price.spoilageMsg")}
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

function MetricCard({ label, value, icon, badge, rawValue }: { label: string; value: string; icon?: React.ReactNode; badge?: boolean; rawValue?: string }) {
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
            <Badge className={`text-xs ${badgeColors[rawValue || value] || ""}`}>{value}</Badge>
          ) : (
            <span className="text-sm font-medium">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
