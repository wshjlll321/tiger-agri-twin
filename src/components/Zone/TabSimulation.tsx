'use client';

import React, { useState } from 'react';
import GlassPanel from '@/components/HUD/GlassPanel';
import AIInterpretation from '@/components/AI/AIInterpretation';
import {
  AlertTriangle, Play, CheckCircle2, TrendingUp, TrendingDown,
  DollarSign, Shield, Zap, Target, Brain, Eye, BarChart3, Clock
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function TabSimulation({ data }: { data: any }) {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(1);
  const { t } = useTranslation();

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setShowResults(true);
    }, 2500);
  };

  const diag = data.aiDiagnosis;

  return (
    <div className="space-y-6">
      {/* ── Row 1: Diagnosis + Risk Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Diagnosis */}
        <GlassPanel title={t('aiDiagnosis')} accent="red">
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="p-2.5 bg-alert-red/20 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-alert-red" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{diag.primary.name}</h3>
                <div className="text-alert-red font-bold text-sm mt-0.5">{t('severity')}: {diag.primary.severity}</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{diag.primary.description}</p>

            {/* Probability gauge */}
            <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400 uppercase">{t('probability')}</span>
                <span className="text-alert-red font-bold">{diag.primary.probability}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyber-yellow to-alert-red rounded-full shadow-[0_0_8px_rgba(255,61,0,0.4)] transition-all duration-1000"
                  style={{ width: `${diag.primary.probability}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-slate-800/30 rounded border border-slate-700/40">
                <span className="text-slate-500 block">{t('affectedArea')}</span>
                <span className="text-white font-bold">{diag.primary.affectedArea}</span>
              </div>
              <div className="p-2 bg-slate-800/30 rounded border border-slate-700/40">
                <span className="text-slate-500 block">{t('detectedBy')}</span>
                <span className="text-white font-bold">{diag.primary.detectedBy}</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Risk Factor Matrix */}
        <GlassPanel title={t('riskFactorMatrix')} accent="red">
          <div className="space-y-3">
            {diag.riskMatrix.map((risk: any, i: number) => (
              <div key={i} className={`p-2.5 rounded border transition-colors ${
                risk.level === 'high' ? 'bg-alert-red/5 border-alert-red/30'
                : risk.level === 'medium' ? 'bg-cyber-yellow/5 border-cyber-yellow/30'
                : 'bg-slate-800/30 border-slate-700/40'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">{risk.factor}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    risk.level === 'high' ? 'bg-alert-red/10 text-alert-red border border-alert-red/30'
                    : risk.level === 'medium' ? 'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/30'
                    : 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                  }`}>{risk.level}</span>
                </div>
                <div className="text-[10px] text-slate-400">{risk.impact}</div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Recommendations */}
        <GlassPanel title={t('actionPlan')} accent="blue">
          <div className="space-y-3">
            {diag.recommendations.map((rec: any, i: number) => (
              <div key={i} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded hover:border-holographic-blue/30 transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? 'bg-alert-red/20 text-alert-red' :
                      i === 1 ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                      'bg-holographic-blue/20 text-holographic-blue'
                    }`}>{i + 1}</div>
                    <span className="text-xs font-bold text-white">{rec.action}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1 pl-7">
                  <div>{t('method')}: <span className="text-slate-300">{rec.method}</span></div>
                  <div className="flex gap-4">
                    <span>{t('priority')}: <span className={`font-bold ${
                      rec.priority === 'Immediate' ? 'text-alert-red' : 'text-cyber-yellow'
                    }`}>{rec.priority}</span></span>
                    <span>{t('cost')}: <span className="text-white font-bold">{rec.cost}</span></span>
                  </div>
                </div>
              </div>
            ))}

            {!showResults && (
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="w-full py-3 bg-holographic-blue/20 border border-holographic-blue/50 text-holographic-blue hover:bg-holographic-blue/30 font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-holographic-blue/30 border-t-holographic-blue rounded-full animate-spin"></div>
                    Processing Simulation...
                  </>
                ) : (
                  <><Play className="w-4 h-4" /> {t('runSimulation')}</>
                )}
              </button>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* AI Interpretation for Diagnosis & Risk */}
      <AIInterpretation
        dataType="AI Diagnosis & Risk"
        dataValue={`${diag.primary.name} — ${diag.primary.severity}`}
        context="Disease Detection & Scenario Analysis"
        interpretation={`[Primary Diagnosis: ${diag.primary.name}] AI engine has identified this pathogen with ${diag.primary.probability}% confidence based on multispectral drone imagery, IoT sensor anomalies, and historical outbreak pattern matching. The affected area of ${diag.primary.affectedArea} was detected by ${diag.primary.detectedBy}, confirming visual symptom correlation with spectral signature analysis.

[Severity Assessment: ${diag.primary.severity}] ${diag.primary.description} The severity classification factors in infection spread rate, crop growth stage vulnerability, and environmental conditions favoring pathogen proliferation. Current weather conditions (high humidity, moderate temperatures) create a favorable environment for disease progression.

[Environmental Risk Matrix]
${diag.riskMatrix.map((r: any) => `- ${r.factor} [${r.level.toUpperCase()}]: ${r.impact}`).join('\n')}

[AI Recommendations Analysis] The AI engine has generated ${diag.recommendations.length} prioritized action items ranked by urgency and cost-effectiveness. ${diag.recommendations[0]?.action} is flagged as the highest priority intervention with ${diag.recommendations[0]?.priority} urgency.

[Scenario Simulation] When simulation is executed, the AI model evaluates 3 intervention scenarios using Monte Carlo simulation across 847 data points. Each scenario projects yield impact, cost, ROI, and risk level to support evidence-based decision making. The model's historical accuracy of 96.2% provides high confidence in projected outcomes.

Decision Support:
1. Execute the highest-priority recommendation within the recommended timeframe
2. Run the scenario simulation to compare cost-effectiveness of intervention strategies
3. Schedule follow-up drone survey in 5-7 days to validate treatment efficacy
4. Update the AI model with treatment outcome data to improve future prediction accuracy`}
      />

      {/* ── Row 2: Scenario Comparison ── */}
      <GlassPanel title={t('scenarioComparison')} accent={showResults ? "green" : "blue"}>
        {!showResults ? (
          <div className="text-center py-12 opacity-30">
            <Brain className="w-16 h-16 mx-auto mb-4" />
            <div className="text-sm font-mono uppercase">Run simulation to compare scenarios...</div>
            <div className="text-xs text-slate-500 mt-2">AI will analyze 3 action scenarios and predict outcomes</div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2 text-neon-green mb-6">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm uppercase">Simulation Complete — 3 Scenarios Analyzed</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {diag.scenarios.map((scenario: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedScenario(i)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedScenario === i
                      ? 'border-holographic-blue bg-holographic-blue/5 shadow-[0_0_20px_rgba(0,176,255,0.1)]'
                      : 'border-slate-700/50 hover:border-slate-600 bg-slate-800/20'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-white">{scenario.name}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                      scenario.riskLevel === 'Critical' ? 'bg-alert-red/10 text-alert-red border border-alert-red/30'
                      : scenario.riskLevel === 'Low' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                      : 'bg-holographic-blue/10 text-holographic-blue border border-holographic-blue/30'
                    }`}>{scenario.riskLevel} Risk</span>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">{t('yieldImpact')}</div>
                      <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                        scenario.yieldImpact >= 0 ? 'text-neon-green' : 'text-alert-red'
                      }`}>
                        {scenario.yieldImpact >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {scenario.yieldImpact > 0 ? '+' : ''}{scenario.yieldImpact}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-slate-900/50 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">{t('cost')}</div>
                        <div className="text-sm font-bold text-white">${scenario.cost}</div>
                      </div>
                      <div className="text-center p-2 bg-slate-900/50 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">{t('roi')}</div>
                        <div className={`text-sm font-bold ${scenario.roi >= 0 ? 'text-cyber-yellow' : 'text-alert-red'}`}>
                          {scenario.roi > 0 ? '+' : ''}{scenario.roi}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedScenario === i && (
                    <div className="mt-3 pt-3 border-t border-holographic-blue/20 text-center">
                      <span className="text-[10px] text-holographic-blue uppercase font-bold">Selected Scenario</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-[10px] text-slate-500">
                <Brain className="w-3.5 h-3.5 inline mr-1 text-holographic-blue" />
                AI Confidence: 92% · Model: AgriTwin v3.2 · Processing: 847 data points
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowResults(false); setSelectedScenario(1); }}
                  className="px-4 py-2 rounded border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 text-xs transition-colors"
                >
                  Reset
                </button>
                <button className="px-6 py-2 rounded bg-neon-green/20 border border-neon-green/50 text-neon-green hover:bg-neon-green/30 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,230,118,0.2)]">
                  Execute Selected Action
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* ── Row 3: Historical Accuracy + AI Model Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Historical Accuracy */}
        <GlassPanel title={t('aiPredictionAccuracy')} accent="blue">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-holographic-blue" />
              <div>
                <div className="text-sm font-bold text-white">Average Accuracy: 96.2%</div>
                <div className="text-[10px] text-slate-400">Based on last 12 months predictions</div>
              </div>
            </div>

            {diag.historicalAccuracy.map((item: any, i: number) => (
              <div key={i} className="p-3 rounded bg-slate-800/30 border border-slate-700/40">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300">{item.date}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded">{item.type}</span>
                  </div>
                  <span className={`text-xs font-bold ${
                    Math.abs(item.predicted - item.actual) <= 3 ? 'text-neon-green' : 'text-cyber-yellow'
                  }`}>
                    {(100 - Math.abs(item.predicted - item.actual)).toFixed(0)}% acc.
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">{t('predicted')}</span>
                      <span className="text-holographic-blue font-mono">{item.predicted}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-holographic-blue rounded-full" style={{ width: `${item.predicted}%` }}></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">{t('actual')}</span>
                      <span className="text-neon-green font-mono">{item.actual}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-green rounded-full" style={{ width: `${item.actual}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* AI Model & System Stats */}
        <GlassPanel title={t('sysState')} accent="green">
          <div className="space-y-4">
            {/* Engine status */}
            <div className="flex items-center gap-4 p-4 rounded bg-neon-green/5 border border-neon-green/30">
              <div className="p-3 bg-neon-green/10 rounded-full">
                <Brain className="w-8 h-8 text-neon-green" />
              </div>
              <div>
                <div className="text-sm font-bold text-neon-green">{t('engineOnline')}</div>
                <div className="text-[10px] text-slate-400">AgriTwin AI v3.2 · Last trained: 2026-02-01</div>
              </div>
            </div>

            {/* Model metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Data Points</div>
                <div className="text-xl font-bold text-white mt-0.5">847K</div>
                <div className="text-[9px] text-slate-500">Training dataset</div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Models Active</div>
                <div className="text-xl font-bold text-holographic-blue mt-0.5">6</div>
                <div className="text-[9px] text-slate-500">Ensemble inference</div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Sensors Feeding</div>
                <div className="text-xl font-bold text-white mt-0.5">8</div>
                <div className="text-[9px] text-slate-500">Real-time inputs</div>
              </div>
              <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Avg Latency</div>
                <div className="text-xl font-bold text-neon-green mt-0.5">1.2s</div>
                <div className="text-[9px] text-slate-500">Inference time</div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="pt-3 border-t border-slate-700/30">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Active Capabilities</div>
              <div className="flex flex-wrap gap-2">
                {['Pest Detection', 'Disease Forecast', 'Yield Prediction', 'Growth Analysis', 'Weather Correlation', 'Anomaly Detection'].map(cap => (
                  <span key={cap} className="text-[9px] px-2 py-1 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
