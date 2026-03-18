"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "day" | "evening" | "night";

const STORAGE_KEY = "cropintel-theme";

function getTimeBasedTheme(): ThemeMode {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "evening";
  return "night";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [manualOverride, setManualOverride] = useState<ThemeMode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    let activeTheme: ThemeMode = getTimeBasedTheme();
    if (stored === "day" || stored === "evening" || stored === "night") {
      activeTheme = stored;
      setManualOverride(stored);
    }
    setTheme(activeTheme);
    document.documentElement.classList.remove("day", "evening", "night");
    document.documentElement.classList.add(activeTheme);

    const interval = window.setInterval(() => {
      if (manualOverride) return;
      const t = getTimeBasedTheme();
      setTheme(t);
      document.documentElement.classList.remove("day", "evening", "night");
      document.documentElement.classList.add(t);
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [manualOverride]);

  const toggleTheme = () => {
    setManualOverride((currentOverride) => {
      const current = currentOverride ?? theme;
      const next: ThemeMode = current === "night" ? "day" : "night";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.classList.remove("day", "evening", "night");
        document.documentElement.classList.add(next);
      }
      setTheme(next);
      return next;
    });
  };

  return { theme, toggleTheme };
}

