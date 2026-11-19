'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { LAUNCH_VEHICLES } from '@/lib/data/launchVehicles';
import type { LaunchVehicle } from '@/types';
import { Rocket, ChevronLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

function formatMass(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function CompatibilityBar({ current, max, label }: { current: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const color = pct > 90 ? '#ef4444' : pct > 70 ? '#eab308' : '#22c55e';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-[var(--space-muted)]">{label}</span>
        <span className="font-mono" style={{ color }}>
          {formatMass(current)} / {formatMass(max)}
        </span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  selected,
  totalMass,
  destinationId,
  onSelect,
}: {
  vehicle: LaunchVehicle;
  selected: boolean;
  totalMass: number;
  destinationId?: string;
  onSelect: () => void;
}) {
  const canReach = destinationId ? vehicle.compatibleDestinations.includes(destinationId as never) : true;
  const massOk = totalMass <= vehicle.payloadToLEO;
  const feasible = canReach && massOk;

  return (
    <button
      onClick={onSelect}
      className={`
        panel p-4 text-left w-full transition-all duration-200
        ${selected ? 'panel-glow border-[var(--space-accent)]' : 'hover:border-[var(--space-accent)]/40'}
        ${!feasible ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-[var(--space-accent)]" />
          <span className="font-bold text-sm text-[var(--space-text)]">{vehicle.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--space-muted)]">{vehicle.manufacturer}</span>
          {feasible
            ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--space-green)]" />
            : <XCircle className="w-3.5 h-3.5 text-[var(--space-red)]" />
          }
        </div>
      </div>

      <p className="text-xs text-[var(--space-muted)] leading-relaxed mb-3 line-clamp-2">
        {vehicle.description}
      </p>

      {/* Mass compatibility bar */}
      <CompatibilityBar
        current={totalMass}
        max={vehicle.payloadToLEO}
        label="Spacecraft mass vs. LEO capacity"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-1 mt-3 text-[10px]">
        <div>
          <div className="text-[var(--space-muted)]">LEO payload</div>
          <div className="font-mono font-semibold">{formatMass(vehicle.payloadToLEO)}</div>
        </div>
        <div>
          <div className="text-[var(--space-muted)]">GTO payload</div>
          <div className="font-mono font-semibold">
            {vehicle.payloadToGTO > 0 ? formatMass(vehicle.payloadToGTO) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[var(--space-muted)]">Escape payload</div>
          <div className="font-mono font-semibold">
            {vehicle.payloadToEscape > 0 ? formatMass(vehicle.payloadToEscape) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[var(--space-muted)]">Launch cost</div>
          <div className="font-mono font-semibold text-[var(--space-yellow)]">${vehicle.launchCostM}M</div>
        </div>
        <div>
          <div className="text-[var(--space-muted)]">Fairing ⌀</div>
          <div className="font-mono font-semibold">{vehicle.fairingDiameterM}m</div>
        </div>
        <div>
          <div className="text-[var(--space-muted)]">Reliability</div>
          <div className="font-mono font-semibold">{(vehicle.reliability * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Incompatibility notices */}
      {!canReach && (
        <div className="mt-2 text-[10px] text-[var(--space-red)] flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Cannot reach {destinationId}
        </div>
      )}
      {!massOk && (
        <div className="mt-1 text-[10px] text-[var(--space-yellow)] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Spacecraft exceeds payload capacity
        </div>
      )}
    </button>
  );
}

export default function RocketStep() {
  const setStep = useMissionStore((s) => s.setStep);
  const setLauncher = useMissionStore((s) => s.setLauncher);
  const selectedLauncher = useMissionStore((s) => s.selectedLauncher);
  const totalMass = useMissionStore((s) => s.resources.totalMass);
  const destinationId = useMissionStore((s) => s.mission.destination?.id);
  const dvBudget = useMissionStore((s) => s.deltaVBudget);
  const isValid = useMissionStore((s) => s.isValidForLaunch);

  return (
    <div className="flex flex-col gap-6 fade-up">
      <div>
        <h2 className="text-xl font-bold text-[var(--space-text)] mb-1">Launch Vehicle Selection</h2>
        <p className="text-sm text-[var(--space-muted)]">
          Match your spacecraft wet mass ({totalMass.toFixed(0)} kg) to a launch vehicle.
          The rocket must be able to reach your target destination.
        </p>
      </div>

      {/* Delta-V summary */}
      {dvBudget && (
        <div className={`panel p-4 ${dvBudget.feasible ? '' : 'border-[var(--space-red)]/50'}`}>
          <div className="flex items-center gap-2 mb-3">
            {dvBudget.feasible
              ? <CheckCircle2 className="w-4 h-4 text-[var(--space-green)]" />
              : <XCircle className="w-4 h-4 text-[var(--space-red)]" />
            }
            <h3 className="text-sm font-semibold text-[var(--space-text)]">
              Delta-V Budget Analysis
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Transfer burn</div>
              <div className="font-mono font-semibold">{dvBudget.transferBurn.toFixed(0)} m/s</div>
            </div>
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Destination insertion</div>
              <div className="font-mono font-semibold">{dvBudget.destinationInsertion.toFixed(0)} m/s</div>
            </div>
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Station keeping</div>
              <div className="font-mono font-semibold">{dvBudget.stationKeeping.toFixed(0)} m/s</div>
            </div>
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Margin</div>
              <div
                className="font-mono font-bold"
                style={{ color: dvBudget.feasible ? '#22c55e' : '#ef4444' }}
              >
                {dvBudget.margin >= 0 ? '+' : ''}{dvBudget.margin} m/s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {LAUNCH_VEHICLES.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selected={selectedLauncher?.id === vehicle.id}
            totalMass={totalMass}
            destinationId={destinationId}
            onSelect={() => setLauncher(vehicle)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(1)} className="btn-ghost flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          {selectedLauncher && !isValid && (
            <span className="text-xs text-[var(--space-yellow)] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Resolve mass or ΔV issues
            </span>
          )}
          <button
            onClick={() => setStep(3)}
            disabled={!selectedLauncher || !isValid}
            className="btn-primary"
          >
            Launch Mission →
          </button>
        </div>
      </div>
    </div>
  );
}
