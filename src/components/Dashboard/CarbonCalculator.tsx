"use client";

import { useState, useEffect, useRef } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import { useTranslation } from "@/lib/i18n";
import { formatCarbon } from "@/lib/units";
import { mockZoneCarbonDetails } from "@/lib/mockData";

const ZONE_COLORS = [
  "#00E676", "#00B0FF", "#FF3D00", "#FFD600", "#AA00FF", "#FF6D00",
];

function useCountUp(target: number, duration: number = 2000) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}

function FormulaVariable({
  label,
  tooltip,
  color,
}: {
  label: string;
  tooltip: string;
  color: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="formula-var font-mono font-bold px-1 rounded"
        style={{ color }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {label}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-dark-bg/95 border border-holographic-blue/30 rounded-lg text-[10px] text-gray-300 font-mono z-50 shadow-[0_0_20px_rgba(0,176,255,0.2)]">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-bg/95 border-b border-r border-holographic-blue/30 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}

export default function CarbonCalculator() {
  const { t, locale } = useTranslation();

  const txt = {
    totalCarbon: { en: "Total Carbon =", zh: "总碳量 =", th: "คาร์บอนรวม =" },
    sum: { en: "sum", zh: "求和", th: "ผลรวม" },
    count: { en: "Count", zh: "数量", th: "จำนวน" },
    volume: { en: "Volume", zh: "体积", th: "ปริมาตร" },
    countTip: {
      en: "Count: Total trees identified via LiDAR point cloud segmentation (14,205 individuals)",
      zh: "数量：通过 LiDAR 点云分割识别的树木总数（14,205 株）",
      th: "จำนวน: ต้นไม้ทั้งหมดที่ระบุจากการแบ่งกลุ่มจุด LiDAR (14,205 ต้น)",
    },
    volumeTip: {
      en: "Volume: Derived from LiDAR crown diameter and allometric height equations (m^3)",
      zh: "体积：由 LiDAR 冠幅直径与异速生长高度方程推算（m^3）",
      th: "ปริมาตร: คำนวณจากเส้นผ่านศูนย์กลางเรือนยอด LiDAR และสมการความสูง (m^3)",
    },
    factorTip: {
      en: "0.47: Wood density conversion factor (IPCC Tier-2 methodology for tropical hardwoods)",
      zh: "0.47：木材密度换算系数（IPCC Tier-2 热带硬木方法）",
      th: "0.47: ค่าสัมประสิทธิ์แปลงความหนาแน่นไม้ (วิธี IPCC Tier-2 สำหรับไม้เขตร้อน)",
    },
  } as const;

  // Derive KPI from mockZoneCarbonDetails (6 zones)
  const totalCarbonStock = mockZoneCarbonDetails.reduce((s, z) => s + z.totalCarbonStock, 0);
  const totalSeqRate = mockZoneCarbonDetails.reduce((s, z) => s + z.carbonSequestrationRate, 0);
  const totalCredits = mockZoneCarbonDetails.reduce((s, z) => s + z.totalCredits, 0);
  const totalRevenue = mockZoneCarbonDetails.reduce((s, z) => s + z.revenueUSD, 0);

  const totalCarbon = useCountUp(Math.round(totalCarbonStock), 2500);

  const zoneData = mockZoneCarbonDetails.map((z, i) => ({
    name: z.zoneName,
    cropType: z.cropType,
    carbon: z.totalCarbonStock,
    color: ZONE_COLORS[i % ZONE_COLORS.length],
  }));

  const maxCarbon = Math.max(...zoneData.map((z) => z.carbon), 1);

  return (
    <GlassPanel title={t("carbonSequestration")} className="h-full flex flex-col">
      <div className="flex flex-col gap-2 h-full overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
        {/* Total carbon stock — compact */}
        <div className="text-center py-1">
          <div className="text-2xl font-mono font-bold text-neon-green count-animate">{formatCarbon(totalCarbon)}</div>
          <div className="text-[9px] text-gray-500 font-mono">{t("totalCO2Sequestered")}</div>
        </div>

        {/* KPI row — compact 4-col */}
        <div className="grid grid-cols-4 gap-1">
          <div className="bg-white/5 rounded border border-neon-green/20 p-1.5 text-center">
            <div className="text-[8px] text-gray-500 font-mono uppercase">{t("stockKpi")}</div>
            <div className="text-xs font-mono font-bold text-neon-green">{totalCarbonStock.toFixed(0)}</div>
            <div className="text-[7px] text-gray-600">tCO2e</div>
          </div>
          <div className="bg-white/5 rounded border border-holographic-blue/20 p-1.5 text-center">
            <div className="text-[8px] text-gray-500 font-mono uppercase">{t("rateKpi")}</div>
            <div className="text-xs font-mono font-bold text-holographic-blue">{totalSeqRate.toFixed(0)}</div>
            <div className="text-[7px] text-gray-600">kg/day</div>
          </div>
          <div className="bg-white/5 rounded border border-cyber-yellow/20 p-1.5 text-center">
            <div className="text-[8px] text-gray-500 font-mono uppercase">{t("creditsLabel")}</div>
            <div className="text-xs font-mono font-bold text-cyber-yellow">{totalCredits}</div>
            <div className="text-[7px] text-gray-600">tCO2e</div>
          </div>
          <div className="bg-white/5 rounded border border-purple-500/20 p-1.5 text-center">
            <div className="text-[8px] text-gray-500 font-mono uppercase">{t("revenueKpi")}</div>
            <div className="text-xs font-mono font-bold text-purple-400">${totalRevenue.toLocaleString()}</div>
            <div className="text-[7px] text-gray-600">USD</div>
          </div>
        </div>

        {/* Biomass formula — compact */}
        <div className="bg-white/5 rounded border border-white/5 px-2 py-1.5 text-center">
          <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">{t("biomassFormula")}</div>
          <div className="text-[11px] flex items-center justify-center gap-0.5 flex-wrap">
            <span className="text-gray-400 font-mono">{txt.totalCarbon[locale]}</span>
            <span className="text-gray-500 font-mono">{txt.sum[locale]}</span>
            <span className="text-gray-500">(</span>
            <FormulaVariable label={txt.count[locale]} tooltip={txt.countTip[locale]} color="#00E676" />
            <span className="text-gray-500 mx-0.5">x</span>
            <FormulaVariable label={txt.volume[locale]} tooltip={txt.volumeTip[locale]} color="#00B0FF" />
            <span className="text-gray-500 mx-0.5">x</span>
            <FormulaVariable label="0.47" tooltip={txt.factorTip[locale]} color="#FF3D00" />
            <span className="text-gray-500">)</span>
          </div>
        </div>

        {/* Zone breakdown — compact */}
        <div className="space-y-1.5 flex-1">
          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{t("carbonByZone")}</div>
          {zoneData.map((zone) => {
            const pct = (zone.carbon / maxCarbon) * 100;
            return (
              <div key={zone.name}>
                <div className="flex justify-between text-[10px] font-mono mb-0.5">
                  <span className="text-gray-400 truncate">
                    {zone.name}
                    <span className="text-[8px] ml-1 opacity-70" style={{ color: zone.color }}>
                      {zone.cropType}
                    </span>
                  </span>
                  <span className="shrink-0 ml-1" style={{ color: zone.color }}>{zone.carbon.toFixed(1)}t</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: zone.color,
                      boxShadow: `0 0 6px ${zone.color}30`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
