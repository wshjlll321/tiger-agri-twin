import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DroneStatusResponse } from "@/lib/api-types";
import { getLatestMission } from "@/lib/server/drone-mission";

type Telemetry = {
  battery?: number;
  speed?: number;
  altitude?: number;
  lat?: number;
  lng?: number;
};

function fallbackStatus(): DroneStatusResponse {
  return {
    drones: [
      {
        id: "H15-001",
        status: "active",
        battery: 68,
        altitude: 120,
        speed: 15.2,
        lat: 9.1234,
        lng: 99.3456,
        scanProgress: 42,
        currentZone: "Sector Alpha",
      },
      {
        id: "H15-002",
        status: "charging",
        battery: 25,
        altitude: 0,
        speed: 0,
        lat: 9.11,
        lng: 99.34,
        scanProgress: 0,
        currentZone: "Base Station",
      },
      {
        id: "H15-003",
        status: "maintenance",
        battery: 0,
        altitude: 0,
        speed: 0,
        lat: 9.11,
        lng: 99.34,
        scanProgress: 0,
        currentZone: "Hangar",
      },
    ],
    totalScanned: 1250,
    totalArea: 3000,
    lastUpdate: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const flights = await db.droneFlight.findMany({
      select: {
        droneId: true,
        status: true,
        telemetry: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    if (flights.length === 0) {
      return NextResponse.json(fallbackStatus());
    }

    const mission = getLatestMission();
    const step1 = mission.steps.find((s) => s.step === 1)?.data ?? {};
    const step3 = mission.steps.find((s) => s.step === 3)?.data ?? {};
    const missionZone = String((step1 as { targetZone?: string }).targetZone ?? "Sector Alpha");
    const missionProgress = Number((step3 as { progress?: number }).progress ?? 0);

    const uniqueByDrone = new Map<string, typeof flights[number]>();
    for (const flight of flights) {
      if (!uniqueByDrone.has(flight.droneId)) {
        uniqueByDrone.set(flight.droneId, flight);
      }
    }
    const uniqueFlights = Array.from(uniqueByDrone.values());

    const drones = uniqueFlights.map((f, i) => {
      const telemetry = (f.telemetry as Telemetry | null) ?? {};
      const missionStatus = (telemetry as { missionStatus?: string }).missionStatus;
      const mappedStatus =
        missionStatus === "aborted"
          ? "maintenance"
          : missionStatus === "completed"
            ? "charging"
            : f.status === "ACTIVE"
              ? "active"
              : f.status === "CHARGING"
                ? "charging"
                : "maintenance";

      return {
        id: f.droneId,
        status: mappedStatus as "active" | "charging" | "maintenance",
        battery: Math.round(telemetry.battery ?? (mappedStatus === "active" ? 68 : mappedStatus === "charging" ? 35 : 0)),
        altitude: Number(telemetry.altitude ?? (mappedStatus === "active" ? 120 : 0)),
        speed: Number(telemetry.speed ?? (mappedStatus === "active" ? 15 : 0)),
        lat: Number(telemetry.lat ?? 9.1234 - i * 0.01),
        lng: Number(telemetry.lng ?? 99.3456 - i * 0.01),
        scanProgress: mappedStatus === "active" ? Number((telemetry as { scanProgress?: number }).scanProgress ?? missionProgress) : 0,
        currentZone:
          (telemetry as { targetZone?: string }).targetZone ??
          (mappedStatus === "active" ? missionZone : mappedStatus === "charging" ? "Base Station" : "Hangar"),
      };
    });

    const totalScanned = Math.round((missionProgress / 100) * Number((step3 as { totalRai?: number }).totalRai ?? 125));
    const totalArea = Number((step3 as { totalRai?: number }).totalRai ?? 125);

    const data: DroneStatusResponse = {
      drones,
      totalScanned,
      totalArea,
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("drone status fallback:", error);
    return NextResponse.json(fallbackStatus());
  }
}
