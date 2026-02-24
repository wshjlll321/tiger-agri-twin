'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import GlassPanel from '@/components/HUD/GlassPanel';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';

/* ── i18n labels ─────────────────────────────────────────── */
const labels: Record<string, Record<'en' | 'zh' | 'th', string>> = {
  droneLive:      { en: 'DRONE LIVE',         zh: '无人机实况',       th: 'โดรนสด' },
  fpvFeed:        { en: 'FPV CAMERA FEED',    zh: 'FPV 摄像头画面',  th: 'ฟีดกล้อง FPV' },
  flightRoute:    { en: 'FLIGHT ROUTE',       zh: '航线进度',         th: 'เส้นทางบิน' },
  telemetry:      { en: 'TELEMETRY',          zh: '遥测数据',         th: 'ข้อมูลเทเลเมทรี' },
  findings:       { en: 'INSPECTION LOG',     zh: '巡检发现',         th: 'บันทึกการตรวจ' },
  altitude:       { en: 'ALT',                zh: '高度',             th: 'ความสูง' },
  speed:          { en: 'SPD',                zh: '速度',             th: 'ความเร็ว' },
  battery:        { en: 'BAT',                zh: '电量',             th: 'แบตเตอรี่' },
  gps:            { en: 'GPS',                zh: 'GPS',              th: 'GPS' },
  coverage:       { en: 'SCAN COVERAGE',      zh: '扫描覆盖率',      th: 'ครอบคลุมการสแกน' },
  progress:       { en: 'PROGRESS',           zh: '进度',             th: 'ความคืบหน้า' },
  completed:      { en: 'COMPLETED',          zh: '已完成',           th: 'เสร็จสิ้น' },
  remaining:      { en: 'REMAINING',          zh: '剩余',             th: 'คงเหลือ' },
  treesDetected:  { en: 'Trees Detected',     zh: '检测到树木',       th: 'ตรวจพบต้นไม้' },
  anomalies:      { en: 'Anomalies',          zh: '异常标记',         th: 'ความผิดปกติ' },
  zone:           { en: 'Zone',               zh: '地块',             th: 'โซน' },
  crop:           { en: 'Crop',               zh: '作物',             th: 'พืช' },
  area:           { en: 'Area',               zh: '面积',             th: 'พื้นที่' },
  normal:         { en: 'NORMAL',             zh: '正常',             th: 'ปกติ' },
  abnormal:       { en: 'ABNORMAL',           zh: '异常',             th: 'ผิดปกติ' },
  severe:         { en: 'SEVERE',             zh: '严重',             th: 'รุนแรง' },
  descNormal1:    { en: 'Canopy structure nominal',               zh: '冠层结构正常',            th: 'โครงสร้างร่มใบปกติ' },
  descNormal2:    { en: 'NDVI reading within optimal range',      zh: 'NDVI 指数在正常范围内',   th: 'ค่า NDVI อยู่ในช่วงปกติ' },
  descNormal3:    { en: 'Soil moisture adequate',                  zh: '土壤湿度良好',            th: 'ความชื้นดินเพียงพอ' },
  descAbnormal1:  { en: 'Leaf discoloration detected — possible nutrient deficiency', zh: '检测到叶片变色 — 疑似缺素', th: 'ตรวจพบใบเปลี่ยนสี — อาจขาดสารอาหาร' },
  descAbnormal2:  { en: 'Irregular canopy gap — wind damage suspected',              zh: '冠层间隙异常 — 疑似风害',   th: 'ช่องว่างร่มใบผิดปกติ — สงสัยลมแรง' },
  descSevere1:    { en: 'Fungal infection cluster identified — 5 trees affected',    zh: '发现真菌感染群 — 影响5棵树', th: 'พบกลุ่มติดเชื้อรา — ต้นไม้ 5 ต้นได้รับผลกระทบ' },
  descSevere2:    { en: 'Root rot symptoms — immediate intervention required',       zh: '根腐病症状 — 需立即处理',   th: 'อาการรากเน่า — ต้องดำเนินการทันที' },
};

type FindingSeverity = 'normal' | 'abnormal' | 'severe';

interface Finding {
  id: number;
  time: string;
  lat: string;
  lng: string;
  severity: FindingSeverity;
  description: string;
}

/* ── helper: format time ─────────────────────────────────── */
function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── component ───────────────────────────────────────────── */
export default function ZoneDroneTracker({ data }: { data: any }) {
  const { locale } = useTranslation();
  const droneStatus = useAppStore((s) => s.droneStatus);

  const t = (key: string): string =>
    labels[key]?.[locale] ?? labels[key]?.en ?? key;

  /* ── telemetry state (animated via rAF) ───────────────── */
  const [alt, setAlt] = useState(droneStatus.altitude);
  const [spd, setSpd] = useState(droneStatus.speed);
  const [bat, setBat] = useState(droneStatus.battery);
  const [lat, setLat] = useState(droneStatus.lat);
  const [lng, setLng] = useState(droneStatus.lng);
  const [coveragePct, setCoverage] = useState(droneStatus.scanProgress);
  const rafRef = useRef<number>(0);
  const lastTick = useRef(performance.now());

  useEffect(() => {
    const tick = (now: number) => {
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      // subtle oscillation to simulate real telemetry
      setAlt((v) => Math.round(Math.max(30, Math.min(200, v + (Math.random() - 0.5) * 2 * dt * 10))));
      setSpd((v) => +(Math.max(0, Math.min(25, v + (Math.random() - 0.48) * dt * 4))).toFixed(1));
      setBat((v) => +(Math.max(5, v - 0.002 * dt)).toFixed(1));
      setLat((v) => +(v + (Math.random() - 0.5) * 0.00002).toFixed(6));
      setLng((v) => +(v + (Math.random() - 0.5) * 0.00002).toFixed(6));
      setCoverage((v) => +(Math.min(100, v + 0.015 * dt)).toFixed(1));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── scanline animation ───────────────────────────────── */
  const [scanY, setScanY] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScanY((p) => (p + 1) % 100), 50);
    return () => clearInterval(id);
  }, []);

  /* ── route progress ───────────────────────────────────── */
  const points = data?.dronePath?.points ?? [];
  const totalWaypoints = Math.max(points.length, 12);
  const [waypointIdx, setWaypointIdx] = useState(Math.floor(totalWaypoints * 0.4));
  useEffect(() => {
    const id = setInterval(() => {
      setWaypointIdx((i) => (i < totalWaypoints - 1 ? i + 1 : i));
    }, 4000);
    return () => clearInterval(id);
  }, [totalWaypoints]);
  const routePct = Math.round((waypointIdx / Math.max(totalWaypoints - 1, 1)) * 100);

  /* ── FPV counter animation ────────────────────────────── */
  const [treesDetected, setTreesDetected] = useState(142);
  const [anomalyCount, setAnomalyCount] = useState(3);
  useEffect(() => {
    const id = setInterval(() => {
      setTreesDetected((v) => v + Math.floor(Math.random() * 3));
      if (Math.random() > 0.85) setAnomalyCount((v) => v + 1);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  /* ── timestamp ────────────────────────────────────────── */
  const [timestamp, setTimestamp] = useState(fmtTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTimestamp(fmtTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── camera drift for FPV ─────────────────────────────── */
  const [camX, setCamX] = useState(0);
  const [camY, setCamY] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCamX(Math.sin(Date.now() / 2400) * 6);
      setCamY(Math.cos(Date.now() / 3100) * 4);
    }, 60);
    return () => clearInterval(id);
  }, []);

  /* ── findings log ─────────────────────────────────────── */
  const descPool: Record<FindingSeverity, string[]> = {
    normal:   ['descNormal1', 'descNormal2', 'descNormal3'],
    abnormal: ['descAbnormal1', 'descAbnormal2'],
    severe:   ['descSevere1', 'descSevere2'],
  };
  const findingIdRef = useRef(0);

  const genFinding = useCallback((): Finding => {
    const rng = Math.random();
    const severity: FindingSeverity = rng > 0.85 ? 'severe' : rng > 0.55 ? 'abnormal' : 'normal';
    const pool = descPool[severity];
    const descKey = pool[Math.floor(Math.random() * pool.length)];
    findingIdRef.current += 1;
    return {
      id: findingIdRef.current,
      time: fmtTime(new Date()),
      lat: (droneStatus.lat + (Math.random() - 0.5) * 0.001).toFixed(5),
      lng: (droneStatus.lng + (Math.random() - 0.5) * 0.001).toFixed(5),
      severity,
      description: t(descKey),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const [findings, setFindings] = useState<Finding[]>(() => [genFinding(), genFinding()]);
  useEffect(() => {
    const id = setInterval(() => {
      setFindings((prev) => [genFinding(), ...prev].slice(0, 30));
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [genFinding]);

  /* ── severity styling ─────────────────────────────────── */
  const sevStyle: Record<FindingSeverity, { border: string; text: string; bg: string; label: string }> = {
    normal:   { border: 'border-neon-green/30',        text: 'text-neon-green',       bg: 'bg-neon-green/10',       label: t('normal') },
    abnormal: { border: 'border-cyber-yellow/30',      text: 'text-cyber-yellow',     bg: 'bg-cyber-yellow/10',     label: t('abnormal') },
    severe:   { border: 'border-alert-red/30',         text: 'text-alert-red',        bg: 'bg-alert-red/10',        label: t('severe') },
  };

  /* ── SVG mini route ───────────────────────────────────── */
  const svgW = 280;
  const svgH = 180;
  const routePoints = (() => {
    if (points.length >= 2) {
      // normalise real points to SVG space
      const lats = points.map((p: number[]) => p[0]);
      const lngs = points.map((p: number[]) => p[1]);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
      const rLat = maxLat - minLat || 1;
      const rLng = maxLng - minLng || 1;
      return points.map((p: number[]) => ({
        x: 20 + ((p[1] - minLng) / rLng) * (svgW - 40),
        y: 20 + (1 - (p[0] - minLat) / rLat) * (svgH - 40),
      }));
    }
    // fallback: generate a zigzag patrol pattern
    const pts: { x: number; y: number }[] = [];
    const rows = 5;
    const cols = 3;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cc = r % 2 === 0 ? c : cols - 1 - c;
        pts.push({
          x: 25 + (cc / (cols - 1)) * (svgW - 50),
          y: 20 + (r / (rows - 1)) * (svgH - 40),
        });
      }
    }
    return pts;
  })();

  const completedSegments = Math.min(waypointIdx, routePoints.length - 1);
  const currentPt = routePoints[Math.min(completedSegments, routePoints.length - 1)];

  const polylineStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="space-y-4">
      {/* ── Header strip ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-sm text-neon-green font-semibold uppercase tracking-wider">
            {t('droneLive')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span>{t('zone')}: <span className="text-slate-200">{data?.name ?? '—'}</span></span>
          <span className="text-slate-600">|</span>
          <span>{t('crop')}: <span className="text-slate-200">{data?.crop ?? '—'}</span></span>
          <span className="text-slate-600">|</span>
          <span>{t('area')}: <span className="text-slate-200">{data?.area ?? '—'}</span></span>
        </div>
      </div>

      {/* ── Main 2-col grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ════════ 1. FPV Camera Feed ════════════════════ */}
        <GlassPanel title={`▣ ${t('fpvFeed')}`} accent="green">
          <div
            className="relative w-full aspect-[16/10] rounded overflow-hidden bg-gradient-to-br from-green-950/80 via-slate-900/90 to-green-900/60 border border-white/5"
            style={{ transform: `translate(${camX}px, ${camY}px)`, transition: 'transform 0.3s ease-out' }}
          >
            {/* scan lines overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,100,0.03) 2px, rgba(0,255,100,0.03) 4px)',
              }}
            />

            {/* moving scan bar */}
            <div
              className="pointer-events-none absolute left-0 right-0 h-[2px] z-20 bg-neon-green/30"
              style={{ top: `${scanY}%`, boxShadow: '0 0 8px rgba(0,230,118,0.4)' }}
            />

            {/* AR bounding boxes */}
            <div className="absolute top-[15%] left-[10%] w-[30%] h-[38%] border border-neon-green/40 rounded-sm z-10 animate-pulse">
              <span className="absolute -top-3 left-0 text-[8px] font-mono text-neon-green/70">
                OBJ-01 P:0.96
              </span>
              <span className="absolute bottom-1 left-1 text-[7px] font-mono text-neon-green/50">
                RUBBER TREE
              </span>
            </div>
            <div className="absolute top-[25%] right-[12%] w-[24%] h-[30%] border border-holographic-blue/40 rounded-sm z-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <span className="absolute -top-3 left-0 text-[8px] font-mono text-holographic-blue/70">
                OBJ-02 P:0.89
              </span>
            </div>
            <div className="absolute bottom-[22%] left-[38%] w-[18%] h-[22%] border border-cyber-yellow/50 rounded-sm z-10 animate-pulse" style={{ animationDelay: '1.2s' }}>
              <span className="absolute -top-3 left-0 text-[8px] font-mono text-cyber-yellow/70">
                ANOMALY P:0.74
              </span>
            </div>

            {/* crosshair */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="relative w-8 h-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-2.5 bg-white/40" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-2.5 bg-white/40" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-2.5 bg-white/40" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-2.5 bg-white/40" />
                <div className="absolute inset-[8px] rounded-full border border-white/20" />
              </div>
            </div>

            {/* REC + LIVE — top left */}
            <div className="absolute top-2 left-2 flex items-center gap-2 z-30">
              <div className="flex items-center gap-1 bg-red-600/80 px-1.5 py-0.5 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[8px] font-mono font-bold text-white">REC</span>
              </div>
              <span className="text-[8px] font-mono font-bold text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded border border-neon-green/30">
                LIVE
              </span>
            </div>

            {/* timestamp — top right */}
            <div className="absolute top-2 right-2 z-30">
              <span className="text-[9px] font-mono text-slate-300 bg-black/40 px-1.5 py-0.5 rounded">
                {timestamp}
              </span>
            </div>

            {/* AR info overlay — bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-black/60 border-t border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono text-slate-300">
                  {t('treesDetected')}: <span className="text-neon-green font-semibold">{treesDetected}</span>
                </span>
                <span className="text-[9px] font-mono text-slate-300">
                  {t('anomalies')}: <span className="text-cyber-yellow font-semibold">{anomalyCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-slate-300">
                  ALT <span className="text-neon-green">{alt}m</span>
                </span>
                <span className="text-[9px] font-mono text-slate-300">
                  SPD <span className="text-neon-green">{spd}m/s</span>
                </span>
                <span className="text-[9px] font-mono text-slate-300">
                  BAT{' '}
                  <span className={bat > 30 ? 'text-neon-green' : 'text-alert-red'}>
                    {Math.round(bat)}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* ════════ 2. Flight Route Panel ═════════════════ */}
        <GlassPanel title={`◈ ${t('flightRoute')}`} accent="blue">
          <div className="space-y-3">
            {/* SVG mini route map */}
            <div className="relative w-full bg-slate-900/60 border border-slate-700/40 rounded overflow-hidden" style={{ aspectRatio: `${svgW}/${svgH}` }}>
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* grid lines */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line key={`gx${i}`} x1={0} y1={(svgH / 5) * i} x2={svgW} y2={(svgH / 5) * i} stroke="rgba(100,116,139,0.12)" strokeWidth={0.5} />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`gy${i}`} x1={(svgW / 7) * i} y1={0} x2={(svgW / 7) * i} y2={svgH} stroke="rgba(100,116,139,0.12)" strokeWidth={0.5} />
                ))}

                {/* remaining path — gray dashed */}
                <polyline
                  points={polylineStr(routePoints)}
                  fill="none"
                  stroke="rgba(148,163,184,0.25)"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                />

                {/* completed path — green */}
                {completedSegments > 0 && (
                  <polyline
                    points={polylineStr(routePoints.slice(0, completedSegments + 1))}
                    fill="none"
                    stroke="rgb(0,230,118)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* waypoints */}
                {routePoints.map((pt: { x: number; y: number }, i: number) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={2}
                    fill={i <= completedSegments ? 'rgb(0,230,118)' : 'rgba(148,163,184,0.3)'}
                  />
                ))}

                {/* current position — pulsing */}
                {currentPt && (
                  <>
                    <circle cx={currentPt.x} cy={currentPt.y} r={8} fill="rgba(0,230,118,0.15)">
                      <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={currentPt.x} cy={currentPt.y} r={4} fill="rgb(0,230,118)" stroke="white" strokeWidth={1.5} />
                  </>
                )}
              </svg>
            </div>

            {/* progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{t('progress')}</span>
                <span className="text-neon-green font-semibold">{routePct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-green/70 to-neon-green rounded-full transition-all duration-700"
                  style={{ width: `${routePct}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>{t('completed')}: {completedSegments}/{routePoints.length}</span>
                <span>{t('remaining')}: {routePoints.length - completedSegments}</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* ════════ 3. Telemetry Panel ════════════════════ */}
        <GlassPanel title={`◆ ${t('telemetry')}`} accent="blue">
          <div className="space-y-3">
            {/* primary metrics grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* ALT */}
              <div className="bg-white/5 border border-white/10 rounded p-2.5 flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {t('altitude')}
                </span>
                <span className="text-lg font-mono font-semibold text-holographic-blue">
                  {alt}<span className="text-xs text-slate-400 ml-0.5">m</span>
                </span>
              </div>

              {/* SPD */}
              <div className="bg-white/5 border border-white/10 rounded p-2.5 flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {t('speed')}
                </span>
                <span className="text-lg font-mono font-semibold text-holographic-blue">
                  {spd}<span className="text-xs text-slate-400 ml-0.5">m/s</span>
                </span>
              </div>

              {/* BAT */}
              <div className="bg-white/5 border border-white/10 rounded p-2.5 flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {t('battery')}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-mono font-semibold ${bat > 30 ? 'text-neon-green' : bat > 15 ? 'text-cyber-yellow' : 'text-alert-red animate-pulse'}`}>
                    {Math.round(bat)}%
                  </span>
                  {/* mini battery bar */}
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bat > 30 ? 'bg-neon-green' : bat > 15 ? 'bg-cyber-yellow' : 'bg-alert-red'}`}
                      style={{ width: `${bat}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* GPS */}
              <div className="bg-white/5 border border-white/10 rounded p-2.5 flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {t('gps')}
                </span>
                <span className="text-[11px] font-mono text-slate-200 leading-relaxed">
                  {lat.toFixed(5)}
                  <br />
                  {lng.toFixed(5)}
                </span>
              </div>
            </div>

            {/* coverage */}
            <div className="bg-white/5 border border-white/10 rounded p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {t('coverage')}
                </span>
                <span className="text-sm font-mono font-semibold text-neon-green">
                  {coveragePct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-holographic-blue/60 to-neon-green rounded-full transition-all duration-500"
                  style={{ width: `${coveragePct}%` }}
                />
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* ════════ 4. Inspection Findings ════════════════ */}
        <GlassPanel title={`◉ ${t('findings')}`} accent="green">
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {findings.map((f) => {
              const s = sevStyle[f.severity];
              return (
                <div
                  key={f.id}
                  className={`rounded p-2 border ${s.border} ${s.bg} transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-400">{f.time}</span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${s.text} ${s.bg} border ${s.border}`}>
                        {s.label}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">
                      {f.lat}, {f.lng}
                    </span>
                  </div>
                  <p className={`text-[10px] font-mono leading-relaxed ${s.text === 'text-neon-green' ? 'text-slate-300' : s.text}`}>
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
