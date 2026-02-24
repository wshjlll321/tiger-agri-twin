"use client";

import { useTranslation, Locale } from "@/lib/i18n";

const LANG_OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "zh", label: "中" },
  { locale: "th", label: "ไทย" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-dark-bg/40 backdrop-blur-md overflow-hidden">
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.locale}
          onClick={() => setLocale(opt.locale)}
          className={`px-3 py-1.5 text-xs font-bold tracking-wider transition-all ${
            locale === opt.locale
              ? "bg-neon-green/20 text-neon-green shadow-[0_0_8px_rgba(0,230,118,0.3)] border-neon-green/40"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
