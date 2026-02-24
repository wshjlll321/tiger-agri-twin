"use client";

import { useEffect, useMemo, useState } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import type { DroneInspectionHistoryResponse } from "@/lib/api-types";
import { useTranslation } from "@/lib/i18n";
import { Filter, Search, AlertTriangle, CheckCircle2, PauseCircle } from "lucide-react";

type StatusFilter = "all" | "completed" | "in_progress" | "aborted";

const STATUS_STYLE: Record<string, string> = {
  completed: "text-neon-green border-neon-green/30 bg-neon-green/10",
  in_progress: "text-holographic-blue border-holographic-blue/30 bg-holographic-blue/10",
  aborted: "text-alert-red border-alert-red/30 bg-alert-red/10",
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
};

export default function DroneInspectionHistory() {
  const { locale } = useTranslation();
  const [data, setData] = useState<DroneInspectionHistoryResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const labels = {
    title: { en: "Inspection History", zh: "巡检历史", th: "ประวัติการตรวจ" },
    missions: { en: "MISSIONS", zh: "任务数", th: "ภารกิจ" },
    anomalies: { en: "ANOMALIES", zh: "异常数", th: "ความผิดปกติ" },
    avgHealth: { en: "AVG HEALTH", zh: "平均健康度", th: "สุขภาพเฉลี่ย" },
    searchPlaceholder: { en: "Search mission / zone / drone", zh: "搜索任务 / 区域 / 无人机", th: "ค้นหา ภารกิจ / โซน / โดรน" },
    all: { en: "All", zh: "全部", th: "ทั้งหมด" },
    completed: { en: "Completed", zh: "已完成", th: "เสร็จสิ้น" },
    inProgress: { en: "In Progress", zh: "进行中", th: "กำลังดำเนินการ" },
    aborted: { en: "Aborted", zh: "已终止", th: "ยกเลิกแล้ว" },
    trees: { en: "Trees", zh: "树木", th: "ต้นไม้" },
    anom: { en: "Anom.", zh: "异常", th: "ผิดปกติ" },
    area: { en: "Area", zh: "面积", th: "พื้นที่" },
    health: { en: "Health", zh: "健康", th: "สุขภาพ" },
    duration: { en: "Duration", zh: "时长", th: "ระยะเวลา" },
    needsReview: { en: "Needs review", zh: "需复核", th: "ต้องตรวจซ้ำ" },
    stable: { en: "Stable", zh: "稳定", th: "ปกติ" },
    noResult: { en: "No missions matched current filters.", zh: "当前筛选条件下没有任务。", th: "ไม่พบภารกิจตามเงื่อนไข" },
    unitRai: { en: "rai", zh: "莱", th: "ไร่" },
  } as const;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/drone/inspection/history", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as DroneInspectionHistoryResponse;
        if (!mounted) return;
        setData(payload);
      } catch {
        // Keep previous state on network errors
      }
    };

    load();
    const interval = setInterval(load, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredMissions = useMemo(() => {
    const all = data?.missions ?? [];
    return all.filter((m) => {
      const passStatus = statusFilter === "all" ? true : m.status === statusFilter;
      const q = query.trim().toLowerCase();
      const passQuery =
        q.length === 0 ||
        m.id.toLowerCase().includes(q) ||
        m.zone.toLowerCase().includes(q) ||
        m.drone.toLowerCase().includes(q);
      return passStatus && passQuery;
    });
  }, [data, statusFilter, query]);

  const totalAnomalies = filteredMissions.reduce((sum, m) => sum + m.anomalies, 0);
  const avgHealth =
    filteredMissions.length > 0
      ? Math.round(filteredMissions.reduce((sum, m) => sum + m.healthScore, 0) / filteredMissions.length)
      : 0;

  return (
    <GlassPanel title={labels.title[locale]} className="h-full flex flex-col">
      <div className="flex flex-col gap-3 h-full min-h-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-white/10 rounded p-2">
            <div className="text-[9px] font-mono text-gray-500">{labels.missions[locale]}</div>
            <div className="text-sm font-mono text-neon-green font-bold">{filteredMissions.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded p-2">
            <div className="text-[9px] font-mono text-gray-500">{labels.anomalies[locale]}</div>
            <div className="text-sm font-mono text-alert-red font-bold">{totalAnomalies}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded p-2">
            <div className="text-[9px] font-mono text-gray-500">{labels.avgHealth[locale]}</div>
            <div className="text-sm font-mono text-holographic-blue font-bold">{avgHealth}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.searchPlaceholder[locale]}
              className="w-full bg-white/5 border border-white/10 rounded px-7 py-1.5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-holographic-blue/50"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-holographic-blue/50"
            >
              <option value="all">{labels.all[locale]}</option>
              <option value="completed">{labels.completed[locale]}</option>
              <option value="in_progress">{labels.inProgress[locale]}</option>
              <option value="aborted">{labels.aborted[locale]}</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-2">
          {filteredMissions.map((mission) => {
            const statusStyle = STATUS_STYLE[mission.status] ?? STATUS_STYLE.pending;
            const isRisk = mission.anomalies >= 10 || mission.healthScore < 80;
            return (
              <div key={mission.id} className="bg-white/5 border border-white/10 rounded-lg p-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-white">{mission.id}</div>
                    <div className="text-[10px] text-gray-400">
                      {mission.date} | {mission.zone} | {mission.drone}
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${statusStyle}`}>{mission.status}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                  <div><div className="text-gray-500">{labels.trees[locale]}</div><div className="text-holographic-blue">{mission.treesFound}</div></div>
                  <div><div className="text-gray-500">{labels.anom[locale]}</div><div className={mission.anomalies > 0 ? "text-alert-red" : "text-neon-green"}>{mission.anomalies}</div></div>
                  <div><div className="text-gray-500">{labels.area[locale]}</div><div className="text-gray-300">{mission.areaRai} {labels.unitRai[locale]}</div></div>
                  <div><div className="text-gray-500">{labels.health[locale]}</div><div className={mission.healthScore < 80 ? "text-alert-red" : "text-neon-green"}>{mission.healthScore}%</div></div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <div className="text-gray-500">{labels.duration[locale]}: <span className="text-gray-300">{mission.duration}</span></div>
                  <div className="flex items-center gap-1">
                    {mission.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> : mission.status === "aborted" ? <PauseCircle className="w-3.5 h-3.5 text-alert-red" /> : <AlertTriangle className="w-3.5 h-3.5 text-holographic-blue" />}
                    <span className={isRisk ? "text-alert-red" : "text-gray-400"}>{isRisk ? labels.needsReview[locale] : labels.stable[locale]}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMissions.length === 0 && <div className="text-xs text-gray-500 text-center py-6">{labels.noResult[locale]}</div>}
        </div>
      </div>
    </GlassPanel>
  );
}
