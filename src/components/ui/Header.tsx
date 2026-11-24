'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { Rocket, Cpu, Navigation, Radio, BarChart3, Check } from 'lucide-react';
import type { GameStep } from '@/types';

const STEPS: { label: string; icon: React.ReactNode; desc: string }[] = [
  { label: 'Destination', icon: <Navigation className="w-4 h-4" />, desc: 'Choose target' },
  { label: 'Assembly',    icon: <Cpu className="w-4 h-4" />,        desc: 'Build craft' },
  { label: 'Launcher',    icon: <Rocket className="w-4 h-4" />,     desc: 'Pick rocket' },
  { label: 'Simulation',  icon: <Radio className="w-4 h-4" />,      desc: 'Fly mission' },
  { label: 'Report',      icon: <BarChart3 className="w-4 h-4" />,  desc: 'Results' },
];

export default function Header() {
  const currentStep = useMissionStore((s) => s.currentStep);
  const destination = useMissionStore((s) => s.mission.destination);
  const resources = useMissionStore((s) => s.resources);
  const resetMission = useMissionStore((s) => s.resetMission);

  const progressPct = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60" style={{ background: 'rgba(2, 4, 8, 0.85)', backdropFilter: 'blur(20px)' }}>
      {/* Progress bar */}
      <div className="h-[3px] w-full bg-slate-800/50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
          style={{ width: `${progressPct}%`, boxShadow: '0 0 12px rgba(14,165,233,0.5)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={resetMission}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
            >
              <Rocket className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">
                SPACE MISSION
              </h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">
                Design Game
              </p>
            </div>
          </div>

          {/* Mission info + resources mini */}
          <div className="hidden md:flex items-center gap-4">
            {destination && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: destination.color, boxShadow: `0 0 6px ${destination.color}` }} />
                <span className="text-slate-300 font-medium">{destination.name}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-500 font-mono">{resources.totalMass.toFixed(0)} kg</span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-500 font-mono">{resources.powerGenerated.toFixed(0)} W</span>
              </div>
            )}
          </div>
        </div>

        {/* Step progress */}
        <nav className="flex items-center gap-0.5" aria-label="Mission progress">
          {STEPS.map((step, idx) => {
            const stepIdx = idx as GameStep;
            const done = currentStep > stepIdx;
            const active = currentStep === stepIdx;

            return (
              <div key={step.label} className="flex items-center flex-1 min-w-0">
                <div
                  className={`flex items-center gap-2 flex-1 min-w-0 px-3 py-2 rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : done
                        ? 'bg-green-500/5 border border-transparent'
                        : 'border border-transparent opacity-40'
                  }`}
                >
                  {/* Circle */}
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300 shrink-0 ${
                      active
                        ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                        : done
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-700 text-slate-600'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : step.icon}
                  </div>

                  {/* Text */}
                  <div className="hidden lg:block min-w-0">
                    <div className={`text-[11px] font-semibold truncate ${active ? 'text-cyan-300' : done ? 'text-green-400/70' : 'text-slate-600'}`}>
                      {step.label}
                    </div>
                    <div className="text-[9px] text-slate-600 truncate">{step.desc}</div>
                  </div>
                </div>

                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <div className={`h-[2px] w-4 mx-0.5 shrink-0 rounded transition-colors duration-500 ${done ? 'bg-green-500/50' : 'bg-slate-800'}`} />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
