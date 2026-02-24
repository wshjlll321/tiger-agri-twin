// Mock Data for Tiger Agri-Twin Platform — Thai Precision Agriculture

// ─── Rubber Tree ───────────────────────────────────────────────────────────────

export interface RubberTree {
  id: string;
  position: [number, number, number];
  health: "healthy" | "critical";
  carbonStock: number; // in kg
  age: number; // years
  lastScanned: string;
  variety: "RRIM 600" | "RRIT 251" | "BPM 24" | "RRIM 623";
  tappingStatus: "open" | "closed";
  drcContent: number; // Dry Rubber Content %
  latexYield: number; // kg/tree/year
  gpsLat: number;
  gpsLng: number;
}

export interface SugarcaneZone {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number];
  ndvi: number;
  status: "growing" | "harvest_ready" | "stressed";
  lodgingStatus?: boolean;
  variety: "KK3" | "LK92-11" | "K95-84" | "Uthong 12";
  ccs: number; // Commercial Cane Sugar %
  areaRai: number;
  yieldTonPerRai: number;
  lodgingPercent: number;
  sugarLossCCS: number;
  daysToHarvest: number;
  growthStage: "germination" | "tillering" | "grand_growth" | "maturation" | "harvest";
  gpsLat: number;
  gpsLng: number;
}

export interface DronePath {
  id: string;
  points: [number, number, number][];
  status: "flying" | "docked";
}

// ─── Rubber Variety Database ───────────────────────────────────────────────────

export interface RubberVariety {
  name: string;
  origin: string;
  recommendedRegion: string;
  tappingAge: string;
  expectedYield: string;
  diseaseResistance: "Low" | "Medium" | "High";
  description: string;
}

export const rubberVarieties: Record<string, RubberVariety> = {
  "RRIM 600": {
    name: "RRIM 600",
    origin: "Malaysia (RRIM)",
    recommendedRegion: "Southern Thailand",
    tappingAge: "6-7 years",
    expectedYield: "1.4-1.8 kg DRC/tree/year",
    diseaseResistance: "Medium",
    description: "Most widely planted clone in Thailand. Good latex yield with moderate wind resistance.",
  },
  "RRIT 251": {
    name: "RRIT 251",
    origin: "Thailand (RRIT)",
    recommendedRegion: "Southern & Eastern Thailand",
    tappingAge: "6 years",
    expectedYield: "1.5-1.9 kg DRC/tree/year",
    diseaseResistance: "High",
    description: "Thai-developed high-yielding clone with excellent disease resistance and vigorous growth.",
  },
  "BPM 24": {
    name: "BPM 24",
    origin: "Indonesia (Balai Penelitian)",
    recommendedRegion: "Eastern Thailand",
    tappingAge: "5-6 years",
    expectedYield: "1.2-1.6 kg DRC/tree/year",
    diseaseResistance: "Low",
    description: "Fast-growing clone, early tappable. Susceptible to leaf diseases in high humidity.",
  },
  "RRIM 623": {
    name: "RRIM 623",
    origin: "Malaysia (RRIM)",
    recommendedRegion: "Southern Thailand",
    tappingAge: "7 years",
    expectedYield: "1.3-1.7 kg DRC/tree/year",
    diseaseResistance: "Medium",
    description: "Good timber quality with steady latex yield. Moderate disease tolerance.",
  },
};

// ─── Rubber Diseases ───────────────────────────────────────────────────────────

export interface RubberDisease {
  nameTH: string;
  nameEN: string;
  pathogen: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  symptoms: string;
  treatment: string;
  prevention: string;
}

export const rubberDiseases: RubberDisease[] = [
  {
    nameTH: "โรครากขาว",
    nameEN: "White Root Disease",
    pathogen: "Rigidoporus microporus",
    severity: "HIGH",
    symptoms: "Yellowing and wilting of leaves, white fungal growth on roots and root collar, tree dieback.",
    treatment: "Apply Tridemorph or Cyproconazole to affected root zones. Remove severely infected trees and treat stumps.",
    prevention: "Regular root inspection every 6 months. Ensure proper drainage. Apply Trichoderma bio-control agents.",
  },
  {
    nameTH: "โรคราแป้ง",
    nameEN: "Powdery Mildew",
    pathogen: "Oidium heveae",
    severity: "MEDIUM",
    symptoms: "White powdery coating on young leaves, leaf curling and distortion, premature defoliation.",
    treatment: "Spray Sulfur suspension (45% SC) at 300x dilution. Follow with Triadimefon 1500x after 7 days.",
    prevention: "Maintain canopy ventilation. Remove fallen leaves to reduce inoculum. Monitor during refoliation season.",
  },
  {
    nameTH: "โรคใบร่วง",
    nameEN: "Abnormal Leaf Fall",
    pathogen: "Phytophthora spp.",
    severity: "HIGH",
    symptoms: "Water-soaked lesions on leaves, rapid defoliation, black rot on petioles, latex dripping from shoots.",
    treatment: "Apply Metalaxyl + Mancozeb (Ridomil Gold MZ) foliar spray. Repeat every 10-14 days during outbreaks.",
    prevention: "Avoid dense planting. Use resistant clones (RRIT 251). Apply copper-based fungicides preventively.",
  },
  {
    nameTH: "เปลือกตาย",
    nameEN: "Bark Necrosis (Tapping Panel Dryness)",
    pathogen: "Multiple causes (physiological + Botryodiplodia)",
    severity: "LOW",
    symptoms: "Dry tapping panels, no latex flow, browning of bark tissue, panel discoloration.",
    treatment: "Apply Ethephon stimulant at reduced concentration. Rest the affected panel for 3-6 months.",
    prevention: "Avoid over-tapping. Follow S/2 d/2 system strictly. Ensure balanced fertilization (N-P-K + Mg).",
  },
];

// ─── Monthly Latex Yield Data ──────────────────────────────────────────────────

export const monthlyLatexYield = [
  { month: "Jan", yield: 85, season: "tapping" },
  { month: "Feb", yield: 92, season: "tapping" },
  { month: "Mar", yield: 78, season: "tapping" },
  { month: "Apr", yield: 65, season: "tapping" },
  { month: "May", yield: 45, season: "tapping" },
  { month: "Jun", yield: 72, season: "tapping" },
  { month: "Jul", yield: 88, season: "tapping" },
  { month: "Aug", yield: 95, season: "tapping" },
  { month: "Sep", yield: 90, season: "tapping" },
  { month: "Oct", yield: 82, season: "tapping" },
  { month: "Nov", yield: 60, season: "tapping" },
  { month: "Dec", yield: 30, season: "wintering" },
];

// ─── Rubber Price Sparkline ────────────────────────────────────────────────────

export const rubberPriceTrend = [
  56.2, 56.8, 57.1, 56.5, 57.4, 58.0, 57.8, 58.2, 58.5, 57.9,
  58.1, 58.3, 57.6, 58.0, 58.5, 58.2, 58.7, 58.9, 58.3, 58.5,
  59.0, 58.8, 58.4, 58.5, 58.6, 58.3, 58.1, 58.5, 58.4, 58.5,
];

// ─── Sugarcane Variety Database ────────────────────────────────────────────────

export interface SugarcaneVariety {
  name: string;
  nameTH: string;
  maturity: string;
  ccsRange: string;
  yieldPotential: string;
  ratooningAbility: string;
  description: string;
}

export const sugarcaneVarieties: Record<string, SugarcaneVariety> = {
  KK3: {
    name: "KK3",
    nameTH: "ขอนแก่น 3",
    maturity: "12-14 months",
    ccsRange: "12-14%",
    yieldPotential: "14-18 Ton/Rai",
    ratooningAbility: "3-4 cycles",
    description: "Most popular Thai variety. High sucrose content, good ratooning, moderate drought tolerance.",
  },
  "LK92-11": {
    name: "LK92-11",
    nameTH: "แอลเค 92-11",
    maturity: "11-13 months",
    ccsRange: "11-13%",
    yieldPotential: "15-18 Ton/Rai",
    ratooningAbility: "3-4 cycles",
    description: "High tonnage variety developed for irrigated conditions. Good fiber content for biomass.",
  },
  "K95-84": {
    name: "K95-84",
    nameTH: "เค 95-84",
    maturity: "10-12 months",
    ccsRange: "10-12%",
    yieldPotential: "12-16 Ton/Rai",
    ratooningAbility: "3 cycles",
    description: "Early maturing variety suitable for areas with short growing seasons. Moderate CCS.",
  },
  "Uthong 12": {
    name: "Uthong 12",
    nameTH: "อู่ทอง 12",
    maturity: "12-14 months",
    ccsRange: "12-14%",
    yieldPotential: "14-17 Ton/Rai",
    ratooningAbility: "4 cycles",
    description: "Drought-tolerant variety bred for rainfed conditions. Excellent ratooning with stable CCS.",
  },
};

// ─── Sugarcane Monthly NDVI Data ───────────────────────────────────────────────

export const sugarcaneNDVI = [
  { month: "Jan", ndvi: 0.25, stage: "germination" },
  { month: "Feb", ndvi: 0.35, stage: "tillering" },
  { month: "Mar", ndvi: 0.50, stage: "tillering" },
  { month: "Apr", ndvi: 0.65, stage: "grand_growth" },
  { month: "May", ndvi: 0.78, stage: "grand_growth" },
  { month: "Jun", ndvi: 0.85, stage: "grand_growth" },
  { month: "Jul", ndvi: 0.88, stage: "grand_growth" },
  { month: "Aug", ndvi: 0.82, stage: "grand_growth" },
  { month: "Sep", ndvi: 0.75, stage: "maturation" },
  { month: "Oct", ndvi: 0.68, stage: "maturation" },
  { month: "Nov", ndvi: 0.55, stage: "maturation" },
  { month: "Dec", ndvi: 0.40, stage: "harvest" },
];

// ─── Drone Inspection Mission Data ─────────────────────────────────────────────

export interface DroneMission {
  id: string;
  targetZone: string;
  altitude: number;
  overlap: number;
  speed: number;
  areaCoverRai: number;
  estimatedFlightMin: number;
  status: "planning" | "preflight" | "inflight" | "data_collected" | "analyzing" | "complete";
  dataCollected: {
    rgbImages: number;
    rgbResolution: string;
    multispectralFrames: number;
    multispectralBands: number;
    pointCloudPoints: string;
    thermalFrames: number;
    totalDataGB: number;
  };
  aiResults: {
    treesDetected: number;
    healthyTrees: number;
    atRiskTrees: number;
    avgCrownArea: number;
    ndviScore: number;
    anomaliesFound: number;
  };
  report: {
    treesCount: number;
    diseaseSpots: number;
    lodgingZones: number;
    lodgingAreaRai: number;
    carbonEstimate: number;
    healthScore: number;
  };
}

export const mockDroneMission: DroneMission = {
  id: "MISSION-2026-0212",
  targetZone: "Sector Alpha",
  altitude: 120,
  overlap: 80,
  speed: 12,
  areaCoverRai: 125,
  estimatedFlightMin: 35,
  status: "planning",
  dataCollected: {
    rgbImages: 2450,
    rgbResolution: "5cm/px",
    multispectralFrames: 2450,
    multispectralBands: 5,
    pointCloudPoints: "12.5M",
    thermalFrames: 1225,
    totalDataGB: 48.2,
  },
  aiResults: {
    treesDetected: 12450,
    healthyTrees: 11680,
    atRiskTrees: 770,
    avgCrownArea: 4.2,
    ndviScore: 0.72,
    anomaliesFound: 23,
  },
  report: {
    treesCount: 12450,
    diseaseSpots: 23,
    lodgingZones: 2,
    lodgingAreaRai: 15.5,
    carbonEstimate: 1240,
    healthScore: 94.2,
  },
};

// ─── Generate Trees with Thai Rubber Varieties ─────────────────────────────────

const VARIETIES: RubberTree["variety"][] = ["RRIM 600", "RRIT 251", "BPM 24", "RRIM 623"];

export const mockRubberTrees: RubberTree[] = Array.from({ length: 150 }).map((_, i) => {
  const isCritical = Math.random() < 0.1;
  const variety = VARIETIES[i % 4];
  return {
    id: `RUB-Z01-${String(i + 1).padStart(4, "0")}`,
    position: [
      (Math.random() - 0.5) * 100,
      0,
      (Math.random() - 0.5) * 100,
    ] as [number, number, number],
    health: isCritical ? "critical" : "healthy",
    carbonStock: Math.floor(Math.random() * 50) + 10,
    age: Math.floor(Math.random() * 5) + 3,
    lastScanned: new Date().toISOString(),
    variety,
    tappingStatus: Math.random() > 0.15 ? "open" : "closed",
    drcContent: 28 + Math.random() * 10, // 28-38% DRC
    latexYield: 1.2 + Math.random() * 0.8, // 1.2-2.0 kg/tree/year
    gpsLat: 9.1 + Math.random() * 0.05,
    gpsLng: 99.28 + Math.random() * 0.05,
  };
});

// ─── Sugarcane Zones with Thai Varieties ───────────────────────────────────────

export const mockSugarcaneZones: SugarcaneZone[] = [
  {
    id: "ZONE-A",
    name: "Sector Alpha",
    position: [60, 0.1, 60],
    size: [40, 40],
    ndvi: 0.85,
    status: "growing",
    variety: "KK3",
    ccs: 13.2,
    areaRai: 125,
    yieldTonPerRai: 15.8,
    lodgingPercent: 2,
    sugarLossCCS: 0.3,
    daysToHarvest: 45,
    growthStage: "maturation",
    gpsLat: 9.12,
    gpsLng: 99.31,
  },
  {
    id: "ZONE-B",
    name: "Sector Beta",
    position: [-60, 0.1, -40],
    size: [50, 30],
    ndvi: 0.45,
    status: "stressed",
    lodgingStatus: true,
    variety: "LK92-11",
    ccs: 10.8,
    areaRai: 95,
    yieldTonPerRai: 12.4,
    lodgingPercent: 18,
    sugarLossCCS: 3.2,
    daysToHarvest: 30,
    growthStage: "maturation",
    gpsLat: 9.10,
    gpsLng: 99.29,
  },
  {
    id: "ZONE-C",
    name: "Sector Gamma",
    position: [20, 0.1, -70],
    size: [30, 60],
    ndvi: 0.65,
    status: "harvest_ready",
    variety: "KK3",
    ccs: 12.5,
    areaRai: 150,
    yieldTonPerRai: 14.2,
    lodgingPercent: 5,
    sugarLossCCS: 0.8,
    daysToHarvest: 15,
    growthStage: "harvest",
    gpsLat: 9.13,
    gpsLng: 99.32,
  },
];

// ─── Drone Path ────────────────────────────────────────────────────────────────

export const mockDronePath: DronePath = {
  id: "DRONE-01",
  status: "flying",
  points: Array.from({ length: 50 }).map((_, i) => {
    const t = (i / 25) * Math.PI;
    return [
      Math.sin(t) * 40,
      20 + Math.sin(t * 3) * 5,
      Math.sin(t) * Math.cos(t) * 40,
    ] as [number, number, number];
  }),
};

// ─── Evidence Chain for Pest/Disease Detection ────────────────────────────────

export interface EvidenceNode {
  id: string;
  timestamp: string;
  source: 'drone_rgb' | 'drone_multispectral' | 'drone_thermal' | 'soil_sensor' | 'weather_station' | 'leaf_wetness_sensor' | 'ai_analysis';
  sourceDevice: string;
  gpsLat: number;
  gpsLng: number;
  dataType: string;
  value: string;
  unit?: string;
  anomalyDetected: boolean;
  confidence: number;
  description: string;
  aiInterpretation: string;
}

export interface PestEvidenceChain {
  id: string;
  pestName: string;
  pestNameTH: string;
  pathogen: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedDate: string;
  status: 'monitoring' | 'confirmed' | 'treating' | 'resolved';
  affectedTreeIds: string[];
  affectedArea: string;
  evidenceNodes: EvidenceNode[];
  finalDiagnosis: string;
  treatmentPlan: string;
  aiReportSummary: string;
}

export const mockPestEvidenceChains: PestEvidenceChain[] = [
  {
    id: "EVC-2026-001",
    pestName: "White Root Disease",
    pestNameTH: "โรครากขาว",
    pathogen: "Rigidoporus microporus",
    severity: "HIGH",
    detectedDate: "2026-02-08",
    status: "treating",
    affectedTreeIds: ["RUB-Z01-0011", "RUB-Z01-0022", "RUB-Z01-0033", "RUB-Z01-0044"],
    affectedArea: "0.3 ha (Sector 3-East)",
    evidenceNodes: [
      {
        id: "EN-001-01",
        timestamp: "2026-02-06T08:15:00Z",
        source: "drone_rgb",
        sourceDevice: "H15-01",
        gpsLat: 9.1256,
        gpsLng: 99.3438,
        dataType: "RGB 航拍影像",
        value: "检测到冠层变黄区域 4棵树",
        anomalyDetected: true,
        confidence: 72,
        description: "无人机常规巡检发现 Sector 3 东部区域 4 棵橡胶树冠层出现异常变黄，叶片密度明显下降。",
        aiInterpretation: "RGB影像分析显示该区域4棵橡胶树冠层NDVI值从0.85降至0.62，叶片反射率异常升高，绿色通道信号减弱18%。这种模式与根部受损导致的营养输送障碍高度一致。建议立即进行多光谱确认扫描和地面根系检查。"
      },
      {
        id: "EN-001-02",
        timestamp: "2026-02-06T09:30:00Z",
        source: "drone_multispectral",
        sourceDevice: "H15-01 (RedEdge-MX)",
        gpsLat: 9.1256,
        gpsLng: 99.3438,
        dataType: "多光谱 NDVI/NDRE 图",
        value: "NDVI=0.62 (正常>0.82), NDRE=0.28",
        anomalyDetected: true,
        confidence: 85,
        description: "多光谱传感器确认受影响树木的NDVI和NDRE指数显著偏低，红边反射率异常。",
        aiInterpretation: "多光谱数据表明受影响区域的植被活力严重下降。NDVI值0.62低于该品种正常阈值0.82，NDRE值0.28表明叶绿素含量显著减少。红边位移从740nm降至722nm，这是典型的根部应激反应特征。结合空间分布呈聚集性特点，高度怀疑土壤传播性病害（如Rigidoporus microporus白根病）。"
      },
      {
        id: "EN-001-03",
        timestamp: "2026-02-06T10:00:00Z",
        source: "drone_thermal",
        sourceDevice: "H15-01 (FLIR Vue Pro)",
        gpsLat: 9.1256,
        gpsLng: 99.3438,
        dataType: "热成像温度图",
        value: "冠层温度 34.2°C (健康树: 29.5°C)",
        unit: "°C",
        anomalyDetected: true,
        confidence: 88,
        description: "热成像显示受影响树木冠层温度比周围健康树木高4.7°C，表明蒸腾作用减弱。",
        aiInterpretation: "热成像数据显示异常树木冠层温度34.2°C，显著高于周围健康树木29.5°C，温差达4.7°C。这种温度升高表明叶片气孔关闭、蒸腾作用减弱，是根系供水受阻的典型信号。结合NDVI异常，该温度分布模式支持根部病害假设，根系受损导致水分输送能力下降约38%。"
      },
      {
        id: "EN-001-04",
        timestamp: "2026-02-07T06:30:00Z",
        source: "soil_sensor",
        sourceDevice: "S-003 (Soil Station)",
        gpsLat: 9.1257,
        gpsLng: 99.3439,
        dataType: "土壤湿度/温度/pH",
        value: "湿度82% (偏高), pH=4.8 (偏酸), 温度28.5°C",
        anomalyDetected: true,
        confidence: 78,
        description: "地面传感器数据显示受影响区域土壤偏湿偏酸，有利于真菌病害发展。",
        aiInterpretation: "土壤传感器数据揭示了有利于Rigidoporus microporus真菌繁殖的环境条件：\n• 土壤湿度82%高于正常水平65-70%，过度饱和促进真菌孢子萌发\n• pH值4.8低于橡胶树最适范围5.5-6.0，酸性环境加速根部组织降解\n• 土壤温度28.5°C处于白根病菌最适生长温度范围(25-32°C)\n建议改善排水并施用石灰提升pH至5.5以上，同时减少灌溉频率。"
      },
      {
        id: "EN-001-05",
        timestamp: "2026-02-07T07:00:00Z",
        source: "leaf_wetness_sensor",
        sourceDevice: "LW-007 (Leaf Monitor)",
        gpsLat: 9.1256,
        gpsLng: 99.3438,
        dataType: "叶面湿度/持续时间",
        value: "叶面湿润持续 >8小时/天",
        anomalyDetected: true,
        confidence: 75,
        description: "叶面湿度传感器显示长时间高湿状态，加剧真菌感染风险。",
        aiInterpretation: "叶面湿度传感器数据表明该区域每日叶面湿润时间超过8小时，远超安全阈值4小时。持续高湿度环境为继发性真菌感染（如Oidium heveae粉状霉菌）创造了条件。建议在根部病害治疗的同时进行冠层修剪以改善通风，降低叶面湿润持续时间至6小时以内。"
      },
      {
        id: "EN-001-06",
        timestamp: "2026-02-07T14:00:00Z",
        source: "weather_station",
        sourceDevice: "WS-01 (Main Station)",
        gpsLat: 9.1250,
        gpsLng: 99.3450,
        dataType: "气象综合数据",
        value: "温度30°C, 湿度88%, 降雨12mm/24h",
        anomalyDetected: false,
        confidence: 95,
        description: "气象站数据显示近期高温高湿，连续降雨为病害扩散提供有利条件。",
        aiInterpretation: "近一周气象数据分析：平均温度29.5°C，平均湿度86%，累计降雨量32mm，无一日气温低于25°C。这些条件构成了白根病爆发的「完美风暴」——高温高湿加速真菌菌丝生长，持续降雨使土壤长期饱和。根据白根病流行病学模型，当前环境条件下R. microporus的菌丝日生长速率约为3.5mm，预计14天内可扩展至邻近树木根系。"
      },
      {
        id: "EN-001-07",
        timestamp: "2026-02-08T10:00:00Z",
        source: "ai_analysis",
        sourceDevice: "AgriTwin AI v3.2",
        gpsLat: 9.1256,
        gpsLng: 99.3438,
        dataType: "AI 综合诊断报告",
        value: "确诊: 白根病 (Rigidoporus microporus) — 置信度 94%",
        anomalyDetected: true,
        confidence: 94,
        description: "AI引擎综合分析6项证据源数据，最终确诊为白根病感染，给出治疗方案。",
        aiInterpretation: "【AI综合诊断报告】\n\n■ 诊断结论: 白根病（Rigidoporus microporus）感染确认\n■ 置信度: 94%\n■ 受影响范围: 4棵橡胶树 (RUB-Z01-0011/0022/0033/0044)\n■ 感染阶段: 中期（根部菌丝覆盖率约40%）\n\n■ 证据链综合:\n  1. RGB+多光谱: 冠层活力下降38%，NDVI从0.85→0.62\n  2. 热成像: 冠层温升+4.7°C，蒸腾率下降\n  3. 土壤: pH偏酸(4.8)，湿度偏高(82%)，利于真菌\n  4. 气象: 连续高温高湿，降雨频繁\n  5. 空间分析: 聚集性分布，符合土壤传播特征\n\n■ 扩散风险: 高（14天内可能影响相邻8棵树）\n■ 经济影响: 若不治疗，预计损失乳胶产量约180kg/年\n\n■ 建议治疗方案:\n  1. 立即: Tridemorph杀菌剂灌根 (200ml/树)\n  2. 48h内: 清除严重感染根系，伤口涂抹杀菌膏\n  3. 7天: 施用石灰提升土壤pH至5.5+\n  4. 持续: Trichoderma生物防治剂每月施用\n  5. 监测: 每周无人机复查直至NDVI恢复"
      }
    ],
    finalDiagnosis: "白根病（Rigidoporus microporus）中期感染，4棵橡胶树受影响，根部菌丝覆盖率约40%",
    treatmentPlan: "Tridemorph杀菌剂灌根 + 清除感染根系 + 土壤pH调节 + Trichoderma生物防治",
    aiReportSummary: "本次病害检测证据链完整覆盖6个数据维度（航拍RGB、多光谱、热成像、土壤传感器、叶面湿度、气象站），AI引擎以94%置信度确诊为白根病。该病害由Rigidoporus microporus真菌引起，当前处于中期感染阶段。如不及时治疗，14天内可能扩散至相邻树木，预计年乳胶产量损失180kg。建议立即执行综合治疗方案并开启每周无人机监测。"
  },
  {
    id: "EVC-2026-002",
    pestName: "Powdery Mildew",
    pestNameTH: "โรคราแป้ง",
    pathogen: "Oidium heveae",
    severity: "MEDIUM",
    detectedDate: "2026-02-10",
    status: "confirmed",
    affectedTreeIds: ["RUB-Z01-0055", "RUB-Z01-0056", "RUB-Z01-0057", "RUB-Z01-0058", "RUB-Z01-0059", "RUB-Z01-0060", "RUB-Z01-0061", "RUB-Z01-0062"],
    affectedArea: "0.5 ha (Sector 2-North)",
    evidenceNodes: [
      {
        id: "EN-002-01",
        timestamp: "2026-02-09T07:45:00Z",
        source: "drone_rgb",
        sourceDevice: "H15-01",
        gpsLat: 9.1260,
        gpsLng: 99.3445,
        dataType: "RGB 航拍影像",
        value: "叶面白色粉状覆盖物，8棵树",
        anomalyDetected: true,
        confidence: 80,
        description: "无人机高分辨率RGB图像检测到嫩叶表面大面积白色粉状覆盖物。",
        aiInterpretation: "RGB影像分析在5cm/px分辨率下清晰识别到8棵树嫩叶表面的白色粉状覆盖物，纹理特征与Oidium heveae（橡胶粉状霉菌）孢子层高度匹配（相似度92%）。受影响叶片主要集中在树冠上部新发叶片，这与粉状霉菌偏好嫩叶组织的特性一致。当前覆盖面积约占叶冠的25-30%。"
      },
      {
        id: "EN-002-02",
        timestamp: "2026-02-09T08:30:00Z",
        source: "drone_multispectral",
        sourceDevice: "H15-01 (RedEdge-MX)",
        gpsLat: 9.1260,
        gpsLng: 99.3445,
        dataType: "多光谱 反射率分析",
        value: "近红外反射率异常升高 +22%",
        anomalyDetected: true,
        confidence: 83,
        description: "多光谱数据显示受感染叶片近红外波段反射率异常，与真菌表面覆盖特征一致。",
        aiInterpretation: "多光谱分析揭示受感染叶片在842nm近红外波段反射率升高22%，这是由于真菌菌丝体在叶表面形成了高反射率的微观结构。同时668nm红光波段吸收降低15%，表明光合效率已受影响。基于多光谱特征向量分类，诊断为粉状霉菌感染的概率为87%。"
      },
      {
        id: "EN-002-03",
        timestamp: "2026-02-10T06:00:00Z",
        source: "leaf_wetness_sensor",
        sourceDevice: "LW-005",
        gpsLat: 9.1261,
        gpsLng: 99.3446,
        dataType: "叶面湿度监测",
        value: "夜间叶面湿度 >95% 持续6小时",
        anomalyDetected: true,
        confidence: 80,
        description: "叶面湿度传感器记录到持续高湿环境，符合粉状霉菌孢子萌发条件。",
        aiInterpretation: "叶面湿度数据显示夜间(22:00-04:00)叶面湿度持续超过95%，持续时间6小时。Oidium heveae孢子萌发仅需叶面湿度>90%持续3小时以上，当前条件远超感染阈值。结合日间温度28-32°C（孢子繁殖最适温度），预计未来48小时内感染面积可能扩大40-60%。建议尽快进行硫磺粉喷施。"
      },
      {
        id: "EN-002-04",
        timestamp: "2026-02-10T11:00:00Z",
        source: "ai_analysis",
        sourceDevice: "AgriTwin AI v3.2",
        gpsLat: 9.1260,
        gpsLng: 99.3445,
        dataType: "AI 综合诊断",
        value: "确诊: 粉状霉菌 (Oidium heveae) — 置信度 89%",
        anomalyDetected: true,
        confidence: 89,
        description: "AI引擎综合RGB、多光谱和环境数据确诊粉状霉菌感染。",
        aiInterpretation: "【AI诊断结论】\n粉状霉菌（Oidium heveae）感染确认，置信度89%。\n8棵树受影响，覆盖面积0.5ha。当前处于早中期感染阶段，叶面覆盖率25-30%。\n\n扩散预测：未来7天内可能扩展至15-20棵树。\n产量影响：如不治疗，本季乳胶产量预计下降12-15%。\n\n推荐处置：\n1. 48h内：硫磺悬浮液(45%SC)300倍稀释喷施\n2. 7天后：三唑酮(Triadimefon)1500倍稀释复喷\n3. 改善冠层通风（修剪下部枝条）"
      }
    ],
    finalDiagnosis: "粉状霉菌（Oidium heveae）早中期感染，8棵橡胶树受影响",
    treatmentPlan: "硫磺悬浮液喷施 + 三唑酮复喷 + 冠层修剪通风",
    aiReportSummary: "AI综合无人机RGB+多光谱+叶面湿度传感器数据，以89%置信度确诊粉状霉菌感染。8棵树受影响，建议立即硫磺喷施并7天后三唑酮复喷。若不处理，产量预计下降12-15%。"
  },
  {
    id: "EVC-2026-003",
    pestName: "Abnormal Leaf Fall",
    pestNameTH: "โรคใบร่วงผิดปกติ",
    pathogen: "Phytophthora botryosa",
    severity: "CRITICAL",
    detectedDate: "2026-02-12",
    status: "monitoring",
    affectedTreeIds: ["RUB-Z01-0099", "RUB-Z01-0100"],
    affectedArea: "0.1 ha (Sector 1-South)",
    evidenceNodes: [
      {
        id: "EN-003-01",
        timestamp: "2026-02-11T07:00:00Z",
        source: "drone_rgb",
        sourceDevice: "H15-02",
        gpsLat: 9.1250,
        gpsLng: 99.3440,
        dataType: "RGB 航拍影像",
        value: "检测到急速落叶区域，地面落叶覆盖异常",
        anomalyDetected: true,
        confidence: 76,
        description: "无人机检测到Sector 1南部2棵树下方地面落叶量异常增多，树冠稀疏。",
        aiInterpretation: "RGB航拍图像分析显示2棵橡胶树冠层叶片密度仅为正常水平的40%，树下地面落叶面积约12m²/棵。落叶速率估计为正常季节性落叶的5倍。叶片掉落模式呈向心性（从外缘向中心），与Phytophthora spp.引起的异常落叶特征一致。"
      },
      {
        id: "EN-003-02",
        timestamp: "2026-02-11T08:00:00Z",
        source: "drone_multispectral",
        sourceDevice: "H15-02 (RedEdge-MX)",
        gpsLat: 9.1250,
        gpsLng: 99.3440,
        dataType: "多光谱 植被指数",
        value: "NDVI=0.38 (严重偏低), CRI=2.8 (叶绿素极低)",
        anomalyDetected: true,
        confidence: 91,
        description: "多光谱扫描显示极低植被活力指数，叶绿素含量处于危险水平。",
        aiInterpretation: "多光谱数据显示NDVI值0.38为该品种(RRIM 600)记录的最低区间，叶绿素反射指数CRI仅2.8（正常值>5.0）。光化学反射指数PRI为-0.15，表明光合系统几乎停止工作。与数据库中Phytophthora botryosa案例的光谱特征匹配度达91%。此为紧急警告级别——如不立即干预，这2棵树可能在30天内完全落叶死亡。"
      },
      {
        id: "EN-003-03",
        timestamp: "2026-02-12T06:00:00Z",
        source: "weather_station",
        sourceDevice: "WS-01",
        gpsLat: 9.1250,
        gpsLng: 99.3450,
        dataType: "降雨+温度记录",
        value: "连续3天降雨 累计52mm, 平均温度27°C",
        anomalyDetected: true,
        confidence: 90,
        description: "气象数据确认近期持续降雨，为Phytophthora孢子传播创造了理想条件。",
        aiInterpretation: "近3天累计降雨52mm，日均温度27°C，连续湿润时间超过48小时。这是Phytophthora botryosa孢子水传播的理想条件（临界值：>30mm/3天 + >25°C）。飞溅传播半径估计为2-3米，感染窗口已开启超过36小时。高优先级建议：立即对受影响树木周围5米范围内的所有树木进行预防性铜基杀菌剂喷施。"
      },
      {
        id: "EN-003-04",
        timestamp: "2026-02-12T09:00:00Z",
        source: "ai_analysis",
        sourceDevice: "AgriTwin AI v3.2",
        gpsLat: 9.1250,
        gpsLng: 99.3440,
        dataType: "AI 紧急预警报告",
        value: "疑似: 异常落叶病 (Phytophthora botryosa) — 置信度 88%",
        anomalyDetected: true,
        confidence: 88,
        description: "AI引擎发出紧急预警，建议立即现场验证和防治处理。",
        aiInterpretation: "【紧急AI预警】\n\n疑似异常落叶病（Phytophthora botryosa），置信度88%。\n当前仅2棵树受影响，但传播风险极高。\n\n⚠ 紧急行动建议:\n1. 立即(TODAY): 派遣地面团队现场采样确认\n2. 24h内: Metalaxyl+Mancozeb(瑞毒霉锰锌)全覆盖喷施\n3. 48h内: 对5m范围内所有树木预防性处理\n4. 持续: 减少该区域灌溉，改善排水\n5. 监测: 每日无人机巡检直至症状缓解\n\n潜在影响: 若扩散至整个Sector 1，估计损失500kg/年乳胶"
      }
    ],
    finalDiagnosis: "疑似异常落叶病（Phytophthora botryosa），紧急级别，需立即现场确认",
    treatmentPlan: "现场采样确认 → Metalaxyl+Mancozeb喷施 → 范围预防处理 → 改善排水",
    aiReportSummary: "AI以88%置信度检测到异常落叶病早期信号，当前仅2棵树但传播风险极高。已发出紧急预警，建议立即现场确认并执行Metalaxyl+Mancozeb喷施方案。"
  }
];

// ─── Zone Carbon Detail Data ─────────────────────────────────────────────────

export interface ZoneCarbonDetail {
  zoneId: string;
  zoneName: string;
  cropType: string;
  area: string;
  areaRai: number;
  aboveGroundBiomass: number;
  belowGroundBiomass: number;
  soilOrganicCarbon: number;
  litterDeadwood: number;
  totalCarbonStock: number;
  carbonSequestrationRate: number;
  netPrimaryProductivity: number;
  soilRespirationRate: number;
  carbonFlux: number;
  carbonDensity: number;
  carbonIntensity: number;
  creditPrice: number;
  totalCredits: number;
  creditsSold: number;
  revenueUSD: number;
  methodology: string;
  verificationStatus: string;
  lastAuditDate: string;
  certificationBody: string;
  monthlySequestration: Array<{ month: string; value: number; emission: number }>;
  aiInterpretation: string;
  aiRecommendations: string[];
}

export const mockZoneCarbonDetails: ZoneCarbonDetail[] = [
  {
    zoneId: "1",
    zoneName: "Durian Zone",
    cropType: "Durian (榴莲)",
    area: "2.4 ha",
    areaRai: 15,
    aboveGroundBiomass: 185.4,
    belowGroundBiomass: 46.3,
    soilOrganicCarbon: 92.7,
    litterDeadwood: 18.5,
    totalCarbonStock: 342.9,
    carbonSequestrationRate: 38.5,
    netPrimaryProductivity: 8.2,
    soilRespirationRate: 3.1,
    carbonFlux: 14.1,
    carbonDensity: 142.9,
    carbonIntensity: 22.9,
    creditPrice: 28.5,
    totalCredits: 42,
    creditsSold: 28,
    revenueUSD: 798,
    methodology: "VCS VM0015",
    verificationStatus: "Verified",
    lastAuditDate: "2026-01-15",
    certificationBody: "SGS Thailand",
    monthlySequestration: [
      { month: "Jan", value: 35, emission: 10 }, { month: "Feb", value: 38, emission: 9 },
      { month: "Mar", value: 42, emission: 11 }, { month: "Apr", value: 40, emission: 10 },
      { month: "May", value: 45, emission: 12 }, { month: "Jun", value: 48, emission: 13 },
      { month: "Jul", value: 50, emission: 11 }, { month: "Aug", value: 47, emission: 12 },
      { month: "Sep", value: 44, emission: 10 }, { month: "Oct", value: 42, emission: 11 },
      { month: "Nov", value: 38, emission: 9 }, { month: "Dec", value: 36, emission: 10 },
    ],
    aiInterpretation: "该榴莲种植区碳储量342.9 tCO2e，碳密度142.9 tCO2e/ha处于热带果树种植区中上水平。地上生物量占比54%为碳储存主体，土壤有机碳占27%表明土壤管理良好。每日碳汇速率38.5 kg/day，NPP值8.2 gC/m²/day高于区域平均水平。建议增加覆盖作物以提升土壤碳汇能力约15-20%。当前已通过VCS验证，可进一步申请Gold Standard认证以获得更高碳信用价格。",
    aiRecommendations: [
      "增加地被覆盖物种以提升土壤碳汇15-20%",
      "优化修剪策略减少枯枝落叶分解速率",
      "申请Gold Standard认证提升碳信用单价至$35+",
      "引入生物炭技术提升土壤固碳能力"
    ]
  },
  {
    zoneId: "2",
    zoneName: "Mangosteen Zone",
    cropType: "Mangosteen (山竹)",
    area: "1.8 ha",
    areaRai: 11.25,
    aboveGroundBiomass: 124.6,
    belowGroundBiomass: 31.2,
    soilOrganicCarbon: 68.4,
    litterDeadwood: 14.2,
    totalCarbonStock: 238.4,
    carbonSequestrationRate: 28.2,
    netPrimaryProductivity: 6.8,
    soilRespirationRate: 2.8,
    carbonFlux: 10.3,
    carbonDensity: 132.4,
    carbonIntensity: 21.2,
    creditPrice: 28.5,
    totalCredits: 32,
    creditsSold: 20,
    revenueUSD: 570,
    methodology: "VCS VM0015",
    verificationStatus: "Verified",
    lastAuditDate: "2026-01-15",
    certificationBody: "SGS Thailand",
    monthlySequestration: [
      { month: "Jan", value: 25, emission: 8 }, { month: "Feb", value: 28, emission: 8 },
      { month: "Mar", value: 30, emission: 9 }, { month: "Apr", value: 32, emission: 9 },
      { month: "May", value: 35, emission: 10 }, { month: "Jun", value: 33, emission: 11 },
      { month: "Jul", value: 30, emission: 10 }, { month: "Aug", value: 28, emission: 9 },
      { month: "Sep", value: 27, emission: 8 }, { month: "Oct", value: 26, emission: 8 },
      { month: "Nov", value: 25, emission: 7 }, { month: "Dec", value: 24, emission: 8 },
    ],
    aiInterpretation: "山竹种植区碳储量238.4 tCO2e，碳密度132.4 tCO2e/ha。该区域NDVI偏低(0.65)影响了碳汇效率，NPP值6.8 gC/m²/day低于最优水平。土壤呼吸速率2.8 gCO2/m²/hr正常，但土壤有机碳占比28.7%仍有提升空间。该区域存在轻微胁迫，建议优先解决病虫害问题以恢复植被活力，预计可提升碳汇速率15%。",
    aiRecommendations: [
      "优先处理植被胁迫以恢复碳汇效率",
      "增施有机肥提升土壤有机碳含量",
      "优化灌溉减少土壤碳排放",
      "考虑林下种植以增加碳汇多样性"
    ]
  },
  {
    zoneId: "3",
    zoneName: "Rubber Zone",
    cropType: "Rubber (橡胶)",
    area: "3.2 ha",
    areaRai: 20,
    aboveGroundBiomass: 298.5,
    belowGroundBiomass: 74.6,
    soilOrganicCarbon: 145.2,
    litterDeadwood: 28.8,
    totalCarbonStock: 547.1,
    carbonSequestrationRate: 52.8,
    netPrimaryProductivity: 10.5,
    soilRespirationRate: 3.4,
    carbonFlux: 19.3,
    carbonDensity: 170.9,
    carbonIntensity: 27.4,
    creditPrice: 28.5,
    totalCredits: 68,
    creditsSold: 45,
    revenueUSD: 1282,
    methodology: "T-VER (Thailand Voluntary Emission Reduction)",
    verificationStatus: "Verified",
    lastAuditDate: "2026-01-20",
    certificationBody: "TGO (Thailand Greenhouse Gas Management Organization)",
    monthlySequestration: [
      { month: "Jan", value: 48, emission: 12 }, { month: "Feb", value: 52, emission: 11 },
      { month: "Mar", value: 55, emission: 13 }, { month: "Apr", value: 50, emission: 12 },
      { month: "May", value: 58, emission: 14 }, { month: "Jun", value: 62, emission: 15 },
      { month: "Jul", value: 65, emission: 13 }, { month: "Aug", value: 60, emission: 14 },
      { month: "Sep", value: 56, emission: 12 }, { month: "Oct", value: 52, emission: 13 },
      { month: "Nov", value: 48, emission: 11 }, { month: "Dec", value: 45, emission: 12 },
    ],
    aiInterpretation: "橡胶种植区是全农场碳汇贡献最大的地块，碳储量547.1 tCO2e，碳密度170.9 tCO2e/ha位于热带人工林优秀水平。NDVI 0.92表明植被活力极佳。地上生物量298.5 tCO2e占比54.6%，橡胶树的高生物量增长率使其成为优质碳汇作物。每日碳汇速率52.8 kg/day，NPP值10.5 gC/m²/day显著高于区域平均。已通过泰国T-VER认证，碳信用单价稳定在$28.5/tCO2e。注意：当前有4棵树受白根病影响，如不治疗预计碳储量损失约8.2 tCO2e/年。",
    aiRecommendations: [
      "尽快治疗白根病感染树木以避免碳储量损失",
      "优化割胶制度(S/2 d/2)减少对树木碳积累的影响",
      "申请VCS国际认证以拓展碳信用海外买家",
      "建立实时碳通量监测塔提升数据精度",
      "考虑间套种固氮作物提升土壤碳含量"
    ]
  },
  {
    zoneId: "4",
    zoneName: "Oil Palm Zone",
    cropType: "Oil Palm (油棕)",
    area: "4.5 ha",
    areaRai: 28.1,
    aboveGroundBiomass: 210.3,
    belowGroundBiomass: 52.6,
    soilOrganicCarbon: 178.5,
    litterDeadwood: 35.2,
    totalCarbonStock: 476.6,
    carbonSequestrationRate: 42.5,
    netPrimaryProductivity: 7.8,
    soilRespirationRate: 4.2,
    carbonFlux: 15.5,
    carbonDensity: 105.9,
    carbonIntensity: 17.0,
    creditPrice: 22.0,
    totalCredits: 55,
    creditsSold: 30,
    revenueUSD: 660,
    methodology: "RSPO PalmGHG",
    verificationStatus: "Pending Review",
    lastAuditDate: "2025-12-10",
    certificationBody: "BSI Group",
    monthlySequestration: [
      { month: "Jan", value: 38, emission: 18 }, { month: "Feb", value: 40, emission: 17 },
      { month: "Mar", value: 42, emission: 19 }, { month: "Apr", value: 44, emission: 18 },
      { month: "May", value: 48, emission: 20 }, { month: "Jun", value: 50, emission: 21 },
      { month: "Jul", value: 52, emission: 19 }, { month: "Aug", value: 48, emission: 20 },
      { month: "Sep", value: 45, emission: 18 }, { month: "Oct", value: 42, emission: 17 },
      { month: "Nov", value: 40, emission: 16 }, { month: "Dec", value: 38, emission: 17 },
    ],
    aiInterpretation: "油棕区碳储量476.6 tCO2e，但碳密度仅105.9 tCO2e/ha，在本农场所有地块中最低。NDVI 0.45严重偏低，表明植被健康状况不佳，直接影响碳汇效率。土壤有机碳占比37.5%较高，但土壤呼吸速率4.2 gCO2/m²/hr偏高，意味着土壤碳流失速度快。碳信用单价仅$22/tCO2e，低于其他认证体系。建议：首先解决NDVI偏低问题（可能需要施肥和灌溉优化），同时转向VCS认证体系以提升碳信用价值。",
    aiRecommendations: [
      "紧急诊断NDVI偏低原因并制定恢复方案",
      "减少土壤碳排放（优化施肥方式，减少翻耕）",
      "增加覆盖物管理减缓土壤呼吸速率",
      "从RSPO PalmGHG转向VCS认证以提升碳信用价格"
    ]
  },
  {
    zoneId: "5",
    zoneName: "Longan Zone",
    cropType: "Longan (龙眼)",
    area: "2.1 ha",
    areaRai: 13.1,
    aboveGroundBiomass: 156.8,
    belowGroundBiomass: 39.2,
    soilOrganicCarbon: 82.4,
    litterDeadwood: 16.5,
    totalCarbonStock: 294.9,
    carbonSequestrationRate: 32.4,
    netPrimaryProductivity: 7.5,
    soilRespirationRate: 2.6,
    carbonFlux: 11.8,
    carbonDensity: 140.4,
    carbonIntensity: 22.5,
    creditPrice: 28.5,
    totalCredits: 38,
    creditsSold: 25,
    revenueUSD: 712,
    methodology: "VCS VM0015",
    verificationStatus: "Verified",
    lastAuditDate: "2026-01-15",
    certificationBody: "SGS Thailand",
    monthlySequestration: [
      { month: "Jan", value: 28, emission: 8 }, { month: "Feb", value: 30, emission: 7 },
      { month: "Mar", value: 33, emission: 9 }, { month: "Apr", value: 35, emission: 8 },
      { month: "May", value: 38, emission: 10 }, { month: "Jun", value: 40, emission: 11 },
      { month: "Jul", value: 42, emission: 9 }, { month: "Aug", value: 38, emission: 10 },
      { month: "Sep", value: 35, emission: 8 }, { month: "Oct", value: 32, emission: 9 },
      { month: "Nov", value: 30, emission: 7 }, { month: "Dec", value: 28, emission: 8 },
    ],
    aiInterpretation: "龙眼种植区碳储量294.9 tCO2e，碳密度140.4 tCO2e/ha处于良好水平。NDVI 0.85表明植被健康。该区域碳汇表现均衡，土壤呼吸速率2.6 gCO2/m²/hr为全农场最低，表明土壤碳保持能力优秀。碳通量11.8 tCO2e/year呈正值（净吸收），全年碳汇稳定。建议在现有基础上增加凋落物管理和土壤覆盖，预计可提升年碳汇量8-12%。",
    aiRecommendations: [
      "强化凋落物管理增加土壤有机碳输入",
      "保持低土壤呼吸率优势（减少不必要翻耕）",
      "申请碳汇交易市场上架",
      "建立长期碳监测基准线数据"
    ]
  },
  {
    zoneId: "6",
    zoneName: "Maize Zone",
    cropType: "Maize (玉米)",
    area: "5.0 ha",
    areaRai: 31.25,
    aboveGroundBiomass: 85.2,
    belowGroundBiomass: 21.3,
    soilOrganicCarbon: 125.8,
    litterDeadwood: 8.5,
    totalCarbonStock: 240.8,
    carbonSequestrationRate: 22.5,
    netPrimaryProductivity: 5.2,
    soilRespirationRate: 3.8,
    carbonFlux: 8.2,
    carbonDensity: 48.2,
    carbonIntensity: 7.7,
    creditPrice: 18.0,
    totalCredits: 25,
    creditsSold: 10,
    revenueUSD: 180,
    methodology: "Gold Standard Soil Carbon",
    verificationStatus: "Under Verification",
    lastAuditDate: "2025-11-20",
    certificationBody: "SCS Global Services",
    monthlySequestration: [
      { month: "Jan", value: 15, emission: 12 }, { month: "Feb", value: 18, emission: 11 },
      { month: "Mar", value: 22, emission: 13 }, { month: "Apr", value: 28, emission: 14 },
      { month: "May", value: 32, emission: 15 }, { month: "Jun", value: 35, emission: 16 },
      { month: "Jul", value: 30, emission: 14 }, { month: "Aug", value: 25, emission: 13 },
      { month: "Sep", value: 20, emission: 12 }, { month: "Oct", value: 15, emission: 11 },
      { month: "Nov", value: 12, emission: 10 }, { month: "Dec", value: 10, emission: 10 },
    ],
    aiInterpretation: "玉米种植区碳密度仅48.2 tCO2e/ha，为所有地块最低，这是一年生作物种植的固有局限。地上生物量仅85.2 tCO2e，但土壤有机碳125.8 tCO2e占总碳储量的52.2%。NPP值5.2 gC/m²/day受生长周期限制。碳信用单价$18/tCO2e偏低。关键改进方向：(1)实施免耕/少耕技术减少土壤碳排放40%，(2)秸秆还田增加土壤碳输入，(3)冬季种植覆盖作物避免碳流失。预计通过综合土壤碳管理可提升碳汇效率35-50%。",
    aiRecommendations: [
      "实施免耕技术减少土壤碳排放30-40%",
      "秸秆粉碎还田增加土壤有机碳输入",
      "冬季种植覆盖作物（如绿肥豆科）",
      "申请Gold Standard土壤碳管理认证",
      "考虑农林间作模式提升整体碳密度"
    ]
  }
];

// ─── AI Interpretation Templates ─────────────────────────────────────────────

export const aiInterpretations = {
  ndvi: (value: number) => `NDVI指数${value}${value > 0.8 ? '处于优良水平，表明植被覆盖度高、光合作用活跃' : value > 0.6 ? '处于中等水平，部分区域植被活力有待提升' : '偏低，需关注植被健康状况'}。该值反映了作物冠层叶绿素含量和叶面积指数(LAI)。建议${value > 0.8 ? '维持当前管理措施' : '排查胁迫因素（水分、病虫害、养分缺乏），针对性优化田间管理'}。对比区域历史均值${(value + 0.05).toFixed(2)}，当前趋势${value > 0.75 ? '稳中向好' : '需要关注'}。`,

  soilMoisture: (value: string) => `当前土壤含水量${value}，${parseInt(value) > 70 ? '偏高，可能影响根系呼吸' : parseInt(value) > 50 ? '处于适宜范围，有利于养分吸收' : '偏低，建议增加灌溉频次'}。土壤水分是影响作物生长和碳汇效率的关键因子。过高的土壤含水量会增加厌氧分解，导致甲烷排放增加；过低则限制光合作用和碳固定。建议将土壤含水量维持在55-70%的最优区间。`,

  temperature: (value: string) => `环境温度${value}，${parseInt(value) > 35 ? '偏高，可能引发热应激' : parseInt(value) > 25 ? '处于热带作物最适生长温度范围' : '偏低'}。当前温度条件下，光合速率约为最大值的${parseInt(value) > 30 ? '85-90%' : '95%'}，暗呼吸速率处于${parseInt(value) > 32 ? '偏高' : '正常'}水平。温度直接影响碳汇效率，Q10温度系数表明温度每升高10°C，土壤呼吸速率约增加2倍。`,

  yieldForecast: (value: string) => `产量预测${value}，基于当前NDVI趋势、气象数据和历史产量模型综合计算。模型考虑了6个影响因子：积温、日照时数、降水分布、土壤养分、病虫害压力和管理措施。当前预测置信区间为±8%。建议关注花期降雨量和果实膨大期温度，这两个因素对最终产量影响最大。`,

  carbonStock: (value: string) => `当前碳储量${value} tCO2e，碳汇价值可观。碳储量由四个碳库构成：地上生物量（主干、枝条、叶片）、地下生物量（根系）、土壤有机碳和枯枝落叶。根据IPCC 2006指南方法学，该数值已经过保守估计（采用Tier 2方法）。建议建立年度碳监测基线，为碳信用交易提供可靠数据支持。`,

  pestRisk: (name: string, risk: number) => `${name}风险指数${risk}%，${risk > 60 ? '处于高风险水平，需要立即采取防控措施' : risk > 40 ? '处于中等风险，建议加强监测频率' : '处于低风险，维持常规监测即可'}。风险评估综合了以下因素：(1)环境条件适宜度 (2)历史发病记录 (3)邻近区域病情 (4)当前天气预报 (5)作物生育期易感性。AI预测模型基于过去3年1200+数据点训练，准确率93.5%。`,

  soilNutrient: (name: string, value: number, unit: string, status: string) => `${name}含量${value}${unit}，${status === 'optimal' ? '处于最优范围，无需额外施用' : status === 'low' ? '偏低，建议补充施肥' : '需要调整'}。该指标通过土壤传感器实时监测+定期实验室分析交叉验证。${name}是作物生长的${name.includes('N') ? '关键氮源，直接影响叶绿素合成和蛋白质代谢' : name.includes('P') ? '重要磷源，影响根系发育和能量代谢' : '钾营养来源，调节渗透压和酶活性'}。建议施肥方案结合产量目标和土壤缓冲能力综合制定。`,
};

// ─── Enhanced Rubber Trees with Health Details ───────────────────────────────

export interface EnhancedRubberTree extends RubberTree {
  disease?: string;
  diseaseNameTH?: string;
  diseaseSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
  diseaseConfidence?: number;
  lastDroneImageId?: string;
  evidenceChainId?: string;
  healthScore: number;
  canopyCondition: 'excellent' | 'good' | 'fair' | 'poor';
  leafColorIndex: number;
  trunkCircumference: number;
  heightEstimate: number;
  crownDiameter: number;
  sensorReadings: {
    soilMoisture: number;
    soilTemp: number;
    leafWetness: number;
    ambientTemp: number;
    humidity: number;
  };
  aiHealthSummary: string;
}

const DISEASE_CONFIGS = [
  { disease: "White Root Disease", diseaseNameTH: "โรครากขาว", evidenceChainId: "EVC-2026-001", severity: "severe" as const, confidence: 94 },
  { disease: "Powdery Mildew", diseaseNameTH: "โรคราแป้ง", evidenceChainId: "EVC-2026-002", severity: "moderate" as const, confidence: 89 },
  { disease: "Abnormal Leaf Fall", diseaseNameTH: "โรคใบร่วงผิดปกติ", evidenceChainId: "EVC-2026-003", severity: "severe" as const, confidence: 88 },
  { disease: "Bark Necrosis", diseaseNameTH: "เปลือกตาย", evidenceChainId: undefined, severity: "mild" as const, confidence: 72 },
];

export const mockEnhancedRubberTrees: EnhancedRubberTree[] = Array.from({ length: 150 }).map((_, i) => {
  const isDiseasedTree = i % 7 === 0 || i % 11 === 0 || i % 13 === 0; // ~20% diseased
  const diseaseConfig = isDiseasedTree ? DISEASE_CONFIGS[i % DISEASE_CONFIGS.length] : null;
  const variety = VARIETIES[i % 4];
  const healthScore = isDiseasedTree
    ? (diseaseConfig?.severity === 'severe' ? 15 + Math.random() * 20 : diseaseConfig?.severity === 'moderate' ? 40 + Math.random() * 20 : 60 + Math.random() * 15)
    : 80 + Math.random() * 20;

  const canopyCondition = healthScore > 85 ? 'excellent' : healthScore > 65 ? 'good' : healthScore > 40 ? 'fair' : 'poor';

  return {
    id: `RUB-Z01-${String(i + 1).padStart(4, "0")}`,
    position: [
      (Math.random() - 0.5) * 100,
      0,
      (Math.random() - 0.5) * 100,
    ] as [number, number, number],
    health: isDiseasedTree ? "critical" : "healthy",
    carbonStock: Math.floor(Math.random() * 50) + 10,
    age: Math.floor(Math.random() * 5) + 3,
    lastScanned: new Date(Date.now() - (i % 72) * 3600 * 1000).toISOString(),
    variety,
    tappingStatus: Math.random() > 0.15 ? "open" : "closed",
    drcContent: 28 + Math.random() * 10,
    latexYield: isDiseasedTree ? 0.3 + Math.random() * 0.5 : 1.2 + Math.random() * 0.8,
    gpsLat: 9.1 + Math.random() * 0.05,
    gpsLng: 99.28 + Math.random() * 0.05,
    // Enhanced fields
    disease: diseaseConfig?.disease,
    diseaseNameTH: diseaseConfig?.diseaseNameTH,
    diseaseSeverity: isDiseasedTree ? diseaseConfig?.severity : 'none',
    diseaseConfidence: diseaseConfig?.confidence,
    lastDroneImageId: `IMG-${String(i + 1).padStart(4, "0")}-${isDiseasedTree ? 'ANOM' : 'NORM'}`,
    evidenceChainId: diseaseConfig?.evidenceChainId,
    healthScore: Math.round(healthScore),
    canopyCondition,
    leafColorIndex: isDiseasedTree ? 0.3 + Math.random() * 0.3 : 0.75 + Math.random() * 0.25,
    trunkCircumference: 45 + Math.random() * 30,
    heightEstimate: 12 + Math.random() * 8,
    crownDiameter: isDiseasedTree ? 3 + Math.random() * 2 : 5 + Math.random() * 3,
    sensorReadings: {
      soilMoisture: isDiseasedTree ? 75 + Math.random() * 15 : 55 + Math.random() * 15,
      soilTemp: 25 + Math.random() * 5,
      leafWetness: isDiseasedTree ? 60 + Math.random() * 30 : 20 + Math.random() * 30,
      ambientTemp: 27 + Math.random() * 5,
      humidity: 70 + Math.random() * 20,
    },
    aiHealthSummary: isDiseasedTree
      ? `该树(${variety})检测到${diseaseConfig?.disease}，健康评分${Math.round(healthScore)}/100，冠层状况${canopyCondition}。建议立即进行${diseaseConfig?.severity === 'severe' ? '紧急治疗' : '监测和预防性处理'}。乳胶产量已下降约${diseaseConfig?.severity === 'severe' ? '60-80%' : '20-40%'}。`
      : `该树(${variety})健康状况良好，健康评分${Math.round(healthScore)}/100。冠层茂密(${canopyCondition})，叶色指数${(0.75 + Math.random() * 0.25).toFixed(2)}正常。乳胶产量稳定，碳汇贡献正常。无需特殊干预，维持常规管理即可。`,
  };
});
