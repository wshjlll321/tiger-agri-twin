"use client";

import { useEffect, useState } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import type { DroneStatusResponse } from "@/lib/api-types";

const STATUS_COLORS = {
  active: "bg-neon-green",
  charging: "bg-yellow-400",
  maintenance: "bg-alert-red",
};

const AR_BOXES = [
  { top: "18%", left: "12%", w: "60px", h: "50px", delay: "0s" },
  { top: "30%", left: "55%", w: "70px", h: "55px", delay: "0.5s" },
  { top: "55%", left: "30%", w: "50px", h: "45px", delay: "1s" },
  { top: "42%", left: "72%", w: "65px", h: "60px", delay: "1.5s" },
  { top: "68%", left: "58%", w: "55px", h: "48px", delay: "0.3s" },
];

export default function DroneCommandCenter() {
  const { droneStatus, setDroneStatus } = useAppStore();
  const { t, locale } = useTranslation();
  const [fleetData, setFleetData] = useState<DroneStatusResponse | null>(null);

  const txt = {
    rec: { en: "REC", zh: "录制", th: "บันทึก" },
    lat: { en: "LAT", zh: "纬度", th: "ละติจูด" },
    lng: { en: "LNG", zh: "经度", th: "ลองจิจูด" },
  } as const;

  const STATUS_LABELS: Record<string, string> = {
    active: t("active"),
    charging: t("charging"),
    maintenance: t("maintenance"),
  };

  useEffect(() => {
    let mounted = true;

    const loadDroneStatus = async () => {
      try {
        const res = await fetch("/api/drone/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as DroneStatusResponse;
        if (!mounted) return;

        setFleetData(data);
        const activeDrone = data.drones.find((d) => d.status === "active") ?? data.drones[0];
        if (activeDrone) {
          setDroneStatus({
            battery: activeDrone.battery,
            altitude: activeDrone.altitude,
            speed: activeDrone.speed,
            scanProgress: activeDrone.scanProgress,
            lat: activeDrone.lat,
            lng: activeDrone.lng,
          });
        }
      } catch {
        // Keep last status when API is unavailable
      }
    };

    loadDroneStatus();
    const interval = setInterval(loadDroneStatus, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [setDroneStatus]);

  const drones = fleetData?.drones ?? [];

  const batteryColor =
    droneStatus.battery > 50
      ? "bg-neon-green"
      : droneStatus.battery > 20
        ? "bg-yellow-400"
        : "bg-alert-red";

  const displayTime = new Date().toLocaleTimeString();

  return (
    <GlassPanel title={t("droneCommandCenter")} className="h-full flex flex-col">
      <div className="flex flex-col gap-3 h-full overflow-y-auto">
        <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video flex-shrink-0">
          <div className="absolute inset-0 fpv-feed" />
          <div className="absolute inset-0 fpv-scanlines" />

          {AR_BOXES.map((box, i) => (
            <div
              key={i}
              className="absolute border-2 pulse-border rounded-sm"
              style={{
                top: box.top,
                left: box.left,
                width: box.w,
                height: box.h,
                animationDelay: box.delay,
              }}
            >
              <span className="absolute -top-4 left-0 text-[8px] font-mono text-neon-green">
                OBJ-{String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-12 h-12">
              <div className="absolute top-0 left-1/2 -translate-x-px w-0.5 h-3 bg-neon-green/60" />
              <div className="absolute bottom-0 left-1/2 -translate-x-px w-0.5 h-3 bg-neon-green/60" />
              <div className="absolute left-0 top-1/2 -translate-y-px w-3 h-0.5 bg-neon-green/60" />
              <div className="absolute right-0 top-1/2 -translate-y-px w-3 h-0.5 bg-neon-green/60" />
              <div className="absolute inset-[35%] border border-neon-green/40 rounded-full" />
            </div>
          </div>

          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-alert-red animate-pulse" />
            <span className="text-[10px] font-mono text-alert-red">{txt.rec[locale]}</span>
          </div>

          <div className="absolute top-2 right-2 text-[10px] font-mono text-white/60">{displayTime}</div>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/5 p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <div>
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  {locale === "zh" ? "当前巡检区域" : locale === "th" ? "โซนตรวจปัจจุบัน" : "Patrol Zone"}
                </div>
                <div className="text-xs font-medium text-neon-green">Rubber Zone</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {locale === "zh" ? "已扫描面积" : locale === "th" ? "พื้นที่สแกน" : "Scanned"}
              </div>
              <div className="text-xs font-mono text-holographic-blue">
                {(20 * droneStatus.scanProgress / 100).toFixed(1)} / 20 {locale === "zh" ? "莱" : locale === "th" ? "ไร่" : "Rai"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-gray-500">{t("altitude")}</span>
              <div className="text-holographic-blue">{droneStatus.altitude.toFixed(0)}m</div>
            </div>
            <div>
              <span className="text-gray-500">{t("speed")}</span>
              <div className="text-holographic-blue">{droneStatus.speed.toFixed(1)} m/s</div>
            </div>
            <div>
              <span className="text-gray-500">{t("battery")}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-neon-green">{droneStatus.battery}%</span>
                <div className="w-10 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${batteryColor}`} style={{ width: `${droneStatus.battery}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-2">
            <div>
              <span className="text-gray-500">{txt.lat[locale]}</span>
              <div className="text-white/80">{droneStatus.lat.toFixed(4)} N</div>
            </div>
            <div>
              <span className="text-gray-500">{txt.lng[locale]}</span>
              <div className="text-white/80">{droneStatus.lng.toFixed(4)} E</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-gray-500">{t("scanProgress").toUpperCase()}</span>
              <span className="text-holographic-blue">{droneStatus.scanProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-holographic-blue rounded-full scan-progress-bar transition-all duration-300"
                style={{ width: `${droneStatus.scanProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-shrink-0">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{t("fleetStatus")}</div>
          {drones.map((drone) => (
            <div key={drone.id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${STATUS_COLORS[drone.status]} ${drone.status === "active" ? "animate-pulse" : ""}`}
                />
                <div>
                  <div className="text-xs font-medium">{drone.id}</div>
                  <div className="text-[10px] font-mono text-gray-500">{drone.currentZone}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-gray-400">{STATUS_LABELS[drone.status]}</div>
                <div className="text-[9px] text-gray-500">BAT {drone.battery}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

