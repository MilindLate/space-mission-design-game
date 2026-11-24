'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';
import {
  Trophy, AlertTriangle, CheckCircle2, XCircle,
  Clock, Rocket, BarChart3, Zap, Database, DollarSign, RotateCcw, Star,
} from 'lucide-react';

const GRADE_STYLES: Record<string, { color: string; label: string; glow: string }> = {
  S: { color: '#fbbf24', label: 'Outstanding', glow: 'rgba(251,191,36,0.3)' },
  A: { color: '#22c55e', label: 'Excellent', glow: 'rgba(34,197,94,0.3)' },
  B: { color: '#0ea5e9', label: 'Good', glow: 'rgba(14,165,233,0.3)' },
  C: { color: '#eab308', label: 'Marginal', glow: 'rgba(234,179,8,0.3)' },
  F: { color: '#ef4444', label: 'Mission Failed', glow: 'rgba(239,68,68,0.3)' },
};

function StatRow({ label, value, unit, icon }: { label: string; value: string | number; unit?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-2.5 border-b border-slate-800/60 last:border-0">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-mono font-bold text-white">
        {value}{unit && <span className="text-slate-500 font-normal ml-1 text-xs">{unit}</span>}
      </span>
    </div>
  );
}

function AnimatedProgressBar({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="gauge-track">
        <div
          className="gauge-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            animationDelay: `${delay}ms`,
          }}
        />
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
      <div className="panel p-8 text-center flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(ellipse at center, ${grade.color}30 0%, transparent 70%)` }}
        />

        {/* Mission name */}
        <div className="flex items-center gap-3 relative">
          <Trophy className="w-7 h-7" style={{ color: grade.color }} />
          <h2 className="text-2xl font-black text-white">{report.missionName}</h2>
        </div>

        {/* Grade circle with score-reveal animation */}
        <div
          className="w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center score-reveal relative"
          style={{
            borderColor: grade.color,
            boxShadow: `0 0 40px ${grade.glow}, 0 0 80px ${grade.glow}`,
          }}
        >
          <span className="text-6xl font-black" style={{ color: grade.color }}>{report.grade}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{grade.label}</span>
        </div>

        {/* Score */}
        <div className="text-5xl font-black text-white count-pulse relative">
          {report.finalScore}
          <span className="text-xl text-slate-500 font-normal ml-2">/ 100</span>
        </div>

        {/* XP earned */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">+{report.finalScore * 10} XP Earned</span>
        </div>

        {report.failureTree && (
          <div className="w-full flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl p-4 relative">
            <XCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{report.failureTree[0]}</span>
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div className="panel p-6 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          Performance Breakdown
        </h3>
        <AnimatedProgressBar label="Mission Completion" pct={report.missionCompletionPct} color="#0ea5e9" delay={0} />
        <AnimatedProgressBar label="Mass Efficiency" pct={report.massEfficiencyPct} color="#22c55e" delay={200} />
        <AnimatedProgressBar label="Budget Efficiency" pct={report.budgetEfficiencyPct} color="#a855f7" delay={400} />
      </div>

      {/* Stats */}
      <div className="panel p-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          Mission Statistics
        </h3>
        <StatRow label="Destination" value={report.destination} icon={<Rocket className="w-3.5 h-3.5 text-cyan-400" />} />
        <StatRow label="Duration" value={report.duration} unit="months" icon={<Clock className="w-3.5 h-3.5 text-blue-400" />} />
        <StatRow label="Launch Vehicle" value={report.launchVehicle} icon={<Rocket className="w-3.5 h-3.5 text-orange-400" />} />
        <StatRow label="Scientific Data Returned" value={report.scientificDataGB} unit="GB" icon={<Database className="w-3.5 h-3.5 text-green-400" />} />
        <StatRow label="Events Resolved" value={`${report.eventsResolved} / ${report.eventsResolved + report.eventsMissed}`} icon={<CheckCircle2 className="w-3.5 h-3.5 text-green-400" />} />
        <StatRow label="Penalty Points" value={`-${report.penaltyPoints}`} icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400" />} />
      </div>

      {/* Failure tree */}
      {report.failureTree && report.failureTree.length > 0 && (
        <div className="panel p-6 border-red-500/30">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-red-400 mb-4 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5" />
            Root-Cause Failure Tree
          </h3>
          <ul className="flex flex-col gap-3">
            {report.failureTree.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-red-500 mt-0.5 shrink-0 font-mono text-xs">
                  {i === 0 ? '✖' : '↳'}
                </span>
                <span className="text-slate-400 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mission timeline */}
      <div className="panel p-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Mission Timeline
        </h3>
        <div className="flex flex-col gap-4 relative">
          {/* Timeline line */}
          <div className="absolute left-[30px] top-0 bottom-0 w-px bg-slate-800" />
          {report.timeline.map((entry, i) => (
            <div key={i} className="flex gap-4 text-sm relative">
              <span className="font-mono text-cyan-500 shrink-0 w-14 text-[11px] text-right">{entry.time}</span>
              <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0 relative z-10" style={{ boxShadow: '0 0 8px rgba(14,165,233,0.5)' }} />
              <div className="flex flex-col gap-0.5 pb-2">
                <span className="font-semibold text-white">{entry.event}</span>
                <span className="text-xs text-slate-500">{entry.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Play again */}
      <button onClick={resetMission} className="btn-primary flex items-center justify-center gap-2 text-lg py-4">
        <RotateCcw className="w-5 h-5" />
        Design New Mission
      </button>
    </div>
  );
}
