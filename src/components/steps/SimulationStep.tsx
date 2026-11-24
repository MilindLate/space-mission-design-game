'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useMissionStore } from '@/lib/store/useMissionStore';
import {
  Play, FastForward, ChevronLeft,
  AlertTriangle, CheckCircle2, Zap, Radio, Clock, Flag, Rocket, Shield,
} from 'lucide-react';
import type { MissionEvent } from '@/types';

// OrbitScene uses Three.js — SSR must be disabled
const OrbitScene = dynamic(() => import('@/components/3d/OrbitScene'), { ssr: false });

const SEVERITY_STYLES: Record<MissionEvent['severity'], { border: string; icon: string; bg: string }> = {
  info:     { border: 'border-cyan-500/40',  icon: '#0ea5e9', bg: 'bg-cyan-500/5' },
  warning:  { border: 'border-yellow-500/50', icon: '#eab308', bg: 'bg-yellow-500/5' },
  critical: { border: 'border-red-500/60 alert-pulse', icon: '#ef4444', bg: 'bg-red-500/5' },
};

function EventCard({ event, onResolve }: { event: MissionEvent; onResolve: () => void }) {
  const style = SEVERITY_STYLES[event.severity];
  return (
    <div className={`panel p-3 ${style.border} ${style.bg} flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: style.icon }} />
          <span className="text-xs font-bold text-white">{event.title}</span>
        </div>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full border shrink-0 capitalize font-bold"
          style={{ color: style.icon, borderColor: `${style.icon}50`, background: `${style.icon}15` }}
        >
          {event.severity}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed">{event.message}</p>
      <div className="text-[10px] text-cyan-400 bg-cyan-500/10 rounded-lg px-2.5 py-1.5 border border-cyan-500/20">
        ⚡ Action required: {event.requiredAction}
      </div>
      {event.penaltyPoints > 0 && (
        <div className="text-[10px] text-slate-500">
          Unresolved penalty: <span className="text-red-400 font-bold">-{event.penaltyPoints}pts</span>
        </div>
      )}
      <button
        onClick={onResolve}
        className="btn-primary text-xs py-2 mt-1 flex items-center justify-center gap-1.5"
      >
        <CheckCircle2 className="w-3 h-3" />
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
      {/* Mission elapsed time */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Mission Elapsed Time</span>
          </div>
          <span className="font-mono text-xs text-white font-bold">
            T+{elapsedDays}d / {totalDays}d
          </span>
        </div>
        <div className="gauge-track mb-1">
          <div
            className="gauge-fill"
            style={{ width: `${pctComplete}%`, background: 'linear-gradient(90deg, #0ea5e9, #3b82f6)' }}
          />
        </div>
        <div className="text-right text-[10px] text-slate-500 font-mono">{pctComplete.toFixed(1)}% complete</div>
      </div>

      {/* Science yield */}
      <div className="panel p-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-green-400" /> Science Yield
          </span>
          <span className="font-mono font-bold text-green-400">
            {sim.scienceYield.toFixed(1)}%
          </span>
        </div>
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${sim.scienceYield}%`, background: 'linear-gradient(90deg, #22c55e, #10b981)' }} />
        </div>
      </div>

      {/* Power health */}
      <div className="panel p-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-400" /> Power Health
          </span>
          <span
            className="font-mono font-bold"
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
      <div className="panel p-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2.5">
          <FastForward className="w-3 h-3 inline mr-1.5" />
          Simulation Speed
        </div>
        <div className="flex gap-2">
          {([1, 10, 100] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setSimSpeed(speed)}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border-2 transition-all duration-300
                ${sim.speedMultiplier === speed
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
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
          <div className="text-[10px] uppercase tracking-widest text-red-400 flex items-center gap-1.5 font-bold">
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
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">
            Resolved Events
          </div>
          <div className="flex flex-col gap-1">
            {sim.resolvedEvents.map((evt) => (
              <div key={evt.id} className="flex items-center gap-2 text-[10px] text-slate-500">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                <span className="line-through">{evt.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End mission */}
      {sim.running && (
        <button
          onClick={endSimulation}
          className="btn-danger text-xs flex items-center justify-center gap-2 mt-auto"
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
      {/* Briefing header */}
      <div className="panel p-6 bg-gradient-to-r from-green-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-green-500/70 uppercase tracking-[0.2em] mb-3">
              <div className="w-6 h-px bg-green-500/30" />
              STEP 4 OF 4 · MISSION SIMULATION
            </div>
            <h2 className="text-2xl font-black text-white mb-1">{destination.name} — Live Simulation</h2>
            <p className="text-sm text-slate-400">
              Real Keplerian mechanics · Resolve anomalies to maximize science yield
            </p>
          </div>
          {!simulation.running && !simulation.completed && !simulation.failed && (
            <button onClick={startSimulation} className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              <Rocket className="w-5 h-5" />
              LAUNCH
            </button>
          )}
        </div>
      </div>

      {/* Main layout: 3D canvas + HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '560px' }}>
        {/* 3D Orbit canvas */}
        <div className="lg:col-span-2 h-[560px] orbit-canvas-container">
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
          <span className="flex items-center gap-2">
            <span
              className={`status-dot ${simulation.running ? 'status-ok animate-pulse' : simulation.failed ? 'status-crit' : 'status-warn'}`}
            />
            <span className="font-bold text-white">
              {simulation.running ? 'NOMINAL' : simulation.failed ? 'MISSION FAILED' : simulation.completed ? 'MISSION COMPLETE' : 'STANDBY'}
            </span>
          </span>
          <span className="text-slate-500 font-mono">
            Speed: {simulation.speedMultiplier}× · Events: {simulation.events.length} active
          </span>
        </div>
        <button onClick={() => setStep(2)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>
    </div>
  );
}
