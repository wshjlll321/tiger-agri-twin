import React from 'react';
import Link from 'next/link';
import ZoneDetailTabs from '@/components/Zone/ZoneDetailTabs';
import {
  ArrowLeft,
} from 'lucide-react';
import { buildSimMapData } from '@/lib/server/simulated-data';
import { mockZoneCarbonDetails } from '@/lib/mockData';

export default async function ZonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const mapData = buildSimMapData();
  const zoneSim = mapData.zones.find(z => z.id === id);

  const zoneDetailsMap: Record<string, any> = {
    "1": { crop: "Durian", cropKey: "durian", status: "Optimal", statusKey: "optimal", area: "2.4 ha" },
    "2": { crop: "Mangosteen", cropKey: "mangosteen", status: "Warning", statusKey: "warning", area: "1.8 ha" },
    "3": { crop: "Rubber", cropKey: "rubber", status: "Optimal", statusKey: "optimal", area: "3.2 ha" },
    "4": { crop: "Oil Palm", cropKey: "oilPalm", status: "Critical", statusKey: "critical", area: "4.5 ha" },
    "5": { crop: "Longan", cropKey: "longan", status: "Optimal", statusKey: "optimal", area: "2.1 ha" },
    "6": { crop: "Maize", cropKey: "maize", status: "Warning", statusKey: "warning", area: "5.0 ha" },
  };

  const numericId = parseInt(id) || 0;
  const detail = zoneDetailsMap[id] || zoneDetailsMap[String(numericId)] || Object.values(zoneDetailsMap)[Math.abs(id.charCodeAt(0)) % 6] || zoneDetailsMap["1"];
  // Match by zoneId directly, or fallback to index-based lookup so any URL always gets carbon data
  const zoneCarbonDetail = mockZoneCarbonDetails.find(z => z.zoneId === id)
    || (numericId >= 1 && numericId <= 6 ? mockZoneCarbonDetails[numericId - 1] : null)
    || mockZoneCarbonDetails[Math.abs(id.charCodeAt(0)) % mockZoneCarbonDetails.length];

  // ── Trees for this zone (filter by zone position proximity) ──
  const zoneCenter = zoneSim?.position || [9.1234, 0.1, 99.3456];
  const zoneSize = zoneSim?.size || [200, 200];
  const allTrees = mapData.trees;
  const zoneTrees = allTrees.map((tree, i) => {
    // Distribute trees within this zone's bounds for the detail map
    const halfW = zoneSize[0] / 2;
    const halfH = zoneSize[1] / 2;
    const angle = (i / allTrees.length) * Math.PI * 6;
    const radius = Math.min(halfW, halfH) * 0.8 * ((i % 23) / 23);
    return {
      ...tree,
      position: [
        zoneCenter[0] + Math.cos(angle) * radius * 0.00025,
        0,
        zoneCenter[2] + Math.sin(angle) * radius * 0.00025,
      ],
    };
  });

  // ── Drone path for this zone ──
  const dronePath = mapData.dronePath;
  const dronePathPoints = dronePath.points.map(p => {
    // Convert scene coords to lat/lng relative to zone center
    const scale = 0.00025;
    return [zoneCenter[0] + p[0] * scale, zoneCenter[2] + p[2] * scale, p[1]] as [number, number, number];
  });

  const data = {
    id,
    name: zoneSim?.name || `Zone ${id}`,
    crop: detail.crop,
    cropKey: detail.cropKey,
    status: detail.status,
    statusKey: detail.statusKey,
    area: detail.area,
    trees: Math.floor(parseInt(detail.area) * 120),

    // ── Zone map data (for detail map + drone tracker) ──
    zoneCenter: [zoneCenter[0], zoneCenter[2]] as [number, number],
    zoneSize,
    zoneTrees: zoneTrees.map(t => ({
      id: t.id,
      lat: t.position[0],
      lng: t.position[2],
      health: t.health,
      carbonStock: t.carbonStock,
      age: t.age,
      lastScanned: t.lastScanned,
    })),
    dronePath: {
      id: dronePath.id,
      status: dronePath.status,
      points: dronePathPoints,
    },
    isDroneActive: dronePath.status === 'flying',

    // ── Overview KPIs ──
    kpis: {
      ndvi: zoneSim?.ndvi || 0.78,
      ndviTrend: '+2.4%',
      moisture: '68%',
      moistureTrend: '-1.2%',
      temperature: '28°C',
      tempTrend: 'Normal',
      humidity: '82%',
      yieldForecast: (numericId * 1.5 + 2).toFixed(1) + ' Tons',
      windSpeed: '12 km/h',
      rainfall: '4.2 mm',
      solarRadiation: '18.6 MJ/m²',
      evapotranspiration: '4.8 mm/day',
    },

    // ── Weather station data (hourly) ──
    weather: {
      current: { temp: 28, humidity: 82, wind: 12, uv: 6, pressure: 1013, dewPoint: 24 },
      hourly: [
        { hour: '06:00', temp: 24, humidity: 92, rain: 0 },
        { hour: '08:00', temp: 26, humidity: 85, rain: 0 },
        { hour: '10:00', temp: 29, humidity: 75, rain: 0 },
        { hour: '12:00', temp: 32, humidity: 68, rain: 0.2 },
        { hour: '14:00', temp: 33, humidity: 65, rain: 0 },
        { hour: '16:00', temp: 31, humidity: 70, rain: 1.5 },
        { hour: '18:00', temp: 28, humidity: 80, rain: 2.5 },
        { hour: '20:00', temp: 26, humidity: 88, rain: 0 },
      ],
      forecast: [
        { day: 'Mon', high: 33, low: 24, rain: 20, icon: 'sun' },
        { day: 'Tue', high: 32, low: 25, rain: 40, icon: 'cloud' },
        { day: 'Wed', high: 30, low: 24, rain: 80, icon: 'rain' },
        { day: 'Thu', high: 29, low: 23, rain: 60, icon: 'rain' },
        { day: 'Fri', high: 31, low: 24, rain: 30, icon: 'cloud' },
        { day: 'Sat', high: 33, low: 25, rain: 10, icon: 'sun' },
        { day: 'Sun', high: 34, low: 25, rain: 5, icon: 'sun' },
      ],
    },

    // ── Growth stage tracking ──
    growthStage: {
      current: 'Flowering',
      progress: 65,
      stages: [
        { name: 'Dormancy', completed: true, date: 'Jan' },
        { name: 'Bud Break', completed: true, date: 'Feb' },
        { name: 'Vegetative', completed: true, date: 'Mar' },
        { name: 'Flowering', completed: false, date: 'May', active: true },
        { name: 'Fruiting', completed: false, date: 'Jul' },
        { name: 'Maturation', completed: false, date: 'Sep' },
        { name: 'Harvest', completed: false, date: 'Nov' },
      ],
      daysToHarvest: 142,
      healthScore: 87,
    },

    // ── Sensor grid ──
    sensors: [
      { id: 'S-001', type: 'Soil Moisture', value: '68%', status: 'normal', lat: 8.01, lng: 99.01 },
      { id: 'S-002', type: 'Soil Temp', value: '26°C', status: 'normal', lat: 8.02, lng: 99.02 },
      { id: 'S-003', type: 'Soil pH', value: '5.8', status: 'warning', lat: 8.03, lng: 99.03 },
      { id: 'S-004', type: 'Air Temp', value: '28°C', status: 'normal', lat: 8.04, lng: 99.04 },
      { id: 'S-005', type: 'Humidity', value: '82%', status: 'normal', lat: 8.05, lng: 99.05 },
      { id: 'S-006', type: 'Leaf Wetness', value: '45%', status: 'normal', lat: 8.06, lng: 99.06 },
      { id: 'S-007', type: 'Light (PAR)', value: '1850 µmol', status: 'normal', lat: 8.07, lng: 99.07 },
      { id: 'S-008', type: 'Wind Speed', value: '12 km/h', status: 'normal', lat: 8.08, lng: 99.08 },
    ],

    // ── Environmental history (30 days) ──
    history: [45, 52, 68, 74, 78, 82, 60, 65, 70, 72, 68, 75],
    ndviHistory: [0.72, 0.74, 0.73, 0.76, 0.78, 0.80, 0.79, 0.81, 0.82, 0.80, 0.78, 0.82],
    moistureHistory: [72, 68, 65, 70, 74, 71, 68, 66, 64, 68, 70, 68],

    // ── Alerts ──
    alerts: [
      { id: 1, type: 'critical', message: 'Low soil moisture detected in Sector 3', time: '10m ago', sensor: 'S-003' },
      { id: 2, type: 'warning', message: 'Pest activity risk elevated — Leaf Miner probability 72%', time: '2h ago', sensor: 'AI-Engine' },
      { id: 3, type: 'warning', message: 'Soil pH below optimal range (5.8 < 6.0)', time: '3h ago', sensor: 'S-003' },
      { id: 4, type: 'info', message: 'Fertilizer application scheduled for tomorrow', time: '5h ago', sensor: 'Scheduler' },
      { id: 5, type: 'info', message: 'Drone H15-01 completed routine scan #448', time: '6h ago', sensor: 'H15-01' },
    ],

    // ── Agronomy / Soil ──
    soil: {
      nitrogen: { value: 140, unit: 'ppm', target: 160, status: 'optimal', pct: 70 },
      phosphorus: { value: 45, unit: 'ppm', target: 80, status: 'low', pct: 40 },
      potassium: { value: 210, unit: 'ppm', target: 200, status: 'optimal', pct: 85 },
      pH: { value: 5.8, optimal: '6.0-6.5', status: 'warning' },
      ec: { value: 1.2, unit: 'dS/m', status: 'normal' },
      organicMatter: { value: 3.8, unit: '%', status: 'good' },
      cec: { value: 18.5, unit: 'cmol/kg', status: 'good' },
      micronutrients: [
        { name: 'Iron (Fe)', value: 42, unit: 'ppm', status: 'optimal' },
        { name: 'Zinc (Zn)', value: 3.2, unit: 'ppm', status: 'optimal' },
        { name: 'Manganese (Mn)', value: 28, unit: 'ppm', status: 'optimal' },
        { name: 'Boron (B)', value: 0.8, unit: 'ppm', status: 'low' },
        { name: 'Copper (Cu)', value: 1.5, unit: 'ppm', status: 'optimal' },
      ],
      texture: { sand: 45, silt: 35, clay: 20, type: 'Loam' },
    },

    // ── Pest & Disease Risk ──
    pestRisk: [
      { name: 'Leaf Miner', risk: 72, trend: 'rising', severity: 'high' },
      { name: 'Phytophthora', risk: 45, trend: 'stable', severity: 'medium' },
      { name: 'Stem Borer', risk: 28, trend: 'declining', severity: 'low' },
      { name: 'Root Rot', risk: 15, trend: 'stable', severity: 'low' },
      { name: 'Powdery Mildew', risk: 55, trend: 'rising', severity: 'medium' },
    ],

    // ── Irrigation ──
    irrigation: {
      status: 'Active',
      method: 'Drip Irrigation',
      lastCycle: '2h ago',
      nextCycle: 'In 4h',
      dailyUsage: '12,400 L',
      efficiency: 92,
      zones: [
        { name: 'Sector A', status: 'completed', moisture: 72 },
        { name: 'Sector B', status: 'active', moisture: 58 },
        { name: 'Sector C', status: 'scheduled', moisture: 65 },
        { name: 'Sector D', status: 'completed', moisture: 70 },
      ],
    },

    // ── Protection History (Timeline) ──
    protectionHistory: [
      { action: 'Drone H15-01 Sprayed Pesticide', target: 'Leaf Miner', coverage: '98%', time: '24 HOURS AGO', active: true },
      { action: 'Manual Soil Sampling', target: 'NPK + pH Analysis', coverage: '12 points', time: '3 DAYS AGO', active: false },
      { action: 'Fungicide Application', target: 'Preventative — wet season', coverage: 'Full zone', time: '1 WEEK AGO', active: false },
      { action: 'Fertilizer Application', target: 'NPK 15-15-15', coverage: 'Full zone', time: '2 WEEKS AGO', active: false },
      { action: 'Drone Infrared Scan', target: 'Heat stress detection', coverage: '100%', time: '3 WEEKS AGO', active: false },
    ],

    // ── Carbon ──
    carbon: {
      totalStock: (1200 + (numericId * 50)).toFixed(1),
      sequestrationRate: '+' + (42 + (numericId * 2)).toFixed(1) + ' kg/day',
      economicValue: '$' + (82000 + (numericId * 1500)).toLocaleString(),
      treeContribution: 'Avg ' + (230 + (numericId * 5)) + 'kg/tree',
      biomassPct: 60 + (numericId % 10),
      soilPct: 40 - (numericId % 10),
      annualSequestration: (15.2 + numericId * 0.8).toFixed(1),
      verificationStatus: 'Verified',
      lastAudit: '2026-01-15',
      creditPrice: 28.5,
      totalCredits: (48 + numericId * 3),
      monthlyData: [
        { month: 'Jan', sequestration: 50, creditValue: 65, emission: 12 },
        { month: 'Feb', sequestration: 55, creditValue: 68, emission: 11 },
        { month: 'Mar', sequestration: 60, creditValue: 70, emission: 13 },
        { month: 'Apr', sequestration: 58, creditValue: 72, emission: 10 },
        { month: 'May', sequestration: 65, creditValue: 75, emission: 12 },
        { month: 'Jun', sequestration: 70, creditValue: 74, emission: 14 },
        { month: 'Jul', sequestration: 75, creditValue: 78, emission: 11 },
        { month: 'Aug', sequestration: 72, creditValue: 82, emission: 13 },
        { month: 'Sep', sequestration: 78, creditValue: 85, emission: 10 },
        { month: 'Oct', sequestration: 80, creditValue: 88, emission: 12 },
        { month: 'Nov', sequestration: 85, creditValue: 92, emission: 11 },
        { month: 'Dec', sequestration: 82, creditValue: 95, emission: 9 },
      ],
      breakdown: [
        { source: 'Above-ground Biomass', value: 42, color: '#39FF14' },
        { source: 'Below-ground Biomass', value: 18, color: '#00E676' },
        { source: 'Soil Organic Carbon', value: 28, color: '#00BCD4' },
        { source: 'Litter & Deadwood', value: 12, color: '#8BC34A' },
      ],
    },

    // ── AI Simulation ──
    aiDiagnosis: {
      primary: {
        name: 'Early Blight Risk',
        severity: 'HIGH',
        probability: 85,
        description: 'Analysis of recent drone imagery and humidity sensors indicates a 85% probability of fungal outbreak in Sector 3 within 48 hours.',
        affectedArea: '0.6 ha (25%)',
        detectedBy: 'Drone H15-01 + AI Engine v3.2',
      },
      recommendations: [
        { action: 'Apply Fungicide (Copper-based)', method: 'Drone Spraying (H15-01)', priority: 'Immediate', cost: '$120' },
        { action: 'Increase Ventilation', method: 'Prune lower canopy branches', priority: '48h', cost: '$45' },
        { action: 'Adjust Irrigation', method: 'Reduce watering cycle by 20%', priority: '24h', cost: '$0' },
      ],
      scenarios: [
        { name: 'No Action', yieldImpact: -25, cost: 0, roi: -100, riskLevel: 'Critical' },
        { name: 'Fungicide Only', yieldImpact: +15, cost: 120, roi: 240, riskLevel: 'Low' },
        { name: 'Full Treatment', yieldImpact: +22, cost: 285, roi: 180, riskLevel: 'Minimal' },
      ],
      historicalAccuracy: [
        { date: 'Jan 2026', predicted: 82, actual: 79, type: 'Yield' },
        { date: 'Feb 2026', predicted: 75, actual: 78, type: 'Pest Risk' },
        { date: 'Mar 2026', predicted: 88, actual: 85, type: 'Disease' },
        { date: 'Apr 2026', predicted: 91, actual: 89, type: 'Yield' },
      ],
      riskMatrix: [
        { factor: 'Humidity > 80%', level: 'high', impact: 'Fungal growth accelerated' },
        { factor: 'Temperature 26-32°C', level: 'medium', impact: 'Optimal pathogen range' },
        { factor: 'Leaf wetness > 6h', level: 'high', impact: 'Infection window open' },
        { factor: 'Wind < 5 km/h', level: 'low', impact: 'Limited spore dispersal' },
        { factor: 'Recent rainfall', level: 'medium', impact: 'Splash dispersal risk' },
      ],
    },

    // ── Drone missions ──
    droneMissions: [
      { id: '#448', drone: 'H15-01', type: 'Routine Scan', status: 'Completed', coverage: '100%', time: '08:30 Today' },
      { id: '#447', drone: 'H15-01', type: 'Pest Detection', status: 'Completed', coverage: '100%', time: 'Yesterday' },
      { id: '#449', drone: 'H15-02', type: 'Spray Mission', status: 'Scheduled', coverage: '-', time: 'Tomorrow 06:00' },
    ],

    // ── Zone Carbon Detail (from mockZoneCarbonDetails) ──
    zoneCarbonDetail,
  };

  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-200 relative overflow-x-hidden overflow-y-auto font-mono selection:bg-neon-green/30 pb-10">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 cockpit-grid opacity-20"></div>
        <div className="scanline-overlay opacity-5"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-holographic-blue/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800/60 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="group flex items-center gap-2 px-4 py-2 rounded-md border border-slate-700 hover:border-holographic-blue/50 bg-slate-900/80 backdrop-blur-sm transition-all hover:shadow-[0_0_15px_rgba(0,176,255,0.15)]"
            >
              <ArrowLeft className="w-4 h-4 text-holographic-blue group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">DASHBOARD</span>
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  <span className="text-holographic-blue opacity-80">ZONE //</span> {data.name}
                </h1>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mt-1 pl-1">
                <span>ID: {data.id}</span>
                <span>•</span>
                <span>{data.crop}</span>
                <span>•</span>
                <span>{data.area}</span>
                <span>•</span>
                <span>{data.trees} trees</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
               <div className="text-xs text-slate-400">LAST UPDATE</div>
               <div className="text-neon-green font-mono">{new Date().toLocaleTimeString()}</div>
             </div>
             <div className="flex gap-1">
               {[1,2,3].map(i => (
                 <div key={i} className={`w-2 h-8 rounded-sm ${i === 3 ? 'bg-slate-700' : 'bg-holographic-blue'} opacity-${i*30} animate-pulse`} style={{animationDelay: `${i*0.1}s`}}></div>
               ))}
             </div>
          </div>
        </header>

        {/* Tabbed Content */}
        <ZoneDetailTabs data={data} />
      </div>
    </main>
  );
}
