'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMissionStore } from '@/lib/store/useMissionStore';
import {
  Play, Pause, FastForward, ChevronLeft,
  AlertTriangle, CheckCircle2, Zap, Radio, Clock, Flag,
} from 'lucide-react';
import type { MissionEvent } from '@/types';

// OrbitScene uses Three.js — SSR must be disabled
const OrbitScene = dynamic(() => import('@/components/3d/OrbitScene'), { ssr: false });

const SEVERITY_STYLES: Record<MissionEvent['severity'], { border: string; icon: string }> = {
  info:     { border: 'border-[var(--space-accent)]/40',  icon: '#0ea5e9' },
  warning:  { border: 'border-[var(--space-yellow)]/50',  icon: '#eab308' },
  critical: { border: 'border-[var(--space-red)]/60 alert-pulse', icon: '#ef4444' },
};

function EventCard({ event, onResolve }: { event: MissionEvent; onResolve: () => void }) {
  const style = SEVERITY_STYLES[event.severity];
  return (
    <div className={`panel p-3 ${style.border} flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: style.icon }} />
          <span className="text-xs font-bold text-[var(--space-text)]">{event.title}</span>
        </div>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 capitalize"
          style={{ color: style.icon, borderColor: `${style.icon}50` }}
        >
          {event.severity}
        </span>
      </div>
      <p className="text-[10px] text-[var(--space-muted)] leading-relaxed">{event.message}</p>
      <div className="text-[10px] text-[var(--space-accent)] bg-[var(--space-accent)]/10 rounded px-2 py-1">
        Action required: {event.requiredAction}
      </div>
      {event.penaltyPoints > 0 && (
        <div className="text-[10px] text-[var(--space-muted)]">
          Unresolved penalty: <span className="text-[var(--space-red)]">-{event.penaltyPoints}pts</span>
        </div>
      )}
      <button
        onClick={onResolve}
        className="btn-primary text-xs py-1.5 mt-1"
      >
        <CheckCircle2 className="w-3 h-3 inline mr-1" />
        Acknowledge & Resolve
      </button>
    </div>
  );
}

function SimulationHUD() {
  const sim = useMissionStore((s) => s.simulation);
  const resources = useMissionStore((s) => s.resources);
  const destination = useMissionStore((s) => s.mission.destination);
  const setSimSpeed = useMissionStore((s) => s.setSimSpeed);
  const startSimulation = useMissionStore((s) => s.startSimulation);
  const endSimulation = useMissionStore((s) => s.endSimulation);
  const resolveEvent = useMissionStore((s) => s.resolveEvent);

  const pctComplete = sim.totalDurationSeconds > 0
    ? Math.min((sim.elapsedSeconds / sim.totalDurationSeconds) * 100, 100)
    : 0;

  const elapsedDays = Math.floor(sim.elapsedSeconds / 86400);
  const totalDays = Math.floor(sim.totalDurationSeconds / 86400);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Time & progress */}
      <div className="panel p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-[var(--space-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Mission Elapsed Time</span>
          </div>
          <span className="font-mono text-xs text-[var(--space-text)]">
            T+{elapsedDays}d / {totalDays}d
          </span>
        </div>
        <div className="gauge-track mb-2">
          <div
            className="gauge-fill"
            style={{ width: `${pctComplete}%`, background: 'var(--space-accent)' }}
          />
        </div>
        <div className="text-right text-[10px] text-[var(--space-muted)]">{pctComplete.toFixed(1)}% complete</div>
      </div>

      {/* Science yield */}
      <div className="panel p-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--space-muted)] flex items-center gap-1">
            <Radio className="w-3 h-3" /> Science Yield
          </span>
          <span className="font-mono font-semibold text-[var(--space-green)]">
            {sim.scienceYield.toFixed(1)}%
          </span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${sim.scienceYield}%`, background: '#22c55e' }} />
        </div>
      </div>

      {/* Power health */}
      <div className="panel p-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--space-muted)] flex items-center gap-1">
            <Zap className="w-3 h-3" /> Power Health
          </span>
          <span
            className="font-mono font-semibold"
            style={{ color: sim.powerHealth > 50 ? '#22c55e' : sim.powerHealth > 20 ? '#eab308' : '#ef4444' }}
          >
            {sim.powerHealth.toFixed(0)}%
          </span>
        </div>
        <div className="gauge-track">
          <div
            className="gauge-fill"
            style={{
              width: `${sim.powerHealth}%`,
              background: sim.powerHealth > 50 ? '#22c55e' : sim.powerHealth > 20 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Speed controls */}
      <div className="panel p-3">
        <div className="text-[10px] uppercase tracking-widest text-[var(--space-muted)] mb-2">Simulation Speed</div>
        <div className="flex gap-2">
          {([1, 10, 100] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setSimSpeed(speed)}
              className={`flex-1 py-1.5 rounded text-xs font-mono font-semibold border transition-colors
                ${sim.speedMultiplier === speed
                  ? 'bg-[var(--space-accent)] border-[var(--space-accent)] text-white'
                  : 'border-[var(--space-border)] text-[var(--space-muted)] hover:border-[var(--space-accent)]'
                }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      {/* Active events */}
      {sim.events.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-widest text-[var(--space-red)] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Active Anomalies ({sim.events.length})
          </div>
          {sim.events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              onResolve={() => resolveEvent(evt.id)}
            />
          ))}
        </div>
      )}

      {/* Resolved events log */}
      {sim.resolvedEvents.length > 0 && (
        <div className="panel p-3">
          <div className="text-[10px] uppercase tracking-widest text-[var(--space-muted)] mb-2">
            Resolved Events
          </div>
          <div className="flex flex-col gap-1">
            {sim.resolvedEvents.map((evt) => (
              <div key={evt.id} className="flex items-center gap-2 text-[10px] text-[var(--space-muted)]">
                <CheckCircle2 className="w-3 h-3 text-[var(--space-green)] shrink-0" />
                {evt.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End mission */}
      {sim.running && (
        <button
          onClick={endSimulation}
          className="btn-ghost text-xs flex items-center justify-center gap-2 mt-auto"
        >
          <Flag className="w-3.5 h-3.5" />
          End Mission Early
        </button>
      )}

      {(sim.completed || sim.failed) && (
        <button
          onClick={endSimulation}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Flag className="w-4 h-4" />
          {sim.failed ? 'View Failure Report' : 'View Mission Report'}
        </button>
      )}
    </div>
  );
}

export default function SimulationStep() {
  const setStep = useMissionStore((s) => s.setStep);
  const startSimulation = useMissionStore((s) => s.startSimulation);
  const tickSimulation = useMissionStore((s) => s.tickSimulation);
  const simulation = useMissionStore((s) => s.simulation);
  const destination = useMissionStore((s) => s.mission.destination);
  const spacecraft = useMissionStore((s) => s.spacecraft);

  const hasSolarPanels = spacecraft.components.some((e) => e.componentId.startsWith('solar_'));
  const hasHighGainAntenna = spacecraft.components.some(
    (e) => e.componentId === 'comms_xband' || e.componentId === 'comms_kaband'
  );

  // Simulation tick loop — 60fps, real-dt based
  const lastRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!simulation.running) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    function tick(now: number) {
      const dt = lastRef.current ? Math.min((now - lastRef.current) / 1000, 0.1) : 0.016;
      lastRef.current = now;
      tickSimulation(dt);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [simulation.running, tickSimulation]);

  if (!destination) return null;

  return (
    <div className="flex flex-col gap-4 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--space-text)] mb-1">Mission Simulation</h2>
          <p className="text-sm text-[var(--space-muted)]">
            {destination.name} — Live orbital simulation with real Keplerian mechanics
          </p>
        </div>
        {!simulation.running && !simulation.completed && !simulation.failed && (
          <button onClick={startSimulation} className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" />
            Launch Mission
          </button>
        )}
      </div>

      {/* Main layout: 3D canvas + HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '560px' }}>
        {/* 3D Orbit canvas */}
        <div className="lg:col-span-2 h-[560px] rounded-xl overflow-hidden">
          <OrbitScene
            destination={destination}
            simulation={simulation}
            hasSolarPanels={hasSolarPanels}
            hasHighGainAntenna={hasHighGainAntenna}
          />
        </div>

        {/* Telemetry HUD panel */}
        <div className="h-[560px]">
          <SimulationHUD />
        </div>
      </div>

      {/* Status bar */}
      <div className="panel p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className={`status-dot ${simulation.running ? 'status-ok animate-pulse' : simulation.failed ? 'status-crit' : 'status-warn'}`}
            />
            {simulation.running ? 'NOMINAL' : simulation.failed ? 'MISSION FAILED' : simulation.completed ? 'MISSION COMPLETE' : 'STANDBY'}
          </span>
          <span className="text-[var(--space-muted)]">
            Speed: {simulation.speedMultiplier}× | Events: {simulation.events.length} active
          </span>
        </div>
        <button onClick={() => setStep(2)} className="btn-ghost py-1 px-3 text-xs flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>
    </div>
  );
}
