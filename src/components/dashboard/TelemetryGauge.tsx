'use client';

import { useMemo } from 'react';

interface TelemetryGaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  decimals?: number;
  threshold?: { warn: number; critical: number };
  history?: number[];
  invertColors?: boolean; // true = low is bad (e.g. fuel)
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function getColor(
  value: number,
  min: number,
  max: number,
  threshold?: { warn: number; critical: number },
  invert?: boolean,
): string {
  if (!threshold) return '#22c55e';
  const { warn, critical } = threshold;
  if (invert) {
    // For fuel/power remaining: low is bad
    const pct = (value - min) / (max - min);
    if (pct > 0.5) return '#22c55e';
    if (pct > 0.2) return '#eab308';
    return '#ef4444';
  }
  if (value < warn) return '#22c55e';
  if (value < critical) return '#eab308';
  return '#ef4444';
}

function Sparkline({ history, min, max }: { history: number[]; min: number; max: number }) {
  const h = 24;
  const w = 100;
  if (history.length < 2) return null;

  const range = max - min || 1;
  const pts = history
    .slice(-30)
    .map((v, i, arr) => {
      const x = (i / (arr.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        points={pts}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TelemetryGauge({
  label,
  value,
  unit,
  min,
  max,
  decimals = 1,
  threshold,
  history,
  invertColors,
}: TelemetryGaugeProps) {
  const pct = useMemo(() => clamp(((value - min) / (max - min)) * 100, 0, 100), [value, min, max]);
  const color = useMemo(
    () => getColor(value, min, max, threshold, invertColors),
    [value, min, max, threshold, invertColors],
  );

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold font-mono" style={{ color }}>
          {value.toFixed(decimals)}
        </span>
        {history && <Sparkline history={history} min={min} max={max} />}
      </div>

      {/* Bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
