'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import { Zap, Weight, DollarSign, Database, Wifi, AlertTriangle } from 'lucide-react';
import ConceptTooltip from '@/components/education/ConceptTooltip';

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function getBarColor(pct: number, invert = false): string {
  const v = invert ? 100 - pct : pct;
  if (v > 85) return '#ef4444';
  if (v > 65) return '#eab308';
  return '#22c55e';
}

interface GaugeProps {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  unit: string;
  formatVal?: (v: number) => string;
  invertColor?: boolean;
}

function Gauge({ label, icon, current, max, unit, formatVal, invertColor }: GaugeProps) {
  const pct = max > 0 ? clamp((current / max) * 100, 0, 100) : 0;
  const color = getBarColor(pct, invertColor);
  const status = pct > 85 ? 'crit' : pct > 65 ? 'warn' : 'ok';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[var(--space-muted)]">
          <span className={`status-dot status-${status}`} />
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono font-semibold text-[var(--space-text)]">
          {formatVal ? formatVal(current) : current.toFixed(1)}
          <span className="text-[var(--space-muted)] font-normal ml-0.5 text-[10px]">/ {formatVal ? formatVal(max) : max.toFixed(0)} {unit}</span>
        </span>
      </div>
      <div className="gauge-track">
        <div
          className="gauge-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ResourceHUD() {
  const resources = useMissionStore((s) => s.resources);
  const launcher = useMissionStore((s) => s.selectedLauncher);
  const dvBudget = useMissionStore((s) => s.deltaVBudget);

  const massMax = launcher?.payloadToLEO ?? 5000;
  const powerBalance = resources.powerGenerated - resources.continuousPowerDraw;
  const powerStatus = powerBalance >= 0 ? 'ok' : 'crit';

  const formatMass = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(2)}t` : `${v.toFixed(0)}kg`;
  const formatCost = (v: number) => `$${v.toFixed(1)}M`;

  return (
    <div className="panel panel-glow p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--space-muted)]">
          Resource Trade-Off Matrix
        </h2>
        {powerBalance < 0 && (
          <div className="flex items-center gap-1 text-[var(--space-red)] text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Power Deficit
          </div>
        )}
      </div>

      {/* Mass */}
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <Gauge
            label="Total Mass"
            icon={<Weight className="w-3 h-3" />}
            current={resources.totalMass}
            max={massMax}
            unit="kg"
            formatVal={formatMass}
          />
        </div>
        <ConceptTooltip conceptKey="mass" />
      </div>

      {/* Power generated vs peak demand */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[var(--space-muted)]">
            <span className={`status-dot status-${powerStatus}`} />
            <Zap className="w-3 h-3" />
            <span>Power</span>
          </div>
          <span className="font-mono font-semibold text-[var(--space-text)]">
            {resources.powerGenerated.toFixed(0)}W gen
            <span className="text-[var(--space-muted)] font-normal ml-1 text-[10px]">
              / {resources.peakPowerDraw.toFixed(0)}W peak
            </span>
          </span>
        </div>
        <div className="gauge-track">
          <div
            className="gauge-fill"
            style={{
              width: `${resources.peakPowerDraw > 0 ? clamp((resources.powerGenerated / resources.peakPowerDraw) * 100, 0, 100) : 100}%`,
              background: powerBalance >= 0 ? '#22c55e' : '#ef4444',
            }}
          />
        </div>
        <div className="text-[10px] text-right font-mono" style={{ color: powerBalance >= 0 ? '#22c55e' : '#ef4444' }}>
          {powerBalance >= 0 ? '+' : ''}{powerBalance.toFixed(0)}W margin
        </div>
      </div>

      {/* Cost */}
      <Gauge
        label="Mission Cost"
        icon={<DollarSign className="w-3 h-3" />}
        current={resources.totalCost + (launcher?.launchCostM ?? 0)}
        max={500}
        unit="M"
        formatVal={formatCost}
      />

      {/* Data rate vs storage */}
      <Gauge
        label="Data Rate"
        icon={<Wifi className="w-3 h-3" />}
        current={resources.dataRateMbps}
        max={1000}
        unit="Mbps"
        formatVal={(v) => `${v.toFixed(0)} Mbps`}
        invertColor
      />

      {/* Storage */}
      <Gauge
        label="Storage"
        icon={<Database className="w-3 h-3" />}
        current={resources.storageGB}
        max={2000}
        unit="GB"
        formatVal={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(1)} TB` : `${v} GB`}`}
        invertColor
      />

      {/* Delta-V budget */}
      {dvBudget && (
        <div className="border-t border-[var(--space-border)] pt-3 flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-widest text-[var(--space-muted)] mb-1">
            ΔV Budget
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--space-muted)]">Required</span>
            <span className="font-mono">{dvBudget.total.toFixed(0)} m/s</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--space-muted)]">Available</span>
            <span className="font-mono">{dvBudget.available.toFixed(0)} m/s</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Margin</span>
            <span
              className="font-mono"
              style={{ color: dvBudget.feasible ? '#22c55e' : '#ef4444' }}
            >
              {dvBudget.margin >= 0 ? '+' : ''}{dvBudget.margin} m/s
            </span>
          </div>
        </div>
      )}

      {/* Summary row */}
      <div className="border-t border-[var(--space-border)] pt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-[var(--space-muted)]">Dry mass</span>
          <span className="font-mono">{formatMass(resources.dryMass)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--space-muted)]">Propellant</span>
          <span className="font-mono">{formatMass(resources.propellantMass)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--space-muted)]">Reliability</span>
          <span className="font-mono">{(resources.averageReliability * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--space-muted)]">Cont. draw</span>
          <span className="font-mono">{resources.continuousPowerDraw.toFixed(0)}W</span>
        </div>
      </div>
    </div>
  );
}
