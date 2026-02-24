export interface RubberOverviewResponse {
  totalTrees: number;
  totalAreaRai: number;
  varieties: Array<{
    name: string;
    areaRai: number;
    count: number;
    avgYieldKgPerTree: number;
    tappingStatus: string;
    tappingSystem: string;
    drc: number;
    cloneOrigin: string;
  }>;
  currentPrice: {
    rss3: number;
    fieldLatex: number;
    currency: string;
    unit: string;
  };
  monthlyYield: Array<{
    month: string;
    kgPerRai: number;
  }>;
  diseases: Array<{
    name: string;
    nameTh?: string;
    pathogen: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    affectedTrees: number;
    symptoms: string;
    treatment: string;
    prevention?: string;
  }>;
  carbonData: {
    totalTCO2e: number;
    perTreeAvg: number;
    todayCredits: number;
    creditPriceTHB: number;
  };
  lastUpdate: string;
}

export interface SugarcaneOverviewResponse {
  totalAreaRai: number;
  varieties: Array<{
    name: string;
    nameTh?: string;
    areaRai: number;
    ccs: number;
    yieldTonPerRai: number;
    stage: string;
    daysToHarvest: number;
  }>;
  lodgingAnalysis: Array<{
    zone: string;
    areaRai: number;
    lodgingPercent: number;
    sugarLossCCS: number;
    status: string;
  }>;
  crushingSeason: {
    start: string;
    end: string;
    quotaDelivered: number;
    nextDeliveryDays: number;
    priceTonCCS: number;
    currency: string;
  };
  ndviHistory: Array<{
    month: string;
    score: number;
  }>;
  seasonRevenueTHB: number;
  totalLodgingLossTHB: number;
  estimatedYieldTons: number;
  lastUpdate: string;
}

export interface DroneStatusResponse {
  drones: Array<{
    id: string;
    status: "active" | "charging" | "maintenance";
    battery: number;
    altitude: number;
    speed: number;
    lat: number;
    lng: number;
    scanProgress: number;
    currentZone: string;
  }>;
  totalScanned: number;
  totalArea: number;
  lastUpdate: string;
}

export interface OverviewResponse {
  totalTrees: number;
  healthIndexPercent: number;
  carbonTCO2e: number;
  openTappingPercent: number;
  closedRainyPercent: number;
  rubberPriceTHBPerKg: number;
  sugarcaneHarvestReadyPercent: number;
  sugarcaneLodgingPercent: number;
  estimatedLodgingLossTHB: number;
  activeDroneCount: number;
  lastUpdate: string;
}

export interface MapTree {
  id: string;
  position: [number, number, number];
  health: "healthy" | "critical";
  carbonStock: number;
  age: number;
  lastScanned: string;
  // Enhanced fields for EnhancedRubberTree support
  variety?: "RRIM 600" | "RRIT 251" | "BPM 24" | "RRIM 623";
  tappingStatus?: "open" | "closed";
  drcContent?: number;
  latexYield?: number;
  gpsLat?: number;
  gpsLng?: number;
  disease?: string;
  diseaseNameTH?: string;
  diseaseSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
  diseaseConfidence?: number;
  lastDroneImageId?: string;
  evidenceChainId?: string;
  healthScore?: number;
  canopyCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  leafColorIndex?: number;
  trunkCircumference?: number;
  heightEstimate?: number;
  crownDiameter?: number;
  sensorReadings?: {
    soilMoisture: number;
    soilTemp: number;
    leafWetness: number;
    ambientTemp: number;
    humidity: number;
  };
  aiHealthSummary?: string;
}

export interface MapZone {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number];
  ndvi: number;
  lodgingStatus?: boolean;
  areaRai: number;
  lodgingPercent: number;
  sugarLossCCS: number;
  cropType?: string;
}

export interface MapMissionBrief {
  missionId: string;
  date: string;
  status: "completed" | "in_progress" | "aborted";
  anomalies: number;
  healthScore: number;
}

export interface ZoneBusinessSummary {
  zoneId: string;
  zoneName: string;
  missionCount: number;
  latestYieldTonPerRai: number;
  alertsTrend: number[];
  recentMissions: MapMissionBrief[];
}

export interface MapDiseaseHotspot {
  id: string;
  zoneId: string;
  position: [number, number, number];
  severity: "low" | "medium" | "high";
  score: number;
}

export interface MapCoverageCell {
  id: string;
  zoneId: string;
  position: [number, number, number];
  intensity: number;
  radius: number;
}

export interface MapDronePath {
  id: string;
  status: "flying" | "docked";
  points: [number, number, number][];
}

export interface MapDataResponse {
  trees: MapTree[];
  zones: MapZone[];
  zoneBusiness: ZoneBusinessSummary[];
  diseaseHotspots: MapDiseaseHotspot[];
  coverageHeatmap: MapCoverageCell[];
  dronePath: MapDronePath;
  updatedAt: string;
}

export interface DroneMissionStep {
  step: number;
  name: string;
  status: "completed" | "active" | "pending";
  data: Record<string, unknown>;
}

export interface DroneMission {
  missionId: string;
  status: "pending" | "in_progress" | "completed" | "aborted";
  currentStep: number;
  steps: DroneMissionStep[];
  drone: { id: string; name: string };
  createdAt: string;
}

export interface DroneInspectionHistoryItem {
  id: string;
  zone: string;
  date: string;
  status: string;
  treesFound: number;
  anomalies: number;
  areaRai: number;
  drone: string;
  healthScore: number;
  duration: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DroneInspectionHistoryResponse {
  missions: DroneInspectionHistoryItem[];
  totalMissions: number;
  lastUpdate: string;
}
