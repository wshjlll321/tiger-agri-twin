'use client';

import React from 'react';
import GlassPanel from '@/components/HUD/GlassPanel';
import AIInterpretation from '@/components/AI/AIInterpretation';
import { aiInterpretations } from '@/lib/mockData';
import { useTranslation } from '@/lib/i18n';
import {
  Sprout, TrendingUp, Droplets, Thermometer, Activity, Calendar,
  AlertTriangle, Wind, Sun, CloudRain, Radio, Leaf, BarChart3, Target,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ComposedChart, Line, Bar, Legend,
} from 'recharts';

export default function TabOverview({ data }: { data: any }) {
  const { t } = useTranslation();

  // ── Build chart data from raw arrays ──
  const envChartData = data.ndviHistory.map((ndvi: number, i: number) => ({
    day: `D${i + 1}`,
    ndvi,
    moisture: data.moistureHistory[i] ?? 0,
    health: data.history[i] ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* ── Row 1: Core KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <GlassPanel title={t('ndviIndex')} accent="green" className="min-h-[9rem]">
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex justify-between items-start">
              <Sprout className="w-7 h-7 text-neon-green/80 p-1.5 bg-neon-green/10 rounded shrink-0" />
              <div className="text-[10px] text-neon-green flex items-center gap-1 bg-neon-green/5 px-1.5 py-0.5 rounded border border-neon-green/20 shrink-0">
                <TrendingUp className="w-3 h-3" /> {data.kpis.ndviTrend}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white kpi-shimmer">{data.kpis.ndvi}</div>
              <div className="text-[10px] text-slate-500 truncate">{t('vegetationDensity')}</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t('soilMoisture')} accent="blue" className="min-h-[9rem]">
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex justify-between items-start">
              <Droplets className="w-7 h-7 text-holographic-blue/80 p-1.5 bg-holographic-blue/10 rounded shrink-0" />
              <div className="text-[10px] text-alert-red flex items-center gap-1 bg-alert-red/5 px-1.5 py-0.5 rounded border border-alert-red/20 shrink-0">
                <TrendingUp className="w-3 h-3 rotate-180" /> {data.kpis.moistureTrend}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white kpi-shimmer">{data.kpis.moisture}</div>
              <div className="text-[10px] text-slate-500 truncate">{t('soilMoisture')}</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t('weather')} accent="blue" className="min-h-[9rem]">
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex justify-between items-start">
              <Thermometer className="w-7 h-7 text-cyber-yellow/80 p-1.5 bg-cyber-yellow/10 rounded shrink-0" />
              <div className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">{data.kpis.tempTrend}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white kpi-shimmer">{data.kpis.temperature}</div>
              <div className="text-[10px] text-slate-500 truncate">{t('ambientTemp')}</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t('yieldForecast')} accent="green" className="min-h-[9rem]">
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="flex justify-between items-start">
              <Activity className="w-7 h-7 text-neon-green/80 p-1.5 bg-neon-green/10 rounded shrink-0" />
              <div className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" /> Q3 2026
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white kpi-shimmer">{data.kpis.yieldForecast}</div>
              <div className="text-[10px] text-slate-500 truncate">{t('estHarvest')}</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t('windSpeed')} accent="blue" className="min-h-[9rem]">
          <div className="flex flex-col justify-between h-full gap-2">
            <Wind className="w-7 h-7 text-holographic-blue/80 p-1.5 bg-holographic-blue/10 rounded shrink-0" />
            <div>
              <div className="text-2xl font-bold text-white">{data.kpis.windSpeed}</div>
              <div className="text-[10px] text-slate-500 truncate">NE Direction</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title={t('rainfallLabel')} accent="blue" className="min-h-[9rem]">
          <div className="flex flex-col justify-between h-full gap-2">
            <CloudRain className="w-7 h-7 text-holographic-blue/80 p-1.5 bg-holographic-blue/10 rounded shrink-0" />
            <div>
              <div className="text-2xl font-bold text-white">{data.kpis.rainfall}</div>
              <div className="text-[10px] text-slate-500 truncate">{t('lastScanned')} (24h)</div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ── Consolidated AI Analysis for Zone Overview ── */}
      <AIInterpretation
        dataType="Zone Overview Analysis"
        dataValue={`NDVI ${data.kpis.ndvi} · ${data.kpis.moisture} · ${data.kpis.temperature} · ${data.kpis.yieldForecast}`}
        context="KPI + Environment + Sensor Comprehensive Analysis"
        zoneData={{
          ndvi: data.kpis.ndvi,
          moisture: data.kpis.moisture,
          temperature: data.kpis.temperature,
          yieldForecast: data.kpis.yieldForecast,
          windSpeed: data.kpis.windSpeed,
          rainfall: data.kpis.rainfall,
          sensorCount: data.sensors.length,
          growthStage: data.growthStage.current,
          healthScore: data.growthStage.healthScore,
        }}
        interpretation={`[NDVI Index: ${data.kpis.ndvi}] ${aiInterpretations.ndvi(data.kpis.ndvi)}

[Soil Moisture: ${data.kpis.moisture}] ${aiInterpretations.soilMoisture(data.kpis.moisture)}

[Temperature: ${data.kpis.temperature}] ${aiInterpretations.temperature(data.kpis.temperature)}

[Yield Forecast: ${data.kpis.yieldForecast}] ${aiInterpretations.yieldForecast(data.kpis.yieldForecast)}

[Wind: ${data.kpis.windSpeed}] Northeast wind direction and current speed are within safe operational limits. No lodging risk escalation anticipated at current levels.

[Rainfall: ${data.kpis.rainfall}] 24-hour precipitation is adequate for maintaining soil moisture. No irrigation supplement required in the next 48 hours based on forecast models.

[Growth Stage: ${data.growthStage.current}] Progress ${data.growthStage.progress}%, health score ${data.growthStage.healthScore}/100. ${data.growthStage.daysToHarvest} days to harvest. Development pace is on track with the expected timeline.

[Sensor Network] ${data.sensors.length} sensors active. ${data.sensors.filter((s: any) => s.status === 'warning').length > 0 ? `${data.sensors.filter((s: any) => s.status === 'warning').length} sensors in warning state — field inspection recommended within 24h.` : 'All sensors operating normally.'}

Recommendation: Monitor soil moisture closely over the next 5 days. If the declining trend continues, initiate supplemental drip irrigation in Sectors 2 and 4 where sensor readings are lowest.`}
      />

      {/* ── Row 2: Growth Stage + Weather ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Stage Tracker */}
        <div className="lg:col-span-2">
          <GlassPanel title={t('growthStageTracker')} accent="green">
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-slate-300">{t('progress')}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-green/60 to-neon-green rounded-full transition-all duration-1000" style={{ width: `${data.growthStage.progress}%` }}></div>
                </div>
                <span className="text-sm font-bold text-neon-green">{data.growthStage.progress}%</span>
              </div>

              {/* Stage pipeline */}
              <div className="flex items-center justify-between gap-1">
                {data.growthStage.stages.map((stage: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className={`w-full h-1.5 rounded-full ${stage.completed ? 'bg-neon-green shadow-[0_0_8px_rgba(0,230,118,0.4)]'
                        : stage.active ? 'bg-neon-green/50 animate-pulse'
                          : 'bg-slate-700'
                      }`}></div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${stage.completed ? 'bg-neon-green/20 border-neon-green text-neon-green'
                        : stage.active ? 'bg-holographic-blue/20 border-holographic-blue text-holographic-blue animate-pulse'
                          : 'bg-slate-800 border-slate-600 text-slate-500'
                      }`}>
                      {stage.completed ? '✓' : i + 1}
                    </div>
                    <div className="text-center">
                      <div className={`text-[10px] font-bold ${stage.active ? 'text-holographic-blue' : stage.completed ? 'text-slate-300' : 'text-slate-500'}`}>
                        {stage.name}
                      </div>
                      <div className="text-[9px] text-slate-600">{stage.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom stats */}
              <div className="flex gap-6 pt-3 border-t border-slate-700/30">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">{t('currentStage')}</div>
                  <div className="text-sm font-bold text-holographic-blue">{data.growthStage.current}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">{t('daysToHarvest')}</div>
                  <div className="text-sm font-bold text-cyber-yellow">{data.growthStage.daysToHarvest} {t('days')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">{t('healthScore')}</div>
                  <div className="text-sm font-bold text-neon-green">{data.growthStage.healthScore}/100</div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Weather Station */}
        <GlassPanel title={t('weatherStation')} accent="blue">
          <div className="space-y-4">
            {/* Current conditions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-slate-800/40 rounded">
                <Thermometer className="w-4 h-4 text-cyber-yellow mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{data.weather.current.temp}°</div>
                <div className="text-[9px] text-slate-500">TEMP</div>
              </div>
              <div className="text-center p-2 bg-slate-800/40 rounded">
                <Droplets className="w-4 h-4 text-holographic-blue mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{data.weather.current.humidity}%</div>
                <div className="text-[9px] text-slate-500">{t('humidity').toUpperCase()}</div>
              </div>
              <div className="text-center p-2 bg-slate-800/40 rounded">
                <Sun className="w-4 h-4 text-cyber-yellow mx-auto mb-1" />
                <div className="text-lg font-bold text-white">UV {data.weather.current.uv}</div>
                <div className="text-[9px] text-slate-500">INDEX</div>
              </div>
            </div>

            {/* Pressure & Dew */}
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{t('pressure')}: <span className="text-white">{data.weather.current.pressure} hPa</span></span>
              <span className="text-slate-400">{t('dewPoint')}: <span className="text-white">{data.weather.current.dewPoint}°C</span></span>
            </div>

            {/* 7-day forecast */}
            <div className="pt-2 border-t border-slate-700/30">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">{t('sevenDayForecast')}</div>
              <div className="flex gap-1">
                {data.weather.forecast.map((d: any, i: number) => (
                  <div key={i} className="flex-1 text-center p-1.5 rounded bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
                    <div className="text-[9px] text-slate-500 mb-1">{d.day}</div>
                    {d.icon === 'sun' && <Sun className="w-3 h-3 text-cyber-yellow mx-auto" />}
                    {d.icon === 'cloud' && <Wind className="w-3 h-3 text-slate-400 mx-auto" />}
                    {d.icon === 'rain' && <CloudRain className="w-3 h-3 text-holographic-blue mx-auto" />}
                    <div className="text-[9px] text-white mt-1">{d.high}°</div>
                    <div className="text-[9px] text-slate-600">{d.low}°</div>
                    <div className="text-[8px] text-holographic-blue mt-0.5">{d.rain}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          4.1 Phenological Calendar (after Growth Stage Tracker)
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const phenoStages = [
          { label: t('vegetativeGrowth'), days: 60, color: '#39FF14' },
          { label: t('flowerInduction'), days: 30, color: '#FFD600' },
          { label: t('floweringPhase'), days: 20, color: '#FF6B35' },
          { label: t('fruitSet'), days: 15, color: '#AA00FF' },
          { label: t('fruitDevelopment'), days: 80, color: '#00B0FF' },
          { label: t('maturationPhase'), days: 40, color: '#FF3D00' },
          { label: t('harvestPhase'), days: 20, color: '#39FF14' },
        ];
        const totalDays = phenoStages.reduce((s, p) => s + p.days, 0);
        const currentDay = 105;
        let accum = 0;
        let currentStageIdx = 0;
        for (let i = 0; i < phenoStages.length; i++) {
          if (currentDay <= accum + phenoStages[i].days) { currentStageIdx = i; break; }
          accum += phenoStages[i].days;
        }
        const todayPct = (currentDay / totalDays) * 100;

        return (
          <GlassPanel title={t("phenologicalCalendar")} accent="green">
            <div className="space-y-3">
              <div className="relative">
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {phenoStages.map((stage, i) => (
                    <div key={stage.label}
                      className={`flex items-center justify-center text-[8px] font-bold text-white transition-all ${i === currentStageIdx ? 'ring-2 ring-white/50 z-10' : ''}`}
                      style={{ width: `${(stage.days / totalDays) * 100}%`, backgroundColor: stage.color, opacity: i === currentStageIdx ? 1 : 0.6 }}>
                      {stage.days >= 30 ? stage.label : ''}
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-white z-20" style={{ left: `${todayPct}%` }}>
                  <div className="absolute -top-4 -translate-x-1/2 text-[8px] bg-white text-black px-1 rounded font-bold">{t('today')}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[9px]">
                {phenoStages.map((stage, i) => (
                  <span key={stage.label} className={`flex items-center gap-1 ${i === currentStageIdx ? 'text-white font-bold' : 'text-slate-500'}`}>
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: stage.color }} />
                    {stage.label} ({stage.days}d)
                  </span>
                ))}
              </div>
              <div className="flex gap-6 pt-2 border-t border-slate-700/30">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">{t('currentPhase')}</div>
                  <div className="text-sm font-bold" style={{ color: phenoStages[currentStageIdx].color }}>{phenoStages[currentStageIdx].label}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">{t('currentDayInCycle')}</div>
                  <div className="text-sm font-bold text-white font-mono">{currentDay} / {totalDays}</div>
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ── Row 3: Environmental History (Recharts) + Sensor Network ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental History Charts */}
        <div className="lg:col-span-2">
          <GlassPanel title={t('envHistory')} accent="blue">
            <div className="space-y-6">
              {/* Combined NDVI + Moisture Area Chart */}
              <div>
                <div className="flex items-center gap-4 text-xs mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded bg-neon-green inline-block"></span>
                    <span className="text-slate-400">{t('ndviTrend')}</span>
                    <span className="text-neon-green font-bold ml-1">{data.ndviHistory[data.ndviHistory.length - 1]}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded bg-holographic-blue inline-block"></span>
                    <span className="text-slate-400">{t('soilMoisturePct')}</span>
                    <span className="text-holographic-blue font-bold ml-1">{data.moistureHistory[data.moistureHistory.length - 1]}%</span>
                  </span>
                </div>
                <div className="h-64 lg:h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={envChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00B0FF" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#00B0FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: '#64748b', fontSize: 9 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="ndvi"
                        domain={['dataMin - 0.02', 'dataMax + 0.02']}
                        tick={{ fill: '#00E676', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => v.toFixed(2)}
                      />
                      <YAxis
                        yAxisId="moisture"
                        orientation="right"
                        domain={['dataMin - 2', 'dataMax + 2']}
                        tick={{ fill: '#00B0FF', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(11,17,32,0.95)',
                          border: '1px solid rgba(0,176,255,0.3)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: '#e2e8f0',
                        }}
                        formatter={(value: any, name: any) => {
                          if (name === 'ndvi') return [Number(value).toFixed(3), 'NDVI'];
                          if (name === 'moisture') return [`${value}%`, t('soilMoisture')];
                          return [value, name];
                        }}
                      />
                      <Area yAxisId="ndvi" type="monotone" dataKey="ndvi" stroke="#00E676" strokeWidth={2} fill="url(#ndviGrad)" dot={{ r: 2, fill: '#00E676' }} activeDot={{ r: 4, stroke: '#00E676', strokeWidth: 2 }} />
                      <Line yAxisId="moisture" type="monotone" dataKey="moisture" stroke="#00B0FF" strokeWidth={2} dot={{ r: 2, fill: '#00B0FF' }} strokeDasharray="4 2" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Health Index Bar Chart */}
              <div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="w-3 h-1 rounded bg-cyber-yellow inline-block"></span>
                  <span className="text-slate-400">{t('overallHealthIndex')}</span>
                  <span className="text-cyber-yellow font-bold ml-1">{data.history[data.history.length - 1]}</span>
                </div>
                <div className="h-48 lg:h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={envChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD600" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FFD600" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: '#64748b', fontSize: 9 }}
                        axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#FFD600', fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(11,17,32,0.95)',
                          border: '1px solid rgba(255,214,0,0.3)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: '#e2e8f0',
                        }}
                        formatter={(value: any) => [value, t('overallHealthIndex')]}
                      />
                      <Area type="monotone" dataKey="health" stroke="#FFD600" strokeWidth={2} fill="url(#healthGrad)" dot={{ r: 2, fill: '#FFD600' }} activeDot={{ r: 4, stroke: '#FFD600', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 uppercase tracking-widest pt-1 border-t border-slate-700/30">
                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Sensor Status Grid */}
        <GlassPanel title={t('sensorNetwork')} accent="green">
          <div className="space-y-2">
            {data.sensors.map((sensor: any) => (
              <div key={sensor.id} className={`flex items-center gap-3 p-2 rounded border transition-colors ${sensor.status === 'warning'
                  ? 'bg-cyber-yellow/5 border-cyber-yellow/30'
                  : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                }`}>
                <div className={`w-2 h-2 rounded-full ${sensor.status === 'warning' ? 'bg-cyber-yellow animate-pulse' : 'bg-neon-green'
                  }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 truncate">{sensor.id} · {sensor.type}</div>
                </div>
                <div className={`text-xs font-mono font-bold ${sensor.status === 'warning' ? 'text-cyber-yellow' : 'text-white'
                  }`}>{sensor.value}</div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-700/30 flex justify-between text-[10px]">
              <span className="text-slate-500">{data.sensors.length} {t('sensorsActive')}</span>
              <span className="text-neon-green flex items-center gap-1"><Radio className="w-3 h-3" /> {t('allOnline')}</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ── Consolidated AI Analysis for Environmental Trends ── */}
      <AIInterpretation
        dataType="Environmental Trend Analysis"
        dataValue={`NDVI ${data.ndviHistory[data.ndviHistory.length - 1]} / Moisture ${data.moistureHistory[data.moistureHistory.length - 1]}% / Health ${data.history[data.history.length - 1]}`}
        context="30-Day Trend + Sensor Network Comprehensive Analysis"
        zoneData={{
          ndviHistory: data.ndviHistory,
          moistureHistory: data.moistureHistory,
          healthHistory: data.history,
          sensorCount: data.sensors.length,
          warningSensors: data.sensors.filter((s: any) => s.status === 'warning').length,
        }}
        interpretation={`[NDVI 30-Day Trend] The vegetation index has shown a steady upward trajectory over the past 4 weeks, rising from ${data.ndviHistory[0]} to ${data.ndviHistory[data.ndviHistory.length - 1]}. This +${((data.ndviHistory[data.ndviHistory.length - 1] - data.ndviHistory[0]) * 100).toFixed(0)}% improvement indicates robust canopy development and increasing photosynthetic capacity. Week 3 showed the strongest growth acceleration, correlating with the post-fertilization nutrient uptake window.

[Soil Moisture 30-Day Trend] Moisture levels have fluctuated between ${Math.min(...data.moistureHistory)}% and ${Math.max(...data.moistureHistory)}%, currently at ${data.moistureHistory[data.moistureHistory.length - 1]}%. The periodic dips correspond to irrigation cycles and natural drainage patterns. Current levels are within the optimal range for root-zone water availability.

[Overall Health Index] The composite health score of ${data.history[data.history.length - 1]} integrates NDVI, moisture, temperature stress, and pest pressure metrics. The upward trend confirms that the zone is responding positively to current management practices.

[Sensor Network] All ${data.sensors.length} field sensors are reporting nominal readings. ${data.sensors.filter((s: any) => s.status === 'warning').length > 0 ? `${data.sensors.filter((s: any) => s.status === 'warning').length} sensors flagged with warnings should be inspected within 24 hours to ensure data integrity.` : 'No anomalies detected.'}

Recommendation: The environmental data supports maintaining current irrigation and fertilization schedules. Continue weekly drone surveys to track NDVI progression through the critical growth stage.`}
      />

      {/* ══════════════════════════════════════════════════════════════
          4.2 Yield Prediction Model
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const months = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
        const yieldPredData = months.map((w, i) => ({
          week: w,
          predicted: [8.2, 8.8, 9.3, 9.8, 10.2, 10.6, 11.0, 11.4, 11.8, 12.1, 12.3, 12.5][i],
          upper: [9.0, 9.6, 10.2, 10.8, 11.3, 11.8, 12.2, 12.6, 13.0, 13.4, 13.6, 13.8][i],
          lower: [7.4, 8.0, 8.5, 8.9, 9.2, 9.5, 9.8, 10.2, 10.6, 10.8, 11.0, 11.2][i],
          lastYear: [7.8, 8.2, 8.6, 9.0, 9.5, 9.8, 10.1, 10.4, 10.7, 11.0, 11.2, 11.5][i],
        }));
        const modelAccuracy = 92.4;
        const modelVersion = 'v3.2.1';
        const finalPrediction = 12.5;
        const ciLow = 11.2;
        const ciHigh = 13.8;

        return (
          <GlassPanel title={t("yieldPredictionModel")} accent="green">
            <div className="space-y-3">
              <div className="min-h-[350px] lg:min-h-0 lg:h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yieldPredData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                    <defs>
                      <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E676" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00E676" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                    <YAxis domain={[6, 15]} tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false}
                      label={{ value: 'ton/rai', angle: -90, position: 'insideLeft', fill: '#64748b', style: { textAnchor: 'middle', fontSize: 9 } }} />
                    <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#ciGrad)" name={t('confidenceBand')} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(11,17,32,1)" name="" />
                    <Line type="monotone" dataKey="predicted" stroke="#00E676" strokeWidth={2.5} name={t('predictedYield')}
                      dot={{ r: 3, fill: '#00E676', strokeWidth: 2, stroke: '#0B1120' }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="lastYear" stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" name={t('previousYearActual')}
                      dot={{ r: 2, fill: '#64748b' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">{t('predictedYield')}</div>
                  <div className="text-2xl font-bold text-neon-green font-mono">{finalPrediction}</div>
                  <div className="text-[9px] text-slate-400">ton/rai ({ciLow}–{ciHigh})</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">{t('modelAccuracy')}</div>
                  <div className="text-2xl font-bold text-holographic-blue font-mono">{modelAccuracy}%</div>
                  <div className="text-[9px] text-slate-400">R² score</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">{t('modelVersion')}</div>
                  <div className="text-2xl font-bold text-white font-mono">{modelVersion}</div>
                  <div className="text-[9px] text-slate-400">AI Engine</div>
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          4.3 Growth Rate Analysis (Actual vs Expected)
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const conformityScore = 88;
        const growthMetrics = [
          { label: t('heightGrowth'), expected: 85, actual: 92, unit: 'cm', deviation: '+8.2%' },
          { label: t('canopyExpansion'), expected: 3.2, actual: 3.5, unit: 'm²', deviation: '+9.4%' },
          { label: t('stemDiameter'), expected: 12, actual: 11.2, unit: 'cm', deviation: '-6.7%' },
          { label: t('leafCount'), expected: 45, actual: 48, unit: '', deviation: '+6.7%' },
          { label: t('rootDepth'), expected: 65, actual: 62, unit: 'cm', deviation: '-4.6%' },
        ];

        return (
          <GlassPanel title={t("growthRateAnalysis")} accent="blue">
            <div className="space-y-4">
              {/* Conformity score header */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-holographic-blue/5 border border-holographic-blue/20">
                <div className="flex items-center gap-3">
                  <Activity className="w-7 h-7 text-holographic-blue p-1.5 bg-holographic-blue/10 rounded" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('growthConformity')}</div>
                    <div className="text-2xl font-bold text-holographic-blue font-mono">{conformityScore}%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">{t('actualVsExpected')}</div>
                  <div className="text-sm text-neon-green font-bold">On Track</div>
                </div>
              </div>

              {/* Growth metrics comparison bars */}
              <div className="space-y-4">
                {growthMetrics.map(metric => {
                  const maxVal = Math.max(metric.expected, metric.actual);
                  const scale = 100 / (maxVal * 1.2);
                  const isPositive = metric.actual >= metric.expected;

                  return (
                    <div key={metric.label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">{metric.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-neon-green' : 'text-cyber-yellow'}`}>
                            {metric.deviation}
                          </span>
                        </div>
                      </div>
                      {/* Expected bar */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-500 w-16">{t('expectedLabel')}</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-slate-500/50" style={{ width: `${metric.expected * scale}%` }}></div>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono w-14 text-right">{metric.expected} {metric.unit}</span>
                        </div>
                        {/* Actual bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-500 w-16">{t('actualLabel')}</span>
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isPositive ? 'bg-neon-green/70' : 'bg-cyber-yellow/70'}`} style={{ width: `${metric.actual * scale}%` }}></div>
                          </div>
                          <span className={`text-[9px] font-mono w-14 text-right font-bold ${isPositive ? 'text-neon-green' : 'text-cyber-yellow'}`}>{metric.actual} {metric.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary note */}
              <div className="pt-2 border-t border-slate-700/30 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-neon-green shrink-0" />
                <span className="text-[10px] text-slate-400">
                  {t('growthDeviation')}: <span className="text-white font-bold">3/5</span> metrics above expected. Stem diameter and root depth slightly below — monitor nutrient uptake.
                </span>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          4.4 Water Use Efficiency Tracking
         ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const wueData = [
          { week: 'W1', wue: 4.2 }, { week: 'W2', wue: 4.5 }, { week: 'W3', wue: 4.3 },
          { week: 'W4', wue: 4.8 }, { week: 'W5', wue: 5.0 }, { week: 'W6', wue: 4.9 },
          { week: 'W7', wue: 5.2 }, { week: 'W8', wue: 5.4 }, { week: 'W9', wue: 5.1 },
          { week: 'W10', wue: 5.5 }, { week: 'W11', wue: 5.3 }, { week: 'W12', wue: 5.6 },
        ];
        const currentWUE = 5.6;
        const targetWUE = 6.0;
        const totalWater = 1250;
        const rainPct = 62;
        const irrigPct = 38;
        const cropET = 4.8;

        return (
          <GlassPanel title={t("waterUseEfficiency")} accent="blue">
            <div className="space-y-4">
              {/* WUE trend chart */}
              <div className="min-h-[280px] lg:min-h-0 lg:h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wueData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B0FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00B0FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} />
                    <YAxis domain={[3, 7]} tick={{ fill: '#00B0FF', fontSize: 9 }} tickLine={false} axisLine={false}
                      label={{ value: 'kg/m³', angle: -90, position: 'insideLeft', fill: '#00B0FF', style: { textAnchor: 'middle', fontSize: 9 } }} />
                    <Tooltip contentStyle={{ background: 'rgba(11,17,32,0.95)', border: '1px solid rgba(0,176,255,0.3)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }}
                      formatter={(value: any) => [`${value} kg/m³`, t('wueIndex')]} />
                    <Area type="monotone" dataKey="wue" stroke="#00B0FF" strokeWidth={2} fill="url(#wueGrad)"
                      dot={{ r: 2, fill: '#00B0FF' }} activeDot={{ r: 4, stroke: '#00B0FF', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-holographic-blue/5 border border-holographic-blue/20 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">{t('wueIndex')}</div>
                  <div className="text-xl font-bold text-holographic-blue font-mono">{currentWUE}</div>
                  <div className="text-[9px] text-slate-400">kg/m³ ({t('wueTarget')}: {targetWUE})</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">{t('totalWaterUsed')}</div>
                  <div className="text-xl font-bold text-white font-mono">{totalWater}</div>
                  <div className="text-[9px] text-slate-400">m³/month</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-center">
                  <div className="text-[9px] text-slate-500 uppercase">{t('cropEvapotranspiration')}</div>
                  <div className="text-xl font-bold text-cyber-yellow font-mono">{cropET}</div>
                  <div className="text-[9px] text-slate-400">mm/day</div>
                </div>
              </div>

              {/* Rain vs Irrigation contribution bar */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('rainContribution')} vs {t('irrigationContribution')}</div>
                <div className="flex h-5 rounded-lg overflow-hidden">
                  <div className="bg-holographic-blue/70 flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${rainPct}%` }}>
                    {t('rainContribution')} {rainPct}%
                  </div>
                  <div className="bg-cyber-yellow/70 flex items-center justify-center text-[9px] font-bold text-white" style={{ width: `${irrigPct}%` }}>
                    {t('irrigationContribution')} {irrigPct}%
                  </div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-holographic-blue/70" />{t('rainContribution')} ({(totalWater * rainPct / 100).toFixed(0)} m³)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyber-yellow/70" />{t('irrigationContribution')} ({(totalWater * irrigPct / 100).toFixed(0)} m³)</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        );
      })()}

      {/* ── Row 4: Quick Panels + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drone Coverage + Quick Soil */}
        <div className="space-y-4">
          <GlassPanel title={t('droneCoverage')} accent="blue" className="relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
              <div className="w-28 h-28 border-2 border-holographic-blue rounded-full radar-sweep"></div>
            </div>
            <div className="relative z-10 text-center py-4">
              <div className="text-4xl font-bold text-white mb-1">98%</div>
              <div className="text-xs text-holographic-blue uppercase">{t('areaMapped')}</div>
              <div className="text-[10px] text-slate-500 mt-2">Last flight: Today 08:30</div>
            </div>
          </GlassPanel>

          <GlassPanel title={t('quickSoilStatus')} accent="green">
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('nitrogen')} (N)</span>
                <span className="text-neon-green">{t('optimal')}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-neon-green h-full w-[85%] shadow-[0_0_8px_rgba(0,230,118,0.5)]"></div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('phosphorus')} (P)</span>
                <span className="text-cyber-yellow">{t('warning')}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyber-yellow h-full w-[40%]"></div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('potassium')} (K)</span>
                <span className="text-neon-green">{t('optimal')}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-neon-green h-full w-[85%]"></div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Drone Missions */}
        <GlassPanel title={t('recentMissions')} accent="blue">
          <div className="space-y-3">
            {data.droneMissions.map((m: any) => (
              <div key={m.id} className="p-3 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-xs font-bold text-white">{t('missionId')} {m.id}</div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${m.status === 'Completed' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' :
                      'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/30'
                    }`}>{m.status}</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <div className="flex justify-between"><span>Drone</span><span className="text-slate-300">{m.drone}</span></div>
                  <div className="flex justify-between"><span>Type</span><span className="text-slate-300">{m.type}</span></div>
                  <div className="flex justify-between"><span>Coverage</span><span className="text-slate-300">{m.coverage}</span></div>
                  <div className="flex justify-between"><span>Time</span><span className="text-slate-300">{m.time}</span></div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Alerts & Events */}
        <GlassPanel title={t('recentAlerts')} accent="red">
          <div className="space-y-3">
            {data.alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-3 rounded border backdrop-blur-sm relative overflow-hidden group hover:scale-[1.01] transition-transform ${alert.type === 'critical'
                    ? 'bg-alert-red/10 border-alert-red/40'
                    : alert.type === 'warning'
                      ? 'bg-cyber-yellow/10 border-cyber-yellow/40'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
              >
                {alert.type === 'critical' && <div className="absolute inset-0 bg-alert-red/5 animate-pulse pointer-events-none"></div>}
                <div className="flex gap-3 relative z-10">
                  <div className={`mt-0.5 p-1 rounded-full h-fit ${alert.type === 'critical' ? 'bg-alert-red/20 text-alert-red' :
                      alert.type === 'warning' ? 'bg-cyber-yellow/20 text-cyber-yellow' : 'bg-holographic-blue/20 text-holographic-blue'
                    }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] font-bold uppercase ${alert.type === 'critical' ? 'text-alert-red' :
                        alert.type === 'warning' ? 'text-cyber-yellow' : 'text-holographic-blue'
                      }`}>{alert.type}</div>
                    <div className="text-xs text-slate-200 leading-tight mt-0.5">{alert.message}</div>
                    <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{alert.time}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-600">{alert.sensor}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
