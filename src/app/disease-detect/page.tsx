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
import { NearbyAgroStores } from "@/components/NearbyAgroStores";

export default function DiseaseDetectPage() {
  const { t, language } = useTranslation();
  const [cropType, setCropType] = useState("Rice");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Prefer back camera on mobile
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError(t("detect.cameraError") || "Camera access denied or not available");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    const video = document.getElementById("camera-preview") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg");
      setImagePreview(imageData);
      stopCamera();
      setResult(null);
    }
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Requirement: Validate file size (5MB) and format
      if (file.size > 5 * 1024 * 1024) {
        setError(t("detect.fileTooLarge") || "File size exceeds 5MB limit");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setError(t("detect.invalidFormat") || "Only JPG/PNG formats are supported");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  async function checkIsPlantLeaf(base64: string): Promise<{ isLeaf: boolean, confidence: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100 * (img.height / img.width);
        if (!ctx) return resolve({ isLeaf: true, confidence: 100 });
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        let greenPixels = 0;
        let skinPixels = 0;
        const totalPixels = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Relaxed Green detection (Typical for leaves)
          if (g > r * 0.9 && g > b * 1.1 && g > 30) {
            greenPixels++;
          }
          
          // Skin tone detection (Typical for human faces/hands)
          // High R, moderate G, lower B (R > G > B)
          if (r > 60 && g > 40 && b > 20 && r > g && g > b && (r - g) > 10) {
            skinPixels++;
          }
        }
        
        const greenRatio = greenPixels / totalPixels;
        const skinRatio = skinPixels / totalPixels;
        
        // Stricter requirements:
        // 1. Must have at least 15% green (raised from 1%)
        // 2. Skin pixels must not exceed 15% (lowered from 25%)
        const isLeaf = greenRatio > 0.15 && skinRatio < 0.15;
        const confidence = Math.min(99, Math.round(greenRatio * 200) + 20);
        
        resolve({ isLeaf, confidence });
      };
      img.onerror = () => resolve({ isLeaf: true, confidence: 100 });
      img.src = base64;
    });
  }

  async function analyzeImage() {
    if (!imagePreview || result) return;
    setLoading(true);
    setError(null);

    // 1️⃣ Add Image Classification Layer (Leaf Validation)
    // 9️⃣ Prevent Backend Processing for invalid images
    const { isLeaf, confidence } = await checkIsPlantLeaf(imagePreview);
    
    if (!isLeaf) {
      setLoading(false);
      setError(`${t("detect.invalidImageTitle")}\n${t("detect.invalidImageDesc")}`);
      return;
    }
    
    if (confidence < 70) {
      setLoading(false);
      setError(`${t("detect.invalidImageTitle")}\n${t("detect.invalidImageRetake") || "Invalid image – retake photo"}`);
      return;
    }

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
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis");
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

            {/* ERROR ALERT */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">{t("detect.leafImage")}</label>
              
              {/* Requirement: Dual Input Buttons */}
              {!imagePreview && !isCameraOpen && (
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2" 
                    onClick={startCamera}
                  >
                    <Microscope className="h-4 w-4" /> {/* Swap with Camera icon if available */}
                    Camera
                  </Button>
                  <div className="relative flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden min-h-[200px] flex flex-col items-center justify-center bg-muted/30 relative">
                {isCameraOpen ? (
                  <div className="w-full h-full relative">
                    <video 
                      id="camera-preview" 
                      autoPlay 
                      playsInline 
                      ref={(el) => { if (el) el.srcObject = stream; }}
                      className="w-full h-full object-cover min-h-[300px]"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                      <Button onClick={captureImage} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 w-12 p-0">
                        <Microscope className="h-6 w-6" />
                      </Button>
                      <Button variant="destructive" onClick={stopCamera} className="rounded-full h-12 w-12 p-0">
                        <AlertCircle className="h-6 w-6 rotate-45" />
                      </Button>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="p-4 space-y-3 text-center w-full">
                    <img
                      src={imagePreview}
                      alt="Captured/Uploaded crop leaf"
                      className="mx-auto max-h-56 rounded-lg object-contain border"
                    />
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-muted-foreground hover:text-red-500"
                        onClick={() => { setImagePreview(null); setResult(null); }}
                      >
                        Retake / Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
                    <p className="text-xs text-muted-foreground">Select an option above to provide an image</p>
                  </div>
                )}
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
                  <div className="flex gap-2">
                    {result.isStable !== undefined && (
                      <Badge variant="outline" className={cn(
                        "flex items-center gap-1",
                        result.isStable ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-amber-500 text-amber-600 bg-amber-50"
                      )}>
                        {result.isStable ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {t(result.isStable ? "detect.stablePrediction" : "detect.uncertainPrediction")}
                      </Badge>
                    )}
                    <Badge className={severityColors[result.severity]}>
                      {t(`advisory.risk.${result.severity}`) || result.severity} {result.severity !== "Healthy" && t("detect.severity")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{t("detect.analysisResult")}</h3>
                  
                  {/* Requirement: Top-2 Prediction Logic */}
                  <div className="space-y-4">
                    {result.topPredictions ? (
                      result.topPredictions.slice(0, 2).map((pred, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className={cn("font-medium", idx === 0 ? "text-foreground" : "text-muted-foreground")}>
                              {idx + 1}. {pred.label}
                            </span>
                            <span className="font-mono font-bold">{Math.round(pred.confidence * 100)}%</span>
                          </div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                idx === 0 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-emerald-500/40"
                              )}
                              style={{ width: `${pred.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">1. {result.diseaseName}</span>
                          <span className="font-mono font-bold">{Math.round(result.confidence * 100)}%</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">{t("detect.infectionArea")}</span>
                  <span className={cn(
                    "text-sm font-bold",
                    result.severity === "High" ? "text-red-500" :
                    result.severity === "Medium" ? "text-amber-500" :
                    "text-emerald-500"
                  )}>
                    {result.infectionArea || "0%"}
                  </span>
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
                    {result.remedies.map((r: string, i: number) => (
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
                  <Shield className={cn("h-4 w-4", result.severity === "Healthy" ? "text-emerald-500" : "text-emerald-500")} />
                  {result.severity === "Healthy" ? t("detect.healthyMaintenance") : t("detect.preventive")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.preventiveMeasures.map((pm: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ShieldCheck className={cn("h-4 w-4 mt-0.5 shrink-0", result.severity === "Healthy" ? "text-emerald-500" : "text-emerald-500")} />
                      <span>{pm}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Display Nearby Agro Stores if severe enough to need treatment */}
            {result.severity !== "Healthy" && (
              <NearbyAgroStores treatmentKeywords={result.remedies || []} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
