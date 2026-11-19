'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import AssemblyPanel from '@/components/ui/AssemblyPanel';
import ResourceHUD from '@/components/ui/ResourceHUD';
import { AlertTriangle, CheckCircle2, ChevronLeft } from 'lucide-react';

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

  return (
    <div className="flex flex-col gap-4 fade-up">
      <div>
        <h2 className="text-xl font-bold text-[var(--space-text)] mb-1">Spacecraft Assembly</h2>
        <p className="text-sm text-[var(--space-muted)]">
          Configure your spacecraft subsystems. Each component affects mass, power, cost, and data budgets in real time.
          {destination && (
            <span className="text-[var(--space-accent)]"> Destination: {destination.name}.</span>
          )}
        </p>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '520px' }}>
        {/* Component selector — takes 2/3 on large screens */}
        <div className="lg:col-span-2 h-[520px]">
          <AssemblyPanel />
        </div>

        {/* Resource HUD + checklist — 1/3 */}
        <div className="flex flex-col gap-4">
          <ResourceHUD />

          {/* Subsystem checklist */}
          <div className="panel p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--space-muted)] mb-3">
              Subsystem Checklist
            </div>
            <div className="flex flex-col gap-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  {c.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--space-green)] shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-[var(--space-muted)] shrink-0" />
                  }
                  <span className={c.ok ? 'text-[var(--space-text)]' : 'text-[var(--space-muted)]'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(0)} className="btn-ghost flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          {!readyForNext && (
            <span className="text-xs text-[var(--space-muted)]">
              Complete all subsystem checks to continue
            </span>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!readyForNext}
            className="btn-primary"
          >
            Select Launch Vehicle →
          </button>
        </div>
      </div>
    </div>
  );
}
