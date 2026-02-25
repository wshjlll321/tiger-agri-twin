import { create } from 'zustand';
import { Locale } from './i18n';
import type { MapTree, ZoneBusinessSummary } from './api-types';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  imageUrl?: string;
}

export interface DroneStatus {
  position: [number, number, number];
  battery: number;
  speed: number;
  altitude: number;
  scanProgress: number;
  lat: number;
  lng: number;
}

interface AppState {
  // Selection State
  selectedTree: MapTree | null;
  setSelectedTree: (tree: MapTree | null) => void;
  selectedZoneId: string | null;
  selectedZoneBusiness: ZoneBusinessSummary | null;
  setSelectedZone: (zoneId: string | null, zoneBusiness?: ZoneBusinessSummary | null) => void;

  // AI Analysis State
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  aiAnalysisResult: string | null;
  setAiAnalysisResult: (result: string | null) => void;

  // View Mode
  viewMode: 'satellite' | 'ndvi' | 'carbon';
  setViewMode: (mode: 'satellite' | 'ndvi' | 'carbon') => void;

  // Algorithm Lens
  algorithmLensActive: boolean;
  setAlgorithmLensActive: (active: boolean) => void;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Tab Navigation
  activeTab: 'overview' | 'drone' | 'analytics' | 'rubber' | 'sugarcane';
  setActiveTab: (tab: 'overview' | 'drone' | 'analytics' | 'rubber' | 'sugarcane') => void;

  // Mobile Layout State
  mobilePanelOpen: boolean;
  setMobilePanelOpen: (open: boolean) => void;

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;

  // Drone State
  droneStatus: DroneStatus;
  setDroneStatus: (status: Partial<DroneStatus>) => void;
  isDroneFlying: boolean;
  setIsDroneFlying: (flying: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTree: null,
  setSelectedTree: (tree) => set({ selectedTree: tree, aiAnalysisResult: null }),
  selectedZoneId: null,
  selectedZoneBusiness: null,
  setSelectedZone: (zoneId, zoneBusiness = null) => set({ selectedZoneId: zoneId, selectedZoneBusiness: zoneBusiness }),

  isAnalyzing: false,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  aiAnalysisResult: null,
  setAiAnalysisResult: (result) => set({ aiAnalysisResult: result }),

  viewMode: 'satellite',
  setViewMode: (mode) => set({ viewMode: mode }),

  algorithmLensActive: false,
  setAlgorithmLensActive: (active) => set({ algorithmLensActive: active }),

  locale: 'en' as Locale,
  setLocale: (locale) => set({ locale }),

  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  mobilePanelOpen: true,
  setMobilePanelOpen: (open) => set({ mobilePanelOpen: open }),

  chatMessages: [
    {
      role: 'user',
      content: 'Zone-B的甘蔗这周为什么长势不好?',
      timestamp: '10:30 AM',
    },
    {
      role: 'ai',
      content: `**诊断结果: Zone-B 甘蔗生长异常**\n\n**严重程度:** 中度风险\n\n经过多源数据融合分析，Zone-B 甘蔗长势不佳的原因如下:\n\n1. **水分胁迫** — 土壤湿度仅 18%，低于最佳阈值 (35-45%)\n2. **NDVI 指数** — 当前 0.45，较上周下降 12%\n3. **倒伏风险** — 检测到约 10% 面积出现茎秆倾斜\n\n**建议措施:**\n- 立即启动 Zone-B 灌溉系统，目标湿度 40%\n- 增施钾肥 (K2O) 15kg/亩，增强茎秆强度\n- 48小时后安排无人机复查`,
      timestamp: '10:31 AM',
    },
    {
      role: 'user',
      content: '帮我分析这张叶片照片',
      timestamp: '10:33 AM',
      imageUrl: '/leaf-sample.jpg',
    },
    {
      role: 'ai',
      content: `**AI 病害诊断报告**\n\n**病害类型:** 白粉病 (Oidium heveae)\n**置信度:** 94.7%\n**严重程度:** 中度 (Grade II)\n\n**识别特征:**\n- 叶面白色粉状菌丝覆盖率约 35%\n- 主要分布于叶片背面\n- 尚未扩散至叶柄\n\n**治疗方案:**\n1. 喷施硫磺悬浮剂 (45% SC) 300倍液\n2. 间隔7天施用三唑酮 (Triadimefon) 1500倍液\n3. 清除落叶减少菌源\n4. 增强通风，降低田间湿度`,
      timestamp: '10:34 AM',
    },
  ],
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  droneStatus: {
    position: [0, 20, 0],
    battery: 68,
    speed: 15.2,
    altitude: 120,
    scanProgress: 42,
    lat: 9.1234,
    lng: 99.3456,
  },
  setDroneStatus: (status) =>
    set((state) => ({ droneStatus: { ...state.droneStatus, ...status } })),

  isDroneFlying: true,
  setIsDroneFlying: (flying) => set({ isDroneFlying: flying }),
}));
