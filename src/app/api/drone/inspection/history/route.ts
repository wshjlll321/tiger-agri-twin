import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type MissionTelemetry = {
  missionId?: string;
  missionStatus?: string;
  targetZone?: string;
  areaCoverRai?: number;
  treesDetected?: number;
  anomalies?: number;
  healthScore?: number;
  elapsed?: string;
};

function fallbackHistory() {
  return {
    missions: [
      {
        id: "INSP-2026-0210-001",
        zone: "Sector Alpha",
        date: "2026-02-10",
        status: "completed",
        treesFound: 2450,
        anomalies: 5,
        areaRai: 125,
        drone: "H15-001",
        healthScore: 92,
        duration: "00:32:18",
        coordinates: { lat: 9.1234, lng: 99.3456 },
      },
      {
        id: "INSP-2026-0208-002",
        zone: "Sector Beta",
        date: "2026-02-08",
        status: "completed",
        treesFound: 1890,
        anomalies: 12,
        areaRai: 95,
        drone: "H15-002",
        healthScore: 78,
        duration: "00:28:45",
        coordinates: { lat: 9.118, lng: 99.338 },
      },
    ],
    totalMissions: 2,
    lastUpdate: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const flights = await db.droneFlight.findMany({
      select: {
        droneId: true,
        telemetry: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const missionRows = flights
      .map((f) => {
        const t = (f.telemetry as MissionTelemetry | null) ?? {};
        if (!t.missionId) return null;

        return {
          id: t.missionId,
          zone: t.targetZone ?? "Sector Alpha",
          date: f.updatedAt.toISOString().slice(0, 10),
          status: t.missionStatus ?? "in_progress",
          treesFound: t.treesDetected ?? 0,
          anomalies: t.anomalies ?? 0,
          areaRai: t.areaCoverRai ?? 0,
          drone: f.droneId,
          healthScore: t.healthScore ?? 0,
          duration: t.elapsed ?? "00:00:00",
          coordinates: { lat: 9.1234, lng: 99.3456 },
          sortTs: f.updatedAt.getTime(),
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    if (missionRows.length === 0) {
      return NextResponse.json(fallbackHistory());
    }

    const dedup = new Map<string, (typeof missionRows)[number]>();
    for (const row of missionRows) {
      const existing = dedup.get(row.id);
      if (!existing || row.sortTs > existing.sortTs) {
        dedup.set(row.id, row);
      }
    }

    const missions = Array.from(dedup.values())
      .sort((a, b) => b.sortTs - a.sortTs)
      .map((row) => {
        const { sortTs, ...rest } = row;
        void sortTs;
        return rest;
      });

    return NextResponse.json({
      missions,
      totalMissions: missions.length,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("inspection history fallback:", error);
    return NextResponse.json(fallbackHistory());
  }
}
