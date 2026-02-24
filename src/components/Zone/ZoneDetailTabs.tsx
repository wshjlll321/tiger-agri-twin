'use client';

import React, { useState, lazy, Suspense } from 'react';
import TabOverview from './TabOverview';
import TabAgronomy from './TabAgronomy';
import TabCarbon from './TabCarbon';
import TabSimulation from './TabSimulation';
import { LayoutDashboard, Sprout, Leaf, Activity, MapPin, Plane } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const ZoneDetailMap = lazy(() => import('./ZoneDetailMap'));
const ZoneDroneTracker = lazy(() => import('./ZoneDroneTracker'));

function TabLoading() {
  return (
    <div className="flex items-center justify-center h-[500px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-holographic-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Loading Module...</span>
      </div>
    </div>
  );
}

export default function ZoneDetailTabs({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useTranslation();

  const tabs = [
    { id: 'overview', label: t('tabOverview'), icon: LayoutDashboard },
    { id: 'fieldmap', label: t('tabFieldMap'), icon: MapPin },
    { id: 'agronomy', label: t('tabAgronomy'), icon: Sprout },
    { id: 'carbon', label: t('tabCarbon'), icon: Leaf },
    { id: 'simulation', label: t('tabAiSim'), icon: Activity },
    ...(data.isDroneActive ? [{ id: 'dronelive', label: t('tabDroneLive'), icon: Plane }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Badge in Header Area equivalent */}
        <div className="flex items-center gap-3 md:hidden">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${data.statusKey === 'optimal' ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-alert-red text-alert-red bg-alert-red/10 animate-pulse'}`}>
            {t(data.statusKey).toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">{t(data.cropKey)}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/60 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDroneLive = tab.id === 'dronelive';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-lg font-mono text-xs uppercase tracking-wider transition-all
                ${isActive
                  ? 'bg-slate-800/80 text-holographic-blue border-t-2 border-holographic-blue'
                  : isDroneLive
                    ? 'text-neon-green hover:text-neon-green/80 hover:bg-neon-green/5 border-t-2 border-transparent'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-holographic-blue' : isDroneLive ? 'text-neon-green animate-pulse' : 'text-slate-500'}`} />
              {tab.label}
              {isDroneLive && !isActive && (
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px] animate-in slide-in-from-bottom-2 fade-in duration-300">
        {activeTab === 'overview' && <TabOverview data={data} />}
        {activeTab === 'fieldmap' && (
          <Suspense fallback={<TabLoading />}>
            <ZoneDetailMap data={data} />
          </Suspense>
        )}
        {activeTab === 'agronomy' && <TabAgronomy data={data} />}
        {activeTab === 'carbon' && <TabCarbon data={data} />}
        {activeTab === 'simulation' && <TabSimulation data={data} />}
        {activeTab === 'dronelive' && (
          <Suspense fallback={<TabLoading />}>
            <ZoneDroneTracker data={data} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
