// components/LanguageSwitcher.tsx
"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Get language from localStorage or navigator
      const savedLanguage =
        localStorage.getItem("language") || navigator.language.split("-")[0];
      setCurrentLanguage(savedLanguage);

      // Apply language to document
      document.documentElement.lang = savedLanguage;
      if (savedLanguage === "ar") {
        document.documentElement.dir = "rtl";
        document.body.classList.remove("font-english");
        document.body.classList.add("font-arabic");
      } else {
        document.documentElement.dir = "ltr";
        document.body.classList.remove("font-arabic");
        document.body.classList.add("font-english");
      }
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "ar" : "en";
    setCurrentLanguage(newLanguage);

    // Save to localStorage
    localStorage.setItem("language", newLanguage);

    // Update document attributes
    document.documentElement.lang = newLanguage;

    if (newLanguage === "ar") {
      document.documentElement.dir = "rtl";
      document.body.classList.remove("font-english");
      document.body.classList.add("font-arabic");
    } else {
      document.documentElement.dir = "ltr";
      document.body.classList.remove("font-arabic");
      document.body.classList.add("font-english");
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex flex-col items-center text-default justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
    >
      <Globe className="w-5 h-5" />

      {currentLanguage === "en" ? "العربية" : "English"}
    </button>
  );
}
