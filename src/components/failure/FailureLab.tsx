'use client';

import { useState } from 'react';
import { useMissionStore } from '@/lib/store/useMissionStore';
import type { GameStep } from '@/types';

interface FailureScenario {
  id: string;
  subsystem: string;
  name: string;
  description: string;
  symptoms: string[];
  cause: string;
  fix: string;
  checkVulnerable: (store: ReturnType<typeof useMissionStore.getState>) => boolean;
  fixStep: GameStep;
}

const SCENARIOS: FailureScenario[] = [
  {
    id: 'power',
    subsystem: 'Power',
    name: 'Power Failure',
    description: 'Solar panels generate insufficient power for all subsystems. Batteries deplete, payloads shut down.',
    symptoms: ['Payload shutting down', 'Battery depleting below 20%', 'Science data loss', 'Thermal control failure'],
    cause: 'Power Generated < Peak Duty Cycle Load',
    fix: 'Add more solar panels or reduce payload power draw below power generation capacity',
    checkVulnerable: (s) => s.resources.powerGenerated < s.resources.peakPowerDraw,
    fixStep: 1,
  },
  {
    id: 'mass',
    subsystem: 'Structure',
    name: 'Mass Overrun',
    description: 'Spacecraft wet mass exceeds launch vehicle payload capacity to target orbit, preventing launch.',
    symptoms: ['Launch window missed', 'Mission abort at T-0', 'Vehicle overloaded'],
    cause: 'Total Wet Mass > Launch Vehicle Payload Capacity to Target Orbit',
    fix: 'Remove heavy components, reduce propellant load, or upgrade to a larger launch vehicle',
    checkVulnerable: (s) =>
      !!s.selectedLauncher &&
      s.resources.totalMass > s.selectedLauncher.payloadToLEO,
    fixStep: 2,
  },
  {
    id: 'comms',
    subsystem: 'Communications',
    name: 'Communication Blackout',
    description: 'Science data generation rate exceeds downlink capacity, causing the solid-state storage to overflow.',
    symptoms: ['Data queue overflow', 'Science loss', 'Mission objectives unmet'],
    cause: 'Data Generation Rate (Mbps) > Downlink Capacity',
    fix: 'Upgrade to X-Band or Ka-Band High-Gain Antenna, or reduce science instrument duty cycle',
    checkVulnerable: (s) => s.resources.dataRateMbps > 50 && s.resources.storageGB < 100,
    fixStep: 1,
  },
  {
    id: 'deltav',
    subsystem: 'Propulsion',
    name: 'Insufficient Delta-V',
    description: 'Available propellant mass is insufficient to complete orbit insertion at the target destination.',
    symptoms: ['Missed orbit insertion burn', 'Spacecraft enters hyperbolic trajectory', 'Mission abort'],
    cause: 'Available ΔV < Required ΔV for Target Orbit',
    fix: 'Increase propellant mass, switch to higher Isp engine, or redesign trajectory',
    checkVulnerable: (s) => !!s.deltaVBudget && !s.deltaVBudget.feasible,
    fixStep: 1,
  },
  {
    id: 'thermal',
    subsystem: 'Thermal',
    name: 'Thermal Runaway',
    description: 'Insufficient thermal management for the orbital radiation and thermal environment causes overheating.',
    symptoms: ['Battery cell failure', 'Electronics overtemperature', 'Component damage'],
    cause: 'No thermal radiator installed; waste heat cannot be rejected',
    fix: 'Install passive thermal radiator and ensure MLI blankets cover structure',
    checkVulnerable: (s) =>
      !s.spacecraft.components.some((c) => c.componentId.includes('thermal')),
    fixStep: 1,
  },
];

function CausalChain({ cause }: { cause: string }) {
  const nodes = ['Design Decision', cause, 'Subsystem Failure', 'Mission Failure'];

  return (
    <svg width="100%" height={80} viewBox="0 0 500 80" className="mt-2">
      {nodes.map((label, i) => {
        const x = i * 125 + 10;
        const color = i === nodes.length - 1 ? '#ef4444' : '#1e3a5f';
        const textColor = i === nodes.length - 1 ? '#fca5a5' : '#7dd3fc';
        return (
          <g key={i}>
            <rect x={x} y={20} width={110} height={36} rx={6} fill={color} />
            <text
              x={x + 55}
              y={42}
              textAnchor="middle"
              fill={textColor}
              fontSize={8}
              fontFamily="monospace"
            >
              {label.length > 18 ? label.slice(0, 18) + '…' : label}
            </text>
            {i < nodes.length - 1 && (
              <text x={x + 118} y={42} fill="#475569" fontSize={16}>
                →
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function FailureLab() {
  const store = useMissionStore();
  const { setStep } = store;
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">💥</span>
        <div>
          <h2 className="text-xl font-bold text-white">Mission Failure Lab</h2>
          <p className="text-slate-400 text-sm">
            Explore why real and simulated space missions fail — and how to fix them
          </p>
        </div>
      </div>

      {SCENARIOS.map((scenario) => {
        const isOpen = expanded === scenario.id;
        const vulnerable = scenario.checkVulnerable(store);

        return (
          <div
            key={scenario.id}
            className={`rounded-xl border transition-all ${
              isOpen ? 'border-red-700/50 bg-red-950/10' : 'border-slate-700 bg-slate-900/60'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    vulnerable ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`}
                />
                <div>
                  <span className="font-semibold text-white">{scenario.name}</span>
                  <span className="ml-2 text-xs text-slate-500">· {scenario.subsystem}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    vulnerable
                      ? 'text-red-400 bg-red-900/30 border border-red-700/40'
                      : 'text-green-400 bg-green-900/20 border border-green-700/30'
                  }`}
                >
                  {vulnerable ? '⚠ VULNERABLE' : '✓ PROTECTED'}
                </span>
                <button
                  onClick={() => setExpanded(isOpen ? null : scenario.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-sm text-slate-300 hover:border-red-500 hover:text-red-300 transition-colors"
                >
                  {isOpen ? 'Collapse' : 'Simulate Failure'}
                </button>
              </div>
            </div>

            {/* Expanded panel */}
            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-700/50 mt-2 pt-4 flex flex-col gap-4">
                <p className="text-slate-400 text-sm">{scenario.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Symptoms */}
                  <div>
                    <div className="text-xs font-mono text-slate-500 uppercase mb-2">Symptoms</div>
                    <ul className="flex flex-col gap-1">
                      {scenario.symptoms.map((s) => (
                        <li key={s} className="flex items-center gap-2 text-sm text-red-300">
                          <span className="text-red-500">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fix */}
                  <div>
                    <div className="text-xs font-mono text-slate-500 uppercase mb-2">Resolution</div>
                    <div className="text-sm text-green-300 bg-green-900/10 border border-green-800/30 rounded-lg p-3">
                      {scenario.fix}
                    </div>

                    {vulnerable && (
                      <button
                        onClick={() => setStep(scenario.fixStep)}
                        className="mt-3 w-full py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors"
                      >
                        Fix This → Go to Step {scenario.fixStep + 1}
                      </button>
                    )}
                  </div>
                </div>

                {/* Causal chain */}
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase mb-1">Failure Chain</div>
                  <CausalChain cause={scenario.cause} />
                </div>

                {/* Vulnerability status */}
                <div
                  className={`rounded-lg p-3 border text-sm ${
                    vulnerable
                      ? 'border-red-700/40 bg-red-900/20 text-red-300'
                      : 'border-green-700/30 bg-green-900/10 text-green-300'
                  }`}
                >
                  {vulnerable
                    ? `⚠ Your current design IS vulnerable to ${scenario.name}. ${scenario.cause}.`
                    : `✓ Your current design handles ${scenario.name} correctly.`}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
