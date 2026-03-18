"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, description: "Decision Intelligence" },
  { href: "/disease-detect", label: "Disease Detection", icon: Microscope, description: "Vision AI Analysis" },
  { href: "/disease-risk", label: "Disease Risk", icon: ShieldAlert, description: "7-10 Day Forecast" },
  { href: "/profit-predict", label: "Profit Prediction", icon: TrendingUp, description: "Yield & Revenue" },
  { href: "/price-forecast", label: "Sell / Store", icon: Store, description: "Price Forecast" },
  { href: "/risk-advisory", label: "Crop Advisory", icon: AlertTriangle, description: "What NOT to Grow" },
  { href: "/irrigation", label: "Smart Irrigation", icon: Droplets, description: "Water & Pump Control" },
  { href: "/pest-outbreak", label: "Pest Outbreak", icon: Bug, description: "Regional Forecasting" },
  { href: "/sms-alerts", label: "SMS Alerts", icon: MessageSquare, description: "Farmer Notifications" },
  { href: "/chatbot", label: "AI Assistant", icon: Bot, description: "Ask Anything" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">CropIntel AI</h1>
            <p className="text-[11px] text-muted-foreground">Decision Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-emerald-600" : "")} />
                <div className="min-w-0">
                  <div className="leading-tight truncate">{item.label}</div>
                  <div className={cn("text-[10px] truncate", isActive ? "text-emerald-600/70" : "text-muted-foreground/70")}>{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 flex items-center justify-center">
          <p className="text-xs font-medium text-muted-foreground">made with ❤️ by INNOVATEX Team</p>
        </div>
      </div>
    </aside>
  );
}
