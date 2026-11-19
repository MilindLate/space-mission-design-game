'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { DESTINATIONS } from '@/lib/data/destinations';
import type { OrbitalDestination, MissionDurationMonths } from '@/types';
import { Navigation, Clock, Zap, Shield, Radio } from 'lucide-react';

const DURATION_OPTIONS: { months: MissionDurationMonths; label: string }[] = [
  { months: 6,  label: '6 months' },
  { months: 12, label: '1 year' },
  { months: 24, label: '2 years' },
  { months: 60, label: '5 years' },
];

const RADIATION_BADGE: Record<string, { label: string; color: string }> = {
  low:     { label: 'Low Radiation',     color: '#22c55e' },
  medium:  { label: 'Medium Radiation',  color: '#eab308' },
  high:    { label: 'High Radiation',    color: '#f97316' },
  extreme: { label: 'Extreme Radiation', color: '#ef4444' },
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
  const rad = RADIATION_BADGE[dest.radiationLevel];

  return (
    <button
      onClick={onSelect}
      className={`
        panel p-4 text-left transition-all duration-200 w-full
        ${selected ? 'panel-glow border-[var(--space-accent)]' : 'hover:border-[var(--space-accent)]/50'}
      `}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: dest.color, boxShadow: selected ? `0 0 8px ${dest.color}` : 'none' }}
          />
          <span className="font-semibold text-sm text-[var(--space-text)]">{dest.name}</span>
        </div>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full border shrink-0"
          style={{ color: rad.color, borderColor: `${rad.color}50` }}
        >
          {rad.label}
        </span>
      </div>

      <p className="text-xs text-[var(--space-muted)] leading-relaxed mb-3 line-clamp-2">
        {dest.description}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
        <div className="flex items-center gap-1 text-[var(--space-muted)]">
          <Navigation className="w-2.5 h-2.5" />
          <span>ΔV req: <span className="text-[var(--space-text)] font-mono">{(dest.requiredDeltaV / 1000).toFixed(1)} km/s</span></span>
        </div>
        <div className="flex items-center gap-1 text-[var(--space-muted)]">
          <Zap className="w-2.5 h-2.5" />
          <span>Solar: <span className="text-[var(--space-text)] font-mono">{dest.solarIrradiance} W/m²</span></span>
        </div>
        <div className="flex items-center gap-1 text-[var(--space-muted)]">
          <Radio className="w-2.5 h-2.5" />
          <span>DSN: <span className="text-[var(--space-text)] font-mono">{dest.dsnContactHoursPerDay}h/day</span></span>
        </div>
        <div className="flex items-center gap-1 text-[var(--space-muted)]">
          <Shield className="w-2.5 h-2.5" />
          <span>Science: <span className="text-[var(--space-text)] font-mono">{dest.scienceOpportunityScore}/100</span></span>
        </div>
      </div>

      {/* Science score bar */}
      <div className="mt-2.5 gauge-track">
        <div
          className="gauge-fill"
          style={{ width: `${dest.scienceOpportunityScore}%`, background: dest.color }}
        />
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
    <div className="flex flex-col gap-6 fade-up">
      <div>
        <h2 className="text-xl font-bold text-[var(--space-text)] mb-1">Mission Destination</h2>
        <p className="text-sm text-[var(--space-muted)]">
          Choose your target orbit. Each destination imposes unique engineering constraints on power, propulsion, and communications.
        </p>
      </div>

      {/* Destination grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DESTINATIONS.map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            selected={selectedDest?.id === dest.id}
            onSelect={() => setDestination(dest)}
          />
        ))}
      </div>

      {/* Mission duration */}
      {selectedDest && (
        <div className="panel p-4 fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[var(--space-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--space-text)]">Mission Duration</h3>
            <span className="text-xs text-[var(--space-muted)]">
              (min {selectedDest.minDurationMonths} months for {selectedDest.name})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(({ months, label }) => {
              const disabled = months < selectedDest.minDurationMonths;
              const active = selectedDuration === months;
              return (
                <button
                  key={months}
                  onClick={() => setMissionDuration(months)}
                  disabled={disabled}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all border
                    ${active
                      ? 'bg-[var(--space-accent)] border-[var(--space-accent)] text-white'
                      : 'border-[var(--space-border)] text-[var(--space-muted)] hover:border-[var(--space-accent)] hover:text-[var(--space-text)]'
                    }
                    ${disabled ? 'opacity-30 cursor-not-allowed hover:border-[var(--space-border)] hover:text-[var(--space-muted)]' : ''}
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Orbital parameters panel */}
      {selectedDest && (
        <div className="panel p-4 fade-up">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--space-muted)] mb-3">
            Orbital Parameters — {selectedDest.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Semi-major axis</div>
              <div className="font-mono font-semibold">{selectedDest.semiMajorAxis.toLocaleString()} km</div>
            </div>
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Eccentricity</div>
              <div className="font-mono font-semibold">{selectedDest.eccentricity.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Inclination</div>
              <div className="font-mono font-semibold">{selectedDest.inclination}°</div>
            </div>
            <div>
              <div className="text-[var(--space-muted)] mb-0.5">Central body</div>
              <div className="font-mono font-semibold">{selectedDest.centralBody}</div>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end">
        <button
          onClick={() => setStep(1)}
          disabled={!selectedDest}
          className="btn-primary"
        >
          Continue to Assembly →
        </button>
      </div>
    </div>
  );
}
