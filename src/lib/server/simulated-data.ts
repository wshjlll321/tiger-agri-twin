import type { MapDataResponse, MapTree, RubberOverviewResponse, SugarcaneOverviewResponse } from "@/lib/api-types";

export const SIM_RUBBER_MONTHLY_YIELD: RubberOverviewResponse["monthlyYield"] = [
  { month: "Jan", kgPerRai: 85 },
  { month: "Feb", kgPerRai: 92 },
  { month: "Mar", kgPerRai: 78 },
  { month: "Apr", kgPerRai: 65 },
  { month: "May", kgPerRai: 45 },
  { month: "Jun", kgPerRai: 55 },
  { month: "Jul", kgPerRai: 70 },
  { month: "Aug", kgPerRai: 75 },
  { month: "Sep", kgPerRai: 80 },
  { month: "Oct", kgPerRai: 82 },
  { month: "Nov", kgPerRai: 78 },
  { month: "Dec", kgPerRai: 40 },
];

export const SIM_RUBBER_DISEASES: RubberOverviewResponse["diseases"] = [
  {
    name: "White Root Disease",
    nameTh: "โรครากขาว",
    pathogen: "Rigidoporus microporus",
    severity: "HIGH",
    affectedTrees: 45,
    symptoms: "Yellowing leaves, white mycelium on roots",
    treatment: "Tridemorph fungicide, remove infected roots",
    prevention: "Root inspection every 6 months and drainage control",
  },
  {
    name: "Powdery Mildew",
    nameTh: "โรคราแป้ง",
    pathogen: "Oidium heveae",
    severity: "MEDIUM",
    affectedTrees: 230,
    symptoms: "White powdery coating on young leaves",
    treatment: "Sulfur dust spray at 3-5m height",
  },
  {
    name: "Abnormal Leaf Fall",
    nameTh: "โรคใบร่วงผิดปกติ",
    pathogen: "Phytophthora spp.",
    severity: "HIGH",
    affectedTrees: 18,
    symptoms: "Rapid defoliation, black lesions on petioles",
    treatment: "Metalaxyl + Mancozeb foliar spray",
  },
  {
    name: "Bark Necrosis",
    nameTh: "เปลือกตาย",
    pathogen: "Tapping panel dryness",
    severity: "LOW",
    affectedTrees: 95,
    symptoms: "Dry tapping panel, no latex flow",
    treatment: "Rest panel 3 months, apply Ethephon stimulant",
  },
];

export const SIM_SUGARCANE_CRUSHING: SugarcaneOverviewResponse["crushingSeason"] = {
  start: "2025-11-15",
  end: "2026-04-30",
  quotaDelivered: 85,
  nextDeliveryDays: 3,
  priceTonCCS: 1050,
  currency: "THB",
};

export const SIM_SUGARCANE_NDVI: SugarcaneOverviewResponse["ndviHistory"] = [
  { month: "Nov", score: 0.82 },
  { month: "Dec", score: 0.78 },
  { month: "Jan", score: 0.72 },
  { month: "Feb", score: 0.68 },
];

export function buildSimTrees(count: number): MapTree[] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 6;
    const radius = 20 + (i % 23) * 2.7;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const critical = i % 11 === 0;

    return {
      id: `RUB-Z01-${String(i + 1).padStart(4, "0")}`,
      position: [Number(x.toFixed(2)), 0, Number(z.toFixed(2))],
      health: critical ? "critical" : "healthy",
      carbonStock: Number((25 + (i % 30) * 1.3).toFixed(1)),
      age: 4 + (i % 6),
      lastScanned: new Date(Date.now() - (i % 72) * 3600 * 1000).toISOString(),
    };
  });
}

function generateDronePathInZone(zone: MapDataResponse["zones"][number]): [number, number, number][] {
  const cx = zone.position[0];
  const cz = zone.position[2];
  const halfW = zone.size[0] / 2;
  const halfH = zone.size[1] / 2;

  const margin = 10;
  const lines = 12;
  const pointsPerLine = 8;
  const altitude = 20;

  const points: [number, number, number][] = [];
  for (let i = 0; i < lines; i++) {
    const z = (cz - halfH + margin) + (i / (lines - 1)) * (halfH * 2 - margin * 2);
    const direction = i % 2 === 0;
    for (let j = 0; j < pointsPerLine; j++) {
      const t = direction ? j / (pointsPerLine - 1) : 1 - j / (pointsPerLine - 1);
      const x = (cx - halfW + margin) + t * (halfW * 2 - margin * 2);
      points.push([x, altitude + Math.sin(j * 0.5) * 2, z]);
    }
  }
  return points;
}

export function buildSimMapData(): MapDataResponse {
  const center = [9.1234, 99.3456];
  const zones: MapDataResponse["zones"] = [
    {
      id: "1",
      name: "Durian Zone",
      position: [center[0] + 0.002, 0.1, center[1] + 0.002],
      size: [240, 240], // Approx representation for 2.4ha
      ndvi: 0.88,
      areaRai: 15, // ~2.4 ha
      lodgingPercent: 0,
      sugarLossCCS: 0,
      cropType: "Durian 榴莲",
    },
    {
      id: "2",
      name: "Mangosteen Zone",
      position: [center[0] - 0.002, 0.1, center[1] + 0.002],
      size: [180, 180], // 1.8ha
      ndvi: 0.65,
      areaRai: 11.25, // 1.8 ha
      lodgingPercent: 5,
      sugarLossCCS: 0,
      cropType: "Mangosteen 山竹",
    },
    {
      id: "3",
      name: "Rubber Zone",
      position: [center[0] + 0.002, 0.1, center[1] - 0.002],
      size: [320, 320], // 3.2ha
      ndvi: 0.92,
      areaRai: 20, // 3.2 ha
      lodgingPercent: 0,
      sugarLossCCS: 0,
      cropType: "Rubber 橡胶",
    },
    {
      id: "4",
      name: "Oil Palm Zone",
      position: [center[0] - 0.002, 0.1, center[1] - 0.002],
      size: [450, 450], // 4.5ha
      ndvi: 0.45,
      areaRai: 28.1, // 4.5 ha
      lodgingPercent: 0,
      sugarLossCCS: 0,
      cropType: "Oil Palm 油棕",
    },
    {
      id: "5",
      name: "Longan Zone",
      position: [center[0] + 0.004, 0.1, center[1]],
      size: [210, 210], // 2.1ha
      ndvi: 0.85,
      areaRai: 13.1, // 2.1 ha
      lodgingPercent: 0,
      sugarLossCCS: 0,
      cropType: "Longan 龙眼",
    },
    {
      id: "6",
      name: "Maize Zone",
      position: [center[0] - 0.004, 0.1, center[1]],
      size: [500, 500], // 5.0ha
      ndvi: 0.72,
      areaRai: 31.25, // 5.0 ha
      lodgingPercent: 12,
      sugarLossCCS: 1.5,
      cropType: "Maize 玉米",
    },
  ];

  // We need to pass the specific crop details via a separate way or infer it,
  // but for MapDataResponse, we stick to the interface.
  // The caller (page.tsx) will map these IDs to specific crops/statuses.

  return {
    trees: buildSimTrees(150),
    zones,
    zoneBusiness: zones.map((z, i) => ({
      zoneId: z.id,
      zoneName: z.name,
      missionCount: [12, 16, 9, 14, 10, 8][i],
      latestYieldTonPerRai: [15.8, 12.4, 14.2, 18.1, 9.5, 8.2][i],
      alertsTrend: [1, 3, 1, 5, 2, 4][i] > 3 ? [2, 3, 4, 7, 8, 9, 11] : [1, 1, 2, 2, 2, 3, 3],
      recentMissions: [
        { missionId: `INSP-2026-02${10 + i}-001`, date: "2026-02-12", status: "completed", anomalies: i === 1 ? 8 : 2, healthScore: i === 1 ? 76 : 91 },
      ],
    })),
    diseaseHotspots: [],
    coverageHeatmap: [],
    dronePath: {
      id: "DRONE-01",
      status: "flying",
      points: generateDronePathInZone(zones.find((z) => z.id === "3")!),
    },
    updatedAt: new Date().toISOString(),
  };
}
