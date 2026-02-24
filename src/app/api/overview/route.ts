import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { OverviewResponse } from "@/lib/api-types";
import { buildSimMapData } from "@/lib/server/simulated-data";

const RUBBER_PRICE = 58.5;

function simulatedOverview(): OverviewResponse {
  const map = buildSimMapData();
  const totalTrees = map.trees.length;
  const critical = map.trees.filter((t) => t.health === "critical").length;
  const openTappingPercent = 85;
  const sugarcaneLodgingPercent = Math.max(...map.zones.map((z) => z.lodgingPercent));

  return {
    totalTrees,
    healthIndexPercent: Number(((1 - critical / totalTrees) * 100).toFixed(1)),
    carbonTCO2e: Number((map.trees.reduce((sum, t) => sum + t.carbonStock, 0) / 10).toFixed(1)),
    openTappingPercent,
    closedRainyPercent: Number((100 - openTappingPercent).toFixed(1)),
    rubberPriceTHBPerKg: RUBBER_PRICE,
    sugarcaneHarvestReadyPercent: 62,
    sugarcaneLodgingPercent,
    estimatedLodgingLossTHB: 180000,
    activeDroneCount: 1,
    lastUpdate: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const [treeAgg, treeCount, criticalCount, sugarPlots, activeDroneCount] = await Promise.all([
      db.rubberTree.aggregate({ _sum: { carbonStock: true, age: true } }),
      db.rubberTree.count(),
      db.rubberTree.count({ where: { healthStatus: "CRITICAL" } }),
      db.sugarcanePlot.findMany({ select: { ndviScore: true, lodgingStatus: true } }),
      db.droneFlight.count({ where: { status: "ACTIVE" } }),
    ]);

    if (treeCount === 0 || sugarPlots.length === 0) {
      return NextResponse.json(simulatedOverview());
    }

    const carbonTCO2e = Number(((treeAgg._sum.carbonStock ?? 0) / 10).toFixed(1));
    const healthIndexPercent = Number(((1 - criticalCount / treeCount) * 100).toFixed(1));
    const avgAge = (treeAgg._sum.age ?? 0) / treeCount;
    const openTappingPercent = Number(Math.min(95, Math.max(40, avgAge * 12)).toFixed(1));

    const harvestReadyCount = sugarPlots.filter((p) => p.ndviScore >= 0.7).length;
    const sugarcaneHarvestReadyPercent = Math.round((harvestReadyCount / sugarPlots.length) * 100);

    const sugarcaneLodgingPercent = sugarPlots.some((p) => p.lodgingStatus)
      ? 18
      : 4.5;
    const estimatedLodgingLossTHB = Math.round(
      sugarPlots.reduce((sum, p) => sum + (p.lodgingStatus ? 95000 : 16000), 0)
    );

    const response: OverviewResponse = {
      totalTrees: treeCount,
      healthIndexPercent,
      carbonTCO2e,
      openTappingPercent,
      closedRainyPercent: Number((100 - openTappingPercent).toFixed(1)),
      rubberPriceTHBPerKg: RUBBER_PRICE,
      sugarcaneHarvestReadyPercent,
      sugarcaneLodgingPercent,
      estimatedLodgingLossTHB,
      activeDroneCount,
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("overview fallback to simulated data:", error);
    return NextResponse.json(simulatedOverview());
  }
}
