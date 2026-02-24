"use client";

import GlassPanel from "@/components/HUD/GlassPanel";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { AlertTriangle, BarChart3, ClipboardList } from "lucide-react";

export default function ZoneDetailsPanel() {
  const { selectedZoneBusiness } = useAppStore();
  const { locale } = useTranslation();

  const txt = {
    title: { en: "Zone Operations", zh: "地块业务联动", th: "ปฏิบัติการแปลง" },
    empty: { en: "Click a zone on the map to view mission linkage.", zh: "点击地图地块查看任务联动。", th: "คลิกแปลงบนแผนที่เพื่อดูข้อมูลเชื่อมโยง" },
    missionCount: { en: "Mission Count", zh: "任务数量", th: "จำนวนภารกิจ" },
    yield: { en: "Latest Yield", zh: "最新产量", th: "ผลผลิตล่าสุด" },
    alertTrend: { en: "Alert Trend (7d)", zh: "告警趋势（7天）", th: "แนวโน้มแจ้งเตือน (7 วัน)" },
    recentMissions: { en: "Recent Missions", zh: "近期任务", th: "ภารกิจล่าสุด" },
    anomalies: { en: "Anomalies", zh: "异常", th: "ความผิดปกติ" },
    health: { en: "Health", zh: "健康度", th: "สุขภาพ" },
    unitTonRai: { en: "t/rai", zh: "吨/莱", th: "ตัน/ไร่" },
  } as const;

  const maxAlert = Math.max(...(selectedZoneBusiness?.alertsTrend ?? [1]), 1);

  return (
    <GlassPanel title={txt.title[locale]} className="h-full flex flex-col">
      {!selectedZoneBusiness ? (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">
          {txt.empty[locale]}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
          <div className="bg-white/5 border border-white/10 rounded p-2">
            <div className="text-xs font-bold text-holographic-blue">{selectedZoneBusiness.zoneName}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-gray-500">{txt.missionCount[locale]}</div>
                <div className="text-sm font-mono text-neon-green">{selectedZoneBusiness.missionCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500">{txt.yield[locale]}</div>
                <div className="text-sm font-mono text-holographic-blue">{selectedZoneBusiness.latestYieldTonPerRai} {txt.unitTonRai[locale]}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded p-2">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
              <BarChart3 className="w-3 h-3" />
              {txt.alertTrend[locale]}
            </div>
            <div className="flex items-end gap-1 h-14">
              {selectedZoneBusiness.alertsTrend.map((v, i) => (
                <div key={i} className="flex-1 rounded-t bg-alert-red/70 border border-alert-red/40" style={{ height: `${Math.max((v / maxAlert) * 100, 8)}%` }} />
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded p-2">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
              <ClipboardList className="w-3 h-3" />
              {txt.recentMissions[locale]}
            </div>
            <div className="space-y-2">
              {selectedZoneBusiness.recentMissions.map((m) => (
                <div key={m.missionId} className="border border-white/10 rounded p-2">
                  <div className="text-[10px] text-white font-mono">{m.missionId}</div>
                  <div className="text-[10px] text-gray-400">{m.date}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">{txt.anomalies[locale]}: <span className="text-alert-red">{m.anomalies}</span></span>
                    <span className="text-gray-400">{txt.health[locale]}: <span className="text-neon-green">{m.healthScore}%</span></span>
                  </div>
                  {m.anomalies >= 8 && (
                    <div className="mt-1 flex items-center gap-1 text-[9px] text-alert-red">
                      <AlertTriangle className="w-3 h-3" />
                      High risk
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

