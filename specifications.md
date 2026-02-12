# 泰戈尔 (Tiger) 农业数字孪生平台 - 项目规格说明书

## 1. 产品全局设计理念 (Design Philosophy)
- **活的数字生命体**: 不仅仅是管理后台，而是有生命力的系统。
- **上帝视角 (God's Eye View)**: 3D数字孪生，远程掌控每一棵树。
- **算法透明化 (Glass-Box AI)**: 可视化展示AI识别、分割、计算全过程，拒绝黑盒。
- **决策智能化 (Data to Wisdom)**: CV "看见" (病害) -> 阿里百炼 "思考" (处方) -> 闭环。

## 2. 核心界面设计规范 (UI System)
- **色彩体系**:
  - 暗夜底色: `#0B1120` (深空蓝黑)
  - 橡胶绿: `#00E676` (荧光绿) - 生命力/资产
  - 警示红: `#FF3D00` (高亮红) - 风险/病害
  - 数据蓝: `#00B0FF` (全息蓝) - 算力/连接
- **视觉质感**:
  - Glassmorphism (玻璃拟态): 半透明磨砂，悬浮于3D地图之上。
  - HUD风格: 细线条、刻度盘、扫描光效，战斗机驾驶舱视觉。

## 3. 技术栈与配置 (Tech Stack)
- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, Three.js / React Three Fiber / Deck.gl (3D Maps).
- **Backend**: Next.js API Routes (or separate Node.js/Python service if needed for heavy CV).
- **Database**: PostgreSQL.
  - Connection: Localhost, Password: `hjh19930712`
- **AI Integration**: Alibaba Bailian (通义千问).
  - API Key: `sk-622f3819e0904111b334b7977bfcc273`
  - Models: qwen-vl-max (Vision), qwen-max (Logic).

## 4. 功能模块详述

### I. 全域数智驾驶舱 (The Commander Cockpit)
- **3D 数字孪生地图**: 加载 DSM/DOM 数据，图层控制 (实景/AI算力/碳汇)。
- **无人机作业监控**: FPV 实时画面，AR 叠加包围盒 (Bounding Box)，飞行参数 HUD，轨迹回放与扫描光带。
- **核心指标**: 左侧资产/产能，右侧碳汇/收益 (Credits/$)，底部动态情报栏。

### II. 橡胶精细化管理 (Rubber Intelligence)
- **资产数字化**: 单株 ID (e.g., RUB-Z01-0023)，记录树龄/高/冠幅。
- **算法透视 (Algorithm Lens)**: 分水岭算法可视化 (分割线)，树顶检出点 (红点)，置信度热力图。
- **碳汇计算器**: 动态公式可视化 `$Total Carbon = \sum (Count_{tree} \times Volume_{crown} \times 0.47)$`，支持数据来源溯源交互。

### III. 甘蔗精细化作业 (Sugarcane Precision)
- **倒伏监测**: 基于 DSM 高度差，黄色斜线标注倒伏区域，损失预估计算。
- **长势热力图 (NDVI)**: 绿(健康) vs 红(缺肥)。
- **变量施肥 (VRA)**: 生成 .shp/.kml 航线文件。

### IV. AI 农学顾问 (Powered by Alibaba Bailian)
- **场景 A (病害诊断)**: 地图异常点点击 -> CV 识别 (YOLO) -> LLM 推理 (Qwen-VL) -> 输出诊断报告 (成因/防治)。
- **场景 B (数据周报)**: 自然语言问答 ("为什么Zone-B长得慢?") -> 数据分析 -> 自动生成 PDF 周报。
