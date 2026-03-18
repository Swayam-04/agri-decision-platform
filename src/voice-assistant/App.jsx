/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoiceAssistant } from "./useVoiceAssistant";
import { getCropAdvice } from "./claudeService";
import { useTranslation } from "@/hooks/useTranslation";

const LANGUAGES = [
  { id: "hi-IN", label: "हिन्दी (Hindi)" },
  { id: "or-IN", label: "ଓଡ଼ିଆ (Odia)" },
];

function bubbleClass(role) {
  return role === "user"
    ? "bg-emerald-600 text-white ml-auto"
    : "bg-muted text-foreground mr-auto";
}

export default function App() {
  const { t } = useTranslation();
  const [lang, setLang] = useState("hi-IN");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste! I’m KisanBot. Tap the mic and ask a crop-related question.",
      at: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const languageLabel = useMemo(
    () => LANGUAGES.find((l) => l.id === lang)?.label ?? "English",
    [lang],
  );

  const onFinalTranscript = useCallback(
    async (text) => {
      const cleaned = (text || "").trim();
      if (!cleaned) return;

      setMessages((prev) => [...prev, { role: "user", text: cleaned, at: Date.now() }]);
      setLoading(true);

      try {
        const { reply } = await getCropAdvice({ text: cleaned, lang, languageLabel });
        setMessages((prev) => [...prev, { role: "assistant", text: reply, at: Date.now() }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              "Sorry — I couldn’t get an answer right now." +
              (msg ? `\n\nError: ${msg}` : "") +
              "\n\nTip: Check your GROQ_API_KEY and model settings, then restart the dev server.",
            at: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [lang, languageLabel],
  );

  const va = useVoiceAssistant({
    lang,
    onFinalTranscript,
    autoSpeak,
  });

  // Auto-speak only the latest assistant message (when enabled)
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

  const playLastAnswer = useCallback(() => {
    if (!va.supported) return;
    if (!lastAssistantText) return;
    va.speak(lastAssistantText);
  }, [va, lastAssistantText]);

  const toggleListening = useCallback(() => {
    if (!va.supported) return;
    if (va.listening) va.stop();
    else va.start();
  }, [va]);

  return (
    <div className="min-h-[calc(100vh-2rem)] max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{t("voice.title")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("voice.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSpeak((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background text-foreground px-3 py-2 text-sm hover:bg-muted"
            aria-pressed={autoSpeak}
            title={autoSpeak ? t("voice.autoSpeak") : t("voice.muted")}
          >
            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{autoSpeak ? t("voice.autoSpeak") : t("voice.muted")}</span>
          </button>

          <button
            type="button"
            onClick={playLastAnswer}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-background text-foreground px-3 py-2 text-sm hover:bg-muted"
          >
            <Volume2 className="h-4 w-4" />
            <span>{t("voice.playAnswer")}</span>
          </button>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-full border border-border bg-background text-foreground px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label={t("voice.language")}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-background overflow-hidden flex flex-col">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div key={`${m.at}-${idx}`} className={`max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${bubbleClass(m.role)}`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
              <div className={`mt-1 text-[10px] ${m.role === "user" ? "text-emerald-100" : "text-zinc-500"}`}>
                {new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}

          {loading && (
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted text-foreground mr-auto">
              <div className="text-sm">Thinking…</div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-muted/30 p-4 sm:p-6">
          {!va.supported ? (
            <div className="text-sm text-muted-foreground">
              {t("voice.unsupported")}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={[
                  "h-20 w-20 sm:h-24 sm:w-24 rounded-full grid place-items-center",
                  "shadow-lg transition-transform active:scale-[0.98]",
                  va.listening ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700",
                  loading ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
                aria-label={va.listening ? "Stop recording" : "Start recording"}
              >
                {va.listening ? <MicOff className="h-9 w-9 text-white" /> : <Mic className="h-9 w-9 text-white" />}
              </button>

              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  {va.listening ? t("voice.listening") : t("voice.tapMic")}
                </div>
                <div className="text-muted-foreground">{t("voice.language")}: {languageLabel}</div>
                {va.transcript ? <div className="mt-1 text-muted-foreground">{t("voice.heard")} “{va.transcript}”</div> : null}
                {va.error ? <div className="mt-1 text-destructive">{va.error}</div> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

