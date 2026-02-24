"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface AIInterpretationProps {
  dataType: string;
  dataValue: string | number;
  context?: string;
  interpretation: string;
  zoneData?: Record<string, unknown>;
}

const liveAiLabel = { en: "Live AI", zh: "实时AI", th: "AI สด" } as const;

export default function AIInterpretation({
  dataType,
  dataValue,
  context,
  interpretation,
  zoneData,
}: AIInterpretationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveInterpretation, setLiveInterpretation] = useState<string | null>(null);
  const [liveRecommendations, setLiveRecommendations] = useState<string[] | null>(null);

  const { locale } = useTranslation();

  const handleLiveAI = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataType,
          dataValue: String(dataValue),
          context: context || "",
          locale,
          zoneData,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setLiveInterpretation(data.interpretation);
      setLiveRecommendations(data.recommendations);
      // Auto-expand the panel to show results
      if (!isOpen) setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const displayText = liveInterpretation ?? interpretation;
  const isLive = liveInterpretation !== null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neon-green/30 bg-neon-green/5 text-neon-green text-[11px] font-mono tracking-wide hover:bg-neon-green/10 hover:border-neon-green/50 transition-all duration-200 shadow-[0_0_8px_rgba(0,230,118,0.08)]"
        >
          <span className="text-sm leading-none">&#x1F916;</span>
          <span>AI{isOpen ? " -" : " +"}</span>
        </button>

        <button
          onClick={handleLiveAI}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-cyber-yellow/30 bg-cyber-yellow/5 text-cyber-yellow text-[11px] font-mono tracking-wide hover:bg-cyber-yellow/10 hover:border-cyber-yellow/50 transition-all duration-200 shadow-[0_0_8px_rgba(255,214,0,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-cyber-yellow/30 border-t-cyber-yellow rounded-full animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5" />
          )}
          <span>{liveAiLabel[locale] ?? liveAiLabel.en}</span>
        </button>
      </div>

      {error && (
        <div className="mt-2 px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/5 text-red-400 text-[11px] font-mono">
          {error}
        </div>
      )}

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-lg border border-holographic-blue/25 bg-slate-950/80 backdrop-blur-sm shadow-[0_0_12px_rgba(0,176,255,0.06)]">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50 bg-slate-900/60">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-cyber-yellow" : "bg-neon-green"} status-dot`} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-holographic-blue">
                AI Analysis
              </span>
              {isLive && (
                <span className="font-mono text-[9px] uppercase tracking-wider text-cyber-yellow">
                  LIVE
                </span>
              )}
              <span className="ml-auto font-mono text-[9px] text-slate-500">
                {dataType}
              </span>
            </div>

            {/* Body */}
            <div className="px-3 py-3 space-y-2">
              {/* Data reference */}
              <div className="flex items-baseline gap-2 font-mono text-[10px]">
                <span className="text-slate-500 uppercase">Input:</span>
                <span className="text-neon-green font-semibold">
                  {dataValue}
                </span>
                {context && (
                  <span className="text-slate-500 truncate max-w-[160px]">
                    | {context}
                  </span>
                )}
              </div>

              {/* Interpretation text */}
              <p className="text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
                {displayText}
              </p>

              {/* Live recommendations */}
              {isLive && liveRecommendations && liveRecommendations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/40 space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cyber-yellow">
                    Recommendations
                  </span>
                  <ul className="space-y-1">
                    {liveRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300">
                        <span className="text-cyber-yellow mt-0.5 shrink-0">&#x25B8;</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Watermark footer */}
            <div className="px-3 py-1.5 border-t border-slate-700/40 flex items-center justify-end">
              <span className="font-mono text-[9px] text-slate-600 tracking-wider select-none">
                {isLive ? "Qwen-Max Live" : "AI Engine v3.2"} &middot; AgriTwin
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
