"use client";

import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { AlertTriangle, ScanEye, LayoutDashboard, Radar as RadarIcon, BarChart3, TreePine, Sprout } from "lucide-react";

const TAB_KEYS = [
  { key: "overview" as const, labelKey: "overview", icon: LayoutDashboard },
  { key: "drone" as const, labelKey: "droneView", icon: RadarIcon },
  { key: "analytics" as const, labelKey: "analytics", icon: BarChart3 },
  { key: "rubber" as const, labelKey: "rubberMgmt", icon: TreePine },
  { key: "sugarcane" as const, labelKey: "sugarcaneMgmt", icon: Sprout },
];

export default function BottomBar() {
  const { t } = useTranslation();
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const algorithmLensActive = useAppStore((s) => s.algorithmLensActive);
  const setAlgorithmLensActive = useAppStore((s) => s.setAlgorithmLensActive);

  const alertMessages = [
    t("alert1"),
    t("alert2"),
    t("alert3"),
    t("alert4"),
    t("alert5"),
  ];
  const tickerContent = [...alertMessages, ...alertMessages];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      {/* Row 1 - Alert Ticker */}
      <div className="mx-4 mb-1 pointer-events-auto">
        <div className="flex items-center gap-3 bg-dark-bg/65 backdrop-blur border border-white/5 rounded-lg px-3 py-1.5">
          <div className="flex-shrink-0 flex items-center justify-center bg-alert-red/20 rounded-full px-2 py-1">
            <AlertTriangle className="w-4 h-4 text-alert-red" />
            <span className="text-[8px] font-mono text-alert-red ml-1 font-bold">LIVE</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex whitespace-nowrap animate-[ticker-scroll_60s_linear_infinite]">
              {tickerContent.map((msg, i) => (
                <span
                  key={i}
                  className="text-xs text-gray-400 mx-6"
                >
                  {msg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 - Navigation Tabs */}
      <div className="flex justify-center pb-3">
        <div className="pointer-events-auto flex items-center gap-0.5 bg-dark-bg/65 backdrop-blur border border-white/5 rounded-lg px-4 py-1.5">
          {TAB_KEYS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider transition-all rounded ${
                  isActive
                    ? "text-neon-green bg-neon-green/10 border border-neon-green/20"
                    : "text-gray-500 hover:text-neon-green hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-neon-green" : ""}`} />
                {t(tab.labelKey)}
              </button>
            );
          })}

          {/* Vertical Divider */}
          <div className="w-px h-5 bg-white/10 mx-2" />

          {/* Algorithm Lens Toggle */}
          <button
            onClick={() => setAlgorithmLensActive(!algorithmLensActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider rounded border transition-colors ${
              algorithmLensActive
                ? "bg-neon-green/20 border-neon-green text-neon-green"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-neon-green"
            }`}
          >
            <ScanEye className="w-3.5 h-3.5" />
            {t("algorithmLens")}
          </button>
        </div>
      </div>
    </div>
  );
}
