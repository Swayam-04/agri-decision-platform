import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Sidebar } from "@/components/sidebar";
import LanguageRootProvider from "@/components/LanguageRootProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CropIntel AI - Crop Intelligence & Decision Platform",
  description:
    "AI-powered crop disease detection, risk forecasting, profit prediction, and actionable farming decisions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} antialiased bg-background text-foreground earthy-theme`}
      >
        <LanguageRootProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen relative">
              {children}
            </main>
          </div>
        </LanguageRootProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
