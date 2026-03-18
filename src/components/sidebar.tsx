"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/hooks/useTheme";
import {
  Microscope,
  ShieldAlert,
  TrendingUp,
  Store,
  AlertTriangle,
  LayoutDashboard,
  Leaf,
  Droplets,
  Bug,
  MessageSquare,
  Bot,
  Mic,
  Globe2,
  Check,
} from "lucide-react";

const languages = [
  { code: "en", native: "English", label: "English" },
  { code: "hi", native: "हिंदी", label: "Hindi" },
  { code: "bn", native: "বাংলা", label: "Bengali" },
  { code: "te", native: "తెలుగు", label: "Telugu" },
  { code: "ta", native: "தமிழ்", label: "Tamil" },
  { code: "mr", native: "मराठी", label: "Marathi" },
  { code: "pa", native: "ਪੰਜਾਬੀ", label: "Punjabi" },
  { code: "or", native: "ଓଡ଼ିଆ", label: "Odia" },
  { code: "kn", native: "ಕನ್ನಡ", label: "Kannada" },
] as const;

const navItems = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard, descriptionKey: "navDesc.dashboard", description: "Decision Intelligence" },
  { href: "/disease-detect", labelKey: "nav.diseaseDetection", icon: Microscope, descriptionKey: "navDesc.diseaseDetection", description: "Vision AI Analysis" },
  { href: "/disease-risk", labelKey: "nav.diseaseRisk", icon: ShieldAlert, descriptionKey: "navDesc.diseaseRisk", description: "7-10 Day Forecast" },
  { href: "/profit-predict", labelKey: "nav.profitPrediction", icon: TrendingUp, descriptionKey: "navDesc.profitPrediction", description: "Yield & Revenue" },
  { href: "/price-forecast", labelKey: "nav.sellStore", icon: Store, descriptionKey: "navDesc.sellStore", description: "Price Forecast" },
  { href: "/risk-advisory", labelKey: "nav.cropAdvisory", icon: AlertTriangle, descriptionKey: "navDesc.cropAdvisory", description: "What NOT to Grow" },
  { href: "/irrigation", labelKey: "nav.smartIrrigation", icon: Droplets, descriptionKey: "navDesc.smartIrrigation", description: "Water & Pump Control" },
  { href: "/pest-outbreak", labelKey: "nav.pestOutbreak", icon: Bug, descriptionKey: "navDesc.pestOutbreak", description: "Regional Forecasting" },
  { href: "/sms-alerts", labelKey: "nav.smsAlerts", icon: MessageSquare, descriptionKey: "navDesc.smsAlerts", description: "Farmer Notifications" },
  { href: "/chatbot", labelKey: "nav.aiAssistant", icon: Bot, descriptionKey: "navDesc.aiAssistant", description: "Ask Anything" },
  { href: "/voice-assistant", labelKey: "nav.voiceAssistant", icon: Mic, descriptionKey: "navDesc.voiceAssistant", description: "Multilingual Mic Chat" },
];

function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const ref = useRef<HTMLDivElement | null>(null);

  const current =
    languages.find((l) => l.code === language) ?? languages[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (code: string) => {
    setLanguage(code as any);
    setOpen(false);
  };

  return (
    <div className="relative mb-3" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-full border border-[rgba(61,31,10,0.2)] bg-[#f5ebd9] px-3 py-1.5 text-[13px] font-semibold text-[#3d1f0a]"
      >
        <span className="flex items-center gap-2">
          <Globe2 className="h-3.5 w-3.5 text-[#16a34a]" />
          <span>
            {current.native} — {current.label}
          </span>
        </span>
        <span className="text-xs text-[#6b4423]">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-[rgba(61,31,10,0.2)] bg-[#fdf6e3] shadow-md overflow-hidden animate-in fade-in zoom-in duration-200">
          <ul className="max-h-60 overflow-y-auto py-1 scrollbar-earth">
            {languages.map((lang) => {
              const active = lang.code === language;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-[13px] ${
                      active ? "bg-[#e8dcc8] font-semibold" : "hover:bg-[#f5ebd9]"
                    }`}
                  >
                    <span>
                      {lang.native} — {lang.label}
                    </span>
                    {active && (
                      <Check className="h-3.5 w-3.5 text-[#16a34a]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[rgba(61,31,10,0.12)] bg-[#fdf6e3]">
      {/* Language dropdown in upper right corner */}
      <div className="absolute top-3 right-3 w-[210px]">
        <LanguageDropdown />
      </div>

      <div className="flex h-full flex-col pt-10">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[rgba(61,31,10,0.12)] px-5 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#f5ebd9] border border-[rgba(22,163,74,0.3)] text-[#16a34a] hover-leaf transition-transform">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#3d1f0a]" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.3px" }}>
              {t("sidebar.appName")}
            </h1>
            <p className="text-[12px] text-[#6b4423]">
              {t("sidebar.subtitle")}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[20px] px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-[#16a34a] text-[#fdf6e3] font-semibold shadow-md"
                    : "text-[#3d1f0a] hover:bg-[#f5ebd9] border border-transparent"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#f59e0b]" />
                )}
                <span className={cn("flex items-center justify-center", isActive ? "text-[#fdf6e3]" : "text-[#16a34a] group-hover:scale-110 transition-transform hover-leaf")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                </span>
                <div className="min-w-0">
                  <div className="leading-tight truncate">{t(item.labelKey)}</div>
                  <div
                    className={cn(
                      "text-[11px] truncate",
                      isActive ? "text-[#fdf6e3]/90" : "text-[#6b4423] group-hover:text-[#3d1f0a]"
                    )}
                  >
                    {t(item.descriptionKey)}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[rgba(61,31,10,0.12)] px-5 py-4 flex flex-col gap-3">
          <ThemeToggle />
          <div className="flex items-center justify-center">
            <p className="text-xs font-semibold text-[#6b4423]">{t("sidebar.madeWith")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-full flex items-center justify-between rounded-full border border-[rgba(61,31,10,0.2)] bg-[#f5ebd9] px-3 py-1.5 text-[13px] font-semibold text-[#3d1f0a] hover:bg-[#e8dcc8] transition-colors"
    >
      <span className="flex items-center gap-2">
        <span className="text-sm">
          {theme === "night" ? "☀️" : "🌙"}
        </span>
        <span>
          {theme === "night" ? t("dashboard.dayMode") : t("dashboard.nightMode")}
        </span>
      </span>
      <div className={cn(
        "h-4 w-8 rounded-full bg-[#6b4423]/20 relative transition-colors",
        theme === "night" && "bg-[#16a34a]/40"
      )}>
        <div className={cn(
          "absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
          theme === "night" && "translate-x-4"
        )} />
      </div>
    </button>
  );
}
