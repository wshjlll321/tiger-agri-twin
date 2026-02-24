"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ShieldAlert, Cpu, Radar, Sprout, Activity, Wind, Bug, AlertTriangle, TrendingUp, DollarSign, Leaf, BarChart3, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { formatCarbon } from "@/lib/units";
import type { OverviewResponse } from "@/lib/api-types";
import GlassPanel from "@/components/HUD/GlassPanel";
import AIInterpretation from "@/components/AI/AIInterpretation";
import { mockPestEvidenceChains, mockZoneCarbonDetails, aiInterpretations } from "@/lib/mockData";

/* ── animated count-up hook ─────────────────────────────── */
function useCountUp(target: number, duration = 1600, decimals = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((eased * target).toFixed(decimals)));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, decimals]);

  return value;
}

/* ── severity config ────────────────────────────────────── */
const sevColor: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
  HIGH: "text-alert-red bg-red-500/10 border-red-500/20",
  MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  LOW: "text-blue-300 bg-blue-400/10 border-blue-400/20",
};

const statusColor: Record<string, string> = {
  monitoring: "text-yellow-400",
  confirmed: "text-alert-red",
  treating: "text-holographic-blue",
  resolved: "text-neon-green",
};

/* ── crop distribution from carbon zones ── */
const CROP_ICONS: Record<string, string> = {
  "Durian": "🍈", "Mangosteen": "🍇", "Rubber": "🌳",
  "Oil Palm": "🌴", "Longan": "🫐", "Maize": "🌽",
};
const CROP_COLORS: Record<string, string> = {
  "Durian": "#FFD600", "Mangosteen": "#AA00FF", "Rubber": "#00E676",
  "Oil Palm": "#FF6D00", "Longan": "#00B0FF", "Maize": "#76FF03",
};

/* ── component ──────────────────────────────────────────── */
export default function LeftPanel() {
  const { t, locale } = useTranslation();

  /* fetch overview KPIs */
  const [data, setData] = useState<OverviewResponse | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/overview");
      if (res.ok) setData(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const id = setInterval(fetchOverview, 30_000);
    return () => clearInterval(id);
  }, [fetchOverview]);

  /* animated values */
  const trees      = useCountUp(data?.totalTrees ?? 14205, 1800);
  const healthIdx  = useCountUp(data?.healthIndexPercent ?? 94.2, 1600, 1);
  const carbon     = useCountUp(data?.carbonTCO2e ?? 1240, 2000);
  const drones     = useCountUp(data?.activeDroneCount ?? 3, 800);

  /* business metrics from carbon data */
  const totalRevenue = mockZoneCarbonDetails.reduce((s, z) => s + z.revenueUSD, 0);
  const totalCredits = mockZoneCarbonDetails.reduce((s, z) => s + z.totalCredits, 0);
  const totalArea = mockZoneCarbonDetails.reduce((s, z) => s + z.areaRai, 0);

  /* derived pest data */
  const highCritCount = mockPestEvidenceChains.filter(
    (c) => c.severity === "CRITICAL" || c.severity === "HIGH"
  ).length;

  const pestOverviewText = mockPestEvidenceChains
    .map(
      (c) =>
        `[${c.severity}] ${c.pestName} (${c.pestNameTH}) — Status: ${c.status.toUpperCase()}, ${c.affectedTreeIds.length} trees affected in ${c.affectedArea}. ${c.aiReportSummary.slice(0, 120)}...`
    )
    .join("\n\n");

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* ── Fixed KPI Section (Always Visible) ── */}
      <div className="shrink-0">
        <GlassPanel title={`◆ ${t("kpiTitle")}`}>
          <div className="grid grid-cols-2 gap-1.5">
            {/* Total Trees */}
            <div className="bg-white/5 border border-white/10 rounded p-2 flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sprout className="w-3 h-3 text-neon-green" />
                {t("totalTreesLabel")}
              </span>
              <span className="text-sm font-mono font-semibold text-neon-green">
                {trees.toLocaleString()}
              </span>
              <span className="text-[8px] font-mono text-slate-500 flex items-center gap-0.5">
                <TrendingUp className="w-2 h-2 text-neon-green" /> +128 {t("lastScanned")}
              </span>
            </div>

            {/* Health Index */}
            <div className="bg-white/5 border border-white/10 rounded p-2 flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-holographic-blue" />
                {t("healthIndexLabel")}
              </span>
              <span className="text-sm font-mono font-semibold text-holographic-blue">
                {healthIdx}%
              </span>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-holographic-blue/60 rounded-full transition-all duration-1000" style={{ width: `${healthIdx}%` }} />
              </div>
            </div>

            {/* Carbon */}
            <div className="bg-white/5 border border-white/10 rounded p-2 flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Leaf className="w-3 h-3 text-neon-green" />
                {t("carbonLabel")}
              </span>
              <span className="text-sm font-mono font-semibold text-neon-green">
                {formatCarbon(carbon)}
              </span>
              <span className="text-[8px] font-mono text-slate-500">{totalCredits} {t("creditsLabel")}</span>
            </div>

            {/* Active Drones */}
            <div className="bg-white/5 border border-white/10 rounded p-2 flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-holographic-blue" />
                {t("activeDronesLabel")}
              </span>
              <span className="text-sm font-mono font-semibold text-holographic-blue">
                {drones}
              </span>
              <span className="text-[8px] font-mono text-neon-green">● {t("allOnline")}</span>
            </div>
          </div>

          {/* Business Revenue Summary */}
          <div className="mt-2 bg-gradient-to-r from-neon-green/5 to-holographic-blue/5 border border-neon-green/15 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyber-yellow" />
                <span className="text-[10px] font-mono uppercase text-slate-400">{t("revenueKpi")}</span>
              </div>
              <span className="text-sm font-mono font-bold text-cyber-yellow">${totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] font-mono text-slate-500">{t("totalArea")}: {totalArea.toFixed(0)} {t("rai")}</span>
              <span className="text-[9px] font-mono text-neon-green flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +12.3%
              </span>
            </div>
          </div>

          {/* Consolidated KPI AI interpretation */}
          <AIInterpretation
            dataType="Farm KPI Overview"
            dataValue={`${trees.toLocaleString()} trees · ${healthIdx}% health · ${formatCarbon(carbon)}`}
            context="Farm-wide KPI + Carbon + Revenue"
            zoneData={{
              totalTrees: trees,
              healthIndex: healthIdx,
              carbon: carbon,
              drones: drones,
              totalRevenue: totalRevenue,
              totalCredits: totalCredits,
              pestChains: mockPestEvidenceChains.length,
              highCritCount: highCritCount,
            }}
            interpretation={`[Farm Overview] Total ${trees.toLocaleString()} trees across ${totalArea.toFixed(0)} rai, health index ${healthIdx}% rated ${healthIdx > 90 ? "EXCELLENT" : healthIdx > 75 ? "GOOD" : "NEEDS ATTENTION"}.

[Carbon Portfolio] ${formatCarbon(carbon)} total sequestered. ${totalCredits} carbon credits generating $${totalRevenue.toLocaleString()} USD revenue. Month-over-month growth +12.3%.

[Pest Status] ${mockPestEvidenceChains.length} active evidence chains tracked. ${highCritCount} at HIGH/CRITICAL severity requiring priority treatment.

[Drone Fleet] ${drones} drones active. Multispectral imaging and IoT sensors confirm ${healthIdx > 90 ? "strong" : "moderate"} vegetation vitality.

Recommendation: Maintain current management protocols. Prioritize treatment of HIGH/CRITICAL pest cases. Carbon credit revenue trending positively — consider VCS certification expansion.`}
          />
        </GlassPanel>
      </div>

      {/* ── Scrollable Content Area ── */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1 xl:overflow-hidden">
        {/* ── Crop Distribution ── */}
        <GlassPanel
          title={`🌾 ${t("cropCarbonProfile")}`}
          collapsible
          scrollable={true}
          className="flex flex-col shrink-0 max-h-[45vh]"
        >
          <div className="space-y-1">
            {mockZoneCarbonDetails.map((zone) => {
              const cropKey = zone.cropType.split(' ')[0];
              const icon = CROP_ICONS[cropKey] ?? "🌿";
              const color = CROP_COLORS[cropKey] ?? "#ccc";
              const maxStock = Math.max(...mockZoneCarbonDetails.map(z => z.totalCarbonStock));
              const pct = (zone.totalCarbonStock / maxStock) * 100;
              return (
                <Link
                  href={`/zone/${zone.zoneId}`}
                  key={zone.zoneId}
                  className="flex items-center gap-2 p-1 rounded hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <span className="text-sm w-5 text-center group-hover:scale-110 transition-transform">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[9px] font-mono mb-0.5">
                      <span className="text-slate-400 truncate group-hover:text-neon-green transition-colors">{zone.zoneName}</span>
                      <span className="text-slate-300 shrink-0 ml-1">{zone.areaRai} {t("rai")}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 4px ${color}40` }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono w-10 text-right tabular-nums" style={{ color }}>{zone.totalCarbonStock.toFixed(0)}t</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                </Link>
              );
            })}
          </div>
        </GlassPanel>

        {/* ── Pest Alert Overview ── */}
        <GlassPanel
          title={`🐛 ${t("pestAlertOverview")}`}
          collapsible
          scrollable={true}
          className="flex flex-col shrink-0 max-h-[45vh]"
        >
          {/* Pest summary bar */}
          <div className="flex items-center gap-2 mb-2 p-1.5 bg-white/5 rounded border border-white/10 shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-alert-red animate-pulse" />
              <span className="text-[10px] font-mono text-alert-red font-bold">{highCritCount}</span>
              <span className="text-[9px] font-mono text-slate-500">{t("critical")}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] font-mono text-yellow-400 font-bold">{mockPestEvidenceChains.filter(c => c.severity === "MEDIUM").length}</span>
              <span className="text-[9px] font-mono text-slate-500">{t("medium")}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] font-mono text-slate-500 ml-auto">{mockPestEvidenceChains.length} {t("detected")}</span>
          </div>
          <div className="space-y-1.5">
            {mockPestEvidenceChains.map((chain) => (
              <div
                key={chain.id}
                className={`rounded p-2 border ${sevColor[chain.severity] ?? sevColor.LOW}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Bug className="w-3 h-3 shrink-0" />
                    <span className="text-[11px] font-mono font-semibold truncate">
                      {chain.pestName}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                    {chain.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className={statusColor[chain.status] ?? "text-slate-400"}>
                    {chain.status.toUpperCase()}
                  </span>
                  <span>|</span>
                  <span>{chain.affectedTreeIds.length} {t("trees")}</span>
                  <span>|</span>
                  <span className="truncate">{chain.affectedArea}</span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                  {chain.pestNameTH} — {chain.pathogen}
                </div>
              </div>
            ))}
          </div>
          <AIInterpretation
            dataType="Pest Overview"
            dataValue={`${mockPestEvidenceChains.length} active chains`}
            context="Farm-wide Pest Monitoring"
            zoneData={{
              totalChains: mockPestEvidenceChains.length,
              criticalCount: highCritCount,
              chains: mockPestEvidenceChains.map(c => ({ name: c.pestName, severity: c.severity, status: c.status, trees: c.affectedTreeIds.length })),
            }}
            interpretation={`Current pest/disease monitoring summary:\n\n${pestOverviewText}\n\nOverall risk assessment: ${mockPestEvidenceChains.some((c) => c.severity === "CRITICAL") ? "CRITICAL — immediate action required for Abnormal Leaf Fall case" : "ELEVATED — active monitoring and treatment ongoing"}. Evidence chains provide full traceability from drone detection to AI diagnosis.`}
          />
        </GlassPanel>

        {/* ── Risk Board ── */}
        <GlassPanel
          title={`⚠ ${t("riskBoardLabel")}`}
          collapsible
          scrollable={true}
          className="flex flex-col shrink-0 max-h-[45vh]"
        >
          <div className="space-y-1.5">
            <div className="bg-slate-900/50 rounded p-2 flex items-start gap-2 border border-alert-red/20">
              <ShieldAlert className="w-4 h-4 text-alert-red shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-mono font-medium text-alert-red">{t("zoneRiskLabel")}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5 leading-tight">{t("fungalScan")}</p>
              </div>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-alert-red/20 text-alert-red border border-alert-red/30 uppercase shrink-0">{t("critical")}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-900/50 rounded p-2 border border-white/5">
                <div className="flex items-center gap-1 mb-0.5">
                  <Radar className="w-3 h-3 text-alert-red" />
                  <span className="text-[9px] font-mono uppercase text-slate-400">{t("lodgingRisk")}</span>
                </div>
                <span className="text-sm font-mono font-semibold text-alert-red">
                  {data?.sugarcaneLodgingPercent ?? 12.4}%
                </span>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-alert-red/60 rounded-full" style={{ width: `${data?.sugarcaneLodgingPercent ?? 12.4}%` }} />
                </div>
              </div>

              <div className="bg-slate-900/50 rounded p-2 border border-white/5">
                <div className="flex items-center gap-1 mb-0.5">
                  <DollarSign className="w-3 h-3 text-yellow-400" />
                  <span className="text-[9px] font-mono uppercase text-slate-400">{t("estLoss")}</span>
                </div>
                <span className="text-[13px] font-mono font-semibold text-yellow-400">
                  ฿{(data?.estimatedLodgingLossTHB ?? 284000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <AIInterpretation
            dataType="Risk Assessment"
            dataValue={`${data?.sugarcaneLodgingPercent ?? 12.4}% lodging · ฿${(data?.estimatedLodgingLossTHB ?? 284000).toLocaleString()} loss`}
            context="Zone B-04 Risk + Lodging"
            zoneData={{
              lodgingPercent: data?.sugarcaneLodgingPercent ?? 12.4,
              estimatedLoss: data?.estimatedLodgingLossTHB ?? 284000,
              fungalAlert: true,
            }}
            interpretation={`[Zone B-04 Fungal Alert] Drone scan #442 has confirmed fungal spore presence in the northeast sector of Zone B-04. The detected strain is consistent with Colletotrichum falcatum (Red Rot), a common sugarcane pathogen in tropical regions. Current infection is localized to approximately 2.3 rai.

[Lodging Risk: ${data?.sugarcaneLodgingPercent ?? 12.4}%] The lodging probability has increased by 3.1% over the past 7 days, primarily driven by recent heavy rainfall (42mm in 48h) combined with above-average stalk height in this growth stage.

[Estimated Loss: ฿${(data?.estimatedLodgingLossTHB ?? 284000).toLocaleString()}] Projected yield loss from combined fungal damage and lodging could reach 8-12% of Zone B-04's total output.

Action Required:
1. Deploy fungicide spray via Drone H15-02 within 48 hours
2. Install temporary wind barriers on the eastern boundary
3. Schedule follow-up drone scan in 5 days`}
          />
        </GlassPanel>
      </div>
    </div>
  );
}
