"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Cpu, Radar, Sprout, Activity, MapPin, AlertTriangle, CheckCircle, Bug, Leaf, DollarSign, ChevronRight } from "lucide-react";
import GlassPanel from "@/components/HUD/GlassPanel";
import AIInterpretation from "@/components/AI/AIInterpretation";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { formatCarbon } from "@/lib/units";
import type { OverviewResponse, RubberOverviewResponse } from "@/lib/api-types";
import { mockPestEvidenceChains, mockZoneCarbonDetails, aiInterpretations } from "@/lib/mockData";

/* ── animated count-up hook ── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

/* ── zone carbon data for mini chart (from mockZoneCarbonDetails) ── */
const ZONE_CARBON_COLORS = [
  "bg-neon-green", "bg-holographic-blue", "bg-amber-400",
  "bg-cyber-yellow", "bg-purple-400", "bg-orange-400",
];
const ZONE_CARBON = mockZoneCarbonDetails.map((z, i) => ({
  zone: z.zoneName.replace(" Zone", ""),
  id: z.zoneId,
  value: Math.round(z.totalCarbonStock),
  color: ZONE_CARBON_COLORS[i % ZONE_CARBON_COLORS.length],
}));

/* ── severity config ── */
const sevColor: Record<string, string> = {
  CRITICAL: "text-red-400 border-red-500/30",
  HIGH: "text-alert-red border-red-500/30",
  MEDIUM: "text-yellow-400 border-yellow-500/30",
  LOW: "text-blue-300 border-blue-400/30",
};

const statusLabel: Record<string, { text: string; color: string }> = {
  monitoring: { text: "MONITORING", color: "text-yellow-400" },
  confirmed: { text: "CONFIRMED", color: "text-alert-red" },
  treating: { text: "TREATING", color: "text-holographic-blue" },
  resolved: { text: "RESOLVED", color: "text-neon-green" },
};

export default function RightPanel() {
  const { t, locale } = useTranslation();
  const selectedZoneBusiness = useAppStore((s) => s.selectedZoneBusiness);
  const selectedZoneId = useAppStore((s) => s.selectedZoneId);

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [rubberOverview, setRubberOverview] = useState<RubberOverviewResponse | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [ovRes, rbRes] = await Promise.all([
        fetch("/api/overview"),
        fetch("/api/rubber/overview"),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (rbRes.ok) setRubberOverview(await rbRes.json());
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const carbonTotal = overview?.carbonTCO2e ?? 1240;
  const animatedCarbon = useCountUp(carbonTotal);
  const activeDrones = overview?.activeDroneCount ?? 3;
  const openTapping = overview?.openTappingPercent ?? 72;
  const healthIndex = overview?.healthIndexPercent ?? 94;

  /* ── carbon summary computed from mockZoneCarbonDetails ── */
  const totalCarbonStock = mockZoneCarbonDetails.reduce((s, z) => s + z.totalCarbonStock, 0);
  const avgSequestrationRate = mockZoneCarbonDetails.reduce((s, z) => s + z.carbonSequestrationRate, 0);
  const totalCreditValue = mockZoneCarbonDetails.reduce((s, z) => s + z.revenueUSD, 0);
  const totalCredits = mockZoneCarbonDetails.reduce((s, z) => s + z.totalCredits, 0);

  /* ── system state indicators ── */
  const indicators = [
    {
      icon: Cpu,
      label: t("aiEngineShort"),
      value: t("onlineStatus"),
      color: "text-neon-green",
    },
    {
      icon: Radar,
      label: t("droneLabel"),
      value: `${activeDrones} ${t("activeLabel")}`,
      color: "text-holographic-blue",
    },
    {
      icon: Sprout,
      label: t("rubberLabel"),
      value: `${openTapping}%`,
      color: "text-neon-green",
    },
    {
      icon: Activity,
      label: t("healthLabel"),
      value: `${healthIndex}%`,
      color: "text-holographic-blue",
    },
  ];

  const maxZoneCarbon = Math.max(...ZONE_CARBON.map((z) => z.value));

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* ─── System State ─── */}
      <div className="shrink-0">
        <GlassPanel title={t("sysState")}>
        <div className="grid grid-cols-2 gap-2">
          {indicators.map((ind) => (
            <div
              key={ind.label}
              className="flex items-center gap-2 rounded bg-white/5 border border-white/10 px-2 py-1.5"
            >
              <ind.icon className={`w-3.5 h-3.5 ${ind.color} shrink-0`} />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-mono uppercase leading-none">
                  {ind.label}
                </div>
                <div className={`text-xs font-mono font-semibold leading-tight ${ind.color}`}>
                  {ind.value}
                </div>
              </div>
            </div>
          ))}
        </div>
        </GlassPanel>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 scrollbar-thin xl:overflow-hidden">
        {/* ─── Carbon Summary (Aggregated) ─── */}
      <GlassPanel
        title={t("carbonSequestration")}
        collapsible
        scrollable={false}
        className="flex flex-col shrink-0 xl:flex-1 xl:min-h-0 xl:shrink"
      >
        <div className="space-y-3 h-full xl:overflow-y-auto xl:pr-1">
          {/* large animated number */}
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              {t("totalCO2Sequestered")}
            </div>
            <div className="text-2xl font-mono font-bold text-neon-green leading-tight mt-0.5 tabular-nums">
              {animatedCarbon.toLocaleString()}
              <span className="text-xs text-slate-400 ml-1 font-normal">tCO2e</span>
            </div>
          </div>

          {/* aggregated carbon stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="bg-white/5 rounded border border-white/10 px-2 py-1.5 text-center">
              <div className="text-[9px] text-slate-500 font-mono">{t("totalStockLabel")}</div>
              <div className="text-xs font-mono font-semibold text-neon-green tabular-nums">
                {totalCarbonStock.toFixed(0)}
              </div>
              <div className="text-[8px] text-slate-500 font-mono">tCO2e</div>
            </div>
            <div className="bg-white/5 rounded border border-white/10 px-2 py-1.5 text-center">
              <div className="text-[9px] text-slate-500 font-mono">{t("seqRateLabel")}</div>
              <div className="text-xs font-mono font-semibold text-holographic-blue tabular-nums">
                {avgSequestrationRate.toFixed(0)}
              </div>
              <div className="text-[8px] text-slate-500 font-mono">kg/day</div>
            </div>
            <div className="bg-white/5 rounded border border-white/10 px-2 py-1.5 text-center">
              <div className="text-[9px] text-slate-500 font-mono">{t("creditsLabel")}</div>
              <div className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                ${totalCreditValue.toLocaleString()}
              </div>
              <div className="text-[8px] text-slate-500 font-mono">{totalCredits} {t("unitsLabel")}</div>
            </div>
          </div>

          {/* formula */}
          <div className="rounded bg-white/5 border border-white/10 px-2 py-1.5">
            <div className="text-[10px] text-slate-500 font-mono mb-0.5">
              {t("biomassFormula")}
            </div>
            <div className="text-[11px] font-mono text-slate-300 leading-snug">
              Total Carbon = Σ(Count × Volume × 0.47)
            </div>
          </div>

          {/* mini bar chart by zone */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">
              {t("carbonByZone")}
            </div>
            <div className="space-y-1.5">
              {ZONE_CARBON.map((z) => (
                <Link
                  href={`/zone/${z.id}`}
                  key={z.zone}
                  className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 p-1 rounded -mx-1 transition-colors"
                >
                  <span className="text-[10px] font-mono text-slate-400 w-20 shrink-0 truncate group-hover:text-holographic-blue transition-colors">
                    {z.zone}
                  </span>
                  <div className="flex-1 h-3 rounded-sm bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-sm ${z.color} transition-all duration-700`}
                      style={{ width: `${(z.value / maxZoneCarbon) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right tabular-nums">
                    {z.value}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <AIInterpretation
          dataType="Carbon Sequestration"
          dataValue={`${totalCarbonStock.toFixed(0)} tCO2e total`}
          context="All Zones Aggregate"
          interpretation={`[Total Carbon Stock: ${totalCarbonStock.toFixed(0)} tCO2e] Aggregated across ${mockZoneCarbonDetails.length} zones, the plantation maintains a strong carbon portfolio.\n\n[Sequestration Rate: ${avgSequestrationRate.toFixed(0)} kg/day] Combined daily sequestration across all zones. The Rubber Zone contributes the highest share at 52.8 kg/day.\n\n[Carbon Credits: $${totalCreditValue.toLocaleString()} from ${totalCredits} units] Multiple certification methodologies in use (VCS, T-VER, RSPO PalmGHG, Gold Standard). Average credit price ranges from $18-28.5/tCO2e depending on certification body.\n\n[Zone Performance Ranking]\n${mockZoneCarbonDetails.map(z => `- ${z.zoneName}: ${z.totalCarbonStock} tCO2e (density: ${z.carbonDensity} tCO2e/ha)`).join('\n')}\n\nRecommendation: Prioritize VCS international certification for Rubber Zone to access premium carbon markets. Address Oil Palm Zone's low NDVI to improve sequestration efficiency.`}
        />
      </GlassPanel>

      {/* ─── Pest Alert List ─── */}
      <GlassPanel title={t("pestAlerts")} className="flex flex-col min-h-0 shrink-0 max-h-[40vh]">
        <div className="overflow-y-auto pr-1 space-y-1.5 flex-1 min-h-0">
          {mockPestEvidenceChains.map((chain) => {
            const st = statusLabel[chain.status] ?? { text: chain.status, color: "text-slate-400" };
            return (
              <div
                key={chain.id}
                className={`rounded bg-white/5 border p-2 ${sevColor[chain.severity] ?? "border-white/10"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Bug className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-mono font-semibold truncate">
                      {chain.pestName}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/5 ${st.color}`}>
                    {st.text}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 mb-1">
                  {chain.pestNameTH} | {chain.pathogen}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span>
                    <span className="text-slate-500">Sev: </span>
                    <span className={chain.severity === 'CRITICAL' || chain.severity === 'HIGH' ? 'text-alert-red' : chain.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-300'}>
                      {chain.severity}
                    </span>
                  </span>
                  <span>
                    <span className="text-slate-500">Trees: </span>
                    {chain.affectedTreeIds.length}
                  </span>
                  <span className="truncate">
                    <span className="text-slate-500">Area: </span>
                    {chain.affectedArea}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* ─── Zone Operations ─── */}
      <GlassPanel title={t("zoneOps")}>
        {selectedZoneBusiness && selectedZoneId ? (
          <div className="space-y-3">
            {/* zone header */}
            <Link
              href={`/zone/${selectedZoneId}`}
              className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 p-1 rounded -mx-1 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-holographic-blue shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono font-semibold text-slate-200 truncate group-hover:text-holographic-blue transition-colors">
                {selectedZoneBusiness.zoneName}
              </span>
              <span className="ml-auto text-[8px] font-mono px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/20 group-hover:bg-neon-green/20 transition-colors">
                {t("activeLabel")}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* stats row */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded bg-white/5 border border-white/10 px-2 py-1.5 text-center">
                <div className="text-[9px] text-slate-500 font-mono">{t("missions")}</div>
                <div className="text-sm font-mono font-semibold text-slate-200 tabular-nums">
                  {selectedZoneBusiness.missionCount}
                </div>
              </div>
              <div className="rounded bg-white/5 border border-white/10 px-2 py-1.5 text-center">
                <div className="text-[9px] text-slate-500 font-mono">
                  {t("yieldPerRai")}
                </div>
                <div className="text-sm font-mono font-semibold text-neon-green tabular-nums">
                  {selectedZoneBusiness.latestYieldTonPerRai.toFixed(1)}
                </div>
              </div>
              <div className="rounded bg-white/5 border border-white/10 px-2 py-1.5 text-center">
                <div className="text-[9px] text-slate-500 font-mono">{t("healthLabel")}</div>
                <div className="text-sm font-mono font-semibold text-holographic-blue tabular-nums">
                  {selectedZoneBusiness.recentMissions[0]?.healthScore ?? 94}%
                </div>
              </div>
            </div>

            {/* alerts trend mini bar chart (7 days) */}
            {selectedZoneBusiness.alertsTrend.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">
                  {t("alertTrend7d")}
                </div>
                <div className="flex items-end gap-1 h-8">
                  {selectedZoneBusiness.alertsTrend.slice(-7).map((count, i) => {
                    const max = Math.max(...selectedZoneBusiness.alertsTrend.slice(-7), 1);
                    const heightPct = (count / max) * 100;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-alert-red/70 transition-all duration-500"
                        style={{ height: `${Math.max(heightPct, 8)}%` }}
                        title={`Day ${i + 1}: ${count} alerts`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-0.5 text-[8px] font-mono text-slate-600">
                  <span>7d ago</span><span>{t("current")}</span>
                </div>
              </div>
            )}

            {/* recent missions */}
            {selectedZoneBusiness.recentMissions.length > 0 && (
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">
                  {t("recentMissionsLabel")}
                </div>
                <div className="space-y-1">
                  {selectedZoneBusiness.recentMissions.slice(0, 4).map((m) => (
                    <div
                      key={m.missionId}
                      className="flex items-center gap-2 rounded bg-white/5 border border-white/10 px-2 py-1"
                    >
                      {m.status === "completed" ? (
                        <CheckCircle className="w-3 h-3 text-neon-green shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-alert-red shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-slate-300 truncate">
                          #{m.missionId}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.anomalies > 0 && (
                          <span className="text-[9px] font-mono text-alert-red tabular-nums">
                            {m.anomalies} anom
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-500 tabular-nums">
                          {m.healthScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MapPin className="w-5 h-5 text-slate-600 mb-2" />
            <span className="text-[11px] font-mono text-slate-500">
              {t("clickZoneMap")}
            </span>
            <span className="text-[9px] font-mono text-slate-600 mt-1">
              {mockZoneCarbonDetails.length} {t("sensorsActive")}
            </span>
          </div>
        )}
      </GlassPanel>
      </div>
    </div>
  );
}
