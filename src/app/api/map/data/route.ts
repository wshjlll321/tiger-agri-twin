import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { MapCoverageCell, MapDataResponse, MapDiseaseHotspot } from "@/lib/api-types";
import { buildSimMapData } from "@/lib/server/simulated-data";

function toMapPosition(location: unknown): [number, number, number] {
  const loc = location as { coordinates?: [number, number] } | null;
  if (!loc?.coordinates || loc.coordinates.length !== 2) return [0, 0, 0];
  const [lng, lat] = loc.coordinates;
  return [Number((lng * 100 - 9900).toFixed(2)), 0, Number((lat * 100 - 900).toFixed(2))];
}

function deriveZonePositions(plots: Array<{ boundary: unknown }>) {
  const raw = plots.map((plot, i) => {
    const boundary = plot.boundary as { center?: [number, number] } | null;
    if (boundary?.center && boundary.center.length === 2) {
      return { x: boundary.center[0], z: boundary.center[1], hasGeo: true };
    }
    return { x: (i % 3) - 1, z: Math.floor(i / 3), hasGeo: false };
  });

  const hasGeo = raw.some((p) => p.hasGeo);
  if (!hasGeo) {
    return raw.map((p, i) => ({ x: (i % 3 - 1) * 70, z: (Math.floor(i / 3) - 1) * 70 }));
  }

  const xs = raw.map((p) => p.x);
  const zs = raw.map((p) => p.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const spanX = Math.max(maxX - minX, 0.0001);
  const spanZ = Math.max(maxZ - minZ, 0.0001);

  const mapMin = -100;
  const mapMax = 100;
  const spread = raw.map((p) => ({
    x: mapMin + ((p.x - minX) / spanX) * (mapMax - mapMin),
    z: mapMin + ((p.z - minZ) / spanZ) * (mapMax - mapMin),
  }));

  const minDist = 42;
  for (let i = 0; i < spread.length; i += 1) {
    for (let j = i + 1; j < spread.length; j += 1) {
      const dx = spread[j].x - spread[i].x;
      const dz = spread[j].z - spread[i].z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0 && dist < minDist) {
        const push = (minDist - dist) / 2;
        const ux = dx / dist;
        const uz = dz / dist;
        spread[i].x -= ux * push;
        spread[i].z -= uz * push;
        spread[j].x += ux * push;
        spread[j].z += uz * push;
      }
    }
  }

  return spread.map((p) => ({
    x: Number(Math.max(mapMin, Math.min(mapMax, p.x)).toFixed(2)),
    z: Number(Math.max(mapMin, Math.min(mapMax, p.z)).toFixed(2)),
  }));
}

export async function GET() {
  try {
    const [trees, plots, flight] = await Promise.all([
      db.rubberTree.findMany({
        select: {
          id: true,
          age: true,
          carbonStock: true,
          healthStatus: true,
          lastInspectionDate: true,
          location: true,
        },
        take: 200,
      }),
      db.sugarcanePlot.findMany({
        select: {
          id: true,
          ndviScore: true,
          lodgingStatus: true,
          boundary: true,
        },
        take: 20,
      }),
      db.droneFlight.findFirst({
        orderBy: { updatedAt: "desc" },
        select: {
          droneId: true,
          status: true,
          flightPath: true,
        },
      }),
    ]);

    if (trees.length === 0 || plots.length === 0) {
      return NextResponse.json(buildSimMapData());
    }

    const zonePositions = deriveZonePositions(plots);

    const response: MapDataResponse = {
      trees: trees.map((tree) => ({
        id: tree.id,
        position: toMapPosition(tree.location ?? null),
        health: tree.healthStatus === "CRITICAL" ? "critical" : "healthy",
        carbonStock: Number(tree.carbonStock.toFixed(1)),
        age: Math.round(tree.age),
        lastScanned: tree.lastInspectionDate.toISOString(),
      })),
      zones: plots.map((plot, index) => {
        const boundary = plot.boundary as { areaRai?: number; center?: [number, number] } | null;
        const areaRai = boundary?.areaRai ?? 80;
        const posX = zonePositions[index]?.x ?? (index % 3 - 1) * 70;
        const posZ = zonePositions[index]?.z ?? (Math.floor(index / 3) - 1) * 70;
        return {
          id: plot.id,
          name: `Sector ${String.fromCharCode(65 + index)}`,
          position: [Number(posX.toFixed(2)), 0.1, Number(posZ.toFixed(2))] as [number, number, number],
          size: [Math.max(20, Math.sqrt(areaRai) * 3.8), Math.max(20, Math.sqrt(areaRai) * 3.2)] as [number, number],
          ndvi: Number(plot.ndviScore.toFixed(2)),
          lodgingStatus: plot.lodgingStatus,
          areaRai: Number(areaRai.toFixed(1)),
          lodgingPercent: plot.lodgingStatus ? 12.5 : 2.8,
          sugarLossCCS: plot.lodgingStatus ? 2.4 : 0.4,
        };
      }),
      zoneBusiness: plots.map((plot, index) => {
        const boundary = plot.boundary as { areaRai?: number } | null;
        const areaRai = boundary?.areaRai ?? 80;
        const zoneId = plot.id;
        const zoneName = `Sector ${String.fromCharCode(65 + index)}`;
        const missionBase = 8 + (index % 3) * 3;
        const alertsBase = plot.lodgingStatus ? [3, 4, 6, 7, 8, 10, 12] : [1, 1, 2, 2, 2, 3, 3];
        return {
          zoneId,
          zoneName,
          missionCount: missionBase,
          latestYieldTonPerRai: Number((14 + (areaRai % 5) * 0.6 - (plot.lodgingStatus ? 1.4 : 0)).toFixed(1)),
          alertsTrend: alertsBase,
          recentMissions: [
            {
              missionId: `INSP-2026-02${12 - index}-001`,
              date: "2026-02-12",
              status: "completed" as const,
              anomalies: plot.lodgingStatus ? 9 : 2,
              healthScore: plot.lodgingStatus ? 77 : 92,
            },
            {
              missionId: `INSP-2026-02${11 - index}-002`,
              date: "2026-02-11",
              status: "completed" as const,
              anomalies: plot.lodgingStatus ? 7 : 1,
              healthScore: plot.lodgingStatus ? 80 : 93,
            },
          ],
        };
      }),
      diseaseHotspots: plots.flatMap<MapDiseaseHotspot>((plot, index) => {
        const zoneId = plot.id;
        const posX = zonePositions[index]?.x ?? (index % 3 - 1) * 70;
        const posZ = zonePositions[index]?.z ?? (Math.floor(index / 3) - 1) * 70;
        if (plot.lodgingStatus) {
          return [
            { id: `HS-${index}-1`, zoneId, position: [posX - 8, 0.4, posZ + 3] as [number, number, number], severity: "high" as const, score: 0.9 },
            { id: `HS-${index}-2`, zoneId, position: [posX + 5, 0.4, posZ - 4] as [number, number, number], severity: "medium" as const, score: 0.72 },
          ];
        }
        return [
          { id: `HS-${index}-1`, zoneId, position: [posX + 2, 0.4, posZ + 2] as [number, number, number], severity: "low" as const, score: 0.48 },
        ];
      }),
      coverageHeatmap: plots.flatMap<MapCoverageCell>((plot, index) => {
        const zoneId = plot.id;
        const posX = zonePositions[index]?.x ?? (index % 3 - 1) * 70;
        const posZ = zonePositions[index]?.z ?? (Math.floor(index / 3) - 1) * 70;
        return [
          { id: `CV-${index}-1`, zoneId, position: [posX - 6, 0.14, posZ - 2] as [number, number, number], intensity: plot.lodgingStatus ? 0.92 : 0.62, radius: 14 },
          { id: `CV-${index}-2`, zoneId, position: [posX + 7, 0.14, posZ + 4] as [number, number, number], intensity: plot.lodgingStatus ? 0.84 : 0.54, radius: 12 },
        ];
      }),
      dronePath: {
        id: flight?.droneId ?? "DRONE-01",
        status: flight?.status === "ACTIVE" ? "flying" : "docked",
        points: Array.isArray((flight?.flightPath as { points?: [number, number, number][] } | null)?.points)
          ? ((flight?.flightPath as { points?: [number, number, number][] }).points ?? [])
          : buildSimMapData().dronePath.points,
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("map data fallback to simulated data:", error);
    return NextResponse.json(buildSimMapData());
  }
}
