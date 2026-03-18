"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import en from "@/translations/en.json";
import hi from "@/translations/hi.json";
import bn from "@/translations/bn.json";
import te from "@/translations/te.json";
import ta from "@/translations/ta.json";
import mr from "@/translations/mr.json";
import pa from "@/translations/pa.json";
import or from "@/translations/or.json";
import kn from "@/translations/kn.json";

type LangCode = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "pa" | "or" | "kn";

const STORAGE_KEY = "cropintel-language";

const translations: Record<LangCode, Record<string, string>> = {
  en,
  hi,
  bn,
  te,
  ta,
  mr,
  pa,
  or,
  kn,
};

interface LanguageContextValue {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

function detectBrowserLanguage(): LangCode {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("hi")) return "hi";
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    const initial =
      stored && translations[stored] ? stored : detectBrowserLanguage();
    setLanguageState(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.lang = language;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (lang) => {
        if (translations[lang]) setLanguageState(lang);
      },
      t: (key: string) => {
        const dict = translations[language] || translations.en;
        return dict[key] ?? translations.en[key] ?? key;
      },
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

