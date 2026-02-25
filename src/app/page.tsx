"use client";

import MapCanvas from "@/components/3DMap/MapCanvas";
import TopBar from "@/components/Cockpit/TopBar";
import BottomBar from "@/components/Cockpit/BottomBar";
import LeftPanel from "@/components/Cockpit/LeftPanel";
import RightPanel from "@/components/Cockpit/RightPanel";
import TreeDetailsPanel from "@/components/HUD/TreeDetailsPanel";
import DroneCommandCenter from "@/components/Drone/DroneCommandCenter";
import DroneInspectionWorkflow from "@/components/Drone/DroneInspectionWorkflow";
import DroneInspectionHistory from "@/components/Drone/DroneInspectionHistory";
import AIChatPanel from "@/components/AI/AIChatPanel";
import CarbonCalculator from "@/components/Dashboard/CarbonCalculator";
import RubberManagement from "@/components/Rubber/RubberManagement";
import SugarcaneManagement from "@/components/Sugarcane/SugarcaneManagement";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const activeTab = useAppStore((s) => s.activeTab);
  const mobilePanelOpen = useAppStore((s) => s.mobilePanelOpen);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-dark-bg text-white scanline-overlay">
      {/* ── Full-screen 3D Satellite Map (底图) ── */}
      <div className="absolute inset-0 z-0">
        <MapCanvas />
      </div>

      {/* ── Tree Details Popup (on tree click) ── */}
      <TreeDetailsPanel />

      {/* ── Top Bar: Title, Clock, Weather, Language ── */}
      <TopBar />

      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="hidden lg:block absolute top-16 left-4 bottom-22 w-[22rem] z-10 pointer-events-none pb-20">
        <div className="pointer-events-auto h-full">
          {activeTab === "overview" && <LeftPanel />}

          {activeTab === "drone" && <DroneCommandCenter />}

          {activeTab === "analytics" && <CarbonCalculator />}

          {activeTab === "rubber" && <RubberManagement />}

          {activeTab === "sugarcane" && <SugarcaneManagement />}
        </div>
      </aside>

      {/* ── Right Sidebar (Desktop) ── */}
      <aside className="hidden lg:block absolute top-16 right-4 bottom-22 w-[22rem] z-10 pointer-events-none pb-20">
        <div className="pointer-events-auto h-full">
          {activeTab === "overview" && <RightPanel />}

          {activeTab === "drone" && (
            <div className="flex flex-col gap-3 h-full">
              <div className="h-1/2">
                <DroneInspectionWorkflow />
              </div>
              <div className="h-1/2">
                <DroneInspectionHistory />
              </div>
            </div>
          )}

          {activeTab === "analytics" && <AIChatPanel />}

          {activeTab === "rubber" && <RightPanel />}

          {activeTab === "sugarcane" && <RightPanel />}
        </div>
      </aside>

      {/* ── Mobile Data Drawer ── */}
      {mobilePanelOpen && (
        <div className="lg:hidden absolute top-[72px] bottom-[110px] left-2 right-2 z-10 pointer-events-auto bg-[#0B1120]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-y-auto p-3 flex flex-col gap-4 shadow-2xl safe-area-pb">
          {activeTab === "overview" && (
            <>
              <div className="flex-none h-[850px]"><LeftPanel /></div>
              <div className="flex-none h-[850px]"><RightPanel /></div>
            </>
          )}

          {activeTab === "drone" && (
            <>
              <div className="flex-none h-[450px]"><DroneCommandCenter /></div>
              <div className="flex flex-col gap-3 min-h-[600px] flex-none">
                <div className="flex-1">
                  <DroneInspectionWorkflow />
                </div>
                <div className="flex-1">
                  <DroneInspectionHistory />
                </div>
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <>
              <div className="flex-none h-[500px]"><CarbonCalculator /></div>
              <div className="flex-none h-[600px]">
                <AIChatPanel />
              </div>
            </>
          )}

          {activeTab === "rubber" && (
            <>
              <div className="flex-none h-[750px]"><RubberManagement /></div>
              <div className="flex-none h-[850px]"><RightPanel /></div>
            </>
          )}

          {activeTab === "sugarcane" && (
            <>
              <div className="flex-none h-[750px]"><SugarcaneManagement /></div>
              <div className="flex-none h-[850px]"><RightPanel /></div>
            </>
          )}
        </div>
      )}

      {/* ── Bottom Bar: Alert Ticker + Navigation Tabs ── */}
      <BottomBar />
    </main>
  );
}
