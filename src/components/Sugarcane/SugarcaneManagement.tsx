"use client";

import { useEffect, useMemo, useState } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import type { SugarcaneOverviewResponse } from "@/lib/api-types";
import { useTranslation } from "@/lib/i18n";
import { Sprout, BarChart3, AlertTriangle, Factory, TrendingUp, Truck, ChevronRight, ArrowUp } from "lucide-react";

const GROWTH_STAGES = ["germination", "tillering", "grand_growth", "maturation", "harvest"] as const;

const FALLBACK: SugarcaneOverviewResponse = {
  totalAreaRai: 370,
  varieties: [{ name: "KK3", areaRai: 150, ccs: 12.8, yieldTonPerRai: 14.2, stage: "maturation", daysToHarvest: 45 }],
  lodgingAnalysis: [{ zone: "Sector Alpha", areaRai: 125, lodgingPercent: 2, sugarLossCCS: 0.3, status: "normal" }],
  crushingSeason: { start: "2025-11-15", end: "2026-04-30", quotaDelivered: 85, nextDeliveryDays: 3, priceTonCCS: 1050, currency: "THB" },
  ndviHistory: [{ month: "Jan", score: 0.72 }],
  seasonRevenueTHB: 2850000,
  totalLodgingLossTHB: 180000,
  estimatedYieldTons: 5250,
  lastUpdate: new Date().toISOString(),
};

function ndviColor(val: number): string {
  if (val >= 0.7) return "bg-neon-green/70";
  if (val >= 0.5) return "bg-neon-green/40";
  if (val >= 0.3) return "bg-yellow-400/60";
  return "bg-alert-red/50";
}

export default function SugarcaneManagement() {
  const { locale } = useTranslation();
  const [data, setData] = useState<SugarcaneOverviewResponse>(FALLBACK);
  const [selectedVariety, setSelectedVariety] = useState(FALLBACK.varieties[0]?.name ?? "KK3");

  const txt = {
    title: { en: "Sugarcane Management", zh: "甘蔗管理", th: "จัดการอ้อย" },
    varietyInfo: { en: "Variety Info", zh: "品种信息", th: "ข้อมูลสายพันธุ์" },
    area: { en: "Area", zh: "面积", th: "พื้นที่" },
    ccs: { en: "CCS", zh: "含糖量", th: "ค่า CCS" },
    yield: { en: "Yield", zh: "产量", th: "ผลผลิต" },
    harvestIn: { en: "Harvest In", zh: "距收割", th: "เก็บเกี่ยวใน" },
    growthTracking: { en: "Growth Tracking", zh: "生长追踪", th: "ติดตามการเจริญเติบโต" },
    germination: { en: "Germination", zh: "萌芽", th: "งอก" },
    tillering: { en: "Tillering", zh: "分蘖", th: "แตกกอ" },
    grandGrowth: { en: "Grand Growth", zh: "旺长期", th: "เจริญเติบโตเร็ว" },
    maturation: { en: "Maturation", zh: "成熟期", th: "สุกแก่" },
    harvest: { en: "Harvest", zh: "收割", th: "เก็บเกี่ยว" },
    estYield: { en: "Est. Yield", zh: "预计产量", th: "ผลผลิตคาดการณ์" },
    ndviTimeline: { en: "NDVI Timeline", zh: "NDVI 时间线", th: "ไทม์ไลน์ NDVI" },
    lodgingAnalysis: { en: "Lodging Analysis", zh: "倒伏分析", th: "การวิเคราะห์การล้ม" },
    zone: { en: "Zone", zh: "区域", th: "โซน" },
    lodgingPct: { en: "Lodging %", zh: "倒伏占比", th: "เปอร์เซ็นต์ล้ม" },
    sugarLoss: { en: "Sugar Loss", zh: "糖分损失", th: "สูญเสียน้ำตาล" },
    totalLodgingImpact: { en: "Total Lodging Impact", zh: "倒伏总影响", th: "ผลกระทบรวมจากการล้ม" },
    estLoss: { en: "Est. loss", zh: "预计损失", th: "ความเสียหายคาดการณ์" },
    emergencyOrder: { en: "Generate Emergency Harvest Order", zh: "生成紧急收割指令", th: "สร้างคำสั่งเก็บเกี่ยวฉุกเฉิน" },
    crushingSeason: { en: "Crushing Season", zh: "榨季管理", th: "ฤดูหีบอ้อย" },
    crushingWindow: { en: "Crushing Window", zh: "榨季窗口", th: "ช่วงเวลาหีบอ้อย" },
    sugarQuota: { en: "Sugar Mill Quota", zh: "糖厂配额", th: "โควต้าโรงงานน้ำตาล" },
    delivered: { en: "delivered", zh: "已交付", th: "ส่งมอบแล้ว" },
    nextDelivery: { en: "Next Delivery", zh: "下次交付", th: "รอบส่งถัดไป" },
    priceTon: { en: "Price/Ton CCS", zh: "CCS 单吨价格", th: "ราคา/ตัน CCS" },
    updated: { en: "updated", zh: "已更新", th: "อัปเดตแล้ว" },
    seasonRevenue: { en: "Season Revenue Estimate", zh: "榨季收益预估", th: "รายได้คาดการณ์ทั้งฤดู" },
    days: { en: "days", zh: "天", th: "วัน" },
    unitRai: { en: "rai", zh: "莱", th: "ไร่" },
    unitTon: { en: "t", zh: "吨", th: "ตัน" },
    unitCurrency: { en: "THB", zh: "泰铢", th: "บาท" },
  } as const;

  const stageText: Record<(typeof GROWTH_STAGES)[number], string> = {
    germination: txt.germination[locale],
    tillering: txt.tillering[locale],
    grand_growth: txt.grandGrowth[locale],
    maturation: txt.maturation[locale],
    harvest: txt.harvest[locale],
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/sugarcane/overview", { cache: "no-store" });
        if (!res.ok) return;
        const apiData = (await res.json()) as SugarcaneOverviewResponse;
        setData(apiData);
        if (apiData.varieties[0]?.name) setSelectedVariety(apiData.varieties[0].name);
      } catch {
        // keep fallback
      }
    };
    load();
  }, []);

  const selected = data.varieties.find((v) => v.name === selectedVariety) ?? data.varieties[0];
  const currentStageIndex = useMemo(() => {
    const idx = GROWTH_STAGES.findIndex((s) => s === selected?.stage);
    return idx >= 0 ? idx : 3;
  }, [selected?.stage]);

  return (
    <GlassPanel title={txt.title[locale]} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="w-3.5 h-3.5 text-neon-green" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.varietyInfo[locale]}</h4>
          </div>

          <select value={selectedVariety} onChange={(e) => setSelectedVariety(e.target.value)} className="w-full bg-dark-bg/80 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-holographic-blue outline-none mb-2">
            {data.varieties.map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>

          {selected && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div><span className="text-gray-500">{txt.area[locale]}</span><div className="text-white">{selected.areaRai} {txt.unitRai[locale]}</div></div>
                <div><span className="text-gray-500">{txt.ccs[locale]}</span><div className="text-holographic-blue">{selected.ccs}%</div></div>
                <div><span className="text-gray-500">{txt.yield[locale]}</span><div className="text-neon-green">{selected.yieldTonPerRai} {txt.unitTon[locale]}/{txt.unitRai[locale]}</div></div>
                <div><span className="text-gray-500">{txt.harvestIn[locale]}</span><div className="text-neon-green">{selected.daysToHarvest}d</div></div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-holographic-blue" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.growthTracking[locale]}</h4>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-1">
              {GROWTH_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center flex-1 min-w-0">
                  <div className={`flex-1 h-2 rounded-full ${i < currentStageIndex ? "bg-neon-green" : i === currentStageIndex ? "bg-neon-green/60 animate-pulse" : "bg-white/10"}`} />
                  {i < GROWTH_STAGES.length - 1 && <ChevronRight className={`w-3 h-3 flex-shrink-0 ${i < currentStageIndex ? "text-neon-green" : "text-gray-600"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray-500">
              {GROWTH_STAGES.map((stage, i) => (
                <span key={stage} className={i === currentStageIndex ? "text-neon-green font-bold" : ""}>{stageText[stage]}</span>
              ))}
            </div>

            {selected && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-dark-bg/60 rounded p-2 border border-white/5 text-center"><div className="text-[9px] font-mono text-gray-500">{txt.ccs[locale]}</div><div className="text-sm font-mono font-bold text-neon-green flex items-center justify-center gap-1">{selected.ccs}% <ArrowUp className="w-3 h-3 text-neon-green" /></div></div>
                <div className="bg-dark-bg/60 rounded p-2 border border-white/5 text-center"><div className="text-[9px] font-mono text-gray-500">{txt.harvestIn[locale].toUpperCase()}</div><div className="text-sm font-mono font-bold text-holographic-blue">{selected.daysToHarvest}d</div></div>
                <div className="bg-dark-bg/60 rounded p-2 border border-white/5 text-center"><div className="text-[9px] font-mono text-gray-500">{txt.estYield[locale].toUpperCase()}</div><div className="text-sm font-mono font-bold text-holographic-blue">{selected.yieldTonPerRai} {txt.unitTon[locale]}/{txt.unitRai[locale]}</div></div>
              </div>
            )}

            <div>
              <div className="text-[9px] font-mono text-gray-500 mb-2">{txt.ndviTimeline[locale]}</div>
              <div className="space-y-1">
                {data.ndviHistory.map((m) => (
                  <div key={m.month} className="flex items-center gap-2">
                    <span className="text-[9px] font-mono w-6 text-gray-500">{m.month}</span>
                    <div className="flex-1 h-3 bg-white/5 rounded-sm overflow-hidden"><div className={`h-full rounded-sm ${ndviColor(m.score)}`} style={{ width: `${m.score * 100}%` }} /></div>
                    <span className="text-[9px] font-mono w-8 text-right text-gray-400">{m.score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-alert-red" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.lodgingAnalysis[locale]}</h4>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono">
                <thead><tr className="text-gray-500 border-b border-white/10"><th className="text-left py-1 font-normal">{txt.zone[locale]}</th><th className="text-right py-1 font-normal">{txt.lodgingPct[locale]}</th><th className="text-right py-1 font-normal">{txt.sugarLoss[locale]}</th></tr></thead>
                <tbody>
                  {data.lodgingAnalysis.map((zone) => (
                    <tr key={zone.zone} className="border-b border-white/5">
                      <td className="py-1.5 text-white">{zone.zone}</td>
                      <td className={`py-1.5 text-right ${zone.lodgingPercent > 10 ? "text-alert-red font-bold" : "text-gray-400"}`}>{zone.lodgingPercent}%</td>
                      <td className="py-1.5 text-right text-yellow-400">-{zone.sugarLossCCS}% CCS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-alert-red/10 border border-alert-red/20 rounded p-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-alert-red flex-shrink-0" />
              <div><div className="text-[10px] font-mono text-alert-red font-bold">{txt.totalLodgingImpact[locale]}</div><div className="text-[10px] font-mono text-gray-400">{txt.estLoss[locale]}: <span className="text-alert-red font-bold">{txt.unitCurrency[locale]} {data.totalLodgingLossTHB.toLocaleString()}</span></div></div>
            </div>

            {data.lodgingAnalysis.some((z) => z.lodgingPercent > 10) && (
              <button className="w-full py-2 bg-alert-red/20 border border-alert-red text-alert-red text-[10px] font-bold tracking-wider rounded hover:bg-alert-red/30 transition-all flex items-center justify-center gap-2"><Truck className="w-3.5 h-3.5" /> {txt.emergencyOrder[locale].toUpperCase()}</button>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Factory className="w-3.5 h-3.5 text-holographic-blue" />
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.crushingSeason[locale]}</h4>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between"><div className="text-[10px] font-mono text-gray-500">{txt.crushingWindow[locale].toUpperCase()}</div><div className="text-xs font-mono font-bold text-neon-green">{data.crushingSeason.start} to {data.crushingSeason.end}</div></div>
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-1"><span className="text-gray-400">{txt.sugarQuota[locale]}</span><span className="text-holographic-blue">{data.crushingSeason.quotaDelivered}% {txt.delivered[locale]}</span></div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-holographic-blue rounded-full scan-progress-bar transition-all" style={{ width: `${data.crushingSeason.quotaDelivered}%` }} /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-bg/60 rounded p-2 border border-white/5"><div className="text-[9px] font-mono text-gray-500">{txt.nextDelivery[locale].toUpperCase()}</div><div className="text-sm font-mono font-bold text-holographic-blue">{data.crushingSeason.nextDeliveryDays} {txt.days[locale]}</div></div>
              <div className="bg-dark-bg/60 rounded p-2 border border-white/5"><div className="text-[9px] font-mono text-gray-500">{txt.priceTon[locale].toUpperCase()}</div><div className="text-sm font-mono font-bold text-neon-green">{txt.unitCurrency[locale]} {data.crushingSeason.priceTonCCS.toLocaleString()}</div><div className="text-[9px] font-mono text-gray-500 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5 text-neon-green" /> {txt.updated[locale]}</div></div>
            </div>

            <div className="bg-dark-bg/60 rounded p-3 border border-neon-green/20 text-center"><div className="text-[9px] font-mono text-gray-500">{txt.seasonRevenue[locale].toUpperCase()}</div><div className="text-xl font-mono font-bold text-neon-green">{txt.unitCurrency[locale]} {data.seasonRevenueTHB.toLocaleString()}</div></div>
          </div>
        </section>
      </div>
    </GlassPanel>
  );
}
