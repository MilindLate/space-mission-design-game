'use client';

import { useState, useMemo } from 'react';
import { useMissionStore } from '@/lib/store/useMissionStore';
import { hohmannTransfer, visViva, escapeVelocity, c3Energy, GM } from '@/lib/physics/visviva';
import FormulaCard from './FormulaCard';

// Earth surface = 6371 km; LEO at ~400 km = 6771 km radius
const EARTH_RADIUS_KM = 6371;
const DEFAULT_LEO_KM = 6771;

function TransferDiagram({
  r1: r1Km,
  r2: r2Km,
}: {
  r1: number;
  r2: number;
}) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const scale = (cx - 20) / Math.max(r1Km, r2Km);

  const r1 = r1Km * scale;
  const r2 = r2Km * scale;
  const at = ((r1Km + r2Km) / 2) * scale; // transfer ellipse semi-major
  const bt = Math.sqrt(r1 * r2);           // approx semi-minor (geometric mean)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="bg-slate-950/60 rounded-xl border border-slate-800"
    >
      {/* Central body */}
      <circle cx={cx} cy={cy} r={6} fill="#ffe57a" />

      {/* Source orbit */}
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke="#22d3ee" strokeWidth={1.5} opacity={0.7} />

      {/* Target orbit */}
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke="#f97316" strokeWidth={1.5} opacity={0.7} />

      {/* Transfer ellipse (half arc) — approximate as ellipse */}
      <ellipse
        cx={cx - (at - r1) / 2}
        cy={cy}
        rx={at}
        ry={bt}
        fill="none"
        stroke="#a855f7"
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.8}
      />

      {/* Burn 1 marker (periapsis) */}
      <circle cx={cx + r1} cy={cy} r={4} fill="#22d3ee" />
      <text x={cx + r1 + 6} y={cy - 6} fill="#22d3ee" fontSize="9" fontFamily="monospace">
        Δv₁
      </text>

      {/* Burn 2 marker (apoapsis) */}
      <circle cx={cx - r2} cy={cy} r={4} fill="#f97316" />
      <text x={cx - r2 - 22} y={cy - 6} fill="#f97316" fontSize="9" fontFamily="monospace">
        Δv₂
      </text>

      {/* Legend */}
      <text x={8} y={size - 24} fill="#22d3ee" fontSize="8" fontFamily="monospace">── Source orbit</text>
      <text x={8} y={size - 14} fill="#f97316" fontSize="8" fontFamily="monospace">── Target orbit</text>
      <text x={8} y={size - 4} fill="#a855f7" fontSize="8" fontFamily="monospace">- - Transfer</text>
    </svg>
  );
}

export default function TrajectoryDesigner() {
  const { deltaVBudget, mission } = useMissionStore();

  const destSmaKm = mission.destination?.semiMajorAxis ?? DEFAULT_LEO_KM;

  const [sourceKm, setSourceKm] = useState(DEFAULT_LEO_KM);
  const [targetKm, setTargetKm] = useState(destSmaKm);

  // For interplanetary: use Sun GM (convert AU → km) — simple toggle
  const isInterplanetary = targetKm > 500_000;
  const mu = isInterplanetary ? GM.Sun : GM.Earth;

  // Convert km for interplanetary to AU-based if needed (keep in km throughout, Sun GM in km³/s²)
  const result = useMemo(
    () => hohmannTransfer(sourceKm, targetKm, mu),
    [sourceKm, targetKm, mu],
  );

  const escV = useMemo(() => escapeVelocity(mu, sourceKm), [mu, sourceKm]);
  const vc1 = useMemo(() => Math.sqrt(mu / sourceKm), [mu, sourceKm]);
  const vinf = Math.max(0, vc1 - escV + result.dv1);
  const c3 = c3Energy(vinf);
  const orbVAtTarget = useMemo(() => visViva(mu, targetKm, targetKm), [mu, targetKm]);

  const dvAvailable = deltaVBudget?.available ?? 0;
  const dvRequired = (result.totalDV * 1000); // convert km/s → m/s for comparison
  const feasible = dvAvailable >= dvRequired;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🛸</span>
        <div>
          <h2 className="text-xl font-bold text-white">Trajectory Designer</h2>
          <p className="text-slate-400 text-sm">Hohmann transfer calculator with real orbital mechanics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase block mb-2">
              Source Orbit Radius (km)
            </label>
            <input
              type="number"
              value={sourceKm}
              min={EARTH_RADIUS_KM + 100}
              max={1_000_000_000}
              step={100}
              onChange={(e) => setSourceKm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
            <div className="text-xs text-slate-600 mt-1">
              Altitude: {(sourceKm - EARTH_RADIUS_KM).toLocaleString()} km
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase block mb-2">
              Target Orbit Radius (km)
            </label>
            <input
              type="number"
              value={targetKm}
              min={EARTH_RADIUS_KM + 100}
              max={1_000_000_000}
              step={1000}
              onChange={(e) => setTargetKm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-orange-300 font-mono text-sm focus:outline-none focus:border-orange-500"
            />
            {mission.destination && (
              <button
                onClick={() => setTargetKm(destSmaKm)}
                className="text-xs text-cyan-500 hover:text-cyan-300 mt-1 transition-colors"
              >
                Use mission destination ({mission.destination.name})
              </button>
            )}
          </div>

          {/* Feasibility */}
          <div
            className={`rounded-xl p-3 border text-sm font-mono text-center ${
              feasible
                ? 'border-green-700 bg-green-900/20 text-green-400'
                : 'border-red-700 bg-red-900/20 text-red-400'
            }`}
          >
            {feasible ? '✓ ΔV Feasible' : '✗ Insufficient ΔV'}
            <div className="text-xs mt-1 text-slate-400">
              Need {result.totalDV.toFixed(3)} km/s · Have {(dvAvailable / 1000).toFixed(3)} km/s
            </div>
          </div>
        </div>

        {/* Diagram */}
        <div className="flex items-center justify-center">
          <TransferDiagram r1={sourceKm} r2={targetKm} />
        </div>

        {/* Results */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Δv₁ (departure burn)', value: result.dv1.toFixed(4), unit: 'km/s', color: '#22d3ee' },
            { label: 'Δv₂ (arrival burn)', value: result.dv2.toFixed(4), unit: 'km/s', color: '#f97316' },
            { label: 'Total ΔV', value: result.totalDV.toFixed(4), unit: 'km/s', color: feasible ? '#22c55e' : '#ef4444' },
            { label: 'Transfer Time', value: result.transferTimeDays.toFixed(1), unit: 'days', color: '#a855f7' },
            { label: 'C3 Energy', value: c3.toFixed(2), unit: 'km²/s²', color: '#94a3b8' },
            { label: 'Target Orbital Vel.', value: orbVAtTarget.toFixed(3), unit: 'km/s', color: '#94a3b8' },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="flex justify-between items-center bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2"
            >
              <span className="text-xs text-slate-400">{label}</span>
              <span className="font-mono font-bold" style={{ color }}>
                {value} <span className="text-slate-500 font-normal text-xs">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formula cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormulaCard
          name="Vis-Viva Equation"
          formula="v = √[ μ · (2/r − 1/a) ]"
          variables={[
            { symbol: 'v', definition: 'orbital speed (km/s)' },
            { symbol: 'μ', definition: 'gravitational parameter GM (km³/s²)' },
            { symbol: 'r', definition: 'current radius from central body (km)' },
            { symbol: 'a', definition: 'semi-major axis of orbit (km)' },
          ]}
          source="Bate, Mueller & White §2.4"
          result={{ label: 'Circular velocity at source', value: vc1.toFixed(3), unit: 'km/s' }}
        />
        <FormulaCard
          name="Hohmann Transfer Time"
          formula="t = π · √(aₜ³ / μ)"
          variables={[
            { symbol: 'aₜ', definition: 'transfer ellipse SMA = (r₁ + r₂)/2 (km)' },
            { symbol: 'μ', definition: 'GM of central body (km³/s²)' },
            { symbol: 'π', definition: 'half-period factor' },
          ]}
          source="Curtis §6.1"
          result={{ label: 'Transfer time', value: result.transferTimeDays.toFixed(1), unit: 'days' }}
        />
        {result.formulaStrings.slice(0, 2).map((s, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-400">
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
