import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RubberOverviewResponse } from "@/lib/api-types";
import { SIM_RUBBER_DISEASES, SIM_RUBBER_MONTHLY_YIELD, buildSimTrees } from "@/lib/server/simulated-data";

const VARIETY_META = [
  { name: "RRIM 600", tappingSystem: "S/2 d/2", cloneOrigin: "Malaysia", drc: 32, yieldBase: 1.5 },
  { name: "RRIT 251", tappingSystem: "S/2 d/3", cloneOrigin: "Thailand", drc: 34, yieldBase: 1.8 },
  { name: "BPM 24", tappingSystem: "S/2 d/2", cloneOrigin: "Indonesia", drc: 30, yieldBase: 1.2 },
] as const;

function buildFromSimulated(): RubberOverviewResponse {
  const trees = buildSimTrees(150);
  const count = trees.length;
  const totalAreaRai = 780;

  const groups = VARIETY_META.map((meta, idx) => {
    const subset = trees.filter((_, i) => i % VARIETY_META.length === idx);
    const treeCount = subset.length;
    const areaRai = Math.round((treeCount / count) * totalAreaRai);
    return {
      name: meta.name,
      areaRai,
      count: treeCount,
      avgYieldKgPerTree: Number(meta.yieldBase.toFixed(1)),
      tappingStatus: idx === 2 ? "closed_wintering" : "open",
      tappingSystem: meta.tappingSystem,
      drc: meta.drc,
      cloneOrigin: meta.cloneOrigin,
    };
  });

  const totalCarbon = trees.reduce((sum, t) => sum + t.carbonStock, 0);
  const perTreeAvg = count > 0 ? totalCarbon / count / 300 : 0.1;

  return {
    totalTrees: count,
    totalAreaRai,
    varieties: groups,
    currentPrice: {
      rss3: 58.5,
      fieldLatex: 42.3,
      currency: "THB",
      unit: "kg",
    },
    monthlyYield: SIM_RUBBER_MONTHLY_YIELD,
    diseases: SIM_RUBBER_DISEASES,
    carbonData: {
      totalTCO2e: Number((totalCarbon / 10).toFixed(1)),
      perTreeAvg: Number(perTreeAvg.toFixed(4)),
      todayCredits: 450,
      creditPriceTHB: 280,
    },
    lastUpdate: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const trees = await db.rubberTree.findMany({
      select: {
        id: true,
        age: true,
        carbonStock: true,
        healthStatus: true,
      },
    });

    if (trees.length === 0) {
      return NextResponse.json(buildFromSimulated());
    }

    const totalTrees = trees.length;
    const totalAreaRai = Math.max(1, Math.round(totalTrees * 0.06));

    const grouped = VARIETY_META.map((meta, idx) => {
      const subset = trees.filter((_, i) => i % VARIETY_META.length === idx);
      const count = subset.length;
      const avgYield = subset.length > 0 ? subset.reduce((s, t) => s + (0.9 + Math.min(t.age / 10, 1) * meta.yieldBase), 0) / subset.length : meta.yieldBase;
      return {
        name: meta.name,
        areaRai: Math.round((count / totalTrees) * totalAreaRai),
        count,
        avgYieldKgPerTree: Number(avgYield.toFixed(1)),
        tappingStatus: idx === 2 ? "closed_wintering" : "open",
        tappingSystem: meta.tappingSystem,
        drc: meta.drc,
        cloneOrigin: meta.cloneOrigin,
      };
    });

    const totalCarbon = trees.reduce((sum, t) => sum + t.carbonStock, 0);
    const criticalCount = trees.filter((t) => t.healthStatus === "CRITICAL").length;

    const data: RubberOverviewResponse = {
      totalTrees,
      totalAreaRai,
      varieties: grouped,
      currentPrice: {
        rss3: 58.5,
        fieldLatex: 42.3,
        currency: "THB",
        unit: "kg",
      },
      monthlyYield: SIM_RUBBER_MONTHLY_YIELD,
      diseases: SIM_RUBBER_DISEASES.map((d) =>
        d.severity === "HIGH"
          ? { ...d, affectedTrees: Math.max(d.affectedTrees, Math.round(criticalCount * 0.6)) }
          : d
      ),
      carbonData: {
        totalTCO2e: Number((totalCarbon / 10).toFixed(1)),
        perTreeAvg: Number((totalCarbon / totalTrees / 300).toFixed(4)),
        todayCredits: 450,
        creditPriceTHB: 280,
      },
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("rubber overview fallback to simulated data:", error);
    return NextResponse.json(buildFromSimulated());
  }
}
