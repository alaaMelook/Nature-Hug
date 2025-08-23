// components/FontWrapper.tsx
"use client";
import {
  muslimah as arabicFont,
  gerlachSans as englishFont,
} from "@/lib/fonts";
import { useTranslation } from "./TranslationProvider";

export default function FontWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = useTranslation();
  const fontClass =
    language === "ar" ? arabicFont.className : englishFont.className;
  return <div className={fontClass}>{children}</div>;
}
