import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { SugarcaneOverviewResponse } from "@/lib/api-types";
import { SIM_SUGARCANE_CRUSHING, SIM_SUGARCANE_NDVI } from "@/lib/server/simulated-data";

const VARIETY_NAMES = ["KK3", "LK92-11", "Uthong 12"] as const;

function stageFromNdvi(ndvi: number): string {
  if (ndvi >= 0.75) return "maturation";
  if (ndvi >= 0.55) return "grand_growth";
  if (ndvi >= 0.35) return "tillering";
  return "germination";
}

function buildSimulated(): SugarcaneOverviewResponse {
  return {
    totalAreaRai: 370,
    varieties: [
      { name: "KK3", nameTh: "ขอนแก่น 3", areaRai: 150, ccs: 12.8, yieldTonPerRai: 14.2, stage: "maturation", daysToHarvest: 45 },
      { name: "LK92-11", areaRai: 120, ccs: 11.5, yieldTonPerRai: 16.0, stage: "grand_growth", daysToHarvest: 75 },
      { name: "Uthong 12", nameTh: "อู่ทอง 12", areaRai: 100, ccs: 13.2, yieldTonPerRai: 12.8, stage: "maturation", daysToHarvest: 30 },
    ],
    lodgingAnalysis: [
      { zone: "Sector Alpha", areaRai: 125, lodgingPercent: 2, sugarLossCCS: 0.3, status: "normal" },
      { zone: "Sector Beta", areaRai: 95, lodgingPercent: 18, sugarLossCCS: 3.2, status: "critical" },
      { zone: "Sector Gamma", areaRai: 150, lodgingPercent: 5, sugarLossCCS: 0.8, status: "warning" },
    ],
    crushingSeason: SIM_SUGARCANE_CRUSHING,
    ndviHistory: SIM_SUGARCANE_NDVI,
    totalLodgingLossTHB: 180000,
    seasonRevenueTHB: 2850000,
    estimatedYieldTons: 5250,
    lastUpdate: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const plots = await db.sugarcanePlot.findMany({
      select: {
        id: true,
        ndviScore: true,
        lodgingStatus: true,
        yieldPrediction: true,
        boundary: true,
      },
    });

    if (plots.length === 0) {
      return NextResponse.json(buildSimulated());
    }

    const totalAreaRai = plots.reduce((sum, p) => {
      const boundary = p.boundary as { areaRai?: number } | null;
      return sum + (boundary?.areaRai ?? 80);
    }, 0);

    const varieties = VARIETY_NAMES.map((name, idx) => {
      const subset = plots.filter((_, i) => i % VARIETY_NAMES.length === idx);
      const areaRai = subset.reduce((sum, p) => {
        const boundary = p.boundary as { areaRai?: number } | null;
        return sum + (boundary?.areaRai ?? 80);
      }, 0);
      const avgNdvi = subset.length > 0 ? subset.reduce((sum, p) => sum + p.ndviScore, 0) / subset.length : 0.6;
      const avgYield = subset.length > 0 ? subset.reduce((sum, p) => sum + p.yieldPrediction, 0) / subset.length : 13;

      return {
        name,
        areaRai: Math.round(areaRai),
        ccs: Number((10 + avgNdvi * 4).toFixed(1)),
        yieldTonPerRai: Number(avgYield.toFixed(1)),
        stage: stageFromNdvi(avgNdvi),
        daysToHarvest: Math.max(10, Math.round((1 - avgNdvi) * 120)),
      };
    });

    const lodgingAnalysis = plots.map((plot, index) => {
      const areaRai = ((plot.boundary as { areaRai?: number } | null)?.areaRai ?? 80);
      const lodgingPercent = plot.lodgingStatus ? Number((12 + (index % 4) * 2.2).toFixed(1)) : Number((1.5 + (index % 3) * 1.1).toFixed(1));
      return {
        zone: `Sector ${String.fromCharCode(65 + index)}`,
        areaRai,
        lodgingPercent,
        sugarLossCCS: Number((lodgingPercent * 0.18).toFixed(1)),
        status: lodgingPercent >= 10 ? "critical" : lodgingPercent >= 4 ? "warning" : "normal",
      };
    });

    const estimatedYieldTons = Number(
      plots.reduce((sum, p) => {
        const areaRai = ((p.boundary as { areaRai?: number } | null)?.areaRai ?? 80);
        return sum + p.yieldPrediction * areaRai;
      }, 0).toFixed(1)
    );

    const totalLodgingLossTHB = Math.round(
      lodgingAnalysis.reduce((sum, z) => sum + z.lodgingPercent * z.areaRai * 45, 0)
    );

    const data: SugarcaneOverviewResponse = {
      totalAreaRai: Math.round(totalAreaRai),
      varieties,
      lodgingAnalysis,
      crushingSeason: SIM_SUGARCANE_CRUSHING,
      ndviHistory: SIM_SUGARCANE_NDVI,
      totalLodgingLossTHB,
      seasonRevenueTHB: Math.round(estimatedYieldTons * SIM_SUGARCANE_CRUSHING.priceTonCCS),
      estimatedYieldTons,
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("sugarcane overview fallback to simulated data:", error);
    return NextResponse.json(buildSimulated());
  }
}
