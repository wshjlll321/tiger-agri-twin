import { NextRequest, NextResponse } from "next/server";
import { abortMission, advanceMission, createMission, getLatestMission, getMission } from "@/lib/server/drone-mission";
import { db } from "@/lib/db";

async function persistMissionSnapshot() {
  const mission = getLatestMission();
  const step1 = mission.steps.find((s) => s.step === 1)?.data ?? {};
  const step3 = mission.steps.find((s) => s.step === 3)?.data ?? {};
  const step4 = mission.steps.find((s) => s.step === 4)?.data ?? {};
  const step5 = mission.steps.find((s) => s.step === 5)?.data ?? {};
  const step6 = mission.steps.find((s) => s.step === 6)?.data ?? {};

  const telemetry = {
    missionId: mission.missionId,
    missionStatus: mission.status,
    currentStep: mission.currentStep,
    targetZone: typeof step1.targetZone === "string" ? step1.targetZone : "Sector Alpha",
    areaCoverRai: typeof step1.areaCoverRai === "number" ? step1.areaCoverRai : 125,
    estimatedMinutes: typeof step1.estimatedMinutes === "number" ? step1.estimatedMinutes : 35,
    altitude: typeof step3.altitude === "number" ? step3.altitude : 120,
    speed: typeof step3.speed === "number" ? step3.speed : 15.2,
    battery: typeof step3.battery === "number" ? step3.battery : 68,
    scanProgress: typeof step3.progress === "number" ? step3.progress : 0,
    elapsed: typeof step3.elapsed === "string" ? step3.elapsed : "00:00:00",
    totalGB: typeof step4.totalGB === "number" ? step4.totalGB : 0,
    treesDetected: typeof step5.treesDetected === "number" ? step5.treesDetected : 0,
    anomalies: typeof step5.anomalies === "number" ? step5.anomalies : 0,
    healthScore: typeof step6.healthScore === "number" ? step6.healthScore : 0,
    diseaseSpots: typeof step6.diseaseSpots === "number" ? step6.diseaseSpots : 0,
    lodgingRai: typeof step6.lodgingRai === "number" ? step6.lodgingRai : 0,
    carbonTCO2e: typeof step6.carbonTCO2e === "number" ? step6.carbonTCO2e : 0,
  };

  const existing = await db.droneFlight.findMany({
    where: { droneId: mission.drone.id },
    select: { id: true, telemetry: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const matched = existing.find((f) => {
    const t = f.telemetry as { missionId?: string } | null;
    return t?.missionId === mission.missionId;
  });

  const status =
    mission.status === "in_progress" || mission.status === "pending"
      ? "ACTIVE"
      : mission.status === "completed"
        ? "CHARGING"
        : "MAINTENANCE";

  if (matched) {
    await db.droneFlight.update({
      where: { id: matched.id },
      data: {
        status,
        telemetry,
      },
    });
    return;
  }

  await db.droneFlight.create({
    data: {
      droneId: mission.drone.id,
      status,
      telemetry,
      videoStreamUrl: "rtsp://demo-drone-feed",
    },
  });
}

export async function GET() {
  const latest = getLatestMission();
  return NextResponse.json(latest);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, missionId, payload } = body as {
      action: string;
      missionId?: string;
      payload?: {
        targetZone?: string;
        altitude?: number;
        overlap?: number;
        speed?: number;
        areaCoverRai?: number;
        estimatedMinutes?: number;
      };
    };

    if (action === "create") {
      const mission = createMission(payload ?? {});
      await persistMissionSnapshot();
      return NextResponse.json(mission, { status: 201 });
    }

    if (action === "advance") {
      const id = missionId ?? getLatestMission().missionId;
      const mission = advanceMission(id);
      if (!mission) {
        return NextResponse.json({ error: `Mission ${id} not found` }, { status: 404 });
      }
      if (mission.status === "aborted") {
        return NextResponse.json({ error: `Mission ${id} is aborted` }, { status: 400 });
      }
      await persistMissionSnapshot();
      return NextResponse.json(mission);
    }

    if (action === "abort") {
      const id = missionId ?? getLatestMission().missionId;
      const mission = abortMission(id);
      if (!mission) {
        return NextResponse.json({ error: `Mission ${id} not found` }, { status: 404 });
      }
      await persistMissionSnapshot();
      return NextResponse.json(mission);
    }

    if (action === "get" && missionId) {
      const mission = getMission(missionId);
      if (!mission) {
        return NextResponse.json({ error: `Mission ${missionId} not found` }, { status: 404 });
      }
      return NextResponse.json(mission);
    }

    return NextResponse.json({ error: 'Invalid action. Use "create", "advance", "abort", or "get".' }, { status: 400 });
  } catch (error: unknown) {
    console.error("Drone Inspection Error:", error);
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
