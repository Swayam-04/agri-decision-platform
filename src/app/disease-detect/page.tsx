"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST } from "@/lib/types";
import type { DiseaseDetectionResult } from "@/lib/types";
import { Microscope, Upload, Loader2, AlertCircle, ShieldCheck, Pill, Shield } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function DiseaseDetectPage() {
  const { t, language } = useTranslation();
  const [cropType, setCropType] = useState("Rice");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  async function analyzeImage() {
    if (!imagePreview) return;
    setLoading(true);
    try {
      const res = await fetch("/api/disease-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({ cropType, imageBase64: imagePreview }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const severityColors: Record<string, string> = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
    Healthy: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Microscope className="h-6 w-6 text-emerald-600" />
          {t("detect.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("detect.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t("detect.uploadCard")}</CardTitle>
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

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">{t("detect.leafImage")}</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Uploaded crop leaf"
                      className="mx-auto max-h-48 rounded-lg object-contain"
                    />
                    <p className="text-xs text-muted-foreground">{t("detect.imageUploaded")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{t("detect.clickToUpload")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("detect.supportedFormats")}</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ position: "relative" }}
                />
              </div>
            </div>

            <Button
              onClick={analyzeImage}
              disabled={!imagePreview || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("detect.btnAnalyzing")}</>
              ) : (
                <><Microscope className="h-4 w-4 mr-2" />{t("detect.btnAnalyze")}</>
              )}
            </Button>

            {/* Demo helper removed */}
          </CardContent>
        </Card>

        {/* Results Panel */}
        {result && (
          <div className="space-y-4">
            <Card className={cn(
              "border-l-4",
              result.severity === "Healthy" ? "border-l-emerald-400" : "border-l-red-400"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {result.severity === "Healthy" ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {t("detect.resultTitle")}
                  </CardTitle>
                  <Badge className={severityColors[result.severity]}>
                    {t(`advisory.risk.${result.severity}`) || result.severity} {result.severity !== "Healthy" && t("detect.severity")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{result.diseaseName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-muted-foreground">{t("detect.confidence")}</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </CardContent>
            </Card>

            {result.severity !== "Healthy" && result.remedies.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pill className="h-4 w-4 text-blue-500" />
                    {t("detect.treatment")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.remedies.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ShieldCheck className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  {t("detect.preventive")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.preventiveMeasures.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
