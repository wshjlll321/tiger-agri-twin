"use client";

import { useEffect, useState } from "react";
import { Wind, Shield, Wifi } from "lucide-react";
import { useTranslation, type Locale } from "@/lib/i18n";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中" },
  { code: "th", label: "ไทย" },
];

export default function TopBar() {
  const { t, locale, setLocale } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="bg-[#0B1120]/60 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 max-h-16">
          {/* ---- Left Section ---- */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm md:text-lg font-bold text-white tracking-wide truncate">
                TIGER AGRI-TWIN
              </span>
              <span className="text-[10px] md:text-xs font-mono text-slate-400 truncate">
                {t("systemOnline")} | V2.0.0
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 ml-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/20">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                <span className="text-[9px] font-mono text-neon-green font-bold">AI</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-holographic-blue/10 border border-holographic-blue/20">
                <Wifi className="w-2.5 h-2.5 text-holographic-blue" />
                <span className="text-[9px] font-mono text-holographic-blue">IoT</span>
              </div>
            </div>
          </div>

          {/* ---- Center Section ---- */}
          <div className="hidden md:flex flex-col items-center font-mono text-xs leading-tight">
            <span className="text-[#00B0FF]">
              {dateStr} &nbsp; {timeStr}
            </span>
            <span className="text-slate-500">
              LAT 9.1234 N &nbsp;|&nbsp; LNG 99.3456 E
            </span>
          </div>

          {/* ---- Right Section ---- */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Language Switcher */}
            <div className="flex items-center gap-0.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${locale === lang.code
                      ? "bg-[#00E676]/20 text-[#00E676]"
                      : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Weather Widget */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-[#00B0FF]">{t("weather")}</span>
              <span className="text-white font-semibold">24°C</span>
              <span className="text-slate-500 hidden md:inline">/</span>
              <span className="hidden md:inline">
                {t("humidity")} 65%
              </span>
              <Wind className="w-3.5 h-3.5 text-[#00B0FF]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
