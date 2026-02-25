'use client';

import React, { useState } from 'react';
import GlassPanel from '@/components/HUD/GlassPanel';
import AIInterpretation from '@/components/AI/AIInterpretation';
import { mockPestEvidenceChains, aiInterpretations } from '@/lib/mockData';
import type { PestEvidenceChain, EvidenceNode } from '@/lib/mockData';
import {
  Sprout, Shield, Calendar, Beaker, Droplets, Bug,
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock, Zap,
  ChevronDown, ChevronUp, Plane, Radio, Brain, CloudRain, MapPin, Leaf,
  Target, Thermometer, Package, Truck, Scissors, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useTranslation } from '@/lib/i18n';

// ── Helper: source icon for evidence nodes ──
function SourceIcon({ source }: { source: EvidenceNode['source'] }) {
  switch (source) {
    case 'drone_rgb':
    case 'drone_multispectral':
    case 'drone_thermal':
      return <Plane className="w-4 h-4 text-holographic-blue" />;
    case 'soil_sensor':
    case 'leaf_wetness_sensor':
      return <Radio className="w-4 h-4 text-neon-green" />;
    case 'ai_analysis':
      return <Brain className="w-4 h-4 text-purple-400" />;
    case 'weather_station':
      return <CloudRain className="w-4 h-4 text-cyber-yellow" />;
    default:
      return <Zap className="w-4 h-4 text-slate-400" />;
  }
}

// ── Helper: severity badge ──
function SeverityBadge({ severity }: { severity: PestEvidenceChain['severity'] }) {
  const colors: Record<string, string> = {
    LOW: 'bg-neon-green/10 text-neon-green border-neon-green/30',
    MEDIUM: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30',
    HIGH: 'bg-alert-red/10 text-alert-red border-alert-red/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colors[severity] ?? colors.LOW}`}>
      {severity}
    </span>
  );
}

// ── Helper: status badge ──
function StatusBadge({ status }: { status: PestEvidenceChain['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    monitoring: { label: 'MONITORING', cls: 'bg-holographic-blue/10 text-holographic-blue border-holographic-blue/30' },
    confirmed: { label: 'CONFIRMED', cls: 'bg-cyber-yellow/10 text-cyber-yellow border-cyber-yellow/30' },
    treating: { label: 'TREATING', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    resolved: { label: 'RESOLVED', cls: 'bg-neon-green/10 text-neon-green border-neon-green/30' },
  };
  const s = map[status] ?? map.monitoring;
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function TabAgronomy({ data }: { data: any }) {
  const { t, locale } = useTranslation();
  const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({});

  const toggleChain = (id: string) =>
    setExpandedChains(prev => ({ ...prev, [id]: !prev[id] }));

  const statusColor = (s: string) => {
    if (s === 'optimal' || s === 'good' || s === 'normal') return 'text-neon-green';
    if (s === 'low' || s === 'warning') return 'text-cyber-yellow';
    return 'text-alert-red';
  };

  const statusBg = (s: string) => {
    if (s === 'optimal' || s === 'good' || s === 'normal') return 'bg-neon-green';
    if (s === 'low' || s === 'warning') return 'bg-cyber-yellow';
    return 'bg-alert-red';
  };

  return (
    <div className="space-y-6">
      {/* ── Row 1: Macro Nutrients + Soil Properties ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Nutrient Analysis */}
        <GlassPanel title={t("macroNutrients") + " (N-P-K)"} accent="green">
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-900/20 border border-green-500/30 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">{t("soilNutrientProfile")}</h4>
                <p className="text-[10px] text-slate-400">{`${t("lastAnalysis")} · ${t("samplePoints")}`}</p>
              </div>
            </div>

            {[
              { key: 'nitrogen', label: `${t('nitrogen')} (N)`, data: data.soil.nitrogen },
              { key: 'phosphorus', label: `${t('phosphorus')} (P)`, data: data.soil.phosphorus },
              { key: 'potassium', label: `${t('potassium')} (K)`, data: data.soil.potassium },
            ].map(({ key, label, data: nutrient }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                  <span className="text-slate-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className={statusColor(nutrient.status)}>{nutrient.value} {nutrient.unit}</span>
                    <span className="text-[9px] text-slate-600">target: {nutrient.target}</span>
                  </div>
                </div>
                <div className="h-5 bg-slate-800 rounded-sm overflow-hidden relative">
                  <div className={`absolute inset-y-0 left-0 ${statusBg(nutrient.status)} transition-all duration-700`} style={{ width: `${nutrient.pct}%` }}></div>
                  <div className="absolute inset-y-0 w-0.5 bg-white/50" style={{ left: `${(nutrient.target / 250) * 100}%` }} title="Target"></div>
                  <div className="absolute inset-0 flex items-center justify-end pr-2">
                    <span className="text-[9px] text-white/70 font-bold">{nutrient.pct}%</span>
                  </div>
                </div>
                {/* Per-nutrient AI interpretation */}
                <AIInterpretation
                  dataType={`${key.charAt(0).toUpperCase() + key.slice(1)} Analysis`}
                  dataValue={`${nutrient.value} ${nutrient.unit}`}
                  context={`Status: ${nutrient.status}`}
                  interpretation={aiInterpretations.soilNutrient(label, nutrient.value, nutrient.unit, nutrient.status)}
                />
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Soil Physical & Chemical Properties */}
        <GlassPanel title={t("soilProperties")} accent="blue">
          <div className="space-y-4 pt-2">
            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("soilPH")}</div>
                <div className={`text-xl font-bold ${statusColor(data.soil.pH.status)}`}>{data.soil.pH.value}</div>
                <div className="text-[9px] text-slate-500">Optimal: {data.soil.pH.optimal}</div>
                {data.soil.pH.status === 'warning' && (
                  <div className="text-[9px] text-cyber-yellow mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {t("belowRange")}
                  </div>
                )}
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("ec")}</div>
                <div className="text-xl font-bold text-white">{data.soil.ec.value} <span className="text-xs text-slate-400">{data.soil.ec.unit}</span></div>
                <div className="text-[9px] text-neon-green mt-1">{t("normalRange")}</div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("organicMatter")}</div>
                <div className="text-xl font-bold text-neon-green">{data.soil.organicMatter.value}%</div>
                <div className="text-[9px] text-slate-500">{t("goodLevel")}</div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-500 uppercase">{t("cec")}</div>
                <div className="text-xl font-bold text-white">{data.soil.cec.value} <span className="text-xs text-slate-400">{data.soil.cec.unit}</span></div>
                <div className="text-[9px] text-neon-green mt-1">{t("goodCapacity")}</div>
              </div>
            </div>

            {/* Soil texture */}
            <div className="pt-3 border-t border-slate-700/30">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 uppercase tracking-wider">{t("soilTexture") + ":"} <span className="text-white font-bold">{data.soil.texture.type}</span></span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                <div className="bg-amber-600/80 transition-all" style={{ width: `${data.soil.texture.sand}%` }} title="Sand"></div>
                <div className="bg-yellow-500/80 transition-all" style={{ width: `${data.soil.texture.silt}%` }} title="Silt"></div>
                <div className="bg-orange-800/80 transition-all" style={{ width: `${data.soil.texture.clay}%` }} title="Clay"></div>
              </div>
              <div className="flex justify-between mt-1.5 text-[9px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-600/80"></span> {t("sand")} {data.soil.texture.sand}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500/80"></span> {t("silt")} {data.soil.texture.silt}%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-800/80"></span> {t("clay")} {data.soil.texture.clay}%</span>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* AI Interpretation for Soil & Nutrients */}
      <AIInterpretation
        dataType="Soil & Nutrient Analysis"
        dataValue={`N:${data.soil.nitrogen.value} P:${data.soil.phosphorus.value} K:${data.soil.potassium.value}`}
        context="Macro Nutrient Profile"
        interpretation={`[Nitrogen (N): ${data.soil.nitrogen.value} ${data.soil.nitrogen.unit} - ${data.soil.nitrogen.status.toUpperCase()}] Nitrogen levels are ${data.soil.nitrogen.status === 'optimal' ? 'within the optimal range for active vegetative growth. Current availability supports protein synthesis, chlorophyll production, and canopy expansion' : 'below target levels. Nitrogen deficiency may lead to chlorosis (yellowing of older leaves), reduced tillering, and lower biomass accumulation'}. Target: ${data.soil.nitrogen.target} ${data.soil.nitrogen.unit}.

[Phosphorus (P): ${data.soil.phosphorus.value} ${data.soil.phosphorus.unit} - ${data.soil.phosphorus.status.toUpperCase()}] ${data.soil.phosphorus.status === 'low' || data.soil.phosphorus.status === 'warning' ? 'Phosphorus is below the recommended threshold. This deficiency limits root development, energy transfer (ATP), and reproductive growth. In tropical laterite soils, P fixation by iron and aluminum oxides is a common challenge. Consider band-applied DAP (diammonium phosphate) at 40-60 kg/ha to improve P availability in the root zone' : 'Phosphorus levels are adequate for current growth stage requirements'}.

[Potassium (K): ${data.soil.potassium.value} ${data.soil.potassium.unit} - ${data.soil.potassium.status.toUpperCase()}] Potassium status is ${data.soil.potassium.status}. K plays a critical role in stomatal regulation, drought tolerance, and sugar transport in sugarcane/rubber. Current levels support adequate osmotic regulation and disease resistance.

[Soil pH: ${data.soil.pH.value}] ${data.soil.pH.status === 'warning' ? 'pH is below the optimal range (' + data.soil.pH.optimal + '). Acidic conditions reduce nutrient availability, particularly P and Ca. Recommend lime application at 1-2 t/ha to correct soil acidity' : 'pH is within the optimal range, supporting maximum nutrient bioavailability'}.

[Soil Texture: ${data.soil.texture.type}] Sand ${data.soil.texture.sand}% / Silt ${data.soil.texture.silt}% / Clay ${data.soil.texture.clay}%. This texture class provides ${data.soil.texture.clay > 30 ? 'good water retention but may require attention to drainage and compaction' : 'balanced drainage and water-holding capacity suitable for crop production'}.

Action Plan:
1. Apply phosphorus correction within 7 days using band placement method
2. Schedule soil re-sampling in 12 days to verify nutrient uptake
3. Monitor pH trends and prepare liming program if acidity continues`}
      />

      {/* ── Row 2: Micronutrients + Pest Risk ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Micronutrient Panel */}
        <GlassPanel title={t("microNutrients")} accent="green">
          <div className="space-y-3 pt-1">
            {data.soil.micronutrients.map((mn: any) => (
              <div key={mn.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{mn.name}</span>
                    <span className={statusColor(mn.status)}>{mn.value} {mn.unit}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${statusBg(mn.status)} transition-all`}
                      style={{ width: `${Math.min((mn.value / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className={`text-[9px] px-1.5 py-0.5 rounded ${mn.status === 'optimal' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                    : 'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/20'
                  }`}>
                  {mn.status.toUpperCase()}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-700/30">
              <div className="text-[10px] text-slate-500">
                <AlertTriangle className="w-3 h-3 inline text-cyber-yellow mr-1" />
                Boron (B) level is below optimal. Consider foliar application.
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Pest & Disease Risk Matrix */}
        <GlassPanel title={t("pestRiskAssessment")} accent="red">
          <div className="space-y-3 pt-1">
            {data.pestRisk.map((pest: any) => (
              <div key={pest.name} className="p-2.5 rounded border border-slate-700/40 bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Bug className={`w-4 h-4 ${pest.severity === 'high' ? 'text-alert-red' :
                        pest.severity === 'medium' ? 'text-cyber-yellow' : 'text-slate-400'
                      }`} />
                    <span className="text-xs font-bold text-slate-200">{pest.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pest.trend === 'rising' && <TrendingUp className="w-3 h-3 text-alert-red" />}
                    {pest.trend === 'declining' && <TrendingDown className="w-3 h-3 text-neon-green" />}
                    {pest.trend === 'stable' && <Minus className="w-3 h-3 text-slate-400" />}
                    <span className={`text-xs font-mono font-bold ${pest.risk >= 60 ? 'text-alert-red' : pest.risk >= 40 ? 'text-cyber-yellow' : 'text-neon-green'
                      }`}>{pest.risk}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pest.risk >= 60 ? 'bg-alert-red shadow-[0_0_6px_rgba(255,61,0,0.4)]'
                        : pest.risk >= 40 ? 'bg-cyber-yellow'
                          : 'bg-neon-green'
                      }`}
                    style={{ width: `${pest.risk}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          NEW: PEST EVIDENCE CHAIN (病虫害证据链)
         ══════════════════════════════════════════════════════════════════════ */}
      <GlassPanel title={t("evidenceChain")} accent="red">
        <div className="space-y-4 pt-1">
          {mockPestEvidenceChains.map((chain) => {
            const isOpen = !!expandedChains[chain.id];
            return (
              <div key={chain.id} className="rounded-lg border border-slate-700/50 bg-slate-900/40 overflow-hidden">
                {/* ── Card Header ── */}
                <button
                  onClick={() => toggleChain(chain.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <Bug className={`w-5 h-5 shrink-0 ${chain.severity === 'CRITICAL' ? 'text-red-400 animate-pulse' :
                        chain.severity === 'HIGH' ? 'text-alert-red' :
                          chain.severity === 'MEDIUM' ? 'text-cyber-yellow' : 'text-neon-green'
                      }`} />
                    <div>
                      <span className="text-sm font-bold text-slate-100">{chain.pestName}</span>
                      <span className="text-xs text-slate-400 ml-2">{chain.pestNameTH}</span>
                    </div>
                    <SeverityBadge severity={chain.severity} />
                    <StatusBadge status={chain.status} />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">{chain.detectedDate}</span>
                    <span className="text-[10px] text-slate-500">{chain.evidenceNodes.length} nodes</span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* ── Expandable Body ── */}
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-5">
                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-700/30">
                        <span>Pathogen: <span className="text-slate-200 italic">{chain.pathogen}</span></span>
                        <span>Affected: <span className="text-alert-red">{chain.affectedTreeIds.length} trees</span></span>
                        <span>Area: <span className="text-slate-200">{chain.affectedArea}</span></span>
                      </div>

                      {/* ── Timeline ── */}
                      <div className="relative pl-5 border-l-2 border-slate-700/60 space-y-6">
                        {chain.evidenceNodes.map((node, idx) => (
                          <div key={node.id} className="relative">
                            {/* Dot */}
                            <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full ring-4 ring-slate-900 ${node.anomalyDetected ? 'bg-alert-red' : 'bg-neon-green'
                              }`}></div>

                            <div className="space-y-2">
                              {/* Timestamp + source */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono text-holographic-blue">
                                  {new Date(node.timestamp).toLocaleString('en-GB', {
                                    month: 'short', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit', hour12: false,
                                  })}
                                </span>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
                                  <SourceIcon source={node.source} />
                                  <span className="text-[9px] text-slate-300">{node.sourceDevice}</span>
                                </div>
                                {node.anomalyDetected && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-alert-red/10 text-alert-red border border-alert-red/30">
                                    ANOMALY
                                  </span>
                                )}
                              </div>

                              {/* Data type + value */}
                              <div className="text-xs text-slate-200 font-medium">{node.dataType}</div>
                              <div className="text-[11px] text-slate-300">{node.value}</div>

                              {/* GPS */}
                              <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                <MapPin className="w-3 h-3" />
                                <span>{node.gpsLat.toFixed(4)}, {node.gpsLng.toFixed(4)}</span>
                              </div>

                              {/* Confidence bar */}
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-500 w-16">Confidence</span>
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-[180px]">
                                  <div
                                    className={`h-full rounded-full transition-all ${node.confidence >= 85 ? 'bg-neon-green' :
                                        node.confidence >= 70 ? 'bg-cyber-yellow' : 'bg-alert-red'
                                      }`}
                                    style={{ width: `${node.confidence}%` }}
                                  ></div>
                                </div>
                                <span className={`text-[10px] font-mono font-bold ${node.confidence >= 85 ? 'text-neon-green' :
                                    node.confidence >= 70 ? 'text-cyber-yellow' : 'text-alert-red'
                                  }`}>{node.confidence}%</span>
                              </div>

                              {/* Description */}
                              <p className="text-[11px] text-slate-400 leading-relaxed">{node.description}</p>

                              {/* AI Interpretation per node */}
                              <AIInterpretation
                                dataType={node.dataType}
                                dataValue={node.value}
                                context={`${chain.pestName} · ${node.sourceDevice}`}
                                interpretation={node.aiInterpretation}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── Chain Summary Footer ── */}
                      <div className="space-y-3 pt-3 border-t border-slate-700/30">
                        {/* Final diagnosis */}
                        <div className="p-3 rounded bg-slate-800/50 border border-slate-700/40">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-holographic-blue" /> {t("finalDiagnosis")}
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{chain.finalDiagnosis}</p>
                        </div>

                        {/* Treatment plan */}
                        <div className="p-3 rounded bg-slate-800/50 border border-slate-700/40">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-neon-green" /> {t("treatmentPlan")}
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{chain.treatmentPlan}</p>
                        </div>

                        {/* AI Report Summary */}
                        <AIInterpretation
                          dataType="Evidence Chain Summary"
                          dataValue={`${chain.pestName} (${chain.severity})`}
                          context={`${chain.evidenceNodes.length} evidence nodes · ${chain.affectedTreeIds.length} trees`}
                          interpretation={chain.aiReportSummary}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* ══════════════════════════════════════════════════════════════════════
          PEST TREATMENT WORKFLOW (病虫害处置工作流)
         ══════════════════════════════════════════════════════════════════════ */}
      <GlassPanel title={t("pestTreatmentWorkflow")} accent="red">
        <div className="space-y-5 pt-1">
          {/* 5-stage timeline */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">{t("disposalPipeline")}</div>
            <div className="flex items-start gap-0">
              {[
                { label: t('discovery'), status: 'completed' as const, time: '2026-02-08 06:30', detail: 'Drone H15-01 multispectral scan', person: 'AI Auto-detect' },
                { label: t('confirm'), status: 'completed' as const, time: '2026-02-08 14:00', detail: 'Pathologist field inspection', person: 'Dr. Somchai K.' },
                { label: t('treat'), status: 'active' as const, time: '2026-02-09 08:00', detail: 'Tridemorph fungicide spray', person: 'Drone H15-01 + G-04' },
                { label: t('review'), status: 'pending' as const, time: '2026-02-16 (est.)', detail: 'NDVI recovery scan', person: 'Drone H15-01' },
                { label: t('closeCase'), status: 'pending' as const, time: '2026-02-28 (est.)', detail: 'Final clearance report', person: 'AI + Agronomist' },
              ].map((stage, i, arr) => (
                <div key={stage.label} className="flex-1 relative">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${stage.status === 'completed' ? 'bg-neon-green/20 text-neon-green border-2 border-neon-green/50' :
                        stage.status === 'active' ? 'bg-holographic-blue/20 text-holographic-blue border-2 border-holographic-blue/50 animate-pulse' :
                          'bg-slate-800 text-slate-500 border-2 border-slate-700'
                      }`}>
                      {stage.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 ${stage.status === 'completed' ? 'bg-neon-green/40' : 'bg-slate-700'
                        }`} />
                    )}
                  </div>
                  <div className="mt-2 pr-2">
                    <div className={`text-[10px] font-bold ${stage.status === 'completed' ? 'text-neon-green' :
                        stage.status === 'active' ? 'text-holographic-blue' : 'text-slate-500'
                      }`}>{stage.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{stage.detail}</div>
                    <div className="text-[9px] text-slate-500">{stage.person}</div>
                    <div className="text-[8px] font-mono text-slate-600 mt-0.5">{stage.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment execution card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/40 border border-purple-500/30">
              <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> {t("treatmentExecution")}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("drug")}</span>
                  <span className="text-slate-200 font-bold">Tridemorph 25% EC</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("concentration")}</span>
                  <span className="text-slate-200">1:500 dilution</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("volume")}</span>
                  <span className="text-slate-200">45L total (3L/tree)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Method 施用方式</span>
                  <span className="text-holographic-blue">Drone spray + Root drench</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{t("executionProgress")}</span>
                    <span className="text-neon-green font-bold">68%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-holographic-blue transition-all" style={{ width: '68%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-700/30">
                  <Clock className="w-3.5 h-3.5 text-cyber-yellow" />
                  <span className="text-[10px] text-cyber-yellow">Next application in 3 days (2026-02-16)</span>
                </div>
              </div>
            </div>

            {/* Recovery tracking */}
            <div className="p-4 rounded-lg bg-slate-800/40 border border-holographic-blue/30">
              <div className="text-[10px] text-holographic-blue uppercase tracking-wider mb-3 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {t("recoveryTracking")}
              </div>
              <div className="space-y-3">
                <div className="text-[10px] text-slate-400 mb-2">{t("ndviRecoveryTrend")}</div>
                {[
                  { label: t('preTreatment'), value: 0.42, color: 'text-alert-red' },
                  { label: t('current'), value: 0.58, color: 'text-cyber-yellow' },
                  { label: t('target'), value: 0.82, color: 'text-neon-green' },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{item.label}</span>
                      <span className={`font-mono font-bold ${item.color}`}>{item.value.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${item.value >= 0.7 ? 'bg-neon-green' : item.value >= 0.5 ? 'bg-cyber-yellow' : 'bg-alert-red'
                        }`} style={{ width: `${item.value * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-700/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px]">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-slate-400">{t("aiRecoveryProb")}</span>
                    <span className="text-neon-green font-bold ml-auto">87.3%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Calendar className="w-3.5 h-3.5 text-holographic-blue" />
                    <span className="text-slate-400">{t("estFullRecovery")}</span>
                    <span className="text-holographic-blue font-bold ml-auto">18 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Plane className="w-3.5 h-3.5 text-cyber-yellow" />
                    <span className="text-slate-400">{t("nextDroneReview")}</span>
                    <span className="text-cyber-yellow font-bold ml-auto">2026-02-16 (weekly)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Treatment Summary */}
          <AIInterpretation
            dataType="Treatment Workflow Analysis"
            dataValue="White Root Disease — Stage 3/5 (Treating)"
            context="15 affected trees · Rubber Zone"
            interpretation={`[处置进度] 当前处于第3阶段「治疗执行」，已完成68%的药剂施用。采用Tridemorph 25% EC灌根+无人机喷洒双重方案，覆盖所有15棵感染树木。

[疗效评估] NDVI从治疗前0.42恢复至当前0.58（+38%），恢复速度高于预期。叶片颜色指数从2.1提升至3.8，冠层密度增加12%。AI模型评估完全恢复概率87.3%，预计18天内达到目标NDVI 0.82。

[风险提示] 3棵树（RUB-Z03-0045/0067/0089）恢复较慢，需要在下次复查时重点监测。若2次复查后仍无明显改善，建议更换为Metalaxyl + Mancozeb联合用药方案。

[下一步行动]
1. 2026-02-16 完成第2次药剂施用（剩余32%区域）
2. 2026-02-16 启动首次无人机NDVI复查扫描
3. 2026-02-23 第2次复查，评估是否需要调整方案
4. 预计2026-02-28 提交结案报告`}
          />
        </div>
      </GlassPanel>

      {/* ── Row 3: Irrigation + Protection Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Irrigation System */}
        <GlassPanel title={t("irrigationMgmt")} accent="blue">
          <div className="space-y-4">
            {/* Status bar */}
            <div className="flex items-center gap-3 p-3 rounded bg-slate-800/40 border border-slate-700/50">
              <Droplets className="w-8 h-8 text-holographic-blue p-1.5 bg-holographic-blue/10 rounded" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-white">{data.irrigation.method}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/30">{data.irrigation.status}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Efficiency: {data.irrigation.efficiency}% · Daily: {data.irrigation.dailyUsage}</div>
              </div>
            </div>

            {/* Cycle info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-slate-800/30 border border-slate-700/40 text-center">
                <div className="text-[9px] text-slate-500 uppercase">{t("lastCycle")}</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{data.irrigation.lastCycle}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/30 border border-slate-700/40 text-center">
                <div className="text-[9px] text-slate-500 uppercase">{t("nextCycle")}</div>
                <div className="text-sm font-bold text-holographic-blue mt-0.5">{data.irrigation.nextCycle}</div>
              </div>
            </div>

            {/* Sector breakdown */}
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t("sectorStatus")}</div>
              {data.irrigation.zones.map((zone: any) => (
                <div key={zone.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 w-20">{zone.name}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${zone.status === 'active' ? 'bg-holographic-blue animate-pulse' :
                          zone.status === 'completed' ? 'bg-neon-green' : 'bg-slate-600'
                        }`}
                      style={{ width: `${zone.moisture}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 w-10 text-right">{zone.moisture}%</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${zone.status === 'active' ? 'bg-holographic-blue/10 text-holographic-blue' :
                      zone.status === 'completed' ? 'bg-neon-green/10 text-neon-green' :
                        'bg-slate-700 text-slate-400'
                    }`}>{zone.status}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Protection History Timeline */}
        <GlassPanel title={t("protectionHistory")} accent="green">
          <div className="relative pl-4 border-l border-slate-700/50 space-y-5">
            {data.protectionHistory.map((item: any, i: number) => (
              <div key={i} className={`relative ${!item.active && 'opacity-60'}`}>
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-slate-900 ${item.active ? 'bg-holographic-blue' : 'bg-slate-600'
                  }`}></div>
                <div className="text-sm font-bold text-slate-200">{item.action}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Target: {item.target} · Coverage: {item.coverage}
                </div>
                <div className={`text-[10px] mt-1 font-mono ${item.active ? 'text-holographic-blue' : 'text-slate-500'}`}>
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* AI Interpretation for Pest & Irrigation */}
      <AIInterpretation
        dataType="Pest & Irrigation Analysis"
        dataValue={`${data.pestRisk.length} risk factors monitored`}
        context="Integrated Pest & Water Management"
        interpretation={`[Pest & Disease Risk Assessment] ${data.pestRisk.filter((p: any) => p.risk >= 60).length} high-risk threats detected out of ${data.pestRisk.length} monitored categories. ${data.pestRisk.filter((p: any) => p.trend === 'rising').length} threats show rising trends requiring immediate attention. The AI model cross-references current weather conditions (humidity, temperature, rainfall) with historical outbreak patterns to generate probability scores.

[Key Risk Factors]
${data.pestRisk.map((p: any) => `- ${p.name}: ${p.risk}% risk (${p.trend}) — ${p.risk >= 60 ? 'CRITICAL: Immediate intervention recommended. Deploy targeted biological or chemical control within 48 hours.' : p.risk >= 40 ? 'WARNING: Monitor closely. Prepare preventive spray schedule.' : 'LOW RISK: Continue routine surveillance.'}`).join('\n')}

[Irrigation System: ${data.irrigation.method}] System efficiency at ${data.irrigation.efficiency}% is ${parseInt(data.irrigation.efficiency) >= 85 ? 'excellent, exceeding the regional benchmark of 80%' : 'below optimal. Consider system maintenance to improve water delivery uniformity'}. Daily usage of ${data.irrigation.dailyUsage} is appropriate for the current growth stage and evapotranspiration demand.

[Sector Analysis] Sectors with moisture below 60% should receive priority in the next irrigation cycle. Active sectors are currently receiving water — ensure cycle completion before scheduled pest spray operations to avoid chemical dilution.

Integrated Recommendations:
1. Coordinate pest spray timing with irrigation cycles — apply chemicals 24h after irrigation for maximum efficacy
2. High-risk pest areas should receive drone-based targeted spraying to minimize chemical usage
3. Maintain soil moisture above 55% in all sectors to support plant immune response against detected pathogens`}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          FERTILIZATION MANAGEMENT (施肥作业管理)
         ══════════════════════════════════════════════════════════════════════ */}
      <GlassPanel title={t("fertilizationMgmt")} accent="green">
        <div className="space-y-5 pt-1">
          {/* 4-stage decision pipeline */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">{t("decisionPipeline")}</div>
            <div className="flex items-start gap-0">
              {[
                { label: t('soilTesting'), status: 'completed' as const, time: '2026-02-10', detail: '12-point soil sampling + lab analysis', person: 'IoT Sensors + Lab' },
                { label: t('aiFormula'), status: 'completed' as const, time: '2026-02-11', detail: 'NPK 15-15-15 + micronutrients', person: 'AI Recommendation Engine' },
                { label: t('execute'), status: 'active' as const, time: '2026-02-15 (plan)', detail: 'Ground Robot G-04 + Drone H15-01', person: 'Pending Approval' },
                { label: t('verify'), status: 'pending' as const, time: '2026-02-27 (est.)', detail: 'Post-application soil + NDVI check', person: 'IoT + Drone' },
              ].map((stage, i, arr) => (
                <div key={stage.label} className="flex-1 relative">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${stage.status === 'completed' ? 'bg-neon-green/20 text-neon-green border-2 border-neon-green/50' :
                        stage.status === 'active' ? 'bg-cyber-yellow/20 text-cyber-yellow border-2 border-cyber-yellow/50 animate-pulse' :
                          'bg-slate-800 text-slate-500 border-2 border-slate-700'
                      }`}>
                      {stage.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 ${stage.status === 'completed' ? 'bg-neon-green/40' : 'bg-slate-700'
                        }`} />
                    )}
                  </div>
                  <div className="mt-2 pr-2">
                    <div className={`text-[10px] font-bold ${stage.status === 'completed' ? 'text-neon-green' :
                        stage.status === 'active' ? 'text-cyber-yellow' : 'text-slate-500'
                      }`}>{stage.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{stage.detail}</div>
                    <div className="text-[9px] text-slate-500">{stage.person}</div>
                    <div className="text-[8px] font-mono text-slate-600 mt-0.5">{stage.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current fertilization plan detail card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/40 border border-neon-green/30">
              <div className="text-[10px] text-neon-green uppercase tracking-wider mb-3 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5" /> {t("currentPlan")}
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("formula")}</span>
                  <span className="text-slate-200 font-bold">NPK 15-15-15 + Ca/Mg/B</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("dosage")}</span>
                  <span className="text-slate-200">25 kg/rai</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Method 施用方式</span>
                  <span className="text-holographic-blue">Ground Robot G-04 (band placement)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("supplement")}</span>
                  <span className="text-holographic-blue">Drone H15-01 foliar spray (B+Zn)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("coverage")}</span>
                  <span className="text-slate-200">20 rai (Rubber Zone)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t("scheduled")}</span>
                  <span className="text-cyber-yellow font-bold">2026-02-15 06:00</span>
                </div>
                <div className="pt-2 border-t border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/30 font-bold">
                      {t("pendingApproval")}
                    </span>
                    <span className="text-[9px] text-slate-500">{t("awaitingSignoff")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fertilization history timeline */}
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {t("applicationHistory")}
              </div>
              <div className="relative pl-4 border-l border-slate-700/50 space-y-4">
                {[
                  {
                    date: '2026-01-18',
                    formula: 'NPK 15-15-15',
                    method: 'Ground Robot G-04',
                    nBefore: 120, nAfter: 165,
                    pBefore: 18, pAfter: 32,
                    kBefore: 140, kAfter: 180,
                    effect: 'good',
                  },
                  {
                    date: '2025-12-05',
                    formula: 'Urea 46-0-0 + KCl',
                    method: 'Manual broadcast',
                    nBefore: 95, nAfter: 148,
                    pBefore: 25, pAfter: 24,
                    kBefore: 110, kAfter: 155,
                    effect: 'good',
                  },
                  {
                    date: '2025-10-20',
                    formula: 'NPK 13-13-21 + Dolomite',
                    method: 'Ground Robot G-04',
                    nBefore: 88, nAfter: 130,
                    pBefore: 15, pAfter: 28,
                    kBefore: 95, kAfter: 165,
                    effect: 'excellent',
                  },
                ].map((rec, i) => (
                  <div key={rec.date} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-slate-900 ${i === 0 ? 'bg-holographic-blue' : 'bg-slate-600'
                      }`} />
                    <div className="text-[10px] font-mono text-holographic-blue">{rec.date}</div>
                    <div className="text-xs text-slate-200 font-bold mt-0.5">{rec.formula}</div>
                    <div className="text-[9px] text-slate-500">{rec.method}</div>
                    <div className="flex gap-3 mt-1.5 text-[9px]">
                      <span className="text-slate-400">N: <span className="text-slate-500">{rec.nBefore}</span><span className="text-neon-green"> → {rec.nAfter}</span></span>
                      <span className="text-slate-400">P: <span className="text-slate-500">{rec.pBefore}</span><span className="text-neon-green"> → {rec.pAfter}</span></span>
                      <span className="text-slate-400">K: <span className="text-slate-500">{rec.kBefore}</span><span className="text-neon-green"> → {rec.kAfter}</span></span>
                    </div>
                    <span className={`text-[8px] mt-1 inline-block px-1.5 py-0.5 rounded ${rec.effect === 'excellent' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' :
                        'bg-holographic-blue/10 text-holographic-blue border border-holographic-blue/20'
                      }`}>{rec.effect.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Fertilization Recommendation */}
          <AIInterpretation
            dataType="Fertilization Strategy Analysis"
            dataValue={`N:${data.soil.nitrogen.value} P:${data.soil.phosphorus.value} K:${data.soil.potassium.value}`}
            context="AI Smart Formula Recommendation"
            interpretation={`[AI智能施肥推荐] 基于当前土壤NPK数据（N:${data.soil.nitrogen.value} ${data.soil.nitrogen.unit}, P:${data.soil.phosphorus.value} ${data.soil.phosphorus.unit}, K:${data.soil.potassium.value} ${data.soil.potassium.unit}）和作物生长阶段分析：

[推荐配方] NPK 15-15-15 复合肥 25kg/rai + 微量元素叶面喷施（硼0.2%+锌0.1%溶液 200L/rai）。磷素偏低需重点补充，建议基施DAP（磷酸二铵）10kg/rai作为磷素快速补充。

[最佳施肥窗口] 2026-02-15 至 2026-02-18（未来3-5天）。理由：(1)天气预报无降雨，利于肥料溶解吸收 (2)土壤含水量62%处于最佳施肥区间 (3)作物正处于营养生长旺盛期，养分需求高峰。

[施用方式建议] 根部区域采用Ground Robot G-04条施（band placement），肥效利用率可达75%以上，优于撒施的40-50%。叶面微量元素由Drone H15-01精准喷施，每次覆盖2rai，预计3小时完成全区作业。

[预期效果]
- 氮素：预计15天内从${data.soil.nitrogen.value}提升至160-170 ${data.soil.nitrogen.unit}（+30%）
- 磷素：预计20天内从${data.soil.phosphorus.value}提升至30-35 ${data.soil.phosphorus.unit}（+60%）
- 钾素：预计12天内从${data.soil.potassium.value}维持在150-160 ${data.soil.potassium.unit}
- NDVI预计提升0.03-0.05，碳汇效率预计提升8-12%

[成本效益] 本次施肥总成本约4,800 THB/rai，预期产量提升12-15%（增收约6,500 THB/rai），投入产出比1:1.35。`}
          />
        </div>
      </GlassPanel>

      {/* ══════════════════════════════════════════════════════════════
          3.1 Crop Growth Lifecycle Calendar
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = 1; // February = index 1
        const phases = [
          { label: t('dormancy'), color: '#64748b', months: [0, 1] },
          { label: t('leafFlush'), color: '#39FF14', months: [2, 3] },
          { label: t('tappingSeason'), color: '#00B0FF', months: [4, 5, 6, 7, 8, 9] },
          { label: t('winterRest'), color: '#FFD600', months: [10, 11] },
        ];
        const actions = [
          { month: 1, label: t('pruning'), color: '#AA00FF' },
          { month: 2, label: t('basalFertilizer'), color: '#39FF14' },
          { month: 3, label: t('pestSurvey'), color: '#FF3D00' },
          { month: 5, label: t('latexCollection'), color: '#00B0FF' },
          { month: 7, label: t('topDressing'), color: '#39FF14' },
          { month: 8, label: t('fungicideSpray'), color: '#FF6B35' },
          { month: 10, label: t('soilAmendment'), color: '#FFD600' },
        ];
        const currentPhaseObj = phases.find(p => p.months.includes(currentMonth));
        const upcoming = actions.filter(a => a.month >= currentMonth && a.month < currentMonth + 3);

        return (
          <GlassPanel title={t("growthLifecycleCalendar")} accent="green">
            <div className="space-y-4">
              {/* Month header */}
              <div className="grid grid-cols-12 gap-0.5">
                {months.map((m, i) => (
                  <div key={m} className={`text-center text-[9px] py-1 rounded-t ${i === currentMonth ? 'bg-holographic-blue/20 text-holographic-blue font-bold border-b-2 border-holographic-blue' : 'text-slate-500'}`}>
                    {m}
                  </div>
                ))}
              </div>

              {/* Phase bands */}
              <div className="space-y-1.5">
                {phases.map(phase => (
                  <div key={phase.label} className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 w-20 text-right shrink-0">{phase.label}</span>
                    <div className="grid grid-cols-12 gap-0.5 flex-1">
                      {months.map((_, i) => (
                        <div key={i} className={`h-5 rounded-sm ${phase.months.includes(i) ? '' : 'bg-transparent'}`}
                          style={{ backgroundColor: phase.months.includes(i) ? phase.color + '40' : undefined, borderLeft: i === currentMonth ? '2px dashed #00B0FF' : undefined }}>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Action markers row */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 w-20 text-right shrink-0">Actions</span>
                  <div className="grid grid-cols-12 gap-0.5 flex-1">
                    {months.map((_, i) => {
                      const action = actions.find(a => a.month === i);
                      return (
                        <div key={i} className="h-5 flex items-center justify-center" style={{ borderLeft: i === currentMonth ? '2px dashed #00B0FF' : undefined }}>
                          {action && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: action.color }} title={action.label} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Current phase + upcoming actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-700/30">
                <div className="p-3 rounded-lg bg-holographic-blue/5 border border-holographic-blue/20">
                  <div className="text-[10px] text-holographic-blue uppercase font-bold mb-1">{t('currentPhase')}</div>
                  <div className="text-sm font-bold text-white">{currentPhaseObj?.label || '-'}</div>
                  <div className="text-[9px] text-slate-400 mt-1">{t('today')}: {months[currentMonth]} 2026</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">{t('upcomingActions')}</div>
                  <div className="space-y-1.5">
                    {upcoming.map(a => (
                      <div key={a.label} className="flex items-center gap-2 text-[10px]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                        <span className="text-slate-300">{a.label}</span>
                        <span className="text-slate-500 ml-auto">{months[a.month]}</span>
                      </div>
                    ))}
                    {upcoming.length === 0 && <div className="text-[10px] text-slate-500">No actions in next 30 days</div>}
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          3.2 IPM Strategy Dashboard
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const overallScore = 78;
        const quadrants = [
          {
            label: t('biologicalControl'), score: 82, color: 'neon-green',
            measures: [
              { name: t('trichodermaApplication'), efficacy: 78, freq: t('monthlyFreq') },
              { name: t('beneficialInsects'), efficacy: 85, freq: t('continuousFreq') },
              { name: t('mycorrhizalInoculation'), efficacy: 72, freq: t('seasonalFreq') },
            ],
          },
          {
            label: t('culturalControl'), score: 75, color: 'cyber-yellow',
            measures: [
              { name: t('cropRotation'), efficacy: 70, freq: t('annualFreq') },
              { name: t('sanitaryPruning'), efficacy: 80, freq: t('quarterlyFreq') },
              { name: t('coverCropping'), efficacy: 75, freq: t('seasonalFreq') },
            ],
          },
          {
            label: t('chemicalControl'), score: 68, color: 'alert-red',
            measures: [
              { name: t('targetedFungicide'), efficacy: 88, freq: t('asNeeded') },
              { name: t('systemicInsecticide'), efficacy: 82, freq: t('asNeeded') },
            ],
          },
          {
            label: t('physicalControl'), score: 85, color: 'holographic-blue',
            measures: [
              { name: t('pheromoneTraps'), efficacy: 75, freq: t('monthlyFreq') },
              { name: t('barrierNetting'), efficacy: 90, freq: t('seasonalFreq') },
            ],
          },
        ];

        return (
          <GlassPanel title={t("ipmStrategyDashboard")} accent="red">
            <div className="space-y-4">
              {/* Center score */}
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={overallScore >= 80 ? '#39FF14' : overallScore >= 60 ? '#FFD600' : '#FF3D00'} strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={`${overallScore * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-white font-mono">{overallScore}</div>
                    <div className="text-[8px] text-slate-400 uppercase">{t('overallIPMScore')}</div>
                  </div>
                </div>
              </div>

              {/* 2x2 quadrants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quadrants.map(q => (
                  <div key={q.label} className={`p-3 rounded-lg bg-slate-800/40 border border-${q.color}/30`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase text-${q.color}`}>{q.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold font-mono text-${q.color}`}>{q.score}</span>
                        <span className="text-[8px] text-slate-500">/100</span>
                        {q.color === 'alert-red' && <span className="text-[8px] px-1 py-0.5 rounded bg-alert-red/10 text-alert-red border border-alert-red/30 font-bold">{t('reducedLabel')}</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {q.measures.map(m => (
                        <div key={m.name} className="space-y-0.5">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-slate-400">{m.name}</span>
                            <span className="text-slate-300 font-mono">{m.efficacy}% {t('efficacy')}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-${q.color}`} style={{ width: `${m.efficacy}%`, opacity: 0.7 }} />
                          </div>
                          <div className="text-[8px] text-slate-600">{m.freq}</div>
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
          3.3 Crop Disease Library with Seasonal Risk Curve
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const diseases = [
          {
            id: 'white-root',
            name: t('whiteRootDisease'),
            pathogen: 'Rigidoporus microporus',
            severity: 'HIGH' as const,
            currentRisk: 72,
            monthlyRisk: [30, 35, 45, 55, 65, 70, 75, 72, 60, 50, 40, 32],
            symptoms: ['Root surface covered with white mycelial threads', 'Yellowing and wilting of leaves', 'Gradual dieback of branches'],
            conditions: ['High soil moisture > 80%', 'Temperature 25-30°C', 'Poor drainage'],
            preventive: ['Improve soil drainage', 'Regular root inspection', 'Trichoderma soil application'],
            curative: ['Tridemorph fungicide root drench', 'Remove severely infected trees', 'Soil sterilization around infected area'],
          },
          {
            id: 'phytophthora',
            name: t('phytophthoraBlight'),
            pathogen: 'Phytophthora palmivora',
            severity: 'MEDIUM' as const,
            currentRisk: 48,
            monthlyRisk: [20, 25, 30, 40, 55, 60, 55, 48, 40, 35, 25, 20],
            symptoms: ['Water-soaked lesions on leaves', 'Dark brown necrotic patches', 'Fruit rot with white sporulation'],
            conditions: ['Prolonged rainfall > 5 days', 'Humidity > 90%', 'Dense canopy with poor air circulation'],
            preventive: ['Canopy management for air circulation', 'Copper-based preventive spray', 'Avoid overhead irrigation'],
            curative: ['Metalaxyl + Mancozeb spray', 'Remove infected fruit and leaves', 'Phosphonate trunk injection'],
          },
          {
            id: 'powdery-mildew',
            name: t('powderyMildew'),
            pathogen: 'Oidium heveae',
            severity: 'MEDIUM' as const,
            currentRisk: 55,
            monthlyRisk: [45, 55, 60, 50, 35, 25, 20, 25, 30, 40, 50, 48],
            symptoms: ['White powdery coating on young leaves', 'Leaf curling and distortion', 'Premature defoliation'],
            conditions: ['Cool dry weather 20-25°C', 'High humidity at night', 'New leaf flush period'],
            preventive: ['Sulfur dust application', 'Resistant variety selection', 'Avoid excessive nitrogen'],
            curative: ['Carbendazim spray', 'Hexaconazole fungicide', 'Remove severely infected leaves'],
          },
          {
            id: 'anthracnose',
            name: t('anthracnose'),
            pathogen: 'Colletotrichum gloeosporioides',
            severity: 'LOW' as const,
            currentRisk: 28,
            monthlyRisk: [15, 20, 25, 35, 45, 50, 55, 50, 40, 30, 20, 15],
            symptoms: ['Sunken dark lesions on fruit', 'Leaf tip necrosis', 'Twig dieback'],
            conditions: ['Warm humid weather', 'Rain splash dispersal', 'Wounded plant tissue'],
            preventive: ['Post-harvest hot water treatment', 'Prune dead twigs', 'Copper fungicide preventive'],
            curative: ['Azoxystrobin spray', 'Prochloraz post-harvest dip', 'Remove infected tissue'],
          },
        ];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = 1;

        return (
          <GlassPanel title={t("diseaseLibrary")} accent="red">
            <div className="space-y-3 pt-1">
              {diseases.map(disease => {
                const isOpen = !!expandedChains[`disease-${disease.id}`];
                const sevColor = disease.severity === 'HIGH' ? 'text-alert-red' : disease.severity === 'MEDIUM' ? 'text-cyber-yellow' : 'text-neon-green';
                const sevBg = disease.severity === 'HIGH' ? 'bg-alert-red/10 border-alert-red/30' : disease.severity === 'MEDIUM' ? 'bg-cyber-yellow/10 border-cyber-yellow/30' : 'bg-neon-green/10 border-neon-green/30';
                const riskChartData = months.map((m, i) => ({ month: m, risk: disease.monthlyRisk[i] }));

                return (
                  <div key={disease.id} className="rounded-lg border border-slate-700/50 bg-slate-900/40 overflow-hidden">
                    {/* Header */}
                    <button onClick={() => toggleChain(`disease-${disease.id}`)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors text-left">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Bug className={`w-5 h-5 shrink-0 ${sevColor}`} />
                        <div>
                          <span className="text-sm font-bold text-slate-100">{disease.name}</span>
                          <span className="text-[10px] text-slate-500 ml-2 italic">{disease.pathogen}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${sevBg}`}>{disease.severity}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-mono font-bold ${disease.currentRisk >= 60 ? 'text-alert-red' : disease.currentRisk >= 40 ? 'text-cyber-yellow' : 'text-neon-green'}`}>{disease.currentRisk}%</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Expandable body */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-4">
                          {/* Risk curve chart */}
                          <div>
                            <div className="text-[9px] text-slate-500 uppercase mb-1">{t('seasonalRiskCurve')}</div>
                            <div className="min-h-[220px] lg:min-h-0 lg:h-[120px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={riskChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id={`risk-${disease.id}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#FF3D00" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#FF3D00" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(255,61,0,0.3)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }} />
                                  <Area type="monotone" dataKey="risk" stroke="#FF3D00" strokeWidth={2} fill={`url(#risk-${disease.id})`} dot={{ r: 2, fill: '#FF3D00' }} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Detail grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="text-[9px] text-slate-500 uppercase font-bold">{t('symptoms')}</div>
                              {disease.symptoms.map((s, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                                  <AlertTriangle className="w-3 h-3 text-alert-red shrink-0 mt-0.5" />{s}
                                </div>
                              ))}
                              <div className="text-[9px] text-slate-500 uppercase font-bold mt-3">{t('favorableConditions')}</div>
                              {disease.conditions.map((c, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400">
                                  <CloudRain className="w-3 h-3 text-cyber-yellow shrink-0 mt-0.5" />{c}
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <div className="text-[9px] text-slate-500 uppercase font-bold">{t('preventiveMeasures')}</div>
                              {disease.preventive.map((p, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                                  <Shield className="w-3 h-3 text-neon-green shrink-0 mt-0.5" />{p}
                                </div>
                              ))}
                              <div className="text-[9px] text-slate-500 uppercase font-bold mt-3">{t('curativeMeasures')}</div>
                              {disease.curative.map((c, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                                  <Zap className="w-3 h-3 text-holographic-blue shrink-0 mt-0.5" />{c}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          3.4 Harvest Planning & Quality Prediction
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const daysLeft = 42;
        const readiness = 68;
        const yieldEst = 12.5;
        const ciLow = 11.2;
        const ciHigh = 13.8;
        const grades = { a: 45, b: 30, c: 18, reject: 7 };
        const qualityFactors = [
          { label: t('fruitSize'), score: 82, color: 'neon-green' },
          { label: t('sugarContent'), score: 75, color: 'holographic-blue' },
          { label: t('colorUniformity'), score: 88, color: 'neon-green' },
          { label: t('pestDamage'), score: 92, color: 'neon-green' },
        ];

        return (
          <GlassPanel title={t("harvestPlanning")} accent="green">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                {/* Days countdown */}
                <div className="text-center p-4 rounded-lg bg-cyber-yellow/5 border border-cyber-yellow/20">
                  <div className="text-[10px] text-slate-400 uppercase">{t('daysRemaining')}</div>
                  <div className="text-5xl font-bold text-cyber-yellow font-mono">{daysLeft}</div>
                  <div className="text-[10px] text-slate-500">{t('estimatedHarvestDate')}: 2026-03-27</div>
                </div>

                {/* Harvest window bar */}
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase">{t('harvestWindow')}</div>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div className="bg-slate-700" style={{ width: '20%' }} />
                    <div className="bg-neon-green/40 border-x border-neon-green" style={{ width: '30%' }} />
                    <div className="bg-neon-green/70 flex items-center justify-center text-[8px] text-white font-bold" style={{ width: '25%' }}>OPTIMAL</div>
                    <div className="bg-cyber-yellow/40" style={{ width: '15%' }} />
                    <div className="bg-slate-700" style={{ width: '10%' }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-600">
                    <span>Mar 20</span><span>Mar 25</span><span>Apr 5</span><span>Apr 10</span>
                  </div>
                </div>

                {/* Readiness score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{t('readinessScore')}</span>
                    <span className="text-cyber-yellow font-bold font-mono">{readiness}%</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyber-yellow/60 to-neon-green" style={{ width: `${readiness}%` }} />
                  </div>
                </div>

                {/* Labor requirement */}
                <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 uppercase mb-2">{t('laborRequirement')}</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Workers</span><span className="text-white font-mono">15</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-white font-mono">5 days</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Equipment</span><span className="text-white font-mono">3 units</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Est. Cost</span><span className="text-cyber-yellow font-mono">฿45,000</span></div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Yield estimate */}
                <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                  <div className="text-[10px] text-slate-400 uppercase">{t('yieldEstimate')}</div>
                  <div className="text-3xl font-bold text-neon-green font-mono">{yieldEst} <span className="text-sm text-slate-400">ton/rai</span></div>
                  <div className="text-[10px] text-slate-500">{t('confidenceInterval')}: {ciLow} — {ciHigh} ton/rai</div>
                  <div className="mt-1.5 h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute h-full bg-neon-green/20 rounded-full" style={{ left: `${(ciLow / 16) * 100}%`, width: `${((ciHigh - ciLow) / 16) * 100}%` }} />
                    <div className="absolute h-full w-1 bg-neon-green rounded-full" style={{ left: `${(yieldEst / 16) * 100}%` }} />
                  </div>
                </div>

                {/* Quality grades stacked bar */}
                <div className="space-y-2">
                  <div className="text-[9px] text-slate-500 uppercase">{t('qualityPrediction')}</div>
                  <div className="flex h-6 rounded-lg overflow-hidden">
                    <div className="bg-neon-green/70 flex items-center justify-center text-[8px] font-bold text-white" style={{ width: `${grades.a}%` }}>{t('gradeA')} {grades.a}%</div>
                    <div className="bg-holographic-blue/70 flex items-center justify-center text-[8px] font-bold text-white" style={{ width: `${grades.b}%` }}>{t('gradeB')} {grades.b}%</div>
                    <div className="bg-cyber-yellow/70 flex items-center justify-center text-[8px] font-bold text-white" style={{ width: `${grades.c}%` }}>{t('gradeC')} {grades.c}%</div>
                    <div className="bg-alert-red/70 flex items-center justify-center text-[8px] font-bold text-white" style={{ width: `${grades.reject}%` }}>{grades.reject}%</div>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-neon-green/70" />{t('gradeA')}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-holographic-blue/70" />{t('gradeB')}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyber-yellow/70" />{t('gradeC')}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-alert-red/70" />{t('rejectGrade')}</span>
                  </div>
                </div>

                {/* Quality factors */}
                <div className="space-y-2">
                  {qualityFactors.map(f => (
                    <div key={f.label} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">{f.label}</span>
                        <span className={`text-${f.color} font-mono font-bold`}>{f.score}/100</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-${f.color}`} style={{ width: `${f.score}%`, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          3.5 Post-Harvest Management Workflow
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const phStages = [
          { label: t('collectionStage'), status: 'completed' as const, detail: 'Manual harvest + transport to collection point', icon: Scissors },
          { label: t('qualitySorting'), status: 'completed' as const, detail: 'Size/color grading, defect removal', icon: Target },
          { label: t('postHarvestTreatment'), status: 'active' as const, detail: `${t('hotWaterDip')} + ${t('modifiedAtmosphere')}`, icon: Beaker },
          { label: t('packagingStage'), status: 'pending' as const, detail: 'Modified atmosphere packaging', icon: Package },
          { label: t('coldChainDelivery'), status: 'pending' as const, detail: 'Refrigerated truck to distribution center', icon: Truck },
        ];
        const storageMetrics = [
          { label: t('temperature'), current: '13°C', target: '12-14°C', ok: true },
          { label: t('humidity'), current: '85%', target: '85-90%', ok: true },
          { label: t('ethyleneLevel'), current: '0.8 ppm', target: '< 1.0 ppm', ok: true },
          { label: t('co2Level'), current: '3.2%', target: '2-5%', ok: true },
        ];

        return (
          <GlassPanel title={t("postHarvestWorkflow")} accent="blue">
            <div className="space-y-5">
              {/* Pipeline */}
              <div className="flex items-start gap-0">
                {phStages.map((stage, i, arr) => {
                  const Icon = stage.icon;
                  return (
                    <div key={stage.label} className="flex-1 relative">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${stage.status === 'completed' ? 'bg-neon-green/20 text-neon-green border-2 border-neon-green/50' :
                            stage.status === 'active' ? 'bg-holographic-blue/20 text-holographic-blue border-2 border-holographic-blue/50 animate-pulse' :
                              'bg-slate-800 text-slate-500 border-2 border-slate-700'
                          }`}>
                          {stage.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`flex-1 h-0.5 ${stage.status === 'completed' ? 'bg-neon-green/40' : 'bg-slate-700'}`} />
                        )}
                      </div>
                      <div className="mt-2 pr-2">
                        <div className={`text-[10px] font-bold ${stage.status === 'completed' ? 'text-neon-green' :
                            stage.status === 'active' ? 'text-holographic-blue' : 'text-slate-500'
                          }`}>{stage.label}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{stage.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Storage conditions monitoring */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('storageConditions')}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {storageMetrics.map(m => (
                    <div key={m.label} className={`p-3 rounded-lg bg-slate-800/40 border ${m.ok ? 'border-neon-green/20' : 'border-alert-red/30'}`}>
                      <div className="text-[9px] text-slate-500 uppercase">{m.label}</div>
                      <div className={`text-lg font-bold font-mono ${m.ok ? 'text-neon-green' : 'text-alert-red'}`}>{m.current}</div>
                      <div className="text-[9px] text-slate-500">{t('target')}: {m.target}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-harvest loss + shelf life summary */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/30">
                <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 uppercase">{t('postHarvestLoss')}</div>
                  <div className="text-xl font-bold text-cyber-yellow font-mono">3.2%</div>
                  <div className="text-[9px] text-neon-green">Below industry avg (5-8%)</div>
                </div>
                <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 uppercase">{t('shelfLife')}</div>
                  <div className="text-xl font-bold text-holographic-blue font-mono">18 {t('days')}</div>
                  <div className="text-[9px] text-slate-400">With MA packaging + cold chain</div>
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}
    </div>
  );
}
