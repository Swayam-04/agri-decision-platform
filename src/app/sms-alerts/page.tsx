"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SmsLogEntry, SmsHistoryResult } from "@/lib/types";
import {
  MessageSquare, Loader2, Phone, AlertTriangle, CheckCircle2, Send,
  Zap, RefreshCw, XCircle, Clock, BarChart3, Shield, Activity,
  FileText, Download, Calendar, Filter, FileSpreadsheet, Droplets, TrendingUp,
  Globe, Sprout, CloudSun, Users, CheckSquare
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";

type ActiveTab = "reports" | "send" | "history" | "farmers";

export default function SmsAlertsPage() {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("reports");

  // Colors & Config
  const statusColors: Record<string, string> = {
    queued: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    retrying: "bg-yellow-100 text-yellow-700",
  };

  const priorityColors: Record<string, string> = {
    Normal: "bg-blue-100 text-blue-700",
    High: "bg-yellow-100 text-yellow-700",
    Critical: "bg-red-100 text-red-700",
  };

  // Form state
  const [sendPhone, setSendPhone] = useState("+919876543210");
  const [sendMessage, setSendMessage] = useState("");
  const [sendPriority, setSendPriority] = useState<"Normal" | "High" | "Critical">("Normal");
  const [sendGateway, setSendGateway] = useState<string>("twilio");
  const [sendCrop, setSendCrop] = useState<string>("Rice");
  const [sendRegion, setSendRegion] = useState<string>("Punjab");
  const [sendSeason, setSendSeason] = useState<string>("Kharif");
  const [useBroadcast, setUseBroadcast] = useState(false);
  const [messageMode, setMessageMode] = useState<"rich" | "compact">("compact");

  // Comprehensive AI Insight states
  const [richMessage, setRichMessage] = useState("");
  const [compactSms, setCompactSms] = useState("");

  // Auto-detection state for module-based alerts
  const [activeModule, setActiveModule] = useState<string>("Disease Risk");

  // Farmer Reg State
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("+91");
  const [regRegion, setRegRegion] = useState("Odisha");
  const [regCrop, setRegCrop] = useState("Rice");
  const [regConsent, setRegConsent] = useState(false);
  const [farmersList, setFarmersList] = useState<any[]>([]);
  const [regStatus, setRegStatus] = useState<{success: boolean, message: string} | null>(null);

  // Results & Loading
  const [sendResult, setSendResult] = useState<{ success: boolean; logEntry: SmsLogEntry; validationErrors?: string[] } | null>(null);
  const [historyResult, setHistoryResult] = useState<SmsHistoryResult | null>(null);
  const [retryResult, setRetryResult] = useState<{ retried: number; succeeded: number; stillFailed: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Report state
  const [reportType, setReportType] = useState("disease");
  const [reportRange, setReportRange] = useState("last30");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // ─── Generate Module-Based SMS (Auto) ───
  async function handleGenerateModuleAlert(moduleName?: string) {
    const targetModule = moduleName || activeModule;
    setGenerating(true);
    try {
      const res = await fetch("/api/sms-alerts/generate-module", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({
          activeModule: targetModule,
          cropType: sendCrop,
          region: sendRegion,
          season: sendSeason,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setSendMessage(data.message);
      }
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }

  // ─── Generate Comprehensive AI Alert ───
  async function handleGenerateComprehensiveAlert() {
    setGenerating(true);
    try {
      const res = await fetch("/api/sms-alerts/generate-comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({
          cropType: sendCrop,
          region: sendRegion,
          season: sendSeason,
        }),
      });
      const data = await res.json();
      if (data.rich && data.compact) {
        setRichMessage(data.rich);
        setCompactSms(data.compact);
        // Automatically sync compact to message field if in compact mode
        if (messageMode === "compact") {
          setSendMessage(data.compact);
        } else {
          setSendMessage(data.rich);
        }
      }
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }

  // ─── Generate PDF Report (Simulation) ───
  async function handleDownload(id: string) {
    setDownloading(id);
    await new Promise((r) => setTimeout(r, 2000));
    setDownloading(null);
    alert(`Downloading ${id}.pdf...`);
  }

  // ─── Send Single SMS ───
  async function handleSend() {
    setLoading(true);
    try {
      const res = await fetch("/api/sms-alerts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": language },
        body: JSON.stringify({
          phone: useBroadcast ? "BROADCAST" : sendPhone, 
          message: sendMessage, 
          priority: sendPriority,
          gateway: sendGateway,
          triggerEvent: useBroadcast ? "Database Broadcast" : "Manual",
          useBroadcast,
          cropType: sendCrop,
          region: sendRegion,
          season: sendSeason,
        }),
      });
      setSendResult(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // ─── Fetch History ───
  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch("/api/sms-alerts/history", {
        headers: { "x-language": language },
      });
      setHistoryResult(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // ─── Retry Failed ───
  async function handleRetry() {
    setLoading(true);
    try {
      const res = await fetch("/api/sms-alerts/retry", {
        method: "POST",
        headers: { "x-language": language },
      });
      setRetryResult(await res.json());
      fetchHistory();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // ─── Farmers Logic ───
  async function fetchFarmers() {
    setLoading(true);
    try {
      const res = await fetch("/api/farmers");
      const data = await res.json();
      setFarmersList(data.farmers || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleRegisterFarmer() {
    setLoading(true);
    setRegStatus(null);
    try {
      const res = await fetch("/api/farmers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, phone: regPhone, region: regRegion, crop: regCrop, consent: regConsent })
      });
      const data = await res.json();
      if (res.ok) {
        setRegStatus({ success: true, message: "Farmer successfully registered!" });
        setRegName(""); setRegPhone("+91"); setRegConsent(false);
        fetchFarmers();
      } else {
        setRegStatus({ success: false, message: data.error || "Registration failed." });
      }
    } catch(err) {
      setRegStatus({ success: false, message: "Network error occurred." });
    } finally { setLoading(false); }
  }

  async function handleUnsubscribeFarmer(phone: string) {
    if(!confirm("Are you sure you want to revoke consent for this farmer?")) return;
    setLoading(true);
    try {
      await fetch("/api/farmers/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      fetchFarmers();
    } catch(err) {}
    finally { setLoading(false); }
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; defaultAction?: () => void }[] = [
    { id: "reports", label: t("reports.tabReports"), icon: <FileText className="h-4 w-4" /> },
    { id: "send", label: t("sms.tabManual"), icon: <Send className="h-4 w-4" /> },
    { id: "farmers", label: "Farmers", icon: <Users className="h-4 w-4" />, defaultAction: fetchFarmers },
    { id: "history", label: t("sms.tabHistory"), icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8 p-4 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-[#3d1f0a] dark:text-[#f0fdf4] tracking-tight mb-2">
          {t("reports.title")}
        </h1>
        <p className="text-lg text-[#6b4423]/60 dark:text-[#86efac]/60 max-w-2xl">
          {t("reports.subtitle")}
        </p>
      </div>

      {/* Premium Tabs */}
      <div className="relative flex justify-center md:justify-start mb-12">
        <div className="flex p-1.5 gap-1.5 bg-[#e8dcc8]/40 dark:bg-[#052e16]/40 backdrop-blur-md rounded-2xl border border-[#16a34a]/10 dark:border-[#16a34a]/20 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.defaultAction) tab.defaultAction();
              }}
              className={`relative flex items-center gap-3 px-8 py-3.5 text-sm font-black rounded-xl transition-all duration-500 overflow-hidden ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#16a34a] text-[#16a34a] dark:text-white shadow-[0_10px_20px_rgba(22,163,74,0.2)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] scale-[1.03] z-10"
                  : "text-[#6b4423] dark:text-[#f0fdf4]/70 hover:bg-white/40 dark:hover:bg-white/5"
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              )}
              <span className={`transition-transform duration-300 ${activeTab === tab.id ? "scale-110" : "scale-100"}`}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB: Reports ─── */}
      {activeTab === "reports" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Standard Reports List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-[#3d1f0a] dark:text-[#f0fdf4] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#16a34a]" />
                {t("reports.availableReports")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "disease_march", type: "disease", date: "March 2024", icon: AlertTriangle, color: "text-red-500" },
                  { id: "market_weekly", type: "market", date: "Week 12, 2024", icon: BarChart3, color: "text-blue-500" },
                  { id: "water_audit", type: "irrigation", date: "Kharif Season", icon: Droplets, color: "text-cyan-500" },
                  { id: "yield_forecast", type: "market", date: "Q1 Projections", icon: TrendingUp, color: "text-emerald-500" }
                ].map((report) => (
                  <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                    <CardContent className="p-0">
                      <div className="p-5 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-[#16a34a]/10 dark:bg-[#16a34a]/20 ${report.color}`}>
                            <report.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-[#3d1f0a] dark:text-[#f0fdf4]">{t(`reports.type.${report.type}`)}</p>
                            <p className="text-xs text-[#6b4423]/60 dark:text-[#86efac]/60">{report.date}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleDownload(report.id)}
                          disabled={!!downloading}
                          size="icon"
                          className="rounded-full bg-[#16a34a] hover:bg-[#15803d]"
                        >
                          {downloading === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="h-1 bg-[#16a34a]/5 group-hover:bg-[#16a34a]/20 transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Report Generator */}
            <Card className="h-fit sticky top-6 border-[#16a34a]/20 bg-[#16a34a]/5 dark:bg-[#16a34a]/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-md font-black dark:text-[#f0fdf4] flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#16a34a]" />
                  {t("reports.customReport")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60">{t("reports.selectType")}</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="bg-white/80 dark:bg-black/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disease">{t("reports.type.disease")}</SelectItem>
                      <SelectItem value="market">{t("reports.type.market")}</SelectItem>
                      <SelectItem value="irrigation">{t("reports.type.irrigation")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60">{t("reports.selectRange")}</label>
                  <Select value={reportRange} onValueChange={setReportRange}>
                    <SelectTrigger className="bg-white/80 dark:bg-black/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7">{t("reports.last7Days")}</SelectItem>
                      <SelectItem value="last30">{t("reports.last30Days")}</SelectItem>
                      <SelectItem value="season">{t("reports.fullSeason")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => handleDownload("custom_report")} 
                  disabled={!!downloading} 
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-6 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-[#16a34a]/20"
                >
                  {downloading === "custom_report" ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("reports.downloading")}</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />{t("reports.generateBtn")}</>
                  )}
                </Button>
                <div className="pt-2">
                    <p className="text-[10px] text-center text-[#6b4423]/40 dark:text-[#86efac]/40 leading-relaxed italic">
                        * Reports are generated using real-time field data and AI analytics.
                    </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB: Manual SMS ─── */}
      {activeTab === "send" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-[#16a34a]/10">
            <CardHeader className="pb-3 border-b border-[#16a34a]/5 mb-4">
              <CardTitle className="text-md font-bold flex items-center gap-2 dark:text-[#f0fdf4]">
                <Send className="h-4 w-4 text-[#16a34a]" />
                {t("sms.sendManual")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 opacity-50">
                  <label className="text-xs font-bold text-[#6b4423]/60 dark:text-[#86efac]/60 uppercase">{t("sms.phoneCountry")}</label>
                  <Input value={useBroadcast ? "BROADCAST TO DB" : sendPhone} onChange={(e) => setSendPhone(e.target.value)} disabled={useBroadcast} placeholder="+919876543210" className="rounded-xl border-[#16a34a]/20 font-mono" />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setUseBroadcast(!useBroadcast)}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${useBroadcast ? "bg-[#16a34a] border-[#16a34a]" : "border-[#16a34a]/40"}`}>
                      {useBroadcast && <CheckSquare className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-[#3d1f0a] dark:text-[#f0fdf4]">Broadcast to Match (Crop+Region)</span>
                  </div>
                </div>
                <div className="space-y-1.5 hidden">
                  <label className="text-xs font-bold text-[#6b4423]/60 dark:text-[#86efac]/60 uppercase">{t("sms.priority")}</label>
                  <Select value={sendPriority} onValueChange={(v) => setSendPriority(v as "Normal" | "High" | "Critical")}>
                    <SelectTrigger className="rounded-xl border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* New Context Selectors */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6b4423]/60 dark:text-[#86efac]/60 uppercase flex items-center gap-1">
                    <Sprout className="h-3 w-3" /> Crop Context
                  </label>
                  <Select value={sendCrop} onValueChange={setSendCrop}>
                    <SelectTrigger className="rounded-xl border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CROP_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6b4423]/60 dark:text-[#86efac]/60 uppercase flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Region
                  </label>
                  <Select value={sendRegion} onValueChange={setSendRegion}>
                    <SelectTrigger className="rounded-xl border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REGION_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6b4423]/60 dark:text-[#86efac]/60 uppercase flex items-center gap-1">
                    <CloudSun className="h-3 w-3" /> Season
                  </label>
                  <Select value={sendSeason} onValueChange={setSendSeason}>
                    <SelectTrigger className="rounded-xl border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEASON_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ─── Module-Aware AI Message Generator (Auto) ─── */}
              <div className="p-4 rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60 tracking-wider flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-[#16a34a]" /> AI Generator (Module Context)
                  </p>
                  <Badge variant="outline" className="text-[9px] border-[#16a34a]/20 text-[#16a34a] bg-white">Auto-Detection ON</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6b4423]/50">Currently Active Feature</label>
                    <Select value={activeModule} onValueChange={(v) => {
                      setActiveModule(v);
                      handleGenerateModuleAlert(v);
                    }}>
                      <SelectTrigger className="h-10 rounded-xl border-[#16a34a]/20 bg-white dark:bg-black/20">
                        <SelectValue placeholder="Select Module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disease Detection">🌿 Disease Detection</SelectItem>
                        <SelectItem value="Disease Risk">🌦️ Disease Risk</SelectItem>
                        <SelectItem value="Pest Outbreak">🐛 Pest Outbreak</SelectItem>
                        <SelectItem value="Profit Prediction">💰 Profit Prediction</SelectItem>
                        <SelectItem value="Sell / Store">📈 Sell / Store</SelectItem>
                        <SelectItem value="Crop Advisory">⚠️ Crop Advisory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleGenerateModuleAlert()}
                    disabled={generating}
                    className="h-10 rounded-xl border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a]/10 font-bold text-xs"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Auto-Refetch Data
                  </Button>
                </div>
                <p className="text-[9px] text-[#6b4423]/40 italic">System is pulling the latest AI predictions for the selected module above.</p>
              </div>

              {/* ─── Comprehensive Multi-Insight AI Alert (New) ─── */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="h-3 w-3" /> Comprehensive AI Insight
                    </p>
                    <p className="text-[9px] text-blue-500/80">Aggregates Risk, Pest, Market & Profit data</p>
                  </div>
                  <Button 
                    onClick={handleGenerateComprehensiveAlert} 
                    disabled={generating}
                    size="sm"
                    className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-sm"
                  >
                    {generating ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Zap className="h-3 w-3 mr-1.5 fill-current" />}
                    Sync All Data
                  </Button>
                </div>
                
                {(richMessage || compactSms) && (
                  <div className="flex bg-white dark:bg-black/20 p-1 rounded-xl border border-blue-100/50">
                    <button 
                      onClick={() => { setMessageMode("compact"); setSendMessage(compactSms); }}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${messageMode === "compact" ? "bg-blue-600 text-white shadow-sm" : "text-blue-600/60 hover:bg-blue-50"}`}
                    >
                      SMS Compact
                    </button>
                    <button 
                      onClick={() => { setMessageMode("rich"); setSendMessage(richMessage); }}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${messageMode === "rich" ? "bg-blue-600 text-white shadow-sm" : "text-blue-600/60 hover:bg-blue-50"}`}
                    >
                      Rich Format
                    </button>
                  </div>
                )}
                <p className="text-[8px] text-blue-400 italic">Generate a multi-point alert covering all farming aspects for the current crop/region.</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-[#6b4423]/60 dark:text-[#86efac]/60 uppercase">{t("sms.message")}</label>
                  </div>
                  <span className={`text-[10px] font-bold ${sendMessage.length > 160 ? "text-red-500" : "text-[#16a34a]"}`}>
                    {sendMessage.length}/160 {t("common.chars")}
                  </span>
                </div>
                <textarea
                  className="w-full min-h-[120px] rounded-2xl border border-[#16a34a]/20 bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 transition-all font-mono"
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  maxLength={160}
                />
              </div>
              <Button onClick={handleSend} disabled={loading || !sendMessage.trim()} className="h-14 px-8 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl font-bold shadow-lg shadow-[#16a34a]/20">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("sms.btnSending")}</> : <><Send className="h-4 w-4 mr-2" />{t("sms.btnSend")}</>}
              </Button>
            </CardContent>
          </Card>

          {sendResult && (
            <Card className="border-[#16a34a]/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 dark:text-[#f0fdf4]">
                  {sendResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  Delivery Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sendResult.validationErrors && sendResult.validationErrors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">{t("sms.valError")}</p>
                    <ul className="list-disc list-inside text-[11px] text-red-600 dark:text-red-500 space-y-0.5">
                      {sendResult.validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                <AlertLogCard entry={sendResult.logEntry} statusColors={statusColors} priorityColors={priorityColors} t={t} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: Farmers ─── */}
      {activeTab === "farmers" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Registration Form */}
            <Card className="h-fit sticky top-6 border-[#16a34a]/20 shadow-md">
              <CardHeader className="bg-[#16a34a]/5 pb-4 border-b border-[#16a34a]/10">
                <CardTitle className="text-md font-black dark:text-[#f0fdf4] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#16a34a]" />
                  Register Farmer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {regStatus && (
                  <div className={`p-3 rounded-xl border text-sm font-bold ${regStatus.success ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {regStatus.message}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60 tracking-wider">Full Name</label>
                  <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="E.g., Ramesh Kumar" className="rounded-xl border-[#16a34a]/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60 tracking-wider">Phone Number</label>
                  <Input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+919876543210" className="rounded-xl border-[#16a34a]/20" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60 tracking-wider">Primary Crop</label>
                    <Select value={regCrop} onValueChange={setRegCrop}>
                      <SelectTrigger className="rounded-xl border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                      <SelectContent>{CROP_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[#6b4423]/60 dark:text-[#86efac]/60 tracking-wider">Region</label>
                    <Select value={regRegion} onValueChange={setRegRegion}>
                      <SelectTrigger className="rounded-xl border-[#16a34a]/20"><SelectValue /></SelectTrigger>
                      <SelectContent>{REGION_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <label 
                    className="flex items-start gap-3 p-3 border border-[#16a34a]/30 rounded-xl bg-white dark:bg-black/20 cursor-pointer hover:bg-[#16a34a]/5 transition-colors"
                    onClick={() => setRegConsent(!regConsent)}
                  >
                     <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${regConsent ? "bg-[#16a34a] border-[#16a34a]" : "border-[#16a34a]/40"}`}>
                        {regConsent && <CheckSquare className="h-4 w-4 text-white" />}
                     </div>
                     <span className="text-xs font-bold text-[#3d1f0a] dark:text-[#f0fdf4] leading-tight">
                        I agree to receive targeted SMS alerts regarding weather risks and AI crop insights.
                     </span>
                  </label>
                </div>

                <Button 
                  onClick={handleRegisterFarmer} 
                  disabled={loading || !regName || !regPhone} 
                  className="w-full mt-2 bg-[#16a34a] hover:bg-[#15803d] text-white py-6 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-[#16a34a]/20"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Farmer Directory */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-[#3d1f0a] dark:text-[#f0fdf4] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#16a34a]" />
                    Verified Roster Directory
                  </h3>
                  <Button onClick={fetchFarmers} variant="outline" size="sm" className="h-8 border-[#16a34a]/20 text-[#16a34a] rounded-lg hover:bg-[#16a34a]/10">
                     <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
               </div>
               
               {farmersList.length === 0 ? (
                  <div className="text-center py-20 bg-[#16a34a]/5 rounded-3xl border border-dashed border-[#16a34a]/20">
                    <Users className="h-12 w-12 mx-auto mb-4 text-[#16a34a]/40" />
                    <p className="text-[#6b4423]/60 dark:text-[#86efac]/60 font-bold">No farmers registered yet.</p>
                  </div>
               ) : (
                  <div className="grid gap-3">
                     {farmersList.map(farmer => (
                        <div key={farmer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-[#0d1f10]/40 border border-[#16a34a]/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-4">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <h4 className="font-black text-[#3d1f0a] dark:text-[#f0fdf4] text-lg">{farmer.name}</h4>
                                 {farmer.verified && <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />}
                              </div>
                              <p className="text-sm font-mono text-[#6b4423]/80 dark:text-[#86efac]/80">{farmer.phone}</p>
                              <div className="flex items-center gap-2 mt-2">
                                 <Badge className="px-2 py-0 text-[10px] bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20">{farmer.crop}</Badge>
                                 <Badge className="px-2 py-0 text-[10px] bg-[#f59e0b]/10 text-[#d97706] border-[#f59e0b]/20">{farmer.region}</Badge>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              {farmer.consent ? (
                                 <Button onClick={() => handleUnsubscribeFarmer(farmer.phone)} variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg">
                                    Revoke Consent
                                 </Button>
                              ) : (
                                 <Badge className="bg-red-50 text-red-700 border-red-200 px-3 py-1.5 flex items-center gap-1.5">
                                    <XCircle className="h-3 w-3" /> Opted Out
                                 </Badge>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB: History ─── */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap gap-3">
            <Button onClick={fetchHistory} disabled={loading} className="bg-[#3d1f0a] dark:bg-[#16a34a] hover:opacity-90 text-white rounded-xl font-bold h-12 px-6">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />...</> : <><Clock className="h-4 w-4 mr-2" />{t("sms.btnLoadHistory")}</>}
            </Button>
            <Button onClick={handleRetry} disabled={loading} variant="outline" className="border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold h-12 px-6">
              <RefreshCw className="h-4 w-4 mr-2" />{t("sms.btnRetry")}
            </Button>
          </div>

          {historyResult ? (
            <div className="space-y-6">
              {historyResult.logs.length === 0 ? (
                <div className="text-center py-20 bg-[#16a34a]/5 rounded-3xl border border-dashed border-[#16a34a]/20">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[#16a34a]/40" />
                  <p className="text-[#6b4423]/60 dark:text-[#86efac]/60 font-bold">{t("sms.noHistory")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyResult.logs.map((entry) => (
                    <AlertLogCard key={entry.id} entry={entry} statusColors={statusColors} priorityColors={priorityColors} t={t} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-[#16a34a]/10 bg-transparent">
                <CardContent className="h-40 flex items-center justify-center text-[#6b4423]/40 dark:text-[#86efac]/40 font-medium">
                    Click "Load History" to see recent activity
                </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Reusable Alert Log Card ───

function AlertLogCard({
  entry,
  statusColors,
  priorityColors,
  t,
}: {
  entry: SmsLogEntry;
  statusColors: Record<string, string>;
  priorityColors: Record<string, string>;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-white dark:bg-[#0d1f10]/40 border border-[#16a34a]/10 dark:border-[#16a34a]/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-3">
          <Badge className={`px-2 py-0.5 text-[10px] font-black rounded-lg ${priorityColors[entry.priority] || ""}`}>{entry.priority}</Badge>
          <span className="text-xs font-black text-[#16a34a] uppercase tracking-wider">{entry.triggerEvent}</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${statusColors[entry.status] || ""}`}>
            {entry.status === "delivered" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {entry.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
            {entry.status === "retrying" && <RefreshCw className="h-3 w-3 mr-1" />}
            {entry.status.toUpperCase()}
          </Badge>
          <span className="text-[10px] text-[#6b4423]/40 dark:text-[#86efac]/40 font-bold">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="bg-[#16a34a]/5 dark:bg-[#16a34a]/10 rounded-xl p-4 mb-4 border-l-4 border-[#16a34a]">
        <p className="text-sm font-bold text-[#3d1f0a] dark:text-[#f0fdf4] leading-relaxed">{entry.message}</p>
      </div>

      {entry.errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 rounded-xl p-3 mb-4">
          <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase mb-1">Error Reason</p>
          <p className="text-xs font-bold text-red-700 dark:text-red-300">{entry.errorMessage}</p>
          {entry.gatewayResponse && (
            <p className="text-[9px] font-mono text-red-500/70 dark:text-red-400/70 mt-1">{entry.gatewayResponse}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
         <div className="flex items-center gap-6">
            <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase text-[#6b4423]/40 dark:text-[#86efac]/40 tracking-widest">{t("sms.phoneLabel")}</p>
                <p className="text-xs font-bold dark:text-[#f0fdf4]">{entry.phone}</p>
            </div>
            <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase text-[#6b4423]/40 dark:text-[#86efac]/40 tracking-widest">Gateway</p>
                <p className="text-xs font-bold dark:text-[#f0fdf4]">{entry.gatewayProvider}</p>
            </div>
         </div>
         <span className="text-[9px] font-mono text-[#6b4423]/20 dark:text-[#86efac]/20">#{entry.id.slice(0,8)}</span>
      </div>
    </div>
  );
}

