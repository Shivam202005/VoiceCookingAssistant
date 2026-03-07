import React from "react";
import { useLanguage } from "../context/LanguageContext";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            language === lang.code
              ? "bg-orange-500 text-white shadow-md scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
          }`}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
