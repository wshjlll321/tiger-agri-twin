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

      {/* ── Left Sidebar ── */}
      <aside className="absolute top-16 left-4 bottom-20 w-[22rem] z-10 pointer-events-none">
        <div className="pointer-events-auto h-full">
          {activeTab === "overview" && <LeftPanel />}

          {activeTab === "drone" && <DroneCommandCenter />}

          {activeTab === "analytics" && <CarbonCalculator />}

          {activeTab === "rubber" && <RubberManagement />}

          {activeTab === "sugarcane" && <SugarcaneManagement />}
        </div>
      </aside>

      {/* ── Right Sidebar ── */}
      <aside className="absolute top-16 right-4 bottom-20 w-[22rem] z-10 pointer-events-none">
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

      {/* ── Bottom Bar: Alert Ticker + Navigation Tabs ── */}
      <BottomBar />
    </main>
  );
}
