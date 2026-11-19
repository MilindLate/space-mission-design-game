'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { Rocket, Cpu, Navigation, Radio, BarChart3, Check } from 'lucide-react';
import type { GameStep } from '@/types';

const STEPS: { label: string; icon: React.ReactNode; desc: string }[] = [
  { label: 'Destination', icon: <Navigation className="w-4 h-4" />, desc: 'Choose target orbit' },
  { label: 'Assembly',    icon: <Cpu className="w-4 h-4" />,        desc: 'Build spacecraft' },
  { label: 'Launcher',   icon: <Rocket className="w-4 h-4" />,      desc: 'Select rocket' },
  { label: 'Simulation', icon: <Radio className="w-4 h-4" />,       desc: 'Run mission' },
  { label: 'Report',     icon: <BarChart3 className="w-4 h-4" />,   desc: 'Post-mission' },
];

export default function Header() {
  const currentStep = useMissionStore((s) => s.currentStep);
  const destination = useMissionStore((s) => s.mission.destination);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--space-border)] bg-[var(--space-surface)]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--space-accent)] flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-[var(--space-text)]">
                SPACE MISSION DESIGN GAME
              </h1>
              <p className="text-[10px] text-[var(--space-muted)] uppercase tracking-widest">
                NASA Space Apps Challenge 2026
              </p>
            </div>
          </div>

          {destination && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--space-border)] text-xs text-[var(--space-muted)]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: destination.color }}
              />
              {destination.name}
            </div>
          )}
        </div>

        {/* Step progress */}
        <nav className="flex items-center gap-1" aria-label="Mission progress">
          {STEPS.map((step, idx) => {
            const stepIdx = idx as GameStep;
            const done = currentStep > stepIdx;
            const active = currentStep === stepIdx;

            return (
              <div key={step.label} className="flex items-center flex-1 min-w-0">
                <div
                  className={`
                    flex flex-col items-center gap-1 flex-1 min-w-0 px-1 py-1.5 rounded-lg transition-all duration-200
                    ${active ? 'bg-[var(--space-accent)]/10 border border-[var(--space-accent)]/40' : ''}
                    ${done ? 'opacity-60' : ''}
                    ${!active && !done ? 'opacity-40' : ''}
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center w-6 h-6 rounded-full border transition-colors
                      ${active ? 'bg-[var(--space-accent)] border-[var(--space-accent)] text-white' : ''}
                      ${done ? 'bg-[var(--space-green)] border-[var(--space-green)] text-white' : ''}
                      ${!active && !done ? 'border-[var(--space-border)] text-[var(--space-muted)]' : ''}
                    `}
                  >
                    {done ? <Check className="w-3 h-3" /> : step.icon}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight hidden sm:block truncate w-full text-center">
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className="h-px flex-shrink-0 w-3 mx-0.5 transition-colors"
                    style={{
                      background: done ? 'var(--space-green)' : 'var(--space-border)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
