# 泰戈尔 (Tiger) 农业数字孪生平台 - Architecture

## Design Philosophy
- **Living Digital Twin**: A system with vitality, not just a management dashboard.
- **God's Eye View**: 3D visualization for remote control of every tree.
- **Glass-Box AI**: Visualizing the AI process (recognition, segmentation, calculation).
- **Intelligent Decision**: CV (See) -> AI (Think) -> Action (Loop).

## UI Design System
- **Color Palette**:
  - **Dark Base**: `#0B1120` (Deep Space Blue/Black)
  - **Rubber Green**: `#00E676` (Fluorescent Green) - Life/Assets
  - **Alert Red**: `#FF3D00` (Highlight Red) - Risk/Disease
  - **Data Blue**: `#00B0FF` (Holographic Blue) - Compute/Connection
- **Visual Style**:
  - **Glassmorphism**: Translucent frosted glass, floating over 3D maps.
  - **HUD Style**: Thin lines, dials, scanning effects, fighter cockpit visuals.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI (Customized for HUD/Glassmorphism)
- **Database**: PostgreSQL (Prisma ORM)
- **3D/Maps**: Three.js / React Three Fiber / Deck.gl (DSM/DOM Data Visualization)
- **AI Integration**: Alibaba Bailian (通义千问)
  - **SDK**: Alibaba Cloud Bailian SDK
  - **Models**: `qwen-vl-max` (Vision), `qwen-max` (Logic)
- **State Management**: Zustand / React Query

## Folder Structure
```
/src
  /app          # Next.js App Router pages
  /components
    /ui         # Shadcn base components (customized)
    /hud        # HUD specific components (Cockpit, overlays)
    /3d         # Three.js/Deck.gl map components
    /ai         # AI chat and visualization components
  /lib          # Utils, hooks, API clients
    /bailian    # Alibaba Bailian integration
  /server       # Server actions, Prisma client
  /types        # TypeScript definitions
```

## Data Schema Design (Entities)
### 1. RubberTree (Assets)
- **id**: String (e.g., "RUB-Z01-0023")
- **location**: GeoJSON Point (Lat, Lng)
- **age**: Float
- **height**: Float
- **crownDiameter**: Float
- **carbonStock**: Float (Calculated)
- **healthStatus**: Enum (HEALTHY, DISEASE_RISK, CRITICAL)
- **lastInspectionDate**: DateTime

### 2. SugarcanePlot (Precision)
- **id**: String
- **boundary**: GeoJSON Polygon
- **ndviScore**: Float (0.0 - 1.0)
- **lodgingStatus**: Boolean (Based on DSM height diff)
- **yieldPrediction**: Float
- **fertilizerPlan**: JSON (VRA prescription)

### 3. DroneFlight (Monitoring)
- **id**: String
- **droneId**: String
- **flightPath**: GeoJSON LineString
- **telemetry**: JSON (Battery, Speed, Altitude)
- **status**: Enum (ACTIVE, CHARGING, MAINTENANCE)
- **videoStreamUrl**: String (FPV)

### 4. AnalysisReport (AI Output)
- **id**: String
- **targetEntityId**: String (Tree or Plot ID)
- **diagnosis**: Text (Qwen-VL output)
- **prescription**: Text (Qwen-Max output)
- **confidence**: Float
- **images**: String[] (URLs)

## Core Modules
1. **Commander Cockpit (全域数智驾驶舱)**:
   - 3D Digital Twin Map (DSM/DOM data).
   - Drone Monitoring (FPV, AR Bounding Box, Flight Params).
   - Core Metrics (Assets, Carbon Credits, Yield).
2. **Rubber Intelligence (橡胶精细化管理)**:
   - Asset Digitization (Single Tree ID).
   - Algorithm Lens (Watershed Algorithm visualization).
   - Carbon Calculator.
3. **Sugarcane Precision (甘蔗精细化作业)**:
   - Lodging Detection (Height difference analysis).
   - Growth Heatmap (NDVI).
   - Variable Rate Application (VRA).
4. **AI Agronomist (AI 农学顾问)**:
   - Disease Diagnosis (YOLO + Qwen-VL).
   - Data Reporting (Natural Language -> SQL/Analysis -> PDF).
