'use client';

import { useState } from 'react';

interface ConceptCardProps {
  name: string;
  formula: string;
  explanation: string;
  example: string;
  missionRef: string;
}

const CONCEPTS: Record<string, ConceptCardProps> = {
  mass: {
    name: 'Mass Budget',
    formula: 'm_wet = m_dry + m_propellant',
    explanation: 'The total spacecraft mass must fit within the launch vehicle\'s payload capacity to the target orbit. Wet mass = dry mass (all hardware) + propellant mass.',
    example: 'MRO: 2180 kg total (including 1149 kg propellant)',
    missionRef: 'NASA MRO Mission Design',
  },
  power: {
    name: 'Power Budget',
    formula: 'P_gen > P_peak_load',
    explanation: 'Solar panels must generate enough power to run all subsystems at peak duty cycle. Shortfall causes payload shutdowns.',
    example: 'Curiosity uses 110W RTG — no solar shortfall possible',
    missionRef: 'SMAD §20.4',
  },
  deltav: {
    name: 'Delta-V Budget',
    formula: 'Δv = Isp·g₀·ln(m₀/m_f)',
    explanation: 'ΔV (delta-V) is the change in velocity the spacecraft can achieve with its propellant. Must exceed the sum of all maneuver requirements.',
    example: 'Mars Transfer requires ~5.7 km/s total ΔV from LEO',
    missionRef: 'Curtis §6.1',
  },
  data: {
    name: 'Data Rate Budget',
    formula: 'Rate_gen < Downlink_capacity',
    explanation: 'Science instruments generate data faster than a comm link can downlink it. Storage buffers the difference — when full, science data is lost.',
    example: 'MRO downlinks 100 Gbits/day via Ka-Band at 5.235 GHz',
    missionRef: 'NASA DSN Telecommunications',
  },
  cost: {
    name: 'Mission Cost',
    formula: 'C_total = Σ(C_component) + C_launch',
    explanation: 'Total mission cost is the sum of all component costs plus the launch vehicle price. NASA missions typically cost $100M–$10B.',
    example: 'JWST: $10B total lifecycle cost',
    missionRef: 'NASA Cost Estimating Handbook',
  },
};

export default function ConceptTooltip({ conceptKey }: { conceptKey: keyof typeof CONCEPTS }) {
  const [open, setOpen] = useState(false);
  const concept = CONCEPTS[conceptKey];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 hover:bg-cyan-800 hover:text-cyan-300 text-[9px] font-bold flex items-center justify-center transition-colors"
        title={`Learn about ${concept.name}`}
        aria-label={`Concept: ${concept.name}`}
      >
        ?
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Card */}
          <div className="absolute left-6 top-0 z-50 w-72 rounded-xl border border-cyan-700/50 bg-slate-900/95 shadow-xl backdrop-blur-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{concept.name}</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>

            <div className="font-mono text-sm text-cyan-300 bg-slate-950/60 rounded px-3 py-2 border border-slate-800">
              {concept.formula}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{concept.explanation}</p>

            <div className="text-xs text-slate-500 italic border-t border-slate-800 pt-2">
              <span className="text-slate-400 not-italic">Example: </span>{concept.example}
            </div>

            <div className="text-[10px] text-slate-600">Source: {concept.missionRef}</div>
          </div>
        </>
      )}
    </div>
  );
}

export { CONCEPTS };
