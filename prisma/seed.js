/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, HealthStatus, DroneStatus } = require("@prisma/client");

const prisma = new PrismaClient();

function buildTree(index) {
  const id = `RUB-Z01-${String(index + 1).padStart(4, "0")}`;
  const lat = 9.1 + (index % 20) * 0.002;
  const lng = 99.28 + (index % 20) * 0.002;
  return {
    id,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
    age: 4 + (index % 7),
    height: 8 + (index % 8) * 0.7,
    crownDiameter: 2.5 + (index % 5) * 0.5,
    carbonStock: 24 + (index % 30) * 1.2,
    healthStatus: index % 11 === 0 ? HealthStatus.CRITICAL : HealthStatus.HEALTHY,
  };
}

function buildPlot(index) {
  const lat = 9.11 + index * 0.01;
  const lng = 99.31 + index * 0.01;
  const areaRai = [125, 95, 150][index % 3];
  const ndviScore = [0.85, 0.45, 0.65][index % 3];
  return {
    boundary: {
      type: "Polygon",
      center: [lng, lat],
      areaRai,
      coordinates: [],
    },
    ndviScore,
    lodgingStatus: ndviScore < 0.5,
    yieldPrediction: [15.8, 12.4, 14.2][index % 3],
    fertilizerPlan: {
      n: 20 + index * 2,
      p: 12,
      k: 18 + index,
    },
  };
}

async function main() {
  const treeCount = await prisma.rubberTree.count();
  if (treeCount === 0) {
    await prisma.rubberTree.createMany({
      data: Array.from({ length: 150 }).map((_, i) => buildTree(i)),
      skipDuplicates: true,
    });
  }

  const plotCount = await prisma.sugarcanePlot.count();
  if (plotCount === 0) {
    for (let i = 0; i < 3; i++) {
      await prisma.sugarcanePlot.create({ data: buildPlot(i) });
    }
  }

  const drones = [
    {
      droneId: "H15-001",
      status: DroneStatus.ACTIVE,
      telemetry: { battery: 68, speed: 15.2, altitude: 120, lat: 9.1234, lng: 99.3456 },
      flightPath: {
        points: Array.from({ length: 50 }).map((_, i) => {
          const t = (i / 25) * Math.PI;
          return [Math.sin(t) * 40, 20 + Math.sin(t * 3) * 5, Math.sin(t) * Math.cos(t) * 40];
        }),
      },
      videoStreamUrl: "rtsp://demo-drone-feed",
    },
    {
      droneId: "H15-002",
      status: DroneStatus.CHARGING,
      telemetry: { battery: 32, speed: 0, altitude: 0, lat: 9.112, lng: 99.339 },
      flightPath: null,
      videoStreamUrl: null,
    },
    {
      droneId: "H15-003",
      status: DroneStatus.MAINTENANCE,
      telemetry: { battery: 0, speed: 0, altitude: 0, lat: 9.111, lng: 99.338 },
      flightPath: null,
      videoStreamUrl: null,
    },
  ];

  for (const drone of drones) {
    const exists = await prisma.droneFlight.findFirst({ where: { droneId: drone.droneId } });
    if (!exists) {
      await prisma.droneFlight.create({ data: drone });
    }
  }

  const missionFlights = await prisma.droneFlight.findMany({
    select: { id: true, telemetry: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  const hasDemoMission = missionFlights.some((f) => {
    const telemetry = f.telemetry || {};
    return telemetry.missionId === "INSP-2026-0210-001";
  });

  if (!hasDemoMission) {
    await prisma.droneFlight.create({
      data: {
        droneId: "H15-001",
        status: DroneStatus.CHARGING,
        telemetry: {
          missionId: "INSP-2026-0210-001",
          missionStatus: "completed",
          currentStep: 6,
          targetZone: "Sector Alpha",
          areaCoverRai: 125,
          estimatedMinutes: 35,
          altitude: 120,
          speed: 15.2,
          battery: 42,
          scanProgress: 100,
          elapsed: "00:32:18",
          totalGB: 18.7,
          treesDetected: 2450,
          anomalies: 5,
          healthScore: 92,
          diseaseSpots: 3,
          lodgingRai: 2.5,
          carbonTCO2e: 244.0,
        },
        flightPath: null,
        videoStreamUrl: "rtsp://demo-drone-feed",
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
