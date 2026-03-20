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

const CROP_COLORS: Record<string, string> = {
  Rice: "#3b82f6",
  Wheat: "#f59e0b",
  Maize: "#10b981",
  Cotton: "#6366f1",
  Sugarcane: "#059669",
  Soybean: "#8b5cf6",
  Tomato: "#ef4444",
  Onion: "#f97316",
  Potato: "#78350f",
  Chickpea: "#ec4899",
  Pigeonpea: "#a855f7",
  Mungbean: "#14b8a6",
  Groundnut: "#854d0e",
};

export default function PriceForecastPage() {
  const { t, language } = useTranslation();
  const [isMultiCrop, setIsMultiCrop] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(["Tomato", "Onion"]);
  const [cropType, setCropType] = useState("Tomato");
  const [region, setRegion] = useState("Maharashtra");
  const [currentPrice, setCurrentPrice] = useState("1800");
  const [currentPrices, setCurrentPrices] = useState<Record<string, string>>({ Tomato: "1800", Onion: "1500" });
  const [quantity, setQuantity] = useState("50");
  const [storageCost, setStorageCost] = useState("8");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceForecastResult | null>(null);

  async function forecast() {
    setLoading(true);
    try {
      const payload = isMultiCrop
        ? {
            cropTypes: selectedCrops,
            region,
            currentPrices: Object.fromEntries(Object.entries(currentPrices).map(([k, v]) => [k, parseFloat(v)])),
            quantityQuintals: parseFloat(quantity),
            storageCostPerDay: parseFloat(storageCost)
          }
        : {
            cropType,
            region,
            currentPrice: parseFloat(currentPrice),
            quantityQuintals: parseFloat(quantity),
            storageCostPerDay: parseFloat(storageCost)
          };

      const res = await fetch("/api/price-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      // Requirement 6: Debug Logging
      console.log("selectedCrops (Debug):", isMultiCrop ? selectedCrops : [cropType]);
      console.log("forecastData (Debug):", data?.priceTimeline);
      
      setResult(data);
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">{t("price.crop")}</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-purple-500">{isMultiCrop ? "Multi-Crop" : "Single"}</span>
                <input 
                  type="checkbox" 
                  checked={isMultiCrop} 
                  onChange={(e) => setIsMultiCrop(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </div>
            </div>

            {!isMultiCrop ? (
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CROP_LIST.map((c) => <SelectItem key={c} value={c}>{t(`crops.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-2 border rounded-md p-2 bg-muted/20 max-h-40 overflow-y-auto">
                {CROP_LIST.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" 
                      checked={selectedCrops.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCrops([...selectedCrops, c]);
                        else setSelectedCrops(selectedCrops.filter(sc => sc !== c));
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-300"
                    />
                    {t(`crops.${c}`)}
                  </label>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("price.region")}</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {!isMultiCrop ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("price.currentPrice")}</label>
                <Input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Current Prices (Rs/Quintal)</label>
                <div className="space-y-2 max-h-32 overflow-y-auto p-1">
                  {selectedCrops.map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <span className="text-[10px] w-16 truncate uppercase font-bold">{t(`crops.${c}`)}</span>
                      <Input 
                        type="number" 
                        size={1}
                        className="h-7 text-xs"
                        value={currentPrices[c] || ""} 
                        onChange={(e) => setCurrentPrices({...currentPrices, [c]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            <Card className={`border-2 ${result.decision === "Store" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-400 bg-red-50 dark:bg-red-950/20"}`}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t("price.aiDecision")}</p>
                    <h2 className={`text-3xl font-bold mt-1 ${result.decision === "Store" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                      {result.combinedStrategy ? "Combined Strategy" : result.decision === "Store" ? `${t("price.storeFor")} ${result.storeDays} ${t("price.days")}` : t("price.sellNow")}
                    </h2>
                    {result.combinedStrategy && (
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">{result.combinedStrategy}</p>
                    )}
                  </div>
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ${result.decision === "Store" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
                    {result.decision === "Store" ? (
                      <Package className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Store className="h-8 w-8 text-red-600 dark:text-red-400" />
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
                {(!result.priceTimeline || result.priceTimeline.length === 0) ? (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <TrendingDown className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">{t("price.noData") || "No forecast data available"}</p>
                  </div>
                ) : (() => {
                  // Requirement 1: Detect Mode
                  const mode = (!isMultiCrop || selectedCrops.length === 1) ? "single" : "multi";
                  
                  // Requirement 2 & 3 & 7: Handle Single/Multi Crop Properly
                  let datasets;
                  if (mode === "single") {
                    const activeCrop = isMultiCrop ? selectedCrops[0] : cropType;
                    datasets = [{
                      label: activeCrop,
                      dataKey: activeCrop,
                      borderColor: CROP_COLORS[activeCrop] || "#8b5cf6",
                      strokeWidth: 3
                    }];
                  } else {
                    datasets = selectedCrops.map((crop) => ({
                      label: crop,
                      dataKey: crop,
                      borderColor: CROP_COLORS[crop] || "#8b5cf6",
                      strokeWidth: 2.5
                    }));
                  }

                  // Requirement 6: Debug Logging before rendering
                  console.log("Rendering Chart - Mode:", mode);
                  console.log("Rendering Chart - Datasets:", datasets);

                  return (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.priceTimeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} 
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `₹${val}`}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 min-w-[140px]">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                      {t("price.daysChart")} {label}
                                    </p>
                                    <div className="space-y-1.5">
                                      {payload.map((entry: any, i) => (
                                        <div key={i} className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                              {t(`crops.${entry.name}`) || entry.name}
                                            </p>
                                          </div>
                                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Rs {entry.value?.toLocaleString("en-IN")}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          
                          {mode === "single" && (
                            <>
                              <ReferenceLine y={result.currentPrice} stroke="#6b7280" strokeDasharray="5 5" label={{ value: t("price.current"), position: "right", fontSize: 10, fill: "#6b7280" }} />
                              {result.decision === "Store" && (
                                <ReferenceLine x={result.storeDays} stroke="#10b981" strokeDasharray="5 5" label={{ value: t("price.sellDay"), position: "top", fontSize: 10, fill: "#10b981" }} />
                              )}
                            </>
                          )}

                          {datasets.map((ds) => (
                            <Line 
                              key={ds.dataKey}
                              type="monotone" 
                              name={ds.label}
                              dataKey={ds.dataKey} 
                              stroke={ds.borderColor} 
                              strokeWidth={ds.strokeWidth} 
                              dot={false}
                              activeDot={{ r: (ds.strokeWidth + 2), strokeWidth: 0, fill: ds.borderColor }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
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

            {/* Individual Breakdown for Multi-Crop */}
            {isMultiCrop && result.individualDecisions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Individual Crop Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(result.individualDecisions).map(([crop, data]) => (
                      <div key={crop} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold">{t(`crops.${crop}`)}</p>
                          <p className="text-[10px] text-muted-foreground">Cur: Rs {data.currentPrice} → Frc: Rs {data.forecastedPrice}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={data.decision === "Store" ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600"}>
                            {data.decision === "Store" ? `Store ${data.storeDays}d` : "Sell Now"}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Potential: Rs {data.expectedGainLoss.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.spoilageRisk !== "Low" && !isMultiCrop && (
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
