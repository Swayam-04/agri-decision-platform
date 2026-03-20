"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Bot, X } from "lucide-react";
import { useVoiceAssistant } from "@/voice-assistant/useVoiceAssistant";
import { getCropAdvice } from "@/voice-assistant/claudeService";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { id: "hi", label: "हिन्दी (Hindi)" },
  { id: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { id: "bn", label: "বাংলা (Bengali)" },
  { id: "te", label: "తెలుగు (Telugu)" },
  { id: "ta", label: "தமிழ் (Tamil)" },
  { id: "mr", label: "मराठी (Marathi)" },
  { id: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { id: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { id: "en", label: "English" },
];

export function VoiceAssistantWidget({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: t("voice.greeting"),
      at: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const languageLabel = useMemo(
    () => LANGUAGES.find((l) => l.id === language)?.label ?? "English",
    [language]
  );

  const onFinalTranscript = useCallback(
    async (text: string) => {
      const cleaned = (text || "").trim();
      if (!cleaned) return;

      setMessages((prev) => [...prev, { role: "user", text: cleaned, at: Date.now() }]);
      setLoading(true);

      try {
        const { reply } = await getCropAdvice({ text: cleaned, lang: language, languageLabel });
        setMessages((prev) => [...prev, { role: "assistant", text: reply, at: Date.now() }]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: t("voice.error") + "\n\n" + t("voice.tip"),
            at: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [language, languageLabel, t]
  );

  const va = useVoiceAssistant({
    lang: language,
    onFinalTranscript,
    autoSpeak,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-speak latest assistant message
  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant") return messages[i].text;
    }
    return "";
  }, [messages]);

  const lastSpokenRef = useRef("");
  useEffect(() => {
    if (!autoSpeak) return;
    if (!lastAssistantText) return;
    if (lastSpokenRef.current === lastAssistantText) return;
    lastSpokenRef.current = lastAssistantText;
    va.speak(lastAssistantText);
  }, [autoSpeak, lastAssistantText, va]);

  const toggleListening = useCallback(() => {
    if (!va.supported) return;
    if (va.listening) va.stop();
    else va.start();
  }, [va]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l-0 bg-[#fdf6e3]">
        <SheetHeader className="p-4 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#16a34a]/10 p-2 rounded-xl">
                <Bot className="h-5 w-5 text-[#16a34a]" />
              </div>
              <div>
                <SheetTitle className="text-[#3d1f0a]">{t("voice.title")}</SheetTitle>
                <p className="text-[11px] text-[#6b4423]/70">{t("voice.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={cn(
                  "h-8 w-8 rounded-full",
                  autoSpeak ? "text-[#16a34a]" : "text-[#6b4423]/40"
                )}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={`${m.at}-${idx}`}
                  className={cn(
                    "max-w-[85%] rounded-[20px] px-4 py-3 text-[14px] leading-relaxed",
                    m.role === "user"
                      ? "bg-[#16a34a] text-white ml-auto rounded-tr-none shadow-sm"
                      : "bg-white border-2 border-[rgba(61,31,10,0.08)] text-[#3d1f0a] mr-auto rounded-tl-none shadow-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className={cn(
                    "text-[10px] block mt-1",
                    m.role === "user" ? "text-white/70" : "text-[#6b4423]/50"
                  )}>
                    {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="bg-white border-2 border-dashed border-[rgba(61,31,10,0.15)] rounded-[20px] px-4 py-3 mr-auto flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#16a34a] animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-[#16a34a] animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-[#16a34a] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-6 border-t bg-white/50 backdrop-blur-sm space-y-4">
          {!va.supported ? (
            <p className="text-center text-sm text-[#b91c1c]">{t("voice.unsupported")}</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Button
                onClick={toggleListening}
                disabled={loading}
                className={cn(
                  "h-20 w-20 rounded-full shadow-lg transition-all scale-100 active:scale-95",
                  va.listening 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse-slow shadow-red-200" 
                    : "bg-[#16a34a] hover:bg-[#15803d] shadow-emerald-100"
                )}
              >
                {va.listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
              
              <div className="text-center space-y-1">
                <p className="font-bold text-[#3d1f0a] text-sm">
                  {va.listening ? t("voice.listening") : t("voice.tapMic")}
                </p>
                <p className="text-[11px] text-[#6b4423]/60">
                  {t("voice.language")}: <span className="text-[#16a34a] font-medium">{languageLabel}</span>
                </p>
                {va.transcript && (
                  <p className="text-xs text-[#6b4423] italic mt-2 animate-in fade-in slide-in-from-bottom-1">
                    "{va.transcript}"
                  </p>
                )}
                {va.error && (
                  <p className="text-[10px] text-red-500 font-medium">{va.error}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
