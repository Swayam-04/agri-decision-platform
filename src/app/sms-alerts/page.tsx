"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_LIST, REGION_LIST, SEASON_LIST } from "@/lib/types";
import type { SmsLogEntry, SmsTriggerResult, SmsHistoryResult } from "@/lib/types";
import {
  MessageSquare, Loader2, Phone, AlertTriangle, CheckCircle2, Send,
  Zap, RefreshCw, XCircle, Clock, BarChart3, Shield, Activity,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type ActiveTab = "trigger" | "send" | "history" | "monitor";

export default function SmsAlertsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>("trigger");

  // Trigger form state
  const [cropType, setCropType] = useState("Rice");
  const [region, setRegion] = useState("Punjab");
  const [season, setSeason] = useState("Kharif");
  const [phone, setPhone] = useState("+919876543210");
  const [temperature, setTemperature] = useState("34");
  const [humidity, setHumidity] = useState("82");
  const [rainfall, setRainfall] = useState("15");
  const [soilType, setSoilType] = useState("Alluvial");

  // Send form state
  const [sendPhone, setSendPhone] = useState("+919876543210");
  const [sendMessage, setSendMessage] = useState("");
  const [sendPriority, setSendPriority] = useState<"Normal" | "High" | "Critical">("Normal");

  // Results
  const [triggerResult, setTriggerResult] = useState<SmsTriggerResult | null>(null);
  const [sendResult, setSendResult] = useState<{ success: boolean; logEntry: SmsLogEntry; validationErrors?: string[] } | null>(null);
  const [historyResult, setHistoryResult] = useState<SmsHistoryResult | null>(null);
  const [retryResult, setRetryResult] = useState<{ retried: number; succeeded: number; stillFailed: number } | null>(null);

  const [loading, setLoading] = useState(false);

  // ─── Trigger Alerts ───
  async function handleTrigger() {
    setLoading(true);
    try {
      const res = await fetch("/api/sms-alerts/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropType, region, season, farmerPhone: phone,
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          recentRainfall: parseFloat(rainfall),
          soilType,
        }),
      });
      setTriggerResult(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // ─── Send Single SMS ───
  async function handleSend() {
    setLoading(true);
    try {
      const res = await fetch("/api/sms-alerts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: sendPhone, message: sendMessage, priority: sendPriority,
          triggerEvent: "Manual", cropType, region, season,
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
      const res = await fetch("/api/sms-alerts/history");
      setHistoryResult(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // ─── Retry Failed ───
  async function handleRetry() {
    setLoading(true);
    try {
      const res = await fetch("/api/sms-alerts/retry", { method: "POST" });
      setRetryResult(await res.json());
      fetchHistory();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

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

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "trigger", label: t("sms.tabTrigger"), icon: <Zap className="h-4 w-4" /> },
    { id: "send", label: t("sms.tabManual"), icon: <Send className="h-4 w-4" /> },
    { id: "history", label: t("sms.tabHistory"), icon: <Clock className="h-4 w-4" /> },
    { id: "monitor", label: t("sms.tabMonitor"), icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("sms.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("sms.subtitle")}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground border-border -mb-px"
                : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: Event Trigger ─── */}
      {activeTab === "trigger" && (
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Event-Based Alert Engine
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Evaluates AI outputs against thresholds and sends SMS for triggered events. Includes deduplication (30-min window).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("detect.cropType")}</label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CROP_LIST.map((c) => <SelectItem key={c} value={c}>{t(`crops.${c}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("advisory.regionLabel")}</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{REGION_LIST.map((r) => <SelectItem key={r} value={r}>{t(`regions.${r}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("advisory.seasonLabel")}</label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SEASON_LIST.map((s) => <SelectItem key={s} value={s}>{t(`seasons.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("sms.farmerPhone")}</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("risk.tempLabel")} (°C)</label>
                  <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("risk.humidityLabel")} (%)</label>
                  <Input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("risk.rainfallLabel")} (mm)</label>
                  <Input type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("profit.soil")}</label>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Alluvial", "Black", "Red", "Laterite", "Sandy", "Loamy", "Clay"].map((s) => (
                        <SelectItem key={s} value={s}>{t(`soilType.${s}`) || s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleTrigger} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("sms.btnEvaluating")}</> : <><Zap className="h-4 w-4 mr-2" />{t("sms.btnTrigger")}</>}
              </Button>
            </CardContent>
          </Card>

          {triggerResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-5 pb-5 text-center">
                    <BarChart3 className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">{triggerResult.totalEvaluated}</div>
                    <p className="text-xs text-muted-foreground">{t("sms.eventsEval")}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-5 text-center">
                    <Send className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                    <div className="text-2xl font-bold text-emerald-600">{triggerResult.triggeredAlerts.length}</div>
                    <p className="text-xs text-muted-foreground">{t("sms.alertsSent")}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5 pb-5 text-center">
                    <Shield className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <div className="text-2xl font-bold text-gray-500">{triggerResult.skippedDuplicates}</div>
                    <p className="text-xs text-muted-foreground">{t("sms.dupSkipped")}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Threshold Evaluations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{t("sms.threshEval")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {triggerResult.thresholds.map((t, i) => (
                      <div key={i} className={`flex items-center justify-between border rounded-lg p-3 ${t.triggered ? "border-red-200 bg-red-50/50" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                          {t.triggered
                            ? <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            : <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-medium">{t.event}</p>
                            <p className="text-xs text-muted-foreground">Threshold: {t.threshold}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={t.triggered ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                            {t.triggered ? "TRIGGERED" : "OK"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{t.currentValue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Triggered Alert Details */}
              {triggerResult.triggeredAlerts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{t("sms.sentDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {triggerResult.triggeredAlerts.map((alert) => (
                        <AlertLogCard key={alert.id} entry={alert} statusColors={statusColors} priorityColors={priorityColors} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Manual SMS ─── */}
      {activeTab === "send" && (
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-500" />
                {t("sms.sendManual")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Send a single SMS with full validation, delivery tracking, and retry on failure.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("sms.phoneCountry")}</label>
                  <Input value={sendPhone} onChange={(e) => setSendPhone(e.target.value)} placeholder="+919876543210" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("sms.priority")}</label>
                  <Select value={sendPriority} onValueChange={(v) => setSendPriority(v as "Normal" | "High" | "Critical")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">{t("sms.message")}</label>
                  <span className={`text-xs ${sendMessage.length > 160 ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                    {sendMessage.length}/160
                  </span>
                </div>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  maxLength={200}
                />
              </div>
              <Button onClick={handleSend} disabled={loading || !sendMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("sms.btnSending")}</> : <><Send className="h-4 w-4 mr-2" />{t("sms.btnSend")}</>}
              </Button>
            </CardContent>
          </Card>

          {sendResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {sendResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  Delivery Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sendResult.validationErrors && sendResult.validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-red-700 mb-1">{t("sms.valError")}</p>
                    <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                      {sendResult.validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                <AlertLogCard entry={sendResult.logEntry} statusColors={statusColors} priorityColors={priorityColors} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: History ─── */}
      {activeTab === "history" && (
        <div className="space-y-5">
          <div className="flex gap-3">
            <Button onClick={fetchHistory} disabled={loading} className="bg-gray-800 hover:bg-gray-900 text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />...</> : <><Clock className="h-4 w-4 mr-2" />{t("sms.btnLoadHistory")}</>}
            </Button>
            <Button onClick={handleRetry} disabled={loading} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              <RefreshCw className="h-4 w-4 mr-2" />{t("sms.btnRetry")}
            </Button>
          </div>

          {retryResult && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold">{retryResult.retried}</div>
                    <p className="text-xs text-muted-foreground">{t("sms.retried")}</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-emerald-600">{retryResult.succeeded}</div>
                    <p className="text-xs text-muted-foreground">{t("sms.recovered")}</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">{retryResult.stillFailed}</div>
                    <p className="text-xs text-muted-foreground">{t("sms.stillFailed")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {historyResult && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="pt-4 pb-4 text-center">
                  <div className="text-xl font-bold">{historyResult.stats.total}</div>
                  <p className="text-xs text-muted-foreground">{t("sms.totalSent")}</p>
                </CardContent></Card>
                <Card><CardContent className="pt-4 pb-4 text-center">
                  <div className="text-xl font-bold text-emerald-600">{historyResult.stats.deliveryRate}%</div>
                  <p className="text-xs text-muted-foreground">{t("sms.successRate")}</p>
                </CardContent></Card>
                <Card><CardContent className="pt-4 pb-4 text-center">
                  <div className="text-xl font-bold text-red-600">{historyResult.stats.failed}</div>
                  <p className="text-xs text-muted-foreground">{t("sms.failed")}</p>
                </CardContent></Card>
                <Card><CardContent className="pt-4 pb-4 text-center">
                  <div className="text-xl font-bold text-amber-600">{historyResult.stats.avgRetries}</div>
                  <p className="text-xs text-muted-foreground">Avg Retries</p>
                </CardContent></Card>
              </div>

              {historyResult.logs.length === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No alert history yet. Use the Event Trigger or Manual SMS tab to send alerts.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Alert Log ({historyResult.logs.length} entries)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {historyResult.logs.map((entry) => (
                        <AlertLogCard key={entry.id} entry={entry} statusColors={statusColors} priorityColors={priorityColors} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Monitoring ─── */}
      {activeTab === "monitor" && (
        <div className="space-y-5">
          <Button onClick={fetchHistory} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</> : <><Activity className="h-4 w-4 mr-2" />Refresh Dashboard</>}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Gateway Config */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  Gateway Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Provider</span>
                    <Badge className="bg-emerald-100 text-emerald-700">MOCK (Simulated)</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sender ID</span>
                    <span className="font-mono text-xs">CROPAI</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Retries</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retry Delays</span>
                    <span className="text-xs">5s → 15s → 30s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dedup Window</span>
                    <span>30 min</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set <code className="bg-muted px-1 rounded">TWILIO_ACCOUNT_SID</code> / <code className="bg-muted px-1 rounded">TWILIO_AUTH_TOKEN</code> env vars to switch to Twilio live gateway.
                </p>
              </CardContent>
            </Card>

            {/* Event Thresholds */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Active Trigger Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { event: "High Disease Risk", threshold: "Risk > 55%", icon: "🦠" },
                    { event: "Pest Outbreak", threshold: "Probability > 50%", icon: "🐛" },
                    { event: "Low Soil Moisture", threshold: "Heavy irrigation needed", icon: "💧" },
                    { event: "Crop Avoidance", threshold: "Risk score > 60", icon: "⛔" },
                    { event: "Weather Extreme", threshold: "Temp >42°C/<5°C, Rain >50mm", icon: "🌡️" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 border rounded-lg p-3">
                      <span className="text-lg">{t.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{t.event}</p>
                        <p className="text-xs text-muted-foreground">{t.threshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Pipeline Diagram */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">SMS Delivery Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {[
                  { label: "AI Output", sub: "Disease/Pest/Moisture", color: "bg-blue-100 text-blue-700 border-blue-200" },
                  { label: "Threshold Check", sub: "Compare vs limits", color: "bg-amber-100 text-amber-700 border-amber-200" },
                  { label: "Deduplication", sub: "30-min window", color: "bg-purple-100 text-purple-700 border-purple-200" },
                  { label: "Phone Validate", sub: "+CC format check", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
                  { label: "Gateway Send", sub: "Twilio/Govt/Mock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                  { label: "Retry (3x)", sub: "5s→15s→30s delay", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
                  { label: "Log & Monitor", sub: "Full audit trail", color: "bg-gray-100 text-gray-700 border-gray-200" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`border rounded-lg p-2.5 text-center min-w-[100px] ${step.color}`}>
                      <p className="text-xs font-semibold">{step.label}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">{step.sub}</p>
                    </div>
                    {i < 6 && <span className="text-muted-foreground text-lg">→</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Stats */}
          {historyResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Live System Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">{historyResult.stats.total}</div>
                    <p className="text-xs text-muted-foreground">Total Sent</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg border-emerald-200 bg-emerald-50/50">
                    <div className="text-xl font-bold text-emerald-600">{historyResult.stats.delivered}</div>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg border-red-200 bg-red-50/50">
                    <div className="text-xl font-bold text-red-600">{historyResult.stats.failed}</div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg border-yellow-200 bg-yellow-50/50">
                    <div className="text-xl font-bold text-yellow-600">{historyResult.stats.retrying}</div>
                    <p className="text-xs text-muted-foreground">Retrying</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg border-blue-200 bg-blue-50/50">
                    <div className="text-xl font-bold text-blue-600">{historyResult.stats.deliveryRate}%</div>
                    <p className="text-xs text-muted-foreground">{t("sms.successRate")}</p>
                  </div>
                </div>
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
}: {
  entry: SmsLogEntry;
  statusColors: Record<string, string>;
  priorityColors: Record<string, string>;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] ${priorityColors[entry.priority] || ""}`}>{entry.priority}</Badge>
          <span className="text-xs font-medium text-muted-foreground">{entry.triggerEvent}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] ${statusColors[entry.status] || ""}`}>
            {entry.status === "delivered" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {entry.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
            {entry.status === "retrying" && <RefreshCw className="h-3 w-3 mr-1" />}
            {entry.status.toUpperCase()}
          </Badge>
          {entry.retryCount > 0 && (
            <span className="text-[10px] text-muted-foreground">Retries: {entry.retryCount}/{entry.maxRetries}</span>
          )}
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-sm font-mono">{entry.message}</p>
        <p className={`text-[10px] mt-1 ${entry.message.length > 160 ? "text-red-500" : "text-muted-foreground"}`}>
          {entry.message.length}/160 chars
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
        <div><span className="font-medium">Phone:</span> {entry.phone}</div>
        <div><span className="font-medium">Gateway:</span> {entry.gatewayProvider}</div>
        <div><span className="font-medium">Crop:</span> {entry.cropType}</div>
        <div><span className="font-medium">Region:</span> {entry.region}</div>
      </div>

      {entry.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-[10px] text-red-600">{entry.errorMessage}</p>
        </div>
      )}

      {entry.gatewayResponse && entry.status === "delivered" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
          <p className="text-[10px] text-emerald-600">{entry.gatewayResponse}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>ID: {entry.id}</span>
        <span>{new Date(entry.timestamp).toLocaleString()}</span>
      </div>
    </div>
  );
}
