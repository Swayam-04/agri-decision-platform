"use client";

import { LanguageProvider } from "@/context/LanguageContext";

export default function LanguageRootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

