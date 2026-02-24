"use client";

import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import GlassPanel from "@/components/HUD/GlassPanel";
import AIInterpretation from "@/components/AI/AIInterpretation";
import { mockPestEvidenceChains } from "@/lib/mockData";
import {
  X,
  Leaf,
  Calendar,
  Activity,
  Thermometer,
  Droplets,
  TreePine,
  Bug,
  ShieldAlert,
  Link2,
  Gauge,
} from "lucide-react";

/* ── circular health gauge ──────────────────────────────── */
function HealthGauge({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score > 80
      ? "text-neon-green"
      : score > 50
        ? "text-yellow-400"
        : "text-alert-red";
  const strokeColor =
    score > 80
      ? "stroke-neon-green"
      : score > 50
        ? "stroke-yellow-400"
        : "stroke-alert-red";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" className="drop-shadow-lg">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          className={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
        <text
          x="44"
          y="40"
          textAnchor="middle"
          className={`font-mono text-lg font-bold fill-current ${color}`}
        >
          {score}
        </text>
        <text
          x="44"
          y="54"
          textAnchor="middle"
          className="font-mono text-[9px] fill-slate-400"
        >
          /100
        </text>
      </svg>
      <span className={`text-[10px] font-mono uppercase tracking-wider ${color}`}>
        Health Score
      </span>
    </div>
  );
}

/* ── severity badge ─────────────────────────────────────── */
function SeverityBadge({ severity }: { severity: string }) {
  const cfg: Record<string, { bg: string; text: string }> = {
    severe: { bg: "bg-red-500/20 border-red-500/40", text: "text-red-400" },
    moderate: { bg: "bg-yellow-500/20 border-yellow-500/40", text: "text-yellow-400" },
    mild: { bg: "bg-blue-400/20 border-blue-400/40", text: "text-blue-300" },
    none: { bg: "bg-neon-green/10 border-neon-green/30", text: "text-neon-green" },
  };
  const c = cfg[severity] ?? cfg.none;
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${c.bg} ${c.text}`}
    >
      {severity}
    </span>
  );
}

/* ── canopy condition label ──────────────────────────────── */
function CanopyLabel({ condition }: { condition: string }) {
  const colors: Record<string, string> = {
    excellent: "text-neon-green",
    good: "text-holographic-blue",
    fair: "text-yellow-400",
    poor: "text-alert-red",
  };
  return (
    <span className={`font-mono text-xs ${colors[condition] ?? "text-slate-300"}`}>
      {condition.toUpperCase()}
    </span>
  );
}

/* ── main component ──────────────────────────────────────── */
export default function TreeDetailsPanel() {
  const { selectedTree, setSelectedTree } = useAppStore();
  const { t, locale } = useTranslation();

  const txt = {
    tree: { en: "Tree", zh: "树木", th: "ต้นไม้" },
    healthy: { en: "healthy", zh: "健康", th: "ปกติ" },
    atRisk: { en: "at-risk", zh: "风险", th: "เสี่ยง" },
    unitKg: { en: "kg", zh: "千克", th: "กก." },
    variety: { en: "Variety", zh: "品种", th: "พันธุ์" },
    age: { en: "Age", zh: "树龄", th: "อายุ" },
    height: { en: "Height", zh: "树高", th: "ความสูง" },
    crown: { en: "Crown", zh: "冠幅", th: "เรือนยอด" },
    trunk: { en: "Trunk Circ.", zh: "干围", th: "รอบลำต้น" },
    disease: { en: "Disease", zh: "病害", th: "โรค" },
    confidence: { en: "Confidence", zh: "置信度", th: "ความเชื่อมั่น" },
    canopy: { en: "Canopy", zh: "冠层", th: "เรือนยอด" },
    leafColor: { en: "Leaf Color Idx", zh: "叶色指数", th: "ดัชนีสีใบ" },
    sensors: { en: "Sensor Readings", zh: "传感器数据", th: "ข้อมูลเซ็นเซอร์" },
    soilMoisture: { en: "Soil Moisture", zh: "土壤湿度", th: "ความชื้นดิน" },
    soilTemp: { en: "Soil Temp", zh: "土壤温度", th: "อุณหภูมิดิน" },
    leafWetness: { en: "Leaf Wetness", zh: "叶面湿度", th: "ความชื้นใบ" },
    ambientTemp: { en: "Ambient Temp", zh: "环境温度", th: "อุณหภูมิอากาศ" },
    humidity: { en: "Humidity", zh: "湿度", th: "ความชื้นสัมพัทธ์" },
    viewEvidence: { en: "View Evidence Chain", zh: "查看完整证据链", th: "ดูห่วงโซ่หลักฐาน" },
    carbonContrib: { en: "Carbon Contribution", zh: "碳汇贡献", th: "การมีส่วนร่วมคาร์บอน" },
  } as const;

  if (!selectedTree) return null;

  const tree = selectedTree;
  const hasDisease = tree.disease && tree.diseaseSeverity && tree.diseaseSeverity !== "none";
  const evidenceChain = tree.evidenceChainId
    ? mockPestEvidenceChains.find((c) => c.id === tree.evidenceChainId)
    : null;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-[340px] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pointer-events-auto">
      <GlassPanel title={`${txt.tree[locale]} ${tree.id}`}>
        <button
          onClick={() => setSelectedTree(null)}
          className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-3">
          {/* ── Health Gauge ─────────────────────────────── */}
          {tree.healthScore != null ? (
            <div className="flex justify-center py-1">
              <HealthGauge score={tree.healthScore} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  tree.health === "healthy" ? "bg-neon-green" : "bg-alert-red"
                } animate-pulse`}
              />
              <span className="text-sm font-mono uppercase tracking-wider">
                {tree.health === "healthy" ? txt.healthy[locale] : txt.atRisk[locale]}
              </span>
            </div>
          )}

          {/* ── Basic Info ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-1.5">
            {tree.variety && (
              <div className="bg-white/5 rounded-lg border border-white/5 p-2">
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                  <TreePine className="w-3 h-3" />
                  {txt.variety[locale]}
                </div>
                <div className="font-mono text-holographic-blue text-xs">{tree.variety}</div>
              </div>
            )}
            <div className="bg-white/5 rounded-lg border border-white/5 p-2">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                <Calendar className="w-3 h-3" />
                {txt.age[locale]}
              </div>
              <div className="font-mono text-holographic-blue text-xs">{tree.age} {t("years")}</div>
            </div>
            {tree.heightEstimate != null && (
              <div className="bg-white/5 rounded-lg border border-white/5 p-2">
                <div className="text-[10px] text-gray-500 mb-0.5">{txt.height[locale]}</div>
                <div className="font-mono text-slate-200 text-xs">{tree.heightEstimate.toFixed(1)} m</div>
              </div>
            )}
            {tree.crownDiameter != null && (
              <div className="bg-white/5 rounded-lg border border-white/5 p-2">
                <div className="text-[10px] text-gray-500 mb-0.5">{txt.crown[locale]}</div>
                <div className="font-mono text-slate-200 text-xs">{tree.crownDiameter.toFixed(1)} m</div>
              </div>
            )}
            {tree.trunkCircumference != null && (
              <div className="bg-white/5 rounded-lg border border-white/5 p-2">
                <div className="text-[10px] text-gray-500 mb-0.5">{txt.trunk[locale]}</div>
                <div className="font-mono text-slate-200 text-xs">{tree.trunkCircumference.toFixed(1)} cm</div>
              </div>
            )}
          </div>

          {/* ── Disease Info ────────────────────────────── */}
          {hasDisease && (
            <div className="bg-red-950/30 rounded-lg border border-red-500/20 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-alert-red" />
                  <span className="text-xs font-mono font-semibold text-alert-red">
                    {tree.disease}
                  </span>
                </div>
                <SeverityBadge severity={tree.diseaseSeverity!} />
              </div>
              {tree.diseaseNameTH && (
                <div className="text-[10px] font-mono text-slate-400">{tree.diseaseNameTH}</div>
              )}
              {tree.diseaseConfidence != null && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <ShieldAlert className="w-3 h-3" />
                  {txt.confidence[locale]}: <span className="text-yellow-400">{tree.diseaseConfidence}%</span>
                </div>
              )}
            </div>
          )}

          {/* ── Canopy & Leaf Color ─────────────────────── */}
          {(tree.canopyCondition || tree.leafColorIndex != null) && (
            <div className="grid grid-cols-2 gap-1.5">
              {tree.canopyCondition && (
                <div className="bg-white/5 rounded-lg border border-white/5 p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">{txt.canopy[locale]}</div>
                  <CanopyLabel condition={tree.canopyCondition} />
                </div>
              )}
              {tree.leafColorIndex != null && (
                <div className="bg-white/5 rounded-lg border border-white/5 p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">{txt.leafColor[locale]}</div>
                  <div className={`font-mono text-xs ${tree.leafColorIndex > 0.7 ? "text-neon-green" : tree.leafColorIndex > 0.5 ? "text-yellow-400" : "text-alert-red"}`}>
                    {tree.leafColorIndex.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Sensor Readings ─────────────────────────── */}
          {tree.sensorReadings && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <Gauge className="w-3 h-3" />
                {txt.sensors[locale]}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-white/5 rounded border border-white/5 px-2 py-1.5">
                  <div className="text-[9px] text-gray-500">{txt.soilMoisture[locale]}</div>
                  <div className="font-mono text-xs text-holographic-blue">
                    <Droplets className="w-3 h-3 inline mr-0.5" />
                    {tree.sensorReadings.soilMoisture.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/5 px-2 py-1.5">
                  <div className="text-[9px] text-gray-500">{txt.soilTemp[locale]}</div>
                  <div className="font-mono text-xs text-slate-200">
                    <Thermometer className="w-3 h-3 inline mr-0.5" />
                    {tree.sensorReadings.soilTemp.toFixed(1)}&deg;C
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/5 px-2 py-1.5">
                  <div className="text-[9px] text-gray-500">{txt.leafWetness[locale]}</div>
                  <div className="font-mono text-xs text-slate-200">
                    {tree.sensorReadings.leafWetness.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/5 px-2 py-1.5">
                  <div className="text-[9px] text-gray-500">{txt.ambientTemp[locale]}</div>
                  <div className="font-mono text-xs text-slate-200">
                    {tree.sensorReadings.ambientTemp.toFixed(1)}&deg;C
                  </div>
                </div>
                <div className="col-span-2 bg-white/5 rounded border border-white/5 px-2 py-1.5">
                  <div className="text-[9px] text-gray-500">{txt.humidity[locale]}</div>
                  <div className="font-mono text-xs text-holographic-blue">
                    {tree.sensorReadings.humidity.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Evidence Chain Button ───────────────────── */}
          {tree.evidenceChainId && evidenceChain && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-holographic-blue/30 bg-holographic-blue/5 text-holographic-blue text-[11px] font-mono hover:bg-holographic-blue/10 hover:border-holographic-blue/50 transition-all">
              <Link2 className="w-3.5 h-3.5" />
              {txt.viewEvidence[locale]} ({evidenceChain.evidenceNodes.length} nodes)
            </button>
          )}

          {/* ── Carbon Contribution ─────────────────────── */}
          <div className="bg-white/5 rounded-lg border border-white/5 p-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Leaf className="w-3 h-3" />
              {txt.carbonContrib[locale]}
            </div>
            <div className="font-mono text-neon-green text-sm">
              {tree.carbonStock} {txt.unitKg[locale]} CO2e
            </div>
          </div>

          {/* ── Last Scanned ────────────────────────────── */}
          <div className="bg-white/5 rounded-lg border border-white/5 p-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
              <Activity className="w-3 h-3" />
              {t("lastScanned")}
            </div>
            <div className="font-mono text-xs text-gray-300">
              {new Date(tree.lastScanned).toLocaleString()}
            </div>
          </div>

          {/* ── AI Health Summary ────────────────────────── */}
          {tree.aiHealthSummary && (
            <AIInterpretation
              dataType="Tree Health"
              dataValue={`${tree.healthScore ?? "--"}/100`}
              context={tree.id}
              interpretation={tree.aiHealthSummary}
            />
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
