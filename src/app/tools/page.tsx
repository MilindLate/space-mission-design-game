'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Link from 'next/link';

const TrajectoryDesigner = dynamic(() => import('@/components/trajectory/TrajectoryDesigner'), { ssr: false });
const FailureLab = dynamic(() => import('@/components/failure/FailureLab'), { ssr: false });
const MissionComparison = dynamic(() => import('@/components/comparison/MissionComparison'), { ssr: false });
const MissionControl = dynamic(() => import('@/components/dashboard/MissionControl'), { ssr: false });

type TabId = 'trajectory' | 'failure' | 'comparison' | 'control';

const TABS: Array<{ id: TabId; label: string; icon: string; desc: string }> = [
  { id: 'trajectory', label: 'Trajectory Designer', icon: '🛸', desc: 'Hohmann transfer calculator with vis-viva equations' },
  { id: 'failure', label: 'Failure Lab', icon: '💥', desc: 'Interactive mission failure scenarios and analysis' },
  { id: 'comparison', label: 'Mission Comparison', icon: '📊', desc: 'Compare your design vs. MRO, Curiosity, JWST, Cassini' },
  { id: 'control', label: 'Mission Control', icon: '🖥️', desc: 'Real-time telemetry dashboard (active during simulation)' },
];

export default function ToolsPage() {
  const [active, setActive] = useState<TabId>('trajectory');

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-cyan-400 text-sm font-mono transition-colors">
            ← Mission
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-300 text-sm font-mono">Mission Tools</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-800 px-6 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              active === tab.id
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/50">
        <p className="text-xs text-slate-500 font-mono">
          {TABS.find((t) => t.id === active)?.desc}
        </p>
      </div>

      {/* Tab content */}
      <div className={active === 'control' ? 'h-[calc(100vh-120px)]' : 'py-4'}>
        {active === 'trajectory' && <TrajectoryDesigner />}
        {active === 'failure' && <FailureLab />}
        {active === 'comparison' && <MissionComparison />}
        {active === 'control' && <MissionControl />}
      </div>
    </div>
  );
}
