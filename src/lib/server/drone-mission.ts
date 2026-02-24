import type { DroneMission } from "@/lib/api-types";

type MissionCreateInput = {
  targetZone?: string;
  altitude?: number;
  overlap?: number;
  speed?: number;
  areaCoverRai?: number;
  estimatedMinutes?: number;
};

const missions: Map<string, DroneMission> = new Map();

const stepCompletionData: Record<number, Record<string, unknown>> = {
  1: {
    targetZone: "Sector Alpha",
    altitude: 120,
    overlap: 80,
    speed: 12,
    areaCoverRai: 125,
    estimatedMinutes: 35,
    coordinates: { lat: 9.1234, lng: 99.3456 },
  },
  2: {
    battery: 98,
    gpsSignal: "strong",
    satellites: 14,
    windSpeed: 3.2,
    allChecked: true,
  },
  3: {
    progress: 100,
    scannedRai: 125,
    totalRai: 125,
    waypoint: "67/67",
    elapsed: "00:32:18",
    altitude: 120,
    speed: 15.2,
    battery: 42,
  },
  4: {
    rgbImages: 2340,
    ndviFrames: 1170,
    pointCloudSize: 4.2,
    thermalFrames: 585,
    totalGB: 18.7,
  },
  5: {
    treesDetected: 2450,
    healthyTrees: 2380,
    anomalies: 5,
    avgCrown: 4.2,
    ndviScore: 0.82,
  },
  6: {
    totalTrees: 2450,
    diseaseSpots: 3,
    lodgingRai: 2.5,
    carbonTCO2e: 244.0,
    healthScore: 92,
  },
};

export function createMission(input: MissionCreateInput = {}): DroneMission {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(missions.size + 1).padStart(3, "0");
  const missionId = `INSP-${dateStr.slice(0, 4)}-${dateStr.slice(4, 8)}-${seq}`;

  const step1 = {
    ...stepCompletionData[1],
    targetZone: input.targetZone ?? "Sector Alpha",
    altitude: input.altitude ?? 120,
    overlap: input.overlap ?? 80,
    speed: input.speed ?? 12,
    areaCoverRai: input.areaCoverRai ?? 125,
    estimatedMinutes: input.estimatedMinutes ?? 35,
  };

  const mission: DroneMission = {
    missionId,
    status: "in_progress",
    currentStep: 1,
    steps: [
      { step: 1, name: "Mission Planning", status: "active", data: step1 },
      { step: 2, name: "Pre-flight Check", status: "pending", data: { battery: 0, gpsSignal: "unknown", satellites: 0, windSpeed: 0, allChecked: false } },
      { step: 3, name: "In-Flight", status: "pending", data: { progress: 0, scannedRai: 0, totalRai: step1.areaCoverRai, waypoint: "0/67", elapsed: "00:00:00", altitude: 0, speed: 0, battery: 0 } },
      { step: 4, name: "Data Collection", status: "pending", data: { rgbImages: 0, ndviFrames: 0, pointCloudSize: 0, thermalFrames: 0, totalGB: 0 } },
      { step: 5, name: "AI Analysis", status: "pending", data: { treesDetected: 0, healthyTrees: 0, anomalies: 0, avgCrown: 0, ndviScore: 0 } },
      { step: 6, name: "Report", status: "pending", data: { totalTrees: 0, diseaseSpots: 0, lodgingRai: 0, carbonTCO2e: 0, healthScore: 0 } },
    ],
    drone: { id: "H15-001", name: "Alpha Scout" },
    createdAt: now.toISOString(),
  };

  missions.set(missionId, mission);
  return mission;
}

export function getLatestMission(): DroneMission {
  const allMissions = Array.from(missions.values());
  return allMissions[allMissions.length - 1] ?? seedDefaultMission();
}

export function getMission(missionId: string): DroneMission | undefined {
  return missions.get(missionId);
}

export function advanceMission(missionId: string): DroneMission | null {
  const mission = missions.get(missionId);
  if (!mission) return null;
  if (mission.status === "completed" || mission.status === "aborted") return mission;

  const currentIdx = mission.currentStep - 1;
  mission.steps[currentIdx].status = "completed";
  mission.steps[currentIdx].data = stepCompletionData[mission.currentStep] || mission.steps[currentIdx].data;

  if (mission.currentStep >= 6) {
    mission.status = "completed";
  } else {
    mission.currentStep += 1;
    mission.steps[mission.currentStep - 1].status = "active";
  }

  return mission;
}

export function abortMission(missionId: string): DroneMission | null {
  const mission = missions.get(missionId);
  if (!mission) return null;
  mission.status = "aborted";
  return mission;
}

function seedDefaultMission(): DroneMission {
  const existing = Array.from(missions.values())[0];
  if (existing) return existing;

  const mission: DroneMission = {
    missionId: "INSP-2026-0212-001",
    status: "in_progress",
    currentStep: 3,
    steps: [
      { step: 1, name: "Mission Planning", status: "completed", data: stepCompletionData[1] },
      { step: 2, name: "Pre-flight Check", status: "completed", data: stepCompletionData[2] },
      {
        step: 3,
        name: "In-Flight",
        status: "active",
        data: {
          progress: 42,
          scannedRai: 53,
          totalRai: 125,
          waypoint: "23/67",
          elapsed: "00:12:34",
          altitude: 120,
          speed: 15.2,
          battery: 68,
        },
      },
      { step: 4, name: "Data Collection", status: "pending", data: { rgbImages: 0, ndviFrames: 0, pointCloudSize: 0, thermalFrames: 0, totalGB: 0 } },
      { step: 5, name: "AI Analysis", status: "pending", data: { treesDetected: 0, healthyTrees: 0, anomalies: 0, avgCrown: 0, ndviScore: 0 } },
      { step: 6, name: "Report", status: "pending", data: { totalTrees: 0, diseaseSpots: 0, lodgingRai: 0, carbonTCO2e: 0, healthScore: 0 } },
    ],
    drone: { id: "H15-001", name: "Alpha Scout" },
    createdAt: "2026-02-12T08:00:00Z",
  };
  missions.set(mission.missionId, mission);
  return mission;
}

seedDefaultMission();
