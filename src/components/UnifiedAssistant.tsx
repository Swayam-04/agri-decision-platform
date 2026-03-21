"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { useVoiceAssistant } from "@/voice-assistant/useVoiceAssistant";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { id: "hi", label: "हिन्दी (Hindi)" },
  { id: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { id: "bn", label: "বাংলা (Bengali)" },
  { id: "en", label: "English" },
];

export function UnifiedAssistant() {
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();
  
  // Local state for language overriding the global if needed, but we can default to global
  const [lang, setLang] = useState<string>(language || "hi");

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: t("chat.greeting") || "Hello! I am CropIntel AI. Ask me any farming-related questions via text or voice.",
      sources: [],
      at: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const languageLabel = useMemo(
    () => LANGUAGES.find((l) => l.id === lang)?.label ?? "English",
    [lang]
  );

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async (textToSubmit: string) => {
    const cleaned = (textToSubmit || "").trim();
    if (!cleaned) return;

    setMessages((prev) => [...prev, { role: "user", text: cleaned, at: Date.now() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleaned, lang, languageLabel }),
      });

      if (!res.ok) throw new Error("API Request Failed");

      const data = await res.json();
      
      const newMsg = {
        role: "assistant",
        text: data.reply || "Sorry, I couldn't process that.",
        voice_text: data.voice_reply || data.reply,
        sources: data.sources || [],
        at: Date.now()
      };

      setMessages((prev) => [...prev, newMsg]);

    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: t("chat.error") || "An error occurred. Please try again.",
          at: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [lang, languageLabel, t]);

  const onFinalTranscript = useCallback((text: string) => {
    const cleaned = (text || "").trim();
    if (!cleaned) return;
    setInput(cleaned); // Show what was heard in input box
    handleSend(cleaned); // Send automatically after speaking
  }, [handleSend]);

  const va = useVoiceAssistant({
    lang: lang,
    onFinalTranscript,
    autoSpeak,
  });

  // Auto-speak latest assistant message
  const lastAssistantMsg = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant" && messages[i].voice_text) return messages[i].voice_text;
    }
    return "";
  }, [messages]);

  const lastSpokenRef = useRef("");
  useEffect(() => {
    if (!autoSpeak) return;
    if (!lastAssistantMsg) return;
    if (lastSpokenRef.current === lastAssistantMsg) return;
    lastSpokenRef.current = lastAssistantMsg;
    va.speak(lastAssistantMsg);
  }, [autoSpeak, lastAssistantMsg, va]);

  const toggleListening = useCallback(() => {
    if (!va.supported) return;
    if (va.listening) va.stop();
    else va.start();
  }, [va]);

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto space-y-4">
      {/* Header controls outside card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">AI Farm Assistant 🤖</h1>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">One interface, two input modes — text and voice.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "rounded-full transition-colors",
              autoSpeak ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" : "text-muted-foreground"
            )}
            title={autoSpeak ? "Auto-speak ON" : "Auto-speak OFF"}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            {autoSpeak ? "Voice ON" : "Voice OFF"}
          </Button>

          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              if (setLanguage) setLanguage(e.target.value as any);
            }}
            className="rounded-full border border-border bg-background text-foreground px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Area */}
      <Card className="flex flex-col h-[600px] shadow-sm bg-[#fdfaf6] border-emerald-100 dark:bg-slate-950 dark:border-slate-800">
        <CardContent 
          className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" 
          ref={scrollRef}
        >
          {messages.map((m, idx) => (
            <div key={`${m.at}-${idx}`} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-emerald-200 dark:border-emerald-800">
                  <Bot className="h-5 w-5 text-emerald-600" />
                </div>
              )}
              
              <div className={cn(
                "rounded-2xl px-5 py-3.5 max-w-[85%] shadow-sm",
                m.role === "user" 
                  ? "bg-emerald-600 text-white rounded-tr-sm" 
                  : "bg-white text-emerald-950 border border-emerald-100 rounded-tl-sm dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                
                {/* Sources Display */}
                {m.role === "assistant" && m.sources?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-50 dark:border-slate-800">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Sources:</p>
                    <ul className="flex flex-wrap gap-2">
                      {m.sources.map((src: any, i: number) => {
                        const isString = typeof src === "string";
                        const name = isString ? src : src.name;
                        const url = isString 
                          ? `https://www.google.com/search?q=${encodeURIComponent(name + " agriculture guidelines")}`
                          : src.url;
                        
                        return (
                          <li key={i} className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors break-all max-w-[200px] truncate" title={url}>
                            <a 
                              href={url}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <span className="truncate">{name}</span> ↗
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                
                <span className={cn(
                  "text-[10px] block mt-2",
                  m.role === "user" ? "text-emerald-100/80 text-right" : "text-emerald-900/40 dark:text-slate-400/60 text-left"
                )}>
                  {mounted && m.at ? new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "\u00A0"}
                </span>
              </div>

              {m.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2 dark:bg-slate-900 dark:border-slate-800">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="p-4 border-t bg-white m-2 mt-0 rounded-2xl shadow-sm border-emerald-50 dark:bg-slate-900 dark:border-slate-800">
          
          {/* Status Indicator for Voice */}
          {va.listening && (
             <div className="mb-3 flex items-center justify-center gap-2 text-sm text-red-500 animate-pulse font-medium">
               <Mic className="h-4 w-4" /> Listening...
             </div>
          )}
          {va.transcript && !loading && va.listening && (
            <div className="mb-3 text-sm text-emerald-700 dark:text-emerald-400 italic text-center animate-in fade-in slide-in-from-bottom-1">
              "{va.transcript}"
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 relative"
          >
            <Button
              type="button"
              onClick={toggleListening}
              disabled={loading || !va.supported}
              className={cn(
                "h-12 w-12 rounded-full shrink-0 transition-all",
                va.listening 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse text-white shadow-md shadow-red-200 dark:shadow-red-900/20" 
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              )}
              title={va.supported ? "Tap to speak" : "Voice not supported"}
            >
              {va.listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={va.listening ? "Speak now..." : "Type your farming question..."}
              className="flex-1 h-12 rounded-full px-5 border-emerald-200 focus-visible:ring-emerald-500 bg-emerald-50/30 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white"
              disabled={loading || va.listening}
            />

            <Button 
              type="submit" 
              disabled={loading || !input.trim() || va.listening} 
              className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
