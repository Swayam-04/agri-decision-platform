"use client";

import { useThemeContext } from "@/context/ThemeContext";

export type { ThemeMode } from "@/context/ThemeContext";

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useThemeContext();
  return { theme, toggleTheme, setTheme };
}

