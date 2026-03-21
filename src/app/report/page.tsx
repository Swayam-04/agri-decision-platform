"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2, MapPin, Calendar, Sprout, Globe } from "lucide-react";
import { toast } from "sonner";

export default function ComprehensiveReportPage() {
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("Khordha");
  const [localArea, setLocalArea] = useState("Bhubaneswar");
  const [season, setSeason] = useState("Kharif");
  const [crop, setCrop] = useState("Rice");
  const [language, setLanguage] = useState("en");
  const [downloading, setDownloading] = useState(false);
  
  const [gpsActive, setGpsActive] = useState(false);
  const [findingLocation, setFindingLocation] = useState(false);

  // States and districts mock
  const stateDistricts: Record<string, string[]> = {
    "Odisha": ["Khordha", "Cuttack", "Ganjam", "Balasore"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
    "Maharashtra": ["Pune", "Nagpur", "Nashik", "Aurangabad"]
  };

  const localAreas: Record<string, string[]> = {
    "Khordha": ["Bhubaneswar", "Jatni", "Khurda Town"],
    "Ludhiana": ["Mullanpur", "Jagraon", "Khanna"],
    "Pune": ["Baramati", "Shirur", "Indapur"]
  };

  const cropsBySeason: Record<string, string[]> = {
    "Kharif": ["Rice", "Maize", "Cotton", "Soybean"],
    "Rabi": ["Wheat", "Mustard", "Barley", "Gram"],
    "Zaid": ["Watermelon", "Cucumber", "Bitter Gourd", "Pumpkin"]
  };

  function handleGpsClick() {
    setFindingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setGpsActive(true);
            setFindingLocation(false);
            // Set based on mock GPS reverse geocoding result
            setState("Punjab");
            setDistrict("Ludhiana");
            setLocalArea("Mullanpur");
            toast.success("GPS Location Detected", { description: "Location auto-set to Mullanpur, Ludhiana, Punjab." });
          }, 800);
        },
        (error) => {
          setFindingLocation(false);
          toast.error("GPS Error", { description: "Please enable location services." });
        }
      );
    } else {
      setFindingLocation(false);
      toast.error("GPS Error", { description: "Geolocation not supported by your browser." });
    }
  }

  async function handleDownload() {
    setDownloading(true);
    toast.info("Compiling Report Data...", {
      description: "Gathering weather, market, and disease insights."
    });

    try {
      const endpoint = `/api/generate-report?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&localArea=${encodeURIComponent(localArea)}&season=${encodeURIComponent(season)}&crop=${encodeURIComponent(crop)}&language=${language}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to generate report");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Agri_Intelligence_${crop}_${state}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report Generated Successfully", {
        description: `📥 ${a.download} is ready.`
      });
    } catch (err) {
      console.error(err);
      toast.error("Generation Failed", {
        description: "Could not create the comprehensive report."
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-10 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-[#3d1f0a] dark:text-[#f0fdf4] tracking-tight mb-2">
          Comprehensive Report
        </h1>
        <p className="text-lg text-[#6b4423]/60 dark:text-[#86efac]/60">
          One click → complete farming intelligence report.
        </p>
      </div>

      <Card className="border-[#16a34a]/20 bg-white/50 dark:bg-[#052e16]/20 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#16a34a]/5 dark:bg-[#16a34a]/10 border-b border-[#16a34a]/10 pb-6">
          <CardTitle className="text-xl font-black flex items-center gap-2 text-[#3d1f0a] dark:text-[#f0fdf4]">
            <FileText className="h-6 w-6 text-[#16a34a]" />
            Report Configurator
          </CardTitle>
          <CardDescription className="text-[#6b4423]/70 dark:text-[#86efac]/70">
            Select your location, season, and crop to generate a hyper-localized agricultural intelligence document.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#16a34a] flex items-center gap-2 uppercase tracking-wider">
                  <MapPin className="h-4 w-4" /> Location Filter
                </h3>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleGpsClick} 
                  disabled={findingLocation}
                  className={`h-8 text-[10px] md:text-xs rounded-full px-3 md:px-4 border ${gpsActive ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a]/10"}`}
                >
                  {findingLocation ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Locating...</>
                  ) : (
                    <><MapPin className={`h-3 w-3 mr-1 ${gpsActive ? 'fill-emerald-500 text-emerald-500' : ''}`} /> {gpsActive ? 'GPS Active' : 'Use GPS'}</>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b4423]/80 dark:text-[#86efac]/80">State</label>
                <Select value={state} onValueChange={(val) => { setState(val); setDistrict(stateDistricts[val][0]); setLocalArea((localAreas[stateDistricts[val][0]] || ["Rural"])[0]); setGpsActive(false); }}>
                  <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-black/20 border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(stateDistricts).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b4423]/80 dark:text-[#86efac]/80">District</label>
                <Select value={district} onValueChange={(val) => { setDistrict(val); setLocalArea((localAreas[val] || ["Rural"])[0]); setGpsActive(false); }}>
                  <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-black/20 border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stateDistricts[state].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Local Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b4423]/80 dark:text-[#86efac]/80">Local Area</label>
                <Select value={localArea} onValueChange={(val) => { setLocalArea(val); setGpsActive(false); }}>
                  <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-black/20 border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(localAreas[district] || ["Rural", "Sub-urban", "Urban"]).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Farming Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#16a34a] flex items-center gap-2 uppercase tracking-wider">
                <Sprout className="h-4 w-4" /> Farming Details
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b4423]/80 dark:text-[#86efac]/80">Season</label>
                <Select value={season} onValueChange={(val) => { setSeason(val); setCrop(cropsBySeason[val][0]); }}>
                  <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-black/20 border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(cropsBySeason).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#6b4423]/80 dark:text-[#86efac]/80">Crop</label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-black/20 border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cropsBySeason[season].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#16a34a]/10">
            <div className="max-w-xs mx-auto md:mx-0 space-y-2">
              <label className="text-xs font-bold text-[#16a34a] flex items-center gap-2 uppercase tracking-wider">
                <Globe className="h-4 w-4" /> Report Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-black/20 border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                  <SelectItem value="or">ଓଡ଼ିଆ (Odia)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleDownload} 
            disabled={downloading}
            className="w-full h-16 text-lg font-black bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl shadow-[0_10px_20px_rgba(22,163,74,0.2)] hover:shadow-[0_15px_30px_rgba(22,163,74,0.3)] transition-all hover:scale-[1.01]"
          >
            {downloading ? (
              <><Loader2 className="h-6 w-6 mr-3 animate-spin" /> Compiling Insights...</>
            ) : (
              <><Download className="h-6 w-6 mr-3" /> Generate & Download Report</>
            )}
          </Button>
          
          <p className="text-center text-xs text-[#6b4423]/50 dark:text-[#86efac]/50 italic">
            * Our system generates a complete, location-aware, multilingual agricultural report combining weather, market, disease, and storage insights into one actionable document.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
