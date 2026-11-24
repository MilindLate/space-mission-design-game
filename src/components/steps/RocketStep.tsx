'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { LAUNCH_VEHICLES } from '@/lib/data/launchVehicles';
import type { LaunchVehicle } from '@/types';
import { Rocket, ChevronLeft, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Flame, Target } from 'lucide-react';

function formatMass(kg: number) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function CompatibilityBar({ current, max, label }: { current: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const color = pct > 90 ? '#ef4444' : pct > 70 ? '#eab308' : '#22c55e';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-slate-500">{label}</span>
        <span className="font-mono font-semibold" style={{ color }}>
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
      className={`mission-card text-left w-full group ${selected ? 'selected' : ''} ${!feasible ? 'opacity-50' : ''}`}
    >
      {/* Feasibility indicator */}
      <div className="absolute top-4 right-4">
        {feasible
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-500" />
        }
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
          selected
            ? 'bg-cyan-500/20 border border-cyan-500/40'
            : 'bg-slate-800/80 border border-slate-700/50 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30'
        }`}>
          <Rocket className={`w-5 h-5 ${selected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
            {vehicle.name}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">{vehicle.manufacturer}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
        {vehicle.description}
      </p>

      {/* Mass compatibility bar */}
      <CompatibilityBar
        current={totalMass}
        max={vehicle.payloadToLEO}
        label="Spacecraft mass vs. LEO capacity"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-3 text-[10px]">
        <div>
          <div className="text-slate-500">LEO payload</div>
          <div className="font-mono font-semibold text-white">{formatMass(vehicle.payloadToLEO)}</div>
        </div>
        <div>
          <div className="text-slate-500">GTO payload</div>
          <div className="font-mono font-semibold text-white">
            {vehicle.payloadToGTO > 0 ? formatMass(vehicle.payloadToGTO) : '—'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Escape payload</div>
          <div className="font-mono font-semibold text-white">
            {vehicle.payloadToEscape > 0 ? formatMass(vehicle.payloadToEscape) : '—'}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Launch cost</div>
          <div className="font-mono font-semibold text-yellow-400">${vehicle.launchCostM}M</div>
        </div>
        <div>
          <div className="text-slate-500">Fairing ⌀</div>
          <div className="font-mono font-semibold text-white">{vehicle.fairingDiameterM}m</div>
        </div>
        <div>
          <div className="text-slate-500">Reliability</div>
          <div className="font-mono font-semibold text-green-400">{(vehicle.reliability * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Incompatibility notices */}
      {!canReach && (
        <div className="mt-3 text-[10px] text-red-400 flex items-center gap-1 bg-red-500/10 rounded-lg px-2 py-1">
          <XCircle className="w-3 h-3" />
          Cannot reach {destinationId}
        </div>
      )}
      {!massOk && (
        <div className="mt-1 text-[10px] text-yellow-400 flex items-center gap-1 bg-yellow-500/10 rounded-lg px-2 py-1">
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
      {/* Briefing header */}
      <div className="panel p-6 bg-gradient-to-r from-orange-500/5 to-transparent">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-500/70 uppercase tracking-[0.2em] mb-3">
          <div className="w-6 h-px bg-orange-500/30" />
          STEP 3 OF 4 · LAUNCH VEHICLE
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Choose Your Rocket</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Match your spacecraft wet mass (<span className="font-mono text-cyan-400">{totalMass.toFixed(0)} kg</span>) to a launch vehicle.
          The rocket must have enough capacity and reach your target destination.
        </p>
      </div>

      {/* Delta-V summary */}
      {dvBudget && (
        <div className={`panel p-5 ${dvBudget.feasible ? 'panel-glow' : 'border-red-500/40'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Delta-V Budget Analysis</h3>
            <div className="ml-auto">
              {dvBudget.feasible
                ? <span className="badge badge-easy">FEASIBLE</span>
                : <span className="badge badge-extreme">INFEASIBLE</span>
              }
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Transfer burn', value: `${dvBudget.transferBurn.toFixed(0)} m/s`, color: '#0ea5e9' },
              { label: 'Dest insertion', value: `${dvBudget.destinationInsertion.toFixed(0)} m/s`, color: '#a855f7' },
              { label: 'Station keeping', value: `${dvBudget.stationKeeping.toFixed(0)} m/s`, color: '#eab308' },
              { label: 'Margin', value: `${dvBudget.margin >= 0 ? '+' : ''}${dvBudget.margin} m/s`, color: dvBudget.feasible ? '#22c55e' : '#ef4444' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</div>
                <div className="text-lg font-mono font-bold" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
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
          <ChevronLeft className="w-4 h-4" /> Back to Assembly
        </button>
        <div className="flex items-center gap-3">
          {selectedLauncher && !isValid && (
            <span className="text-xs text-yellow-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Resolve mass or ΔV issues
            </span>
          )}
          <button
            onClick={() => setStep(3)}
            disabled={!selectedLauncher || !isValid}
            className="btn-primary flex items-center gap-2"
          >
            <Flame className="w-4 h-4" />
            <span>Launch Mission</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
