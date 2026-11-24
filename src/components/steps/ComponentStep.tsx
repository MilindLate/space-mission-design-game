'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import AssemblyPanel from '@/components/ui/AssemblyPanel';
import ResourceHUD from '@/components/ui/ResourceHUD';
import { AlertTriangle, CheckCircle2, ChevronLeft, ArrowRight, Cpu, Shield } from 'lucide-react';

export default function ComponentStep() {
  const setStep = useMissionStore((s) => s.setStep);
  const resources = useMissionStore((s) => s.resources);
  const destination = useMissionStore((s) => s.mission.destination);
  const installedCount = useMissionStore((s) =>
    s.spacecraft.components.reduce((sum, e) => sum + e.count, 0)
  );

  // Minimum viable spacecraft validation
  const hasStructure = useMissionStore((s) =>
    s.spacecraft.components.some((e) => e.componentId.startsWith('bus_'))
  );
  const hasPower = resources.powerGenerated > 0;
  const hasPropulsion = useMissionStore((s) =>
    s.spacecraft.components.some((e) => e.componentId.startsWith('prop_'))
  );
  const hasComms = useMissionStore((s) =>
    s.spacecraft.components.some((e) => e.componentId.startsWith('comms_'))
  );
  const hasPayload = useMissionStore((s) =>
    s.spacecraft.components.some((e) => e.componentId.startsWith('payload_'))
  );
  const hasThermal = useMissionStore((s) =>
    s.spacecraft.components.some((e) => e.componentId.startsWith('thermal_'))
  );
  const powerOk = resources.powerGenerated >= resources.continuousPowerDraw;

  const checks = [
    { label: 'Primary bus structure', ok: hasStructure },
    { label: 'Power subsystem', ok: hasPower },
    { label: 'Propulsion system', ok: hasPropulsion },
    { label: 'Communications', ok: hasComms },
    { label: 'Scientific payload', ok: hasPayload },
    { label: 'Thermal control', ok: hasThermal },
    { label: 'Power budget positive', ok: powerOk },
  ];

  const readyForNext = checks.every((c) => c.ok);
  const passedCount = checks.filter((c) => c.ok).length;
  const checkPct = (passedCount / checks.length) * 100;

  return (
    <div className="flex flex-col gap-6 fade-up">
      {/* Briefing header */}
      <div className="panel p-6 bg-gradient-to-r from-cyan-500/5 to-transparent">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-500/70 uppercase tracking-[0.2em] mb-3">
          <div className="w-6 h-px bg-cyan-500/30" />
          STEP 2 OF 4 · SPACECRAFT ASSEMBLY
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Build Your Spacecraft</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Configure your spacecraft subsystems. Each component affects mass, power, cost, and data budgets in real time.
          {destination && (
            <span className="text-cyan-400 font-semibold"> Target: {destination.name}.</span>
          )}
        </p>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '540px' }}>
        {/* Component selector — takes 2/3 on large screens */}
        <div className="lg:col-span-2 h-[540px]">
          <AssemblyPanel />
        </div>

        {/* Resource HUD + checklist — 1/3 */}
        <div className="flex flex-col gap-4">
          <ResourceHUD />

          {/* Subsystem checklist */}
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Subsystem Checklist
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {passedCount}/{checks.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="gauge-track mb-3">
              <div
                className="gauge-fill"
                style={{
                  width: `${checkPct}%`,
                  background: readyForNext ? '#22c55e' : '#eab308',
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  {c.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  }
                  <span className={c.ok ? 'text-slate-300' : 'text-slate-600'}>
                    {c.label}
                  </span>
                  {c.ok && (
                    <span className="ml-auto text-[9px] text-green-500/60 font-mono">PASS</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Installed count pill */}
          <div className="text-center text-xs text-slate-500">
            <span className="font-mono font-bold text-cyan-400">{installedCount}</span> components installed
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(0)} className="btn-ghost flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Missions
        </button>
        <div className="flex items-center gap-3">
          {!readyForNext && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
              Complete all subsystem checks
            </span>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!readyForNext}
            className="btn-primary flex items-center gap-2"
          >
            <span>Select Launch Vehicle</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
