"use client";

import { useLanguage } from "@/context/LanguageContext";

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}

