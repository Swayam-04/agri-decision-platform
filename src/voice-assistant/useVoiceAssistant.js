import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useVoiceAssistant({ lang, onFinalTranscript, autoSpeak }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const supported = useMemo(() => {
    const SR = getSpeechRecognitionCtor();
    return Boolean(SR) && typeof window !== "undefined" && "speechSynthesis" in window;
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    } finally {
      setListening(false);
    }
  }, []);

  const speak = useCallback(
    (text) => {
      if (typeof window === "undefined") return;
      if (!("speechSynthesis" in window)) return;
      const cleaned = (text || "").trim();
      if (!cleaned) return;

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleaned);
      try {
        const voices = window.speechSynthesis.getVoices?.() || [];
        // Map common codes to full BCP-47
        const langMap = {
          en: "en-IN",
          hi: "hi-IN",
          bn: "bn-IN",
          te: "te-IN",
          ta: "ta-IN",
          mr: "mr-IN",
          pa: "pa-IN",
          or: "or-IN",
          kn: "kn-IN",
        };
        const langCode = langMap[lang] || lang || "en-IN";
        const langPrefix = langCode.split("-")[0]?.toLowerCase?.() || "";
        
        // Find best matching voice
        let voice = voices.find(v => v.lang === langCode);
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith(langPrefix));
        }
        
        if (voice) {
          utter.voice = voice;
          utter.lang = voice.lang;
        } else {
          utter.lang = langCode;
        }
      } catch {
        // ignore voice lookup errors
      }
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    },
    [lang],
  );

  const cancelSpeak = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel?.();
  }, []);

  const start = useCallback(() => {
    setError("");
    setTranscript("");

    const SR = getSpeechRecognitionCtor();
    if (!SR) {
      setError("Speech recognition is not available in this browser.");
      return;
    }

    cancelSpeak();

    const langMap = {
      en: "en-IN",
      hi: "hi-IN",
      bn: "bn-IN",
      te: "te-IN",
      ta: "ta-IN",
      mr: "mr-IN",
      pa: "pa-IN",
      or: "or-IN",
      kn: "kn-IN",
    };

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = langMap[lang] || lang || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setError(e?.error ? `Mic error: ${e.error}` : "Mic error. Please try again.");
      setListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        const text = res?.[0]?.transcript ?? "";
        if (res.isFinal) finalText += text;
        else interimText += text;
      }

      const combined = (finalText || interimText || "").trim();
      setTranscript(combined);

      if (finalText && onFinalTranscript) {
        onFinalTranscript(finalText.trim());
      }
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start the mic. Check permissions and try again.");
      setListening(false);
    }
  }, [cancelSpeak, lang, onFinalTranscript]);

  useEffect(() => {
    if (!autoSpeak) return;
    // speaking is driven by the caller when they append assistant messages
  }, [autoSpeak]);

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    speak,
    cancelSpeak,
  };
}

