"use client";

import { useEffect, useMemo, useState } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import type { RubberOverviewResponse } from "@/lib/api-types";
import { useTranslation } from "@/lib/i18n";
import { Droplets, TreePine, Bug, TrendingUp, AlertTriangle, ChevronDown } from "lucide-react";

const TAPPING_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const SEVERITY_COLORS = {
  LOW: "text-neon-green border-neon-green/30 bg-neon-green/10",
  MEDIUM: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  HIGH: "text-alert-red border-alert-red/30 bg-alert-red/10",
};

const FALLBACK: RubberOverviewResponse = {
  totalTrees: 12450,
  totalAreaRai: 780,
  varieties: [
    { name: "RRIM 600", areaRai: 390, count: 6200, avgYieldKgPerTree: 1.5, tappingStatus: "open", tappingSystem: "S/2 d/2", drc: 32, cloneOrigin: "Malaysia" },
  ],
  currentPrice: { rss3: 58.5, fieldLatex: 42.3, currency: "THB", unit: "kg" },
  monthlyYield: [
    { month: "Jan", kgPerRai: 85 },
    { month: "Feb", kgPerRai: 92 },
    { month: "Mar", kgPerRai: 78 },
  ],
  diseases: [
    { name: "White Root Disease", pathogen: "Rigidoporus microporus", severity: "HIGH", affectedTrees: 45, symptoms: "Yellowing leaves.", treatment: "Apply fungicide." },
  ],
  carbonData: { totalTCO2e: 1240, perTreeAvg: 0.0996, todayCredits: 450, creditPriceTHB: 280 },
  lastUpdate: new Date().toISOString(),
};

export default function RubberManagement() {
  const { locale } = useTranslation();
  const [data, setData] = useState<RubberOverviewResponse>(FALLBACK);
  const [selectedVariety, setSelectedVariety] = useState(FALLBACK.varieties[0]?.name ?? "RRIM 600");
  const [expandedDisease, setExpandedDisease] = useState<number | null>(null);

  const txt = {
    title: { en: "Rubber Management", zh: "橡胶管理", th: "จัดการยางพารา" },
    varietyProfile: { en: "Variety Profile", zh: "品种档案", th: "ข้อมูลสายพันธุ์" },
    origin: { en: "Origin", zh: "来源", th: "แหล่งที่มา" },
    area: { en: "Area", zh: "面积", th: "พื้นที่" },
    tapping: { en: "Tapping", zh: "割胶", th: "การกรีด" },
    drc: { en: "DRC", zh: "干胶含量", th: "ค่า DRC" },
    tappingManagement: { en: "Tapping Management", zh: "割胶管理", th: "การจัดการกรีด" },
    tappingCal: { en: "S/2 d/2 Tapping Calendar (This Week)", zh: "S/2 d/2 割胶日历（本周）", th: "ปฏิทินกรีด S/2 d/2 (สัปดาห์นี้)" },
    tap: { en: "TAP", zh: "割", th: "กรีด" },
    monthlyYield: { en: "Monthly Latex Yield (kg/Rai)", zh: "月度产胶量（kg/莱）", th: "ผลผลิตน้ำยางรายเดือน (kg/ไร่)" },
    diseaseLibrary: { en: "Disease Library", zh: "病害库", th: "คลังโรคพืช" },
    affected: { en: "affected", zh: "影响", th: "ได้รับผลกระทบ" },
    symptoms: { en: "Symptoms", zh: "症状", th: "อาการ" },
    treatment: { en: "Treatment", zh: "处理建议", th: "แนวทางรักษา" },
    marketRevenue: { en: "Market & Revenue", zh: "市场与收益", th: "ตลาดและรายได้" },
    rubberSheet: { en: "Rubber Sheet RSS3", zh: "RSS3 胶片价格", th: "ราคายางแผ่น RSS3" },
    totalTrees: { en: "Total Trees", zh: "树木总数", th: "จำนวนต้นรวม" },
    low: { en: "LOW", zh: "低", th: "ต่ำ" },
    medium: { en: "MEDIUM", zh: "中", th: "กลาง" },
    high: { en: "HIGH", zh: "高", th: "สูง" },
    unitRai: { en: "rai", zh: "莱", th: "ไร่" },
    unitKg: { en: "kg", zh: "千克", th: "กก." },
    unitCurrency: { en: "THB", zh: "泰铢", th: "บาท" },
  } as const;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rubber/overview", { cache: "no-store" });
        if (!res.ok) return;
        const apiData = (await res.json()) as RubberOverviewResponse;
        setData(apiData);
        if (apiData.varieties[0]?.name) setSelectedVariety(apiData.varieties[0].name);
      } catch {
        // keep fallback
      }
    };

    load();
  }, []);

  const varieties = data.varieties;
  const selected = varieties.find((v) => v.name === selectedVariety) ?? varieties[0];
  const currentMonth = new Date().getMonth();

  const yieldMin = useMemo(() => Math.min(...data.monthlyYield.map((m) => m.kgPerRai)), [data.monthlyYield]);
  const yieldMax = useMemo(() => Math.max(...data.monthlyYield.map((m) => m.kgPerRai)), [data.monthlyYield]);

  const severityText = (s: "LOW" | "MEDIUM" | "HIGH") => {
    if (s === "LOW") return txt.low[locale];
    if (s === "MEDIUM") return txt.medium[locale];
    return txt.high[locale];
  };

  return (
    <GlassPanel title={txt.title[locale]} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <TreePine className="w-3.5 h-3.5 text-neon-green" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.varietyProfile[locale]}</h4>
          </div>

          <select value={selectedVariety} onChange={(e) => setSelectedVariety(e.target.value)} className="w-full bg-dark-bg/80 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-holographic-blue outline-none mb-2">
            {varieties.map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>

          {selected && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div><span className="text-gray-500">{txt.origin[locale]}</span><div className="text-white">{selected.cloneOrigin}</div></div>
                <div><span className="text-gray-500">{txt.area[locale]}</span><div className="text-white">{selected.areaRai} {txt.unitRai[locale]}</div></div>
                <div><span className="text-gray-500">{txt.tapping[locale]}</span><div className="text-holographic-blue">{selected.tappingSystem}</div></div>
                <div><span className="text-gray-500">{txt.drc[locale]}</span><div className="text-neon-green">{selected.drc}%</div></div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-3.5 h-3.5 text-holographic-blue" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.tappingManagement[locale]}</h4>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-2 mb-2">
            <div className="text-[9px] font-mono text-gray-500 mb-1">{txt.tappingCal[locale]}</div>
            <div className="grid grid-cols-7 gap-1">
              {TAPPING_DAYS.map((d, i) => {
                const isTapDay = i % 2 === 0;
                return (
                  <div key={i} className={`text-center rounded py-1 ${isTapDay ? "bg-neon-green/20 border border-neon-green/30" : "bg-white/5 border border-white/5"}`}>
                    <div className="text-[8px] font-mono text-gray-500">{d}</div>
                    <div className={`text-[10px] font-mono font-bold ${isTapDay ? "text-neon-green" : "text-gray-600"}`}>{isTapDay ? txt.tap[locale] : "-"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-2">
            <div className="text-[9px] font-mono text-gray-500 mb-2">{txt.monthlyYield[locale]}</div>
            <div className="space-y-1">
              {data.monthlyYield.map((m, i) => {
                const width = yieldMax > yieldMin ? ((m.kgPerRai - yieldMin) / (yieldMax - yieldMin)) * 100 : 100;
                return (
                  <div key={m.month} className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono w-6 ${i === currentMonth ? "text-neon-green font-bold" : "text-gray-500"}`}>{m.month}</span>
                    <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden"><div className="h-full rounded-sm bg-neon-green/60" style={{ width: `${Math.max(width, 8)}%` }} /></div>
                    <span className="text-[9px] font-mono w-8 text-right text-gray-400">{m.kgPerRai}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-3.5 h-3.5 text-alert-red" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.diseaseLibrary[locale]}</h4>
          </div>

          <div className="space-y-2">
            {data.diseases.map((disease, i) => (
              <div key={i} className={`border rounded-lg overflow-hidden ${SEVERITY_COLORS[disease.severity].split(" ").slice(1).join(" ")}`}>
                <button onClick={() => setExpandedDisease(expandedDisease === i ? null : i)} className="w-full p-2 flex items-center gap-2 text-left">
                  <AlertTriangle className={`w-3 h-3 flex-shrink-0 ${SEVERITY_COLORS[disease.severity].split(" ")[0]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{disease.name}</div>
                    <div className="text-[10px] text-gray-400"><span className="italic">{disease.pathogen}</span> | {txt.affected[locale]}: {disease.affectedTrees}</div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold ${SEVERITY_COLORS[disease.severity].split(" ")[0]}`}>{severityText(disease.severity)}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${expandedDisease === i ? "rotate-180" : ""}`} />
                </button>
                {expandedDisease === i && (
                  <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                    <div><div className="text-[9px] font-mono text-gray-500 mb-0.5">{txt.symptoms[locale]}</div><div className="text-[10px] text-gray-300">{disease.symptoms}</div></div>
                    <div><div className="text-[9px] font-mono text-neon-green mb-0.5">{txt.treatment[locale]}</div><div className="text-[10px] text-gray-300">{disease.treatment}</div></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.marketRevenue[locale]}</h4>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono text-gray-500">{txt.rubberSheet[locale]}</div>
                <div className="text-lg font-mono font-bold text-neon-green">{txt.unitCurrency[locale]} {data.currentPrice.rss3.toFixed(2)}/{txt.unitKg[locale]}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono text-gray-500">{txt.totalTrees[locale]}</div>
                <div className="text-xs font-mono text-neon-green">{data.totalTrees.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </GlassPanel>
  );
}
