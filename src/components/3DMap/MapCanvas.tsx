"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import type { MapDataResponse, MapZone } from "@/lib/api-types";
import { useAppStore } from "@/lib/store";
import { buildSimMapData } from "@/lib/server/simulated-data";
import { useTranslation } from "@/lib/i18n";

/* ── constants ─────────────────────────────────────────── */
const CENTER: [number, number] = [9.1234, 99.3456];
const DEFAULT_ZOOM = 15;

const COLORS = {
  neonGreen: "#00E676",
  alertRed: "#FF3D00",
  holoBlue: "#00B0FF",
  yellow: "#FFD600",
};

const FALLBACK_MAP: MapDataResponse = buildSimMapData();

/* ── helpers ───────────────────────────────────────────── */

function sceneToLatLng(pos: [number, number, number]): [number, number] {
  const scale = 0.00025;
  const lat = CENTER[0] - pos[2] * scale;
  const lng = CENTER[1] + pos[0] * scale;
  return [lat, lng];
}

function zoneToPolygon(zone: MapZone): [number, number][] {
  const halfW = zone.size[0] / 2;
  const halfH = zone.size[1] / 2;
  const cx = zone.position[0];
  const cz = zone.position[2];
  return [
    sceneToLatLng([cx - halfW, 0, cz - halfH]),
    sceneToLatLng([cx + halfW, 0, cz - halfH]),
    sceneToLatLng([cx + halfW, 0, cz + halfH]),
    sceneToLatLng([cx - halfW, 0, cz + halfH]),
  ];
}

function ndviColor(ndvi: number): string {
  if (ndvi >= 0.7) return COLORS.neonGreen;
  if (ndvi >= 0.5) return COLORS.yellow;
  return COLORS.alertRed;
}

const CROP_KEY_MAP: Record<string, string> = {
  "Durian 榴莲": "durian",
  "Mangosteen 山竹": "mangosteen",
  "Rubber 橡胶": "rubber",
  "Oil Palm 油棕": "oilPalm",
  "Longan 龙眼": "longan",
  "Maize 玉米": "maize"
};

/* ── Component ─────────────────────────────────────────── */
interface MapCanvasProps {
  showDrone?: boolean;
}

export default function MapCanvas({ showDrone = false }: MapCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mapData, setMapData] = useState<MapDataResponse>(FALLBACK_MAP);
  const { selectedZoneId, setSelectedZone, setSelectedTree, setDroneStatus } = useAppStore();
  const { t, locale } = useTranslation();

  // Fetch map data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/map/data", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as MapDataResponse;
        setMapData(data);
      } catch {
        // Keep fallback
      }
    };
    load();
  }, []);

  // Initialize Leaflet map + render everything (client-only)
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    let cancelled = false;
    let animFrameId = 0;
    let droneProgress = 0;

    // Dynamic import of Leaflet (avoids SSR window error)
    const init = async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      // ── Create map ──
      const map = L.map(containerRef.current, {
        center: CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 12,
      });
      mapInstanceRef.current = map;

      // Satellite tile layer
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 18 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // ── Zone polygons ──
      const zonePolygons: ReturnType<typeof L.polygon>[] = [];
      const zoneLabelMarkers: ReturnType<typeof L.marker>[] = [];

      const renderZones = () => {
        zonePolygons.forEach((p) => map.removeLayer(p));
        zoneLabelMarkers.forEach((m) => map.removeLayer(m));
        zonePolygons.length = 0;
        zoneLabelMarkers.length = 0;

        mapData.zones.forEach((zone) => {
          const coords = zoneToPolygon(zone);
          const isSelected = selectedZoneId === zone.id;
          const isLodging = zone.lodgingStatus === true;
          const color = isLodging ? COLORS.alertRed : ndviColor(zone.ndvi);

          const polygon = L.polygon(coords as L.LatLngTuple[], {
            color: isSelected ? "#ffffff" : color,
            weight: isSelected ? 3 : 2,
            fillColor: color,
            fillOpacity: isSelected ? 0.45 : 0.25,
            dashArray: isLodging ? "8 4" : undefined,
            className: (isSelected ? "zone-selected " : "") + "cursor-pointer",
          }).addTo(map);

          // Zone label — with crop type
          const center = polygon.getBounds().getCenter();
          const cropColors: Record<string, string> = {
            "Durian 榴莲": "#FFD600",
            "Mangosteen 山竹": "#AA00FF",
            "Rubber 橡胶": "#00E676",
            "Oil Palm 油棕": "#FF6D00",
            "Longan 龙眼": "#00B0FF",
            "Maize 玉米": "#76FF03",
          };
          const cropIcons: Record<string, string> = {
            "Durian 榴莲": "🍈",
            "Mangosteen 山竹": "🍇",
            "Rubber 橡胶": "🌳",
            "Oil Palm 油棕": "🌴",
            "Longan 龙眼": "🫐",
            "Maize 玉米": "🌽",
          };
          const cropType = (zone as any).cropType as string | undefined;

          // I18n for crop type
          let translatedCropName = cropType;
          if (cropType && CROP_KEY_MAP[cropType]) {
             translatedCropName = t(CROP_KEY_MAP[cropType]);
          }

          const cropColor = cropType ? (cropColors[cropType] ?? "#ccc") : "";
          const cropIcon = cropType ? (cropIcons[cropType] ?? "🌿") : "";
          const labelHtml = `
            <div class="zone-label ${isSelected ? "zone-label-selected" : ""} ${isLodging ? "zone-label-lodging" : ""}">
              <div class="zone-label-name">${zone.name}</div>
              ${cropType ? `<div style="font-size:10px;color:${cropColor};margin-top:1px;">${cropIcon} ${translatedCropName}</div>` : ""}
              <div class="zone-label-info">NDVI ${zone.ndvi.toFixed(2)} · ${zone.areaRai} ${t('rai')}</div>
              ${isLodging ? `<div class="zone-label-alert">⚠ ${t('lodgingAlert')} ${zone.lodgingPercent}%</div>` : ""}
            </div>
          `;
          const icon = L.divIcon({
            html: labelHtml,
            className: "zone-label-container",
            iconSize: [140, 50],
            iconAnchor: [70, 25],
          });
          const labelMarker = L.marker(center, { icon, interactive: false }).addTo(map);

          // ── Rich hover tooltip for zone ──
          const ndviLabel = zone.ndvi >= 0.7 ? t('healthyLabel') : zone.ndvi >= 0.5 ? t('warning') : t('atRisk');
          const ndviDotColor = zone.ndvi >= 0.7 ? '#00E676' : zone.ndvi >= 0.5 ? '#FFD600' : '#FF3D00';
          const treesInZone = mapData.trees.filter(tr => {
            const hW = zone.size[0] / 2, hH = zone.size[1] / 2;
            return Math.abs(tr.position[0] - zone.position[0]) <= hW && Math.abs(tr.position[2] - zone.position[2]) <= hH;
          });
          const criticalCount = treesInZone.filter(tr => tr.health === 'critical').length;

          const tooltipHtml = `
            <div style="font-family:monospace;font-size:11px;min-width:180px;padding:2px 0;">
              <div style="font-weight:bold;font-size:13px;color:#fff;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:4px;">
                ${zone.name}
              </div>
              ${cropType ? `<div style="color:${cropColor};margin-bottom:4px;">${cropIcon} ${translatedCropName}</div>` : ''}
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <span style="color:#94a3b8;">NDVI</span>
                <span style="color:${ndviDotColor};font-weight:bold;">${zone.ndvi.toFixed(2)} · ${ndviLabel}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <span style="color:#94a3b8;">${t('area')}</span>
                <span style="color:#fff;">${zone.areaRai} ${t('rai')}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <span style="color:#94a3b8;">${t('trees')}</span>
                <span style="color:#fff;">${treesInZone.length}${criticalCount > 0 ? ` <span style="color:#FF3D00;">(${criticalCount} ${t('atRisk')})</span>` : ''}</span>
              </div>
              ${isLodging ? `<div style="color:#FF3D00;margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,61,0,0.3);">⚠ ${t('lodgingAlert')} ${zone.lodgingPercent}% · ${t('sugarLoss')}: ${zone.sugarLossCCS} CCS</div>` : ''}
              <div style="color:#64748b;font-size:9px;margin-top:5px;text-align:center;">${t('clickForDetails')}</div>
            </div>
          `;

          polygon.bindTooltip(tooltipHtml, {
            sticky: true,
            direction: 'top',
            offset: [0, -10] as L.PointTuple,
            className: 'zone-tooltip-container',
            opacity: 0.95,
          });

          polygon.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            const bizData = mapData.zoneBusiness.find((z) => z.zoneId === zone.id) ?? null;
            if (selectedZoneId === zone.id) {
              setSelectedZone(null, null);
            } else {
              setSelectedZone(zone.id, bizData);
              router.push("/zone/" + zone.id);
            }
          });

          polygon.on("mouseover", () => {
            if (selectedZoneId !== zone.id) {
              polygon.setStyle({ weight: 3, fillOpacity: 0.38 });
            }
          });
          polygon.on("mouseout", () => {
            if (selectedZoneId !== zone.id) {
              polygon.setStyle({ weight: 2, fillOpacity: 0.25 });
            }
          });

          zonePolygons.push(polygon);
          zoneLabelMarkers.push(labelMarker);
        });
      };

      renderZones();

      // ── Tree markers ──
      const treeGroup = L.layerGroup();
      mapData.trees.forEach((tree) => {
        const latlng = sceneToLatLng(tree.position);
        const isCritical = tree.health === "critical";
        const color = isCritical ? COLORS.alertRed : COLORS.neonGreen;

        const marker = L.circleMarker(latlng as L.LatLngTuple, {
          radius: 3,
          color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 1,
        });

        const varietyLine = tree.variety ? `<div style="color:#AA00FF;font-size:10px;">${t('rubberVariety')} ${tree.variety}</div>` : "";
        marker.bindTooltip(
          `<div class="tree-tooltip">
            <div class="tree-tooltip-id">${tree.id}</div>
            ${varietyLine}
            <div>${t('carbonStock')}: ${tree.carbonStock} kg</div>
            <div>${t('age')}: ${tree.age} ${t('years')}</div>
            <div class="${isCritical ? "tree-critical" : "tree-healthy"}">${isCritical ? t('atRisk') : t('healthyLabel')}</div>
          </div>`,
          { direction: "top", offset: [0, -6] as L.PointTuple, className: "tree-tooltip-container" }
        ).bindPopup(
          `<div class="p-2 text-xs font-mono text-slate-200">
            <div class="font-bold text-neon-green mb-1">Tree #${tree.id} (H15 Monitored)</div>
            <div class="grid grid-cols-2 gap-x-2 gap-y-1">
              <span>Status:</span> <span class="${tree.health === 'critical' ? 'text-red-500' : 'text-green-400'}">${tree.health}</span>
              <span>Carbon:</span> <span>${tree.carbonStock} kg</span>
              <span>Age:</span> <span>${tree.age} yrs</span>
              <span>Height:</span> <span>${(tree.age * 0.8).toFixed(1)}m</span>
            </div>
          </div>`
        );

        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedTree(tree);
        });

        treeGroup.addLayer(marker);
      });
      treeGroup.addTo(map);

      // ── Disease hotspots ──
      const hotspotGroup = L.layerGroup();
      mapData.diseaseHotspots.forEach((hs) => {
        const latlng = sceneToLatLng(hs.position);
        const color = hs.severity === "high" ? COLORS.alertRed : hs.severity === "medium" ? COLORS.yellow : COLORS.neonGreen;

        L.circleMarker(latlng as L.LatLngTuple, {
          radius: 14, color, fillColor: color, fillOpacity: 0.12, weight: 2, dashArray: "4 3",
        }).addTo(hotspotGroup);

        L.circleMarker(latlng as L.LatLngTuple, {
          radius: 6, color, fillColor: color, fillOpacity: 0.5, weight: 1,
        }).addTo(hotspotGroup);
      });
      hotspotGroup.addTo(map);

      // ── Drone path + animated marker (only when showDrone is true) ──
      if (showDrone) {
        const points = mapData.dronePath.points;
        if (points.length >= 2) {
          const pathLatLngs = points.map((p) => sceneToLatLng(p) as L.LatLngTuple);
          L.polyline(pathLatLngs, {
            color: COLORS.holoBlue, weight: 2, opacity: 0.5, dashArray: "6 4",
          }).addTo(map);

          const droneIcon = L.divIcon({
            html: `<div class="drone-marker"><div class="drone-body"></div><div class="drone-pulse"></div><div class="drone-label">H15-01</div></div>`,
            className: "drone-icon-container",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          const droneMarker = L.marker(sceneToLatLng(points[0]) as L.LatLngTuple, { icon: droneIcon, zIndexOffset: 1000 }).addTo(map);
          const totalPts = points.length;

          const animateDrone = () => {
            droneProgress = (droneProgress + 0.001) % 1;
            const idx = droneProgress * (totalPts - 1);
            const i = Math.floor(idx);
            const frac = idx - i;
            const p1 = points[i];
            const p2 = points[Math.min(i + 1, totalPts - 1)];
            const pos: [number, number, number] = [
              p1[0] + (p2[0] - p1[0]) * frac,
              p1[1] + (p2[1] - p1[1]) * frac,
              p1[2] + (p2[2] - p1[2]) * frac,
            ];
            const ll = sceneToLatLng(pos);
            droneMarker.setLatLng(ll as L.LatLngTuple);

            if (Math.random() < 0.02) {
              setDroneStatus({
                position: pos, lat: ll[0], lng: ll[1],
                altitude: 115 + pos[1] * 0.5, speed: 14 + Math.random() * 2,
              });
            }
            animFrameId = requestAnimationFrame(animateDrone);
          };
          animFrameId = requestAnimationFrame(animateDrone);
        }
      }

      // ── Click empty map to deselect ──
      map.on("click", () => {
        setSelectedZone(null, null);
        setSelectedTree(null);
      });
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameId);
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData, selectedZoneId, locale, showDrone]); // re-render on language/drone/selection change

  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
