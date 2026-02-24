"use client";

import { useCallback, useEffect, useState } from "react";
import GlassPanel from "@/components/HUD/GlassPanel";
import type { DroneMission } from "@/lib/api-types";
import { useTranslation } from "@/lib/i18n";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Upload,
  Send,
  Download,
  Loader2,
  Rocket,
  Eye,
  Brain,
  ClipboardCheck,
  Plane,
  Database,
} from "lucide-react";

interface StepConfig {
  number: number;
  titleKey: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { number: 1, titleKey: "stepMissionPlanning", icon: <ClipboardCheck className="w-4 h-4" /> },
  { number: 2, titleKey: "stepPreflight", icon: <CheckCircle2 className="w-4 h-4" /> },
  { number: 3, titleKey: "stepInflight", icon: <Plane className="w-4 h-4" /> },
  { number: 4, titleKey: "stepDataCollection", icon: <Database className="w-4 h-4" /> },
  { number: 5, titleKey: "stepAiAnalysis", icon: <Brain className="w-4 h-4" /> },
  { number: 6, titleKey: "stepReport", icon: <Eye className="w-4 h-4" /> },
];

const ZONES = ["alpha", "beta", "gamma"] as const;
const ZONE_NAMES: Record<(typeof ZONES)[number], string> = {
  alpha: "Sector Alpha",
  beta: "Sector Beta",
  gamma: "Sector Gamma",
};

function numberFrom(data: Record<string, unknown> | undefined, key: string, fallback = 0): number {
  const val = data?.[key];
  return typeof val === "number" ? val : fallback;
}

function stringFrom(data: Record<string, unknown> | undefined, key: string, fallback = "-"): string {
  const val = data?.[key];
  return typeof val === "string" ? val : fallback;
}

export default function DroneInspectionWorkflow() {
  const { t, locale } = useTranslation();
  const [mission, setMission] = useState<DroneMission | null>(null);
  const [expandedStep, setExpandedStep] = useState(1);
  const [isBusy, setIsBusy] = useState(false);

  const [targetZone, setTargetZone] = useState<(typeof ZONES)[number]>(ZONES[0]);
  const [altitude, setAltitude] = useState(120);
  const [overlap, setOverlap] = useState(80);
  const [speed, setSpeed] = useState(12);

  const [checklist, setChecklist] = useState<boolean[]>(new Array(6).fill(false));
  const [scanPercent, setScanPercent] = useState(0);
  const [waypointCurrent, setWaypointCurrent] = useState(0);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [aiStepIndex, setAiStepIndex] = useState(-1);

  const currentStep = mission?.currentStep ?? 1;
  const missionId = mission?.missionId;

  const txt = {
    title: { en: "Drone Inspection Workflow", zh: "无人机巡检流程", th: "เวิร์กโฟลว์ตรวจโดรน" },
    lifecycle: { en: "Mission Lifecycle", zh: "任务生命周期", th: "วงจรภารกิจ" },
    noMission: { en: "No mission", zh: "无任务", th: "ไม่มีภารกิจ" },
    abort: { en: "ABORT", zh: "中止", th: "ยกเลิก" },
    targetZone: { en: "TARGET ZONE", zh: "目标区域", th: "โซนเป้าหมาย" },
    area: { en: "Area", zh: "面积", th: "พื้นที่" },
    estFlight: { en: "Est. Flight", zh: "预计飞行", th: "เวลาบินคาดการณ์" },
    createMission: { en: "CREATE MISSION", zh: "创建任务", th: "สร้างภารกิจ" },
    launch: { en: "LAUNCH", zh: "起飞", th: "เริ่มบิน" },
    scanning: { en: "Scanning", zh: "扫描", th: "สแกน" },
    completeFlight: { en: "COMPLETE FLIGHT", zh: "完成飞行", th: "จบบิน" },
    uploadServer: { en: "UPLOAD TO SERVER", zh: "上传到服务器", th: "อัปโหลดขึ้นเซิร์ฟเวอร์" },
    viewReport: { en: "VIEW FULL REPORT", zh: "查看完整报告", th: "ดูรายงานเต็ม" },
    treesCounted: { en: "Trees Counted", zh: "识别树木", th: "จำนวนต้นไม้" },
    diseaseSpots: { en: "Disease Spots", zh: "病害点位", th: "จุดโรค" },
    lodgingAreas: { en: "Lodging Areas", zh: "倒伏区域", th: "พื้นที่ล้ม" },
    carbonEstimate: { en: "Carbon Estimate", zh: "碳估算", th: "คาร์บอนประมาณการ" },
    overallHealth: { en: "OVERALL HEALTH SCORE", zh: "综合健康评分", th: "คะแนนสุขภาพรวม" },
    downloadPdf: { en: "DOWNLOAD PDF", zh: "下载 PDF", th: "ดาวน์โหลด PDF" },
    sendAi: { en: "SEND TO AI ADVISOR", zh: "发送给 AI 顾问", th: "ส่งให้ AI ที่ปรึกษา" },
    waypoint: { en: "Waypoint", zh: "航点", th: "เวย์พอยต์" },
    elapsed: { en: "Elapsed", zh: "耗时", th: "เวลาที่ใช้" },
    uploading: { en: "Uploading...", zh: "上传中...", th: "กำลังอัปโหลด..." },
    preflight1: { en: "Battery > 90%", zh: "电池 > 90%", th: "แบตเตอรี่ > 90%" },
    preflight2: { en: "GPS Signal Strong (>12 satellites)", zh: "GPS 信号良好（>12 颗卫星）", th: "สัญญาณ GPS ดี (>12 ดาวเทียม)" },
    preflight3: { en: "Weather Clear (Wind < 10 m/s)", zh: "天气良好（风速 < 10 m/s）", th: "อากาศปลอดโปร่ง (ลม < 10 m/s)" },
    preflight4: { en: "Camera Calibrated", zh: "相机已校准", th: "ปรับเทียบกล้องแล้ว" },
    preflight5: { en: "Flight Path Approved", zh: "航线已审批", th: "อนุมัติเส้นทางบินแล้ว" },
    preflight6: { en: "No-fly Zone Clear", zh: "禁飞区已确认", th: "ตรวจสอบเขตห้ามบินแล้ว" },
    aiLabel1: { en: "Tree Detection (YOLOv8)", zh: "树木识别 (YOLOv8)", th: "ตรวจจับต้นไม้ (YOLOv8)" },
    aiResult1: { en: "2,450 trees detected", zh: "识别树木 2,450 棵", th: "ตรวจพบต้นไม้ 2,450 ต้น" },
    aiLabel2: { en: "Health Classification", zh: "健康分类", th: "จำแนกสุขภาพ" },
    aiResult2: { en: "2,380 healthy, 70 at risk", zh: "健康 2,380 棵，风险 70 棵", th: "สุขภาพดี 2,380 ต้น เสี่ยง 70 ต้น" },
    aiLabel3: { en: "Crown Segmentation", zh: "树冠分割", th: "แยกเรือนยอด" },
    aiResult3: { en: "Average crown: 4.2m2", zh: "平均冠幅：4.2m2", th: "เรือนยอดเฉลี่ย: 4.2m2" },
    aiLabel4: { en: "NDVI Mapping", zh: "NDVI 建图", th: "ทำแผนที่ NDVI" },
    aiResult4: { en: "Zone health score: 0.82", zh: "区域健康评分：0.82", th: "คะแนนสุขภาพโซน: 0.82" },
    aiLabel5: { en: "Anomaly Detection", zh: "异常检测", th: "ตรวจจับความผิดปกติ" },
    aiResult5: { en: "5 anomalies flagged", zh: "标记异常 5 处", th: "พบความผิดปกติ 5 จุด" },
    unitRai: { en: "rai", zh: "莱", th: "ไร่" },
    unitMin: { en: "min", zh: "分钟", th: "นาที" },
  } as const;

  const zoneLabels = ZONE_NAMES;

  const preflightItems = [
    txt.preflight1[locale],
    txt.preflight2[locale],
    txt.preflight3[locale],
    txt.preflight4[locale],
    txt.preflight5[locale],
    txt.preflight6[locale],
  ];

  const aiSteps = [
    { label: txt.aiLabel1[locale], result: txt.aiResult1.en },
    { label: txt.aiLabel2[locale], result: txt.aiResult2.en },
    { label: txt.aiLabel3[locale], result: txt.aiResult3.en },
    { label: txt.aiLabel4[locale], result: txt.aiResult4.en },
    { label: txt.aiLabel5[locale], result: txt.aiResult5.en },
  ];

  const refreshMission = useCallback(async () => {
    const res = await fetch("/api/drone/inspection", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as DroneMission;
    setMission(data);
    setExpandedStep(data.currentStep);
  }, []);

  useEffect(() => {
    refreshMission();
    const timer = setInterval(refreshMission, 5000);
    return () => clearInterval(timer);
  }, [refreshMission]);

  const callMissionAction = useCallback(
    async (action: "create" | "advance" | "abort", payload?: Record<string, unknown>) => {
      if (isBusy) return;
      setIsBusy(true);
      try {
        const res = await fetch("/api/drone/inspection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, missionId, payload }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as DroneMission;
        setMission(data);
        setExpandedStep(data.currentStep);
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, missionId]
  );

  const areaRai = targetZone === "alpha" ? 125 : targetZone === "beta" ? 95 : 150;
  const estFlightMin = Math.round((areaRai * 0.16) / (speed / 15));
  const allChecked = checklist.every(Boolean);
  const waypointTotal = 67;

  useEffect(() => {
    if (currentStep !== 3) return;
    const step3 = mission?.steps.find((s) => s.step === 3)?.data;
    const start = numberFrom(step3, "progress", 0);
    setScanPercent(start);
    setWaypointCurrent(Math.round((start / 100) * waypointTotal));

    const interval = setInterval(() => {
      setScanPercent((p) => (p >= 100 ? 100 : p + 1.2));
      setWaypointCurrent((w) => (w >= waypointTotal ? waypointTotal : w + 1));
    }, 300);
    return () => clearInterval(interval);
  }, [currentStep, mission]);

  const startUpload = useCallback(() => {
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          void callMissionAction("advance");
          return 100;
        }
        return p + 4;
      });
    }, 150);
  }, [callMissionAction]);

  useEffect(() => {
    if (currentStep !== 5) return;
    setAiStepIndex(-1);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 5; i += 1) {
      timers.push(setTimeout(() => setAiStepIndex(i), (i + 1) * 900));
    }
    return () => timers.forEach(clearTimeout);
  }, [currentStep]);

  const stepStatus = (num: number): "completed" | "active" | "future" => {
    if (num < currentStep) return "completed";
    if (num === currentStep) return "active";
    return "future";
  };

  const toggleCheck = (i: number) =>
    setChecklist((prev) => {
      const n = [...prev];
      n[i] = !n[i];
      return n;
    });

  const step3Data = mission?.steps.find((s) => s.step === 3)?.data;
  const step4Data = mission?.steps.find((s) => s.step === 4)?.data;
  const step6Data = mission?.steps.find((s) => s.step === 6)?.data;

  const scanRaiDone = Math.round((scanPercent / 100) * areaRai);

  return (
    <GlassPanel title={txt.title[locale]} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{txt.lifecycle[locale]}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">{mission?.missionId ?? txt.noMission[locale]}</span>
          {mission && mission.status !== "aborted" && mission.status !== "completed" && (
            <button onClick={() => void callMissionAction("abort")} className="text-[10px] font-mono px-2 py-1 rounded border border-alert-red/40 text-alert-red hover:bg-alert-red/10">
              {txt.abort[locale]}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-0">
        {STEPS.map((step) => {
          const status = stepStatus(step.number);
          const isExpanded = expandedStep === step.number;

          return (
            <div key={step.number} className="relative">
              {step.number < 6 && <div className={`absolute left-[15px] top-[32px] w-0.5 h-full ${status === "completed" ? "bg-neon-green/60" : "bg-white/10"}`} />}

              <button onClick={() => setExpandedStep(isExpanded ? -1 : step.number)} className="flex items-center gap-3 w-full text-left py-2 group">
                <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${status === "completed" ? "border-neon-green bg-neon-green/20 text-neon-green" : status === "active" ? "border-neon-green bg-neon-green/10 text-neon-green shadow-[0_0_12px_rgba(0,230,118,0.4)] animate-pulse" : "border-white/20 bg-white/5 text-gray-600"}`}>
                  {status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-mono font-bold">{step.number}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold tracking-wide ${status === "future" ? "text-gray-600" : "text-white"}`}>{t(step.titleKey)}</div>
                </div>

                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
              </button>

              {isExpanded && (
                <div className="ml-[38px] mb-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3">
                    {step.number === 1 && (
                      <>
                        <div>
                          <label className="text-[10px] font-mono text-gray-500 block mb-1">{txt.targetZone[locale]}</label>
                          <select value={targetZone} onChange={(e) => setTargetZone(e.target.value as (typeof ZONES)[number])} className="w-full bg-dark-bg/80 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-holographic-blue outline-none">
                            {ZONES.map((z) => (
                              <option key={z} value={z}>{zoneLabels[z]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" min={80} max={150} value={altitude} onChange={(e) => setAltitude(+e.target.value)} className="w-full bg-dark-bg/80 border border-white/20 rounded px-2 py-1 text-xs font-mono text-holographic-blue outline-none" />
                          <input type="number" min={70} max={85} value={overlap} onChange={(e) => setOverlap(+e.target.value)} className="w-full bg-dark-bg/80 border border-white/20 rounded px-2 py-1 text-xs font-mono text-holographic-blue outline-none" />
                          <input type="number" min={8} max={20} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full bg-dark-bg/80 border border-white/20 rounded px-2 py-1 text-xs font-mono text-holographic-blue outline-none" />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-gray-500">{txt.area[locale]}: <span className="text-white">{areaRai} {txt.unitRai[locale]}</span></span>
                          <span className="text-gray-500">{txt.estFlight[locale]}: <span className="text-white">{estFlightMin} {txt.unitMin[locale]}</span></span>
                        </div>
                        <button onClick={() => void callMissionAction("create", { targetZone, altitude, overlap, speed, areaCoverRai: areaRai, estimatedMinutes: estFlightMin })} disabled={isBusy} className="w-full py-2 bg-neon-green/20 border border-neon-green text-neon-green text-xs font-bold tracking-wider rounded hover:bg-neon-green/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                          <Rocket className="w-3.5 h-3.5" /> {txt.createMission[locale]}
                        </button>
                      </>
                    )}

                    {step.number === 2 && (
                      <>
                        <div className="space-y-2">
                          {preflightItems.map((item, i) => (
                            <label key={i} className="flex items-center gap-2 cursor-pointer group">
                              <div onClick={() => toggleCheck(i)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${checklist[i] ? "bg-neon-green border-neon-green text-dark-bg" : "border-white/30 hover:border-white/60"}`}>
                                {checklist[i] && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className={`text-xs ${checklist[i] ? "text-neon-green" : "text-gray-400"}`}>{item}</span>
                            </label>
                          ))}
                        </div>
                        <button onClick={() => allChecked && void callMissionAction("advance")} disabled={!allChecked || isBusy} className={`w-full py-2 text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-all ${allChecked ? "bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green/30" : "bg-white/5 border border-white/10 text-gray-600"}`}>
                          <Plane className="w-3.5 h-3.5" /> {txt.launch[locale]}
                        </button>
                      </>
                    )}

                    {step.number === 3 && (
                      <>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: "ALT", value: `${numberFrom(step3Data, "altitude", altitude)}m`, color: "text-holographic-blue" },
                            { label: "SPD", value: `${numberFrom(step3Data, "speed", speed)} m/s`, color: "text-holographic-blue" },
                            { label: "BAT", value: `${numberFrom(step3Data, "battery", 68)}%`, color: "text-neon-green" },
                            { label: "GPS", value: "14 SAT", color: "text-neon-green" },
                          ].map((item) => (
                            <div key={item.label} className="bg-dark-bg/60 rounded p-1.5"><div className="text-[9px] font-mono text-gray-500">{item.label}</div><div className={`text-xs font-mono font-bold ${item.color}`}>{item.value}</div></div>
                          ))}
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] font-mono mb-1"><span className="text-gray-400">{txt.scanning[locale]}: <span className="text-holographic-blue">{Math.min(Math.round(scanPercent), 100)}%</span> ({scanRaiDone}/{areaRai} {txt.unitRai[locale]})</span></div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-holographic-blue rounded-full scan-progress-bar transition-all duration-200" style={{ width: `${Math.min(scanPercent, 100)}%` }} /></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-gray-400"><span>{txt.waypoint[locale]} <span className="text-white">{Math.min(waypointCurrent, waypointTotal)}/{waypointTotal}</span></span><span>{txt.elapsed[locale]}: <span className="text-white">{stringFrom(step3Data, "elapsed", "00:00:00")}</span></span></div>
                        <div className="flex gap-2">
                          <button onClick={() => void callMissionAction("advance")} className="flex-1 py-1.5 bg-holographic-blue/20 border border-holographic-blue text-holographic-blue text-[10px] font-bold rounded hover:bg-holographic-blue/30 transition-all">{txt.completeFlight[locale]}</button>
                          <button onClick={() => void callMissionAction("abort")} className="px-3 py-1.5 bg-alert-red/20 border border-alert-red text-alert-red text-[10px] font-bold rounded hover:bg-alert-red/30 transition-all flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {txt.abort[locale]}</button>
                        </div>
                      </>
                    )}

                    {step.number === 4 && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "RGB Orthomosaic", detail: `${numberFrom(step4Data, "rgbImages", 0).toLocaleString()} images`, sub: "5cm/px" },
                            { label: "Multispectral", detail: `${numberFrom(step4Data, "ndviFrames", 0).toLocaleString()} frames`, sub: "5 bands" },
                            { label: "DSM/DTM", detail: "Point cloud", sub: `${numberFrom(step4Data, "pointCloudSize", 0)}M pts` },
                            { label: "Thermal", detail: `${numberFrom(step4Data, "thermalFrames", 0).toLocaleString()} frames`, sub: "Radiometric" },
                          ].map((d) => (
                            <div key={d.label} className="bg-dark-bg/60 rounded p-2 border border-white/5"><div className="text-[9px] font-mono text-holographic-blue">{d.label}</div><div className="text-xs font-mono text-white">{d.detail}</div><div className="text-[9px] font-mono text-gray-500">{d.sub}</div></div>
                          ))}
                        </div>
                        {uploading || uploadProgress > 0 ? (
                          <div>
                            <div className="flex justify-between text-[10px] font-mono mb-1"><span className="text-gray-400">{txt.uploading[locale]}</span><span className="text-neon-green">{Math.min(uploadProgress, 100)}%</span></div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-neon-green rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} /></div>
                          </div>
                        ) : (
                          <button onClick={startUpload} className="w-full py-2 bg-holographic-blue/20 border border-holographic-blue text-holographic-blue text-xs font-bold tracking-wider rounded hover:bg-holographic-blue/30 transition-all flex items-center justify-center gap-2"><Upload className="w-3.5 h-3.5" /> {txt.uploadServer[locale]}</button>
                        )}
                      </>
                    )}

                    {step.number === 5 && (
                      <>
                        <div className="space-y-2">
                          {aiSteps.map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {i <= aiStepIndex ? <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> : i === aiStepIndex + 1 ? <Loader2 className="w-3.5 h-3.5 text-holographic-blue animate-spin" /> : <Circle className="w-3.5 h-3.5 text-gray-600" />}
                              <div className="flex-1 min-w-0"><span className={`text-[10px] font-mono ${i <= aiStepIndex ? "text-white" : "text-gray-500"}`}>{s.label}</span>{i <= aiStepIndex && <div className="text-[9px] font-mono text-neon-green">{s.result}</div>}</div>
                            </div>
                          ))}
                        </div>
                        {aiStepIndex >= aiSteps.length - 1 && (
                          <button onClick={() => void callMissionAction("advance")} className="w-full py-2 bg-neon-green/20 border border-neon-green text-neon-green text-xs font-bold tracking-wider rounded hover:bg-neon-green/30 transition-all flex items-center justify-center gap-2"><Eye className="w-3.5 h-3.5" /> {txt.viewReport[locale]}</button>
                        )}
                      </>
                    )}

                    {step.number === 6 && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: txt.treesCounted[locale], value: String(numberFrom(step6Data, "totalTrees", 2450)), color: "text-holographic-blue" },
                            { label: txt.diseaseSpots[locale], value: String(numberFrom(step6Data, "diseaseSpots", 3)), color: "text-alert-red" },
                            { label: txt.lodgingAreas[locale], value: `${numberFrom(step6Data, "lodgingRai", 2.5)} ${txt.unitRai[locale]}`, color: "text-yellow-400" },
                            { label: txt.carbonEstimate[locale], value: `${numberFrom(step6Data, "carbonTCO2e", 244)} tCO2e`, color: "text-neon-green" },
                          ].map((r) => (
                            <div key={r.label} className="bg-dark-bg/60 rounded p-2 border border-white/5"><div className="text-[9px] font-mono text-gray-500">{r.label}</div><div className={`text-sm font-mono font-bold ${r.color}`}>{r.value}</div></div>
                          ))}
                        </div>
                        <div className="bg-dark-bg/60 rounded p-3 border border-neon-green/20 text-center"><div className="text-[9px] font-mono text-gray-500 mb-1">{txt.overallHealth[locale]}</div><div className="text-2xl font-mono font-bold text-neon-green">{numberFrom(step6Data, "healthScore", 92)}%</div></div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-holographic-blue/20 border border-holographic-blue text-holographic-blue text-[10px] font-bold rounded hover:bg-holographic-blue/30 transition-all flex items-center justify-center gap-1.5"><Download className="w-3 h-3" /> {txt.downloadPdf[locale]}</button>
                          <button className="flex-1 py-2 bg-neon-green/20 border border-neon-green text-neon-green text-[10px] font-bold rounded hover:bg-neon-green/30 transition-all flex items-center justify-center gap-1.5"><Send className="w-3 h-3" /> {txt.sendAi[locale]}</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
