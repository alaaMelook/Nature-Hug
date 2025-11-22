"use client";
import {
  muslimah as arabicFont,
  gerlachSans as englishFont,
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
  return <div className={fontClass}>{children}</div>;
}
