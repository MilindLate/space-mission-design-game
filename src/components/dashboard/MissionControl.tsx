'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import { useMissionStore } from '@/lib/store/useMissionStore';
import TelemetryGauge from './TelemetryGauge';
import EventLog, { type LogEntry } from './EventLog';
import { visViva, GM } from '@/lib/physics/visviva';

const OrbitScene = dynamic(() => import('@/components/3d/OrbitScene'), { ssr: false }) as React.ComponentType<{
  destination: import('@/types').OrbitalDestination;
  simulation: import('@/types').SimulationState;
  hasSolarPanels?: boolean;
  hasHighGainAntenna?: boolean;
}>;

function formatMET(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type SubsystemKey = 'Power' | 'Propulsion' | 'Comms' | 'Thermal' | 'Payload' | 'GNC';

const SUBSYSTEM_EVENT_MAP: Record<SubsystemKey, string[]> = {
  Power:     ['solar_particle_event', 'battery_fault'],
  Propulsion:['thruster_anomaly'],
  Comms:     ['comms_blackout'],
  Thermal:   ['solar_particle_event'],
  Payload:   ['sensor_degradation', 'micrometeorite_impact'],
  GNC:       ['micrometeorite_impact', 'thruster_anomaly'],
};

export default function MissionControl() {
  const { simulation, mission, resources, deltaVBudget } = useMissionStore();

  const destination = mission.destination;
  const smaKm = destination?.semiMajorAxis ?? 6771;
  const mu = destination?.centralBody === 'Mars' ? GM.Mars
           : destination?.centralBody === 'Moon' ? GM.Moon
           : GM.Earth;

  // Orbital velocity at target orbit (km/s)
  const orbitalVelocity = useMemo(() => visViva(mu, smaKm, smaKm), [mu, smaKm]);

  // Altitude above body surface (km)
  const bodyRadii: Record<string, number> = { Earth: 6371, Moon: 1737, Mars: 3390, Sun: 695700 };
  const bodyRadius = bodyRadii[destination?.centralBody ?? 'Earth'] ?? 6371;
  const altitudeKm = smaKm - bodyRadius;

  // Fuel remaining %
  const propUsedFraction = simulation.elapsedSeconds / Math.max(simulation.totalDurationSeconds, 1);
  const fuelRemainingPct = Math.max(0, (1 - propUsedFraction * 0.4) * 100);

  // Data stored GB
  const dataGB = (simulation.scienceYield / 100) * resources.storageGB;

  // Subsystem health
  const activeEventTypes = simulation.events
    .filter((e) => !e.resolved)
    .map((e) => e.type);

  function subsystemStatus(key: SubsystemKey): 'GREEN' | 'YELLOW' | 'RED' {
    const affectingTypes = SUBSYSTEM_EVENT_MAP[key];
    const critical = simulation.events.find(
      (e) => !e.resolved && affectingTypes.includes(e.type) && e.severity === 'critical',
    );
    const warning = simulation.events.find(
      (e) => !e.resolved && affectingTypes.includes(e.type),
    );
    if (critical) return 'RED';
    if (warning) return 'YELLOW';
    return 'GREEN';
  }

  const subsystems: SubsystemKey[] = ['Power', 'Propulsion', 'Comms', 'Thermal', 'Payload', 'GNC'];
  const statusColors = { GREEN: '#22c55e', YELLOW: '#eab308', RED: '#ef4444' };

  // Build EventLog entries from mission events
  const logEntries: LogEntry[] = [
    ...simulation.resolvedEvents.map((e) => ({
      id: e.id,
      time: e.firedAt,
      message: e.title + ': ' + e.message,
      type: 'success' as LogEntry['type'],
      resolved: true,
    })),
    ...simulation.events.map((e) => ({
      id: e.id + '_active',
      time: e.firedAt,
      message: e.title + ': ' + e.message,
      type: (e.severity === 'critical' ? 'critical' : e.severity === 'warning' ? 'warning' : 'info') as LogEntry['type'],
      resolved: false,
    })),
  ].sort((a, b) => a.time - b.time);

  // Mission phase
  const pct = simulation.totalDurationSeconds > 0
    ? simulation.elapsedSeconds / simulation.totalDurationSeconds
    : 0;
  const phase = pct < 0.1 ? 'LAUNCH' : pct < 0.3 ? 'CRUISE' : pct < 0.8 ? 'OPERATIONS' : 'END OF MISSION';

  // Unused variable suppression
  void activeEventTypes;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '48px 1fr 160px',
        gridTemplateColumns: '224px 1fr 256px',
        height: '100vh',
        width: '100%',
        background: '#050a14',
        color: 'white',
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}
    >
      {/* ── Top bar ─── span all columns */}
      <div
        style={{
          gridColumn: '1 / -1',
          gridRow: '1 / 2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>MET</span>
          <span style={{ color: '#22d3ee', fontSize: '18px', fontWeight: 'bold' }}>
            {formatMET(simulation.elapsedSeconds)}
          </span>
        </div>
        <span
          style={{
            padding: '2px 12px',
            borderRadius: '4px',
            background: '#1e3a5f',
            color: '#7dd3fc',
            fontSize: '11px',
            letterSpacing: '2px',
          }}
        >
          {phase}
        </span>
        <div style={{ color: '#475569', fontSize: '11px' }}>
          {destination?.name ?? 'No destination'} · {simulation.speedMultiplier}× speed
        </div>
      </div>

      {/* ── Left: Subsystem status ─── */}
      <div
        style={{
          gridColumn: '1 / 2',
          gridRow: '2 / 3',
          borderRight: '1px solid #1e293b',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Subsystem Status
        </div>
        {subsystems.map((sys) => {
          const st = subsystemStatus(sys);
          return (
            <div key={sys} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: statusColors[st],
                  boxShadow: `0 0 6px ${statusColors[st]}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#e2e8f0', fontSize: '12px' }}>{sys}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  color: statusColors[st],
                }}
              >
                {st}
              </span>
            </div>
          );
        })}

        {/* Score preview */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
            Score Preview
          </div>
          <div style={{ color: '#22d3ee', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
            {Math.round(
              100 -
              simulation.penaltyTotal * 0.1 +
              simulation.scienceYield * 0.3 +
              (pct * 100) * 0.2,
            ).toFixed(0)}
          </div>
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '10px' }}>/ 100</div>
        </div>
      </div>

      {/* ── Center: 3D Orbit ─── */}
      <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', position: 'relative' }}>
        {destination && (
          <OrbitScene
            destination={destination}
            simulation={simulation}
            hasSolarPanels
            hasHighGainAntenna={false}
          />
        )}
        {!destination && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontFamily: 'monospace', fontSize: '12px' }}>
            No destination selected
          </div>
        )}
      </div>

      {/* ── Right: Telemetry ─── */}
      <div
        style={{
          gridColumn: '3 / 4',
          gridRow: '2 / 3',
          borderLeft: '1px solid #1e293b',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Telemetry
        </div>

        <TelemetryGauge
          label="Altitude"
          value={altitudeKm}
          unit="km"
          min={0}
          max={altitudeKm * 2}
          decimals={0}
        />

        <TelemetryGauge
          label="Orbital Velocity"
          value={orbitalVelocity}
          unit="km/s"
          min={0}
          max={orbitalVelocity * 1.5}
          decimals={2}
        />

        <TelemetryGauge
          label="Fuel Remaining"
          value={fuelRemainingPct}
          unit="%"
          min={0}
          max={100}
          decimals={1}
          threshold={{ warn: 50, critical: 20 }}
          invertColors
        />

        <TelemetryGauge
          label="Data Stored"
          value={dataGB}
          unit="GB"
          min={0}
          max={resources.storageGB}
          decimals={1}
          threshold={{ warn: resources.storageGB * 0.8, critical: resources.storageGB * 0.95 }}
        />

        {/* ΔV Budget */}
        {deltaVBudget && (
          <div
            style={{
              background: 'rgba(5,10,20,0.6)',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
            }}
          >
            <div style={{ color: '#475569', marginBottom: '8px', textTransform: 'uppercase', fontSize: '10px' }}>
              ΔV Budget
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Required</span>
              <span style={{ color: '#fca5a5' }}>{(deltaVBudget.total / 1000).toFixed(2)} km/s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Available</span>
              <span style={{ color: deltaVBudget.feasible ? '#86efac' : '#fca5a5' }}>
                {(deltaVBudget.available / 1000).toFixed(2)} km/s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom: Event Log ─── span all columns */}
      <div style={{ gridColumn: '1 / -1', gridRow: '3 / 4' }}>
        <EventLog events={logEntries} />
      </div>
    </div>
  );
}
