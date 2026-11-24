'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { DESTINATIONS } from '@/lib/data/destinations';
import type { OrbitalDestination, MissionDurationMonths } from '@/types';
import { Navigation, Clock, Zap, Shield, Radio, ArrowRight, Lock } from 'lucide-react';

const DURATION_OPTIONS: { months: MissionDurationMonths; label: string }[] = [
  { months: 6,  label: '6 mo' },
  { months: 12, label: '1 yr' },
  { months: 24, label: '2 yr' },
  { months: 60, label: '5 yr' },
];

const DIFFICULTY: Record<string, { label: string; cls: string; tier: number }> = {
  LEO:   { label: 'Beginner',   cls: 'badge-easy',      tier: 1 },
  SSO:   { label: 'Easy',       cls: 'badge-easy',      tier: 2 },
  GTO:   { label: 'Medium',     cls: 'badge-medium',    tier: 3 },
  LUNAR: { label: 'Hard',       cls: 'badge-hard',      tier: 4 },
  L2:    { label: 'Expert',     cls: 'badge-extreme',   tier: 5 },
  MARS:  { label: 'Legendary',  cls: 'badge-legendary', tier: 6 },
};

const MISSION_NAMES: Record<string, string> = {
  LEO: 'Earth Sentinel', SSO: 'Sun Chaser', GTO: 'Orbital Relay',
  LUNAR: 'Lunar Pathfinder', L2: 'Deep Eye', MARS: 'Red Pioneer',
};

const ICONS: Record<string, string> = {
  LEO: '🌍', SSO: '🛰️', GTO: '📡', LUNAR: '🌙', L2: '🔭', MARS: '🔴',
};

const RADIATION_BADGE: Record<string, { label: string; color: string }> = {
  low:     { label: 'Low Rad',      color: '#22c55e' },
  medium:  { label: 'Med Rad',      color: '#eab308' },
  high:    { label: 'High Rad',     color: '#f97316' },
  extreme: { label: 'Extreme Rad',  color: '#ef4444' },
};

function DestinationCard({
  dest,
  selected,
  onSelect,
}: {
  dest: OrbitalDestination;
  selected: boolean;
  onSelect: () => void;
}) {
  const diff = DIFFICULTY[dest.id];
  const rad = RADIATION_BADGE[dest.radiationLevel];
  const icon = ICONS[dest.id] ?? '🚀';
  const missionName = MISSION_NAMES[dest.id] ?? dest.name;

  return (
    <button
      onClick={onSelect}
      className={`mission-card text-left w-full group ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
    >
      {/* Level badge corner */}
      <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-700/50">
        {diff.tier}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`text-4xl transition-transform duration-300 ${selected ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Difficulty */}
          <span className={`badge ${diff.cls} mb-2 inline-block`}>
            {diff.label}
          </span>

          {/* Title */}
          <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-cyan-300 transition-colors">
            {missionName}
          </h3>
          <p className="text-xs font-mono text-slate-500 mb-2">{dest.name}</p>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {dest.description}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Navigation className="w-2.5 h-2.5 text-cyan-500" />
              <span>ΔV: <span className="text-white font-mono font-semibold">{(dest.requiredDeltaV / 1000).toFixed(1)} km/s</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-2.5 h-2.5 text-yellow-500" />
              <span>Solar: <span className="text-white font-mono font-semibold">{dest.solarIrradiance} W/m²</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Radio className="w-2.5 h-2.5 text-green-500" />
              <span>DSN: <span className="text-white font-mono font-semibold">{dest.dsnContactHoursPerDay}h/day</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-2.5 h-2.5" style={{ color: rad.color }} />
              <span style={{ color: rad.color }}>{rad.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Science score bar */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[9px] text-slate-500 uppercase tracking-wider w-16 shrink-0">Science</span>
        <div className="gauge-track flex-1">
          <div
            className="gauge-fill"
            style={{ width: `${dest.scienceOpportunityScore}%`, background: `linear-gradient(90deg, ${dest.color}, ${dest.color}80)` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-slate-300 w-10 text-right">{dest.scienceOpportunityScore}</span>
      </div>
    </button>
  );
}

export default function DestinationStep() {
  const setDestination = useMissionStore((s) => s.setDestination);
  const setMissionDuration = useMissionStore((s) => s.setMissionDuration);
  const setStep = useMissionStore((s) => s.setStep);
  const selectedDest = useMissionStore((s) => s.mission.destination);
  const selectedDuration = useMissionStore((s) => s.spacecraft.missionDurationMonths);

  return (
    <div className="flex flex-col gap-8 fade-up">
      {/* Briefing header */}
      <div className="panel p-6 bg-gradient-to-r from-cyan-500/5 to-transparent">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-500/70 uppercase tracking-[0.2em] mb-3">
          <div className="w-6 h-px bg-cyan-500/30" />
          STEP 1 OF 4 · MISSION BRIEFING
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Select Your Mission</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Each mission presents unique engineering challenges. Harder missions require
          more propellant, better power systems, and careful thermal management.
          Choose wisely — your component budget depends on the destination.
        </p>
      </div>

      {/* Mission grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {DESTINATIONS.map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            selected={selectedDest?.id === dest.id}
            onSelect={() => setDestination(dest)}
          />
        ))}
      </div>

      {/* Mission duration + orbital params (combined panel) */}
      {selectedDest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 slide-in-right">
          {/* Duration */}
          <div className="panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Mission Duration</h3>
              <span className="text-[10px] text-slate-500 ml-auto font-mono">
                min {selectedDest.minDurationMonths}mo
              </span>
            </div>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(({ months, label }) => {
                const disabled = months < selectedDest.minDurationMonths;
                const active = selectedDuration === months;
                return (
                  <button
                    key={months}
                    onClick={() => setMissionDuration(months)}
                    disabled={disabled}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    } ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orbital params */}
          <div className="panel p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">
              Orbital Parameters — {selectedDest.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                { label: 'Semi-major axis', value: `${selectedDest.semiMajorAxis.toLocaleString()} km` },
                { label: 'Eccentricity', value: selectedDest.eccentricity.toFixed(3) },
                { label: 'Inclination', value: `${selectedDest.inclination}°` },
                { label: 'Central body', value: selectedDest.centralBody },
              ].map((p) => (
                <div key={p.label}>
                  <div className="text-slate-500 mb-0.5">{p.label}</div>
                  <div className="font-mono font-bold text-white">{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end">
        <button
          onClick={() => setStep(1)}
          disabled={!selectedDest}
          className="btn-primary flex items-center gap-2"
        >
          <span>Proceed to Spacecraft Assembly</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
