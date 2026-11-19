'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import {
  Trophy, AlertTriangle, CheckCircle2, XCircle,
  Clock, Rocket, BarChart3, Zap, Database, DollarSign, RotateCcw,
} from 'lucide-react';

const GRADE_STYLES: Record<string, { color: string; label: string }> = {
  S: { color: '#a855f7', label: 'Outstanding' },
  A: { color: '#22c55e', label: 'Excellent' },
  B: { color: '#0ea5e9', label: 'Good' },
  C: { color: '#eab308', label: 'Marginal' },
  F: { color: '#ef4444', label: 'Mission Failed' },
};

function StatRow({ label, value, unit, icon }: { label: string; value: string | number; unit?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 border-b border-[var(--space-border)] last:border-0">
      <div className="flex items-center gap-2 text-[var(--space-muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-mono font-semibold text-[var(--space-text)]">
        {value}{unit && <span className="text-[var(--space-muted)] font-normal ml-1 text-xs">{unit}</span>}
      </span>
    </div>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--space-muted)]">{label}</span>
        <span className="font-mono font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function MissionReport() {
  const report = useMissionStore((s) => s.report);
  const resetMission = useMissionStore((s) => s.resetMission);

  if (!report) return null;

  const grade = GRADE_STYLES[report.grade];

  return (
    <div className="max-w-2xl mx-auto w-full fade-up flex flex-col gap-6">
      {/* Header score card */}
      <div className="panel panel-glow p-6 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6" style={{ color: grade.color }} />
          <h2 className="text-xl font-bold text-[var(--space-text)]">{report.missionName}</h2>
        </div>

        {/* Grade circle */}
        <div
          className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center"
          style={{ borderColor: grade.color, boxShadow: `0 0 32px ${grade.color}60` }}
        >
          <span className="text-5xl font-black" style={{ color: grade.color }}>{report.grade}</span>
          <span className="text-xs text-[var(--space-muted)]">{grade.label}</span>
        </div>

        <div className="text-4xl font-black text-[var(--space-text)]">
          {report.finalScore}
          <span className="text-lg text-[var(--space-muted)] font-normal ml-1">/ 100</span>
        </div>

        {report.failureTree && (
          <div className="w-full flex items-center gap-2 text-[var(--space-red)] text-sm bg-[var(--space-red)]/10 border border-[var(--space-red)]/30 rounded-lg p-3">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{report.failureTree[0]}</span>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div className="panel p-5 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--space-muted)]">
          Performance Breakdown
        </h3>
        <ProgressBar label="Mission Completion" pct={report.missionCompletionPct} color="#0ea5e9" />
        <ProgressBar label="Mass Efficiency" pct={report.massEfficiencyPct} color="#22c55e" />
        <ProgressBar label="Budget Efficiency" pct={report.budgetEfficiencyPct} color="#a855f7" />
      </div>

      {/* Stats */}
      <div className="panel p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--space-muted)] mb-2">
          Mission Statistics
        </h3>
        <StatRow label="Destination" value={report.destination} icon={<Rocket className="w-3.5 h-3.5" />} />
        <StatRow label="Duration" value={report.duration} unit="months" icon={<Clock className="w-3.5 h-3.5" />} />
        <StatRow label="Launch Vehicle" value={report.launchVehicle} icon={<Rocket className="w-3.5 h-3.5" />} />
        <StatRow label="Scientific Data Returned" value={report.scientificDataGB} unit="GB" icon={<Database className="w-3.5 h-3.5" />} />
        <StatRow label="Events Resolved" value={`${report.eventsResolved} / ${report.eventsResolved + report.eventsMissed}`} icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
        <StatRow label="Penalty Points" value={`-${report.penaltyPoints}`} icon={<AlertTriangle className="w-3.5 h-3.5" />} />
      </div>

      {/* Failure tree */}
      {report.failureTree && report.failureTree.length > 0 && (
        <div className="panel p-5 border-[var(--space-red)]/40">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--space-red)] mb-3 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5" /> Root-Cause Failure Tree
          </h3>
          <ul className="flex flex-col gap-2">
            {report.failureTree.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[var(--space-red)] mt-0.5 shrink-0">↳</span>
                <span className="text-[var(--space-muted)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mission timeline */}
      <div className="panel p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--space-muted)] mb-3">
          Mission Timeline
        </h3>
        <div className="flex flex-col gap-3">
          {report.timeline.map((entry, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-[var(--space-accent)] shrink-0 w-16 text-xs">{entry.time}</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-[var(--space-text)]">{entry.event}</span>
                <span className="text-xs text-[var(--space-muted)]">{entry.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Play again */}
      <button onClick={resetMission} className="btn-primary flex items-center justify-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Design New Mission
      </button>
    </div>
  );
}
