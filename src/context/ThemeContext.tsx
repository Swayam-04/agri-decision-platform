"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type ThemeMode = "day" | "evening" | "night";

const STORAGE_KEY = "cropintel-theme";

function getTimeBasedTheme(): ThemeMode {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()));
  
  if (hour >= 6 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "evening";
  return "night";
}

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("day");
  const [manualOverride, setManualOverride] = useState<boolean>(false);

  // Initialize from IST on load
  useEffect(() => {
    const initial = getTimeBasedTheme();
    setThemeState(initial);
    document.documentElement.classList.add(initial);
    if (initial === "night") document.documentElement.classList.add("dark");
  }, []);

  // Timer logic for time-based theme
  useEffect(() => {
    if (manualOverride) return;

    const interval = window.setInterval(() => {
      const t = getTimeBasedTheme();
      setThemeState((prev) => {
        if (prev !== t) return t;
        return prev;
      });
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [manualOverride]);

  // Sync state to DOM (but not Storage, to ensure refresh = auto)
  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.classList.remove("day", "evening", "night", "dark");
    document.documentElement.classList.add(theme);
    if (theme === "night") {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (t: ThemeMode) => {
      setThemeState(t);
      setManualOverride(true);
    },
    toggleTheme: () => {
      const next: ThemeMode = theme === "night" ? "day" : "night";
      setThemeState(next);
      setManualOverride(true);
    }
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
