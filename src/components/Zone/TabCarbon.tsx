'use client';

import React from 'react';
import GlassPanel from '@/components/HUD/GlassPanel';
import AIInterpretation from '@/components/AI/AIInterpretation';
import {
  Leaf, Activity, DollarSign, TrendingUp, ShieldCheck, Calendar,
  BarChart3, TreeDeciduous, Layers, FlaskConical, Wind, Gauge,
  BadgeDollarSign, Award, CheckCircle2, Lightbulb, Factory,
  Truck, Droplets, Zap, AlertTriangle,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import type { ZoneCarbonDetail } from '@/lib/mockData';
import {
  Sprout, Target,
} from 'lucide-react';

/* ── Crop-specific carbon benchmarks ── */
const cropCarbonProfiles: Record<string, {
  icon: string;
  benchmarkDensity: string;
  avgSeqRate: string;
  maturityYears: string;
  peakCarbonAge: string;
  rootShootRatio: string;
  woodDensity: string;
  leafAreaIndex: string;
  turnoverRate: string;
  soilCarbonPotential: string;
  description: string;
}> = {
  "Durian (榴莲)": {
    icon: "🍈",
    benchmarkDensity: "85-120 tCO2e/ha",
    avgSeqRate: "35-50 kg/day/ha",
    maturityYears: "8-12 years",
    peakCarbonAge: "15-25 years",
    rootShootRatio: "0.26",
    woodDensity: "0.52 g/cm³",
    leafAreaIndex: "4.2-5.8",
    turnoverRate: "3.5%/year",
    soilCarbonPotential: "High (deep root system)",
    description: "Durian trees have a large canopy and dense wood structure, making them excellent carbon sinks in tropical agroforestry. Their deep root systems contribute significantly to below-ground carbon stocks.",
  },
  "Mangosteen (山竹)": {
    icon: "🍇",
    benchmarkDensity: "60-90 tCO2e/ha",
    avgSeqRate: "25-38 kg/day/ha",
    maturityYears: "10-15 years",
    peakCarbonAge: "20-30 years",
    rootShootRatio: "0.24",
    woodDensity: "0.61 g/cm³",
    leafAreaIndex: "3.8-5.2",
    turnoverRate: "2.8%/year",
    soilCarbonPotential: "Medium-High",
    description: "Mangosteen is a slow-growing evergreen with dense hardwood. Its high wood density (0.61 g/cm³) results in superior per-tree carbon storage despite slower growth rates compared to other tropical fruit trees.",
  },
  "Rubber (橡胶)": {
    icon: "🌳",
    benchmarkDensity: "100-160 tCO2e/ha",
    avgSeqRate: "45-65 kg/day/ha",
    maturityYears: "5-7 years",
    peakCarbonAge: "15-25 years",
    rootShootRatio: "0.21",
    woodDensity: "0.53 g/cm³",
    leafAreaIndex: "5.0-7.0",
    turnoverRate: "4.2%/year",
    soilCarbonPotential: "High (latex tap doesn't reduce carbon)",
    description: "Rubber plantations are among the highest carbon-sequestering tropical crops. Latex harvesting removes minimal biomass, allowing continuous carbon accumulation. IPCC recognizes rubber as a carbon-positive crop under sustainable management.",
  },
  "Oil Palm (油棕)": {
    icon: "🌴",
    benchmarkDensity: "50-80 tCO2e/ha",
    avgSeqRate: "20-35 kg/day/ha",
    maturityYears: "3-4 years",
    peakCarbonAge: "10-20 years",
    rootShootRatio: "0.18",
    woodDensity: "0.35 g/cm³",
    leafAreaIndex: "5.5-7.5",
    turnoverRate: "5.0%/year",
    soilCarbonPotential: "Medium (depends on peat management)",
    description: "Oil palm has the highest photosynthetic efficiency among tropical crops but lower wood density limits per-tree carbon stock. Carbon management must account for land-use change emissions. RSPO PalmGHG methodology applies.",
  },
  "Longan (龙眼)": {
    icon: "🫐",
    benchmarkDensity: "70-100 tCO2e/ha",
    avgSeqRate: "30-42 kg/day/ha",
    maturityYears: "5-8 years",
    peakCarbonAge: "15-25 years",
    rootShootRatio: "0.23",
    woodDensity: "0.55 g/cm³",
    leafAreaIndex: "4.0-5.5",
    turnoverRate: "3.2%/year",
    soilCarbonPotential: "Medium-High",
    description: "Longan trees develop substantial canopy coverage and moderate wood density. Proper pruning management can optimize both fruit yield and carbon sequestration by maintaining vigorous growth.",
  },
  "Maize (玉米)": {
    icon: "🌽",
    benchmarkDensity: "5-15 tCO2e/ha",
    avgSeqRate: "8-18 kg/day/ha",
    maturityYears: "Annual (120 days)",
    peakCarbonAge: "60-90 days (tasseling)",
    rootShootRatio: "0.15",
    woodDensity: "N/A (herbaceous)",
    leafAreaIndex: "3.5-5.0",
    turnoverRate: "100%/year (annual)",
    soilCarbonPotential: "Low-Medium (residue management critical)",
    description: "As an annual crop, maize has limited standing carbon stock. Carbon benefits primarily come from soil organic carbon accumulation through residue incorporation and no-till practices. Cover cropping between seasons can significantly enhance soil carbon.",
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-gray-700 p-3 rounded shadow-lg backdrop-blur-sm">
        <p className="text-gray-200 font-semibold mb-2 text-xs">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="text-white font-mono">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TabCarbon({ data }: { data: any }) {
  const { t } = useTranslation();

  const cd: ZoneCarbonDetail | undefined = data.zoneCarbonDetail;

  if (!cd) {
    return (
      <GlassPanel title="CARBON DATA" accent="green">
        <div className="text-center text-slate-400 py-8 text-sm">No carbon detail data available for this zone.</div>
      </GlassPanel>
    );
  }

  const totalStock = cd.totalCarbonStock;
  const stockItems = [
    { label: t("aboveGroundBiomass"), value: cd.aboveGroundBiomass, icon: TreeDeciduous, color: 'text-neon-green', bg: 'bg-neon-green/10' },
    { label: t("belowGroundBiomass"), value: cd.belowGroundBiomass, icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: t("soilOrganicCarbon"), value: cd.soilOrganicCarbon, icon: FlaskConical, color: 'text-holographic-blue', bg: 'bg-holographic-blue/10' },
    { label: t("litterDeadwood"), value: cd.litterDeadwood, icon: Leaf, color: 'text-lime-400', bg: 'bg-lime-400/10' },
  ];

  const chartData = cd.monthlySequestration.map(m => ({
    month: m.month,
    sequestration: m.value,
    emission: m.emission,
    net: m.value - m.emission,
  }));

  const creditsAvailable = cd.totalCredits - cd.creditsSold;
  const potentialRevenue = creditsAvailable * cd.creditPrice;

  return (
    <div className="space-y-6">

      {/* ====== Section 1: Total Carbon Stock Highlight + 4 KPI Cards ====== */}
      <GlassPanel title={`${t("carbonStockBreakdown")} — ${cd.cropType}`} accent="green">
        <div className="space-y-4">
          {/* Total highlight */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-neon-green/5 border border-neon-green/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neon-green/10 rounded-lg">
                <Leaf className="w-7 h-7 text-neon-green" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t("carbonStockLabel")}</div>
                <div className="text-3xl font-bold text-neon-green font-mono">{totalStock.toFixed(1)} <span className="text-sm text-slate-400">tCO2e</span></div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-500">{t("area")}</div>
              <div className="text-sm text-white font-mono">{cd.area} ({cd.areaRai} Rai)</div>
            </div>
          </div>

          {/* 4 sub-stock cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stockItems.map(item => {
              const pct = ((item.value / totalStock) * 100).toFixed(1);
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${item.color} p-1 ${item.bg} rounded`} />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide leading-tight">{item.label}</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono">{item.value.toFixed(1)}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">tCO2e</span>
                    <span className={`text-[10px] font-mono font-bold ${item.color}`}>{pct}%</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color === 'text-neon-green' ? 'bg-neon-green' : item.color === 'text-emerald-400' ? 'bg-emerald-400' : item.color === 'text-holographic-blue' ? 'bg-holographic-blue' : 'bg-lime-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>

      {/* AI Interpretation: Carbon Stock Summary */}
      <AIInterpretation
        dataType="Carbon Stock Analysis"
        dataValue={`${totalStock.toFixed(1)} tCO2e total`}
        context={cd.cropType}
        interpretation={cd.aiInterpretation}
      />

      {/* ====== Section 1.5: Crop-Specific Carbon Profile ====== */}
      {(() => {
        const profile = cropCarbonProfiles[cd.cropType];
        if (!profile) return null;
        const densityVal = cd.carbonDensity;
        const benchRange = profile.benchmarkDensity.match(/(\d+)-(\d+)/);
        const benchLow = benchRange ? parseInt(benchRange[1]) : 0;
        const benchHigh = benchRange ? parseInt(benchRange[2]) : 200;
        const benchMid = (benchLow + benchHigh) / 2;
        const performanceRatio = densityVal / benchMid;
        const performanceLabel = performanceRatio >= 1.1 ? t("aboveBenchmark") : performanceRatio >= 0.9 ? t("onTarget") : t("belowBenchmark");
        const performanceColor = performanceRatio >= 1.1 ? 'text-neon-green' : performanceRatio >= 0.9 ? 'text-holographic-blue' : 'text-cyber-yellow';

        return (
          <GlassPanel title={`${profile.icon} ${t("cropCarbonProfile")} — ${cd.cropType}`} accent="green">
            <div className="space-y-4">
              {/* Performance vs benchmark */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{profile.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{cd.cropType}</div>
                    <div className="text-[10px] text-slate-400">{profile.description.slice(0, 80)}...</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold font-mono ${performanceColor}`}>{performanceLabel}</div>
                  <div className="text-[10px] text-slate-500">{t("vsBenchmark")} {profile.benchmarkDensity}</div>
                </div>
              </div>

              {/* Benchmark comparison bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{t("densityVsBenchmark")}</span>
                  <span className="font-mono">{densityVal} / {benchMid} tCO2e/ha ({(performanceRatio * 100).toFixed(0)}%)</span>
                </div>
                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                  {/* Benchmark range */}
                  <div className="absolute inset-y-0 bg-slate-700/50 rounded-full" style={{ left: `${(benchLow / (benchHigh * 1.5)) * 100}%`, width: `${((benchHigh - benchLow) / (benchHigh * 1.5)) * 100}%` }} />
                  {/* Actual value */}
                  <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${performanceRatio >= 0.9 ? 'bg-neon-green/70' : 'bg-cyber-yellow/70'}`}
                    style={{ width: `${Math.min((densityVal / (benchHigh * 1.5)) * 100, 100)}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] text-white font-mono font-bold drop-shadow-lg">{densityVal} tCO2e/ha</span>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                  <span>0</span>
                  <span>{benchLow} (low)</span>
                  <span>{benchHigh} (high)</span>
                </div>
              </div>

              {/* Crop carbon characteristics grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { label: t("seqRateBenchmark"), value: profile.avgSeqRate, icon: <Activity className="w-3.5 h-3.5 text-neon-green" /> },
                  { label: t("maturityPeriod"), value: profile.maturityYears, icon: <Calendar className="w-3.5 h-3.5 text-holographic-blue" /> },
                  { label: t("peakCarbonAge"), value: profile.peakCarbonAge, icon: <TrendingUp className="w-3.5 h-3.5 text-cyber-yellow" /> },
                  { label: t("rootShootRatio"), value: profile.rootShootRatio, icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
                  { label: t("woodDensity"), value: profile.woodDensity, icon: <TreeDeciduous className="w-3.5 h-3.5 text-lime-400" /> },
                  { label: t("leafAreaIndex"), value: profile.leafAreaIndex, icon: <Leaf className="w-3.5 h-3.5 text-neon-green" /> },
                  { label: t("turnoverRate"), value: profile.turnoverRate, icon: <Wind className="w-3.5 h-3.5 text-alert-red" /> },
                  { label: t("soilCPotential"), value: profile.soilCarbonPotential, icon: <FlaskConical className="w-3.5 h-3.5 text-holographic-blue" /> },
                ].map(item => (
                  <div key={item.label} className="p-2 rounded bg-slate-800/30 border border-slate-700/40">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.icon}
                      <span className="text-[9px] text-slate-500 uppercase">{item.label}</span>
                    </div>
                    <div className="text-[11px] text-white font-mono font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Crop-specific AI insight */}
              <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="w-4 h-4 text-neon-green" />
                  <span className="text-[10px] text-neon-green uppercase font-bold tracking-wider">{t("cropCarbonInsight")}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{profile.description}</p>
                <div className="mt-2 pt-2 border-t border-neon-green/10 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-holographic-blue" />
                  <span className="text-[10px] text-slate-400">
                    {t("currentDensity")} <span className={`font-bold ${performanceColor}`}>{densityVal} tCO2e/ha</span> —
                    {t("targetRange")} <span className="text-white font-bold">{profile.benchmarkDensity}</span>
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ====== Section 2: Carbon Flux & Rate Metrics ====== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <GlassPanel title={t("sequestrationRate")} accent="green" className="h-36">
          <div className="flex flex-col justify-between h-full pb-1">
            <Activity className="w-7 h-7 text-neon-green/80 p-1.5 bg-neon-green/10 rounded" />
            <div>
              <div className="text-xl font-bold text-neon-green font-mono">{cd.carbonSequestrationRate}</div>
              <div className="text-[10px] text-slate-500">kg/day</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t("npp")} accent="blue" className="h-36">
          <div className="flex flex-col justify-between h-full pb-1">
            <TrendingUp className="w-7 h-7 text-holographic-blue/80 p-1.5 bg-holographic-blue/10 rounded" />
            <div>
              <div className="text-xl font-bold text-holographic-blue font-mono">{cd.netPrimaryProductivity}</div>
              <div className="text-[10px] text-slate-500">gC/m2/day</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t("soilRespiration")} accent="red" className="h-36">
          <div className="flex flex-col justify-between h-full pb-1">
            <Wind className="w-7 h-7 text-alert-red/80 p-1.5 bg-alert-red/10 rounded" />
            <div>
              <div className="text-xl font-bold text-alert-red font-mono">{cd.soilRespirationRate}</div>
              <div className="text-[10px] text-slate-500">gCO2/m2/hr</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t("carbonFlux")} accent="green" className="h-36">
          <div className="flex flex-col justify-between h-full pb-1">
            <BarChart3 className="w-7 h-7 text-neon-green/80 p-1.5 bg-neon-green/10 rounded" />
            <div>
              <div className="text-xl font-bold text-white font-mono">{cd.carbonFlux}</div>
              <div className="text-[10px] text-slate-500">tCO2e/year</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t("carbonDensity")} accent="blue" className="h-36">
          <div className="flex flex-col justify-between h-full pb-1">
            <Gauge className="w-7 h-7 text-holographic-blue/80 p-1.5 bg-holographic-blue/10 rounded" />
            <div>
              <div className="text-xl font-bold text-holographic-blue font-mono">{cd.carbonDensity}</div>
              <div className="text-[10px] text-slate-500">tCO2e/ha</div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ====== Section 3: Monthly Sequestration Chart ====== */}
      <GlassPanel title={t("monthlySeqChart")} accent="green">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="#39FF14" tick={{ fill: '#39FF14', fontSize: 10 }}
                label={{ value: 'kg CO2e', angle: -90, position: 'insideLeft', fill: '#39FF14', style: { textAnchor: 'middle', fontSize: 10 } }} />
              <YAxis yAxisId="right" orientation="right" stroke="#00FFFF" tick={{ fill: '#00FFFF', fontSize: 10 }}
                label={{ value: 'Net', angle: 90, position: 'insideRight', fill: '#00FFFF', style: { textAnchor: 'middle', fontSize: 10 } }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="sequestration" name="Sequestration" fill="#39FF14" barSize={18} radius={[3, 3, 0, 0]} fillOpacity={0.7} />
              <Bar yAxisId="left" dataKey="emission" name="Emission" fill="#FF3D00" barSize={18} radius={[3, 3, 0, 0]} fillOpacity={0.5} />
              <Line yAxisId="right" type="monotone" dataKey="net" name="Net Carbon" stroke="#00FFFF" strokeWidth={2.5}
                dot={{ r: 3, fill: '#00FFFF', strokeWidth: 2, stroke: '#0B1120' }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* ====== Section 4: Carbon Credits & Economic Value ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Credit Trading */}
        <GlassPanel title={t("carbonCreditTrading")} accent="green">
          <div className="space-y-4">
            {/* Credit KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-800/40 rounded border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("totalCredits")}</div>
                <div className="text-xl font-bold text-neon-green font-mono">{cd.totalCredits}</div>
                <div className="text-[9px] text-slate-500">tCO2e</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("sold")}</div>
                <div className="text-xl font-bold text-white font-mono">{cd.creditsSold}</div>
                <div className="text-[9px] text-slate-500">tCO2e</div>
              </div>
              <div className="text-center p-3 bg-slate-800/40 rounded border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("available")}</div>
                <div className="text-xl font-bold text-holographic-blue font-mono">{creditsAvailable}</div>
                <div className="text-[9px] text-slate-500">tCO2e</div>
              </div>
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-slate-700/30 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><BadgeDollarSign className="w-3.5 h-3.5" /> {t("unitPrice")}</span>
                <span className="text-cyber-yellow font-mono font-bold">${cd.creditPrice}/tCO2e</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {t("revenue")}</span>
                <span className="text-neon-green font-mono font-bold">${cd.revenueUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {t("potentialRevenue")}</span>
                <span className="text-holographic-blue font-mono font-bold">${potentialRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Verification & Certification */}
        <GlassPanel title={t("verificationCert")} accent="blue">
          <div className="space-y-4">
            {/* Verification badge */}
            <div className={`flex items-center gap-4 p-4 rounded ${cd.verificationStatus === 'Verified' ? 'bg-neon-green/5 border border-neon-green/30' : cd.verificationStatus === 'Pending Review' ? 'bg-cyber-yellow/5 border border-cyber-yellow/30' : 'bg-holographic-blue/5 border border-holographic-blue/30'}`}>
              <div className={`p-3 rounded-full ${cd.verificationStatus === 'Verified' ? 'bg-neon-green/10' : 'bg-cyber-yellow/10'}`}>
                <ShieldCheck className={`w-8 h-8 ${cd.verificationStatus === 'Verified' ? 'text-neon-green' : 'text-cyber-yellow'}`} />
              </div>
              <div>
                <div className={`text-sm font-bold uppercase ${cd.verificationStatus === 'Verified' ? 'text-neon-green' : 'text-cyber-yellow'}`}>{cd.verificationStatus}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{t("creditsVerified")}</div>
              </div>
            </div>

            {/* Certification details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("methodology")}</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-holographic-blue" /> {cd.methodology}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("certificationBody")}</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> {cd.certificationBody}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("lastAudit")}</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-holographic-blue" /> {cd.lastAuditDate}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("carbonIntensity")}</div>
                <div className="text-sm font-bold text-holographic-blue flex items-center gap-1.5 mt-0.5">
                  <Gauge className="w-3.5 h-3.5 text-holographic-blue" /> {cd.carbonIntensity} tCO2e/ha
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* AI Interpretation: Credits & Recommendations */}
      <AIInterpretation
        dataType="Carbon Credit & Verification"
        dataValue={`${cd.totalCredits} tCO2e credits | ${cd.verificationStatus}`}
        context={`${cd.methodology} — ${cd.certificationBody}`}
        interpretation={`[Carbon Credit Summary] Total ${cd.totalCredits} tCO2e credits generated. ${cd.creditsSold} sold at $${cd.creditPrice}/tCO2e = $${cd.revenueUSD.toLocaleString()} revenue. ${creditsAvailable} credits remain available, representing $${potentialRevenue.toLocaleString()} in potential revenue.

[Verification] Status: ${cd.verificationStatus}. Methodology: ${cd.methodology}. Certified by ${cd.certificationBody}. Last audit: ${cd.lastAuditDate}.

[AI Recommendations]
${cd.aiRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`}
      />

      {/* ====== Section 5: AI Recommendations List ====== */}
      <GlassPanel title={t("aiRecommendations")} accent="green">
        <div className="space-y-2">
          {cd.aiRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/40 hover:border-neon-green/30 transition-colors">
              <div className="p-1.5 bg-neon-green/10 rounded-md mt-0.5">
                <Lightbulb className="w-4 h-4 text-neon-green" />
              </div>
              <span className="text-xs text-slate-300 leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* ══════════════════════════════════════════════════════════════
          2.1 Carbon Footprint Lifecycle Analysis
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const footprintStages = [
          {
            key: 'field', label: t('fieldProduction'), pct: 35, color: '#FF6B35',
            items: [
              { label: t('fertilizerApplication'), value: 1.12 },
              { label: t('machineryFuel'), value: 0.68 },
              { label: t('irrigationEnergy'), value: 0.52 },
              { label: t('pesticideProduction'), value: 0.48 },
            ],
          },
          {
            key: 'postHarvest', label: t('postHarvestStage'), pct: 20, color: '#FFD600',
            items: [
              { label: t('dryingEnergy'), value: 0.64 },
              { label: t('sortingPacking'), value: 0.42 },
              { label: t('coldStorage'), value: 0.54 },
            ],
          },
          {
            key: 'processing', label: t('processingStage'), pct: 25, color: '#00B0FF',
            items: [
              { label: t('factoryElectricity'), value: 0.82 },
              { label: t('waterTreatment'), value: 0.38 },
              { label: t('packagingMaterials'), value: 0.80 },
            ],
          },
          {
            key: 'transport', label: t('transportStage'), pct: 20, color: '#AA00FF',
            items: [
              { label: t('domesticLogistics'), value: 0.48 },
              { label: t('portHandling'), value: 0.32 },
              { label: t('internationalShipping'), value: 0.80 },
            ],
          },
        ];
        const totalFootprint = 8.0;

        return (
          <GlassPanel title={t("carbonFootprintLifecycle")} accent="red">
            <div className="space-y-4">
              {/* Hero number */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-alert-red/5 border border-alert-red/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-alert-red/10 rounded-lg">
                    <Factory className="w-7 h-7 text-alert-red" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t("totalCarbonFootprint")}</div>
                    <div className="text-3xl font-bold text-alert-red font-mono">{totalFootprint.toFixed(1)} <span className="text-sm text-slate-400">tCO2e/year</span></div>
                  </div>
                </div>
              </div>

              {/* Stacked horizontal bar */}
              <div className="space-y-2">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {footprintStages.map(stage => (
                    <div key={stage.key} className="flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${stage.pct}%`, backgroundColor: stage.color }}>
                      {stage.pct}%
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  {footprintStages.map(stage => (
                    <span key={stage.key} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: stage.color }} />
                      {stage.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stage detail items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {footprintStages.map(stage => (
                  <div key={stage.key} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: stage.color }} />
                      <span className="text-[10px] font-bold text-white uppercase">{stage.label} ({stage.pct}%)</span>
                    </div>
                    <div className="space-y-1.5">
                      {stage.items.map(item => (
                        <div key={item.label} className="space-y-0.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">{item.label}</span>
                            <span className="text-slate-200 font-mono">{item.value.toFixed(2)} tCO2e</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(item.value / totalFootprint) * 100 * 3}%`, backgroundColor: stage.color, opacity: 0.7 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          2.2 Carbon Neutrality Roadmap Timeline
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const roadmapStages = [
          { label: t('baseline'), year: '2024', detail: t('baselineDetail'), status: 'completed' as const },
          { label: t('reduction25'), year: '2025', detail: t('reduction25Detail'), status: 'completed' as const },
          { label: t('reduction50'), year: '2026', detail: t('reduction50Detail'), status: 'active' as const },
          { label: t('reduction75'), year: '2027', detail: t('reduction75Detail'), status: 'pending' as const },
          { label: t('netZero'), year: '2028', detail: t('netZeroDetail'), status: 'pending' as const },
        ];
        const currentProgress = 50;

        return (
          <GlassPanel title={t("carbonNeutralityRoadmap")} accent="green">
            <div className="space-y-4">
              {/* Stage pipeline */}
              <div className="flex items-start gap-0">
                {roadmapStages.map((stage, i, arr) => (
                  <div key={stage.year} className="flex-1 relative">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        stage.status === 'completed' ? 'bg-neon-green/20 text-neon-green border-2 border-neon-green/50' :
                        stage.status === 'active' ? 'bg-holographic-blue/20 text-holographic-blue border-2 border-holographic-blue/50 animate-pulse' :
                        'bg-slate-800 text-slate-500 border-2 border-slate-700'
                      }`}>
                        {stage.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : stage.year}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          stage.status === 'completed' ? 'bg-neon-green/40' : 'bg-slate-700'
                        }`} />
                      )}
                    </div>
                    <div className="mt-2 pr-2">
                      <div className={`text-[10px] font-bold ${
                        stage.status === 'completed' ? 'text-neon-green' :
                        stage.status === 'active' ? 'text-holographic-blue' : 'text-slate-500'
                      }`}>{stage.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{stage.detail}</div>
                      <div className="text-[8px] font-mono text-slate-600 mt-0.5">{stage.year}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">{t("progressTowardNetZero")}</span>
                  <span className="text-neon-green font-bold font-mono">{currentProgress}%</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon-green/60 to-neon-green transition-all" style={{ width: `${currentProgress}%` }} />
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          2.3 Yearly Carbon Sequestration Trend
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const yearlyData = months.map((m, i) => ({
          month: m,
          y2024: [3.2, 3.5, 4.1, 4.8, 5.2, 5.0, 4.6, 4.8, 5.1, 4.9, 4.2, 3.8][i],
          y2025: [3.8, 4.2, 4.8, 5.5, 6.0, 5.8, 5.4, 5.6, 5.9, 5.7, 4.9, 4.5][i],
          y2026: [4.5, 5.0, 5.6, 6.2, 6.8, 6.5, 6.1, 6.3, 6.7, 6.4, 5.6, 5.2][i],
        }));
        const total2024 = 53.2;
        const total2025 = 62.1;
        const total2026 = 74.9;
        const yoyGrowth = (((total2026 - total2025) / total2025) * 100).toFixed(1);

        return (
          <GlassPanel title={t("yearlyCarbonTrend")} accent="green">
            <div className="space-y-3">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yearlyData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                    <YAxis stroke="#39FF14" tick={{ fill: '#39FF14', fontSize: 10 }} label={{ value: 'tCO2e', angle: -90, position: 'insideLeft', fill: '#39FF14', style: { textAnchor: 'middle', fontSize: 10 } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="y2024" name={`2024 (${total2024} t)`} stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2, fill: '#64748b' }} />
                    <Line type="monotone" dataKey="y2025" name={`2025 (${total2025} t)`} stroke="#00B0FF" strokeWidth={2} dot={{ r: 2.5, fill: '#00B0FF' }} />
                    <Line type="monotone" dataKey="y2026" name={`2026 (${total2026} t)`} stroke="#39FF14" strokeWidth={2.5} dot={{ r: 3, fill: '#39FF14', strokeWidth: 2, stroke: '#0B1120' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neon-green/5 border border-neon-green/20">
                <span className="text-[10px] text-slate-400">{t("yearOverYearGrowth")} (2025→2026)</span>
                <span className="text-sm font-bold text-neon-green font-mono">+{yoyGrowth}%</span>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          2.4 Carbon Credit Price History
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const priceMonths = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
        const priceData = priceMonths.map((m, i) => ({
          month: m,
          vcs: [8.2, 8.5, 8.8, 9.1, 9.4, 9.6, 10.0, 10.2, 10.5, 10.8, 11.0, 11.4][i],
          gold: [12.0, 12.3, 12.8, 13.2, 13.5, 13.8, 14.2, 14.5, 14.8, 15.0, 15.4, 15.8][i],
          tgo: [5.5, 5.8, 6.0, 6.2, 6.5, 6.8, 7.0, 7.2, 7.5, 7.8, 8.0, 8.2][i],
        }));

        return (
          <GlassPanel title={t("creditPriceHistory")} accent="blue">
            <div className="space-y-3">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <defs>
                      <linearGradient id="vcsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B0FF" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00B0FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD600" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FFD600" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tgoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39FF14" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: '$/tCO2e', angle: -90, position: 'insideLeft', fill: '#64748b', style: { textAnchor: 'middle', fontSize: 10 } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="vcs" name={t("vcsMarket")} stroke="#00B0FF" strokeWidth={2} fill="url(#vcsGrad)" dot={{ r: 2, fill: '#00B0FF' }} />
                    <Area type="monotone" dataKey="gold" name={t("goldStandardMarket")} stroke="#FFD600" strokeWidth={2} fill="url(#goldGrad)" dot={{ r: 2, fill: '#FFD600' }} />
                    <Area type="monotone" dataKey="tgo" name={t("thailandTGO")} stroke="#39FF14" strokeWidth={2} fill="url(#tgoGrad)" dot={{ r: 2, fill: '#39FF14' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Current prices */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t('vcsMarket'), price: 11.4, trend: '+12.0%', color: 'text-holographic-blue' },
                  { label: t('goldStandardMarket'), price: 15.8, trend: '+15.2%', color: 'text-cyber-yellow' },
                  { label: t('thailandTGO'), price: 8.2, trend: '+18.8%', color: 'text-neon-green' },
                ].map(item => (
                  <div key={item.label} className="p-2 rounded bg-slate-800/40 border border-slate-700/50 text-center">
                    <div className="text-[9px] text-slate-500 uppercase">{item.label}</div>
                    <div className={`text-lg font-bold font-mono ${item.color}`}>${item.price}</div>
                    <div className="text-[9px] text-neon-green font-mono">{item.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          2.5 Carbon Offset Scenario Calculator
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const scenarios = [
          {
            key: 'baseline',
            label: t('scenarioBaseline'),
            desc: t('scenarioBaselineDesc'),
            sequestration: 45.2,
            emissions: 8.0,
            net: 37.2,
            improvement: null,
            color: 'slate',
            measures: [t('currentManagement')],
          },
          {
            key: 'optimized',
            label: t('scenarioOptimized'),
            desc: t('scenarioOptimizedDesc'),
            sequestration: 52.3,
            emissions: 5.0,
            net: 47.3,
            improvement: 27,
            color: 'blue',
            measures: [t('precisionFertilizer'), t('reducedTillage'), t('coverCropping'), t('solarIrrigation')],
          },
          {
            key: 'maxCarbon',
            label: t('scenarioMaxCarbon'),
            desc: t('scenarioMaxCarbonDesc'),
            sequestration: 62.3,
            emissions: 5.0,
            net: 57.3,
            improvement: 54,
            color: 'green',
            measures: [t('agroforestry'), t('biochar'), t('organicTransition'), t('coverCropping'), t('solarIrrigation')],
          },
        ];
        const creditPrice = 11.4;

        return (
          <GlassPanel title={t("carbonOffsetCalculator")} accent="green">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map(s => {
                const borderColor = s.color === 'green' ? 'border-neon-green/40' : s.color === 'blue' ? 'border-holographic-blue/40' : 'border-slate-700/50';
                const accentColor = s.color === 'green' ? 'text-neon-green' : s.color === 'blue' ? 'text-holographic-blue' : 'text-slate-300';
                const bgAccent = s.color === 'green' ? 'bg-neon-green' : s.color === 'blue' ? 'bg-holographic-blue' : 'bg-slate-500';

                return (
                  <div key={s.key} className={`p-4 rounded-lg bg-slate-800/40 border ${borderColor} space-y-3`}>
                    <div>
                      <div className={`text-sm font-bold ${accentColor}`}>{s.label}</div>
                      <div className="text-[9px] text-slate-500">{s.desc}</div>
                    </div>

                    {/* Sequestration bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-400">{t('annualSequestration')}</span>
                        <span className="text-neon-green font-mono">{s.sequestration} t</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-neon-green/60" style={{ width: `${(s.sequestration / 65) * 100}%` }} />
                      </div>
                    </div>

                    {/* Emissions bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-400">{t('annualEmissions')}</span>
                        <span className="text-alert-red font-mono">{s.emissions} t</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-alert-red/60" style={{ width: `${(s.emissions / 65) * 100}%` }} />
                      </div>
                    </div>

                    {/* Net offset hero */}
                    <div className="text-center py-2 border-t border-b border-slate-700/30">
                      <div className="text-[9px] text-slate-500 uppercase">{t('netCarbonOffset')}</div>
                      <div className={`text-2xl font-bold font-mono ${accentColor}`}>{s.net}</div>
                      <div className="text-[9px] text-slate-500">tCO2e/year</div>
                      {s.improvement && (
                        <div className="text-[10px] text-neon-green font-bold mt-1">+{s.improvement}% {t('improvementVsBaseline')}</div>
                      )}
                    </div>

                    {/* Credit value */}
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{t('creditValue')}</span>
                      <span className="text-cyber-yellow font-bold font-mono">${(s.net * creditPrice).toLocaleString()}</span>
                    </div>

                    {/* Measures */}
                    <div className="space-y-1">
                      {s.measures.map(m => (
                        <div key={m} className="flex items-center gap-1.5 text-[9px] text-slate-400">
                          <CheckCircle2 className={`w-3 h-3 ${s.color === 'green' ? 'text-neon-green' : s.color === 'blue' ? 'text-holographic-blue' : 'text-slate-500'}`} />
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          2.6 Emission Source Breakdown
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const emissionSources = [
          { label: t('soilN2O'), value: 2.8, pct: 35, color: '#FF6B35' },
          { label: t('fertilizerManufacture'), value: 1.6, pct: 20, color: '#FFD600' },
          { label: t('dieselMachinery'), value: 1.2, pct: 15, color: '#00B0FF' },
          { label: t('irrigationPumping'), value: 0.96, pct: 12, color: '#AA00FF' },
          { label: t('pesticideUseEmission'), value: 0.8, pct: 10, color: '#FF3D00' },
          { label: t('otherSources'), value: 0.64, pct: 8, color: '#64748b' },
        ];
        const totalEmission = 8.0;

        return (
          <GlassPanel title={t("emissionSourceBreakdown")} accent="red">
            <div className="space-y-4">
              {/* Stacked bar */}
              <div className="flex h-6 rounded-lg overflow-hidden">
                {emissionSources.map(s => (
                  <div key={s.label} className="flex items-center justify-center text-[8px] font-bold text-white" style={{ width: `${s.pct}%`, backgroundColor: s.color }}>
                    {s.pct >= 10 ? `${s.pct}%` : ''}
                  </div>
                ))}
              </div>

              {/* Detail list */}
              <div className="space-y-2">
                {emissionSources.map((s, i) => (
                  <div key={s.label} className={`flex items-center gap-3 p-2 rounded ${i === 0 ? 'bg-alert-red/5 border border-alert-red/20' : 'bg-slate-800/30 border border-slate-700/30'}`}>
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-slate-300 flex-1">{s.label}</span>
                    <span className="text-xs font-mono text-white">{s.value.toFixed(2)} tCO2e</span>
                    <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{s.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Largest contributor highlight */}
              <div className="p-2 rounded bg-alert-red/5 border border-alert-red/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-alert-red shrink-0" />
                <span className="text-[10px] text-slate-300">
                  {t('largestContributor')}: <span className="text-alert-red font-bold">{emissionSources[0].label}</span> — {emissionSources[0].value.toFixed(2)} tCO2e ({emissionSources[0].pct}%)
                </span>
              </div>
            </div>
          </GlassPanel>
        );
      })()}
    </div>
  );
}
