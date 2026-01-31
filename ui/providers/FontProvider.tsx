"use client";
import {
  muslimah as arabicFont,
  gerlachSans as englishFont,
  cairo,
} from "@/lib/fonts";
import { useTranslation } from "react-i18next";
import { useCurrentLanguage } from "../hooks/useCurrentLanguage";

export default function FontProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = useCurrentLanguage();
  const fontClass =
    language === "ar" ? arabicFont.className : englishFont.className;
  // Include cairo.className to preload the font, and cairo.variable for CSS access
  return <div className={`${fontClass} ${cairo.variable} ${cairo.className}`}>{children}</div>;
}
