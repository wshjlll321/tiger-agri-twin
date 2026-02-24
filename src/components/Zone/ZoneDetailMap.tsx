'use client';

import { useEffect, useRef, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import GlassPanel from '@/components/HUD/GlassPanel';
import { useTranslation } from '@/lib/i18n';

/* ── constants ─────────────────────────────────────────── */
const neonGreen = '#00E676';
const alertRed = '#FF3D00';
const holoBlue = '#00B0FF';

const TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/* ── types ─────────────────────────────────────────────── */
interface TreeData {
  id: string;
  lat: number;
  lng: number;
  health: string;
  carbonStock: number;
  age: number;
  lastScanned: string;
}

interface ZoneDetailMapProps {
  data: {
    zoneCenter: [number, number];
    zoneSize: [number, number];
    zoneTrees: TreeData[];
    dronePath: { id: string; status: string; points: [number, number, number][] };
    isDroneActive: boolean;
    crop: string;
    name: string;
    [key: string]: unknown;
  };
}

/* ── Component ─────────────────────────────────────────── */
export default function ZoneDetailMap({ data }: ZoneDetailMapProps) {
  const { t } = useTranslation();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const trees = data.zoneTrees ?? [];
  const stats = useMemo(() => {
    const total = trees.length;
    const healthy = trees.filter((tr) => tr.health !== 'critical').length;
    const issues = total - healthy;
    return { total, healthy, issues };
  }, [trees]);

  /* ── Leaflet init ────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;
    let animFrameId = 0;

    const init = async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;

      const center: [number, number] = data.zoneCenter ?? [9.1234, 99.3456];

      const map = L.map(mapRef.current, {
        center,
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20,
        minZoom: 13,
      });
      mapInstanceRef.current = map;

      L.tileLayer(TILE_URL, { maxZoom: 20 }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      /* ── Tree markers ─────────────────────────────────── */
      const treeGroup = L.layerGroup();
      trees.forEach((tree) => {
        const isCritical = tree.health === 'critical';
        const color = isCritical ? alertRed : neonGreen;

        const marker = L.circleMarker([tree.lat, tree.lng] as L.LatLngTuple, {
          radius: 5,
          color,
          fillColor: color,
          fillOpacity: 0.75,
          weight: 1,
        });

        marker.bindPopup(
          `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:#0f172a;padding:8px 10px;border-radius:6px;min-width:160px;border:1px solid ${isCritical ? alertRed : neonGreen}44">
            <div style="font-weight:700;margin-bottom:6px;color:${isCritical ? alertRed : neonGreen}">
              Tree #${tree.id}
            </div>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px">
              <span style="color:#94a3b8">${t('healthIndex')}:</span>
              <span style="color:${isCritical ? alertRed : neonGreen}">${isCritical ? t('critical') : t('healthy')}</span>
              <span style="color:#94a3b8">${t('carbonStock')}:</span>
              <span>${tree.carbonStock} kg</span>
              <span style="color:#94a3b8">${t('age')}:</span>
              <span>${tree.age} ${t('years')}</span>
              <span style="color:#94a3b8">${t('lastScanned')}:</span>
              <span>${tree.lastScanned}</span>
            </div>
          </div>`,
          {
            className: 'zone-tree-popup',
            closeButton: true,
            maxWidth: 240,
          },
        );

        treeGroup.addLayer(marker);
      });
      treeGroup.addTo(map);

      /* ── Drone path polyline ──────────────────────────── */
      const points = data.dronePath?.points ?? [];
      if (points.length >= 2) {
        const pathLatLngs = points.map(
          (p) => [p[0], p[1]] as L.LatLngTuple,
        );

        L.polyline(pathLatLngs, {
          color: holoBlue,
          weight: 2,
          opacity: 0.6,
          dashArray: '8 6',
        }).addTo(map);

        /* ── Animated drone marker ────────────────────── */
        const droneIcon = L.divIcon({
          html: `<div style="position:relative;width:28px;height:28px">
            <div style="position:absolute;inset:0;border-radius:50%;background:${holoBlue};opacity:0.25;animation:dronePulse 1.6s ease-in-out infinite"></div>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:${holoBlue};border:2px solid #fff;box-shadow:0 0 8px ${holoBlue}"></div>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const droneMarker = L.marker(
          [points[0][0], points[0][1]] as L.LatLngTuple,
          { icon: droneIcon, zIndexOffset: 1000 },
        ).addTo(map);

        if (data.isDroneActive) {
          let progress = 0;
          const totalPts = points.length;

          const animateDrone = () => {
            progress = (progress + 0.0008) % 1;
            const idx = progress * (totalPts - 1);
            const i = Math.floor(idx);
            const frac = idx - i;
            const p1 = points[i];
            const p2 = points[Math.min(i + 1, totalPts - 1)];
            const lat = p1[0] + (p2[0] - p1[0]) * frac;
            const lng = p1[1] + (p2[1] - p1[1]) * frac;
            droneMarker.setLatLng([lat, lng] as L.LatLngTuple);
            animFrameId = requestAnimationFrame(animateDrone);
          };
          animFrameId = requestAnimationFrame(animateDrone);
        }
      }

      /* ── Legend (top-right) ───────────────────────────── */
      const LegendControl = L.Control.extend({
        options: { position: 'topright' as L.ControlPosition },
        onAdd() {
          const div = L.DomUtil.create('div');
          div.innerHTML = `
            <div style="
              background:rgba(15,23,42,0.88);
              backdrop-filter:blur(6px);
              border:1px solid rgba(100,116,139,0.4);
              border-radius:8px;
              padding:10px 14px;
              font-family:ui-monospace,monospace;
              font-size:10px;
              color:#cbd5e1;
              line-height:1.8;
              min-width:120px;
            ">
              <div style="font-weight:700;margin-bottom:4px;color:#e2e8f0;text-transform:uppercase;letter-spacing:0.08em">${t('mapLegend')}</div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="width:10px;height:10px;border-radius:50%;background:${neonGreen};display:inline-block"></span>
                ${t('healthy')}
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="width:10px;height:10px;border-radius:50%;background:${alertRed};display:inline-block"></span>
                ${t('critical')}
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="width:10px;height:10px;border-radius:50%;background:#FFD600;display:inline-block"></span>
                ${t('sensorLabel')}
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="width:18px;border-top:2px dashed ${holoBlue};display:inline-block"></span>
                ${t('dronePathLabel')}
              </div>
            </div>
          `;
          return div;
        },
      });
      new LegendControl().addTo(map);

      /* ── Inject pulse keyframe ────────────────────────── */
      if (!document.getElementById('zone-map-keyframes')) {
        const style = document.createElement('style');
        style.id = 'zone-map-keyframes';
        style.textContent = `
          @keyframes dronePulse {
            0%, 100% { transform: scale(1); opacity: 0.25; }
            50% { transform: scale(1.8); opacity: 0; }
          }
          .zone-tree-popup .leaflet-popup-content-wrapper {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .zone-tree-popup .leaflet-popup-content {
            margin: 0 !important;
          }
          .zone-tree-popup .leaflet-popup-tip {
            background: #0f172a !important;
          }
        `;
        document.head.appendChild(style);
      }
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameId);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlassPanel title={`${t('tabFieldMap')} — ${data.name}`} accent="blue">
      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full rounded-md overflow-hidden border border-slate-700/50"
        style={{ height: 500 }}
      />

      {/* Stats bar */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-md bg-slate-800/50 border border-slate-700/40">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            {t('totalTrees')}
          </span>
          <span className="text-xl font-bold text-white mt-1">{stats.total}</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-md bg-slate-800/50 border border-slate-700/40">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            {t('healthyTrees')}
          </span>
          <span className="text-xl font-bold mt-1" style={{ color: neonGreen }}>
            {stats.healthy}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-md bg-slate-800/50 border border-slate-700/40">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            {t('issueTrees')}
          </span>
          <span className="text-xl font-bold mt-1" style={{ color: alertRed }}>
            {stats.issues}
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}
