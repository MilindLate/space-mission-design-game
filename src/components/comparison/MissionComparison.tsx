'use client';

import { useMissionStore } from '@/lib/store/useMissionStore';

interface RealMission {
  name: string;
  year: number;
  massKg: number;
  powerW: number;
  costM: number;
  dvMs: number;
  instruments: number;
  durationYears: number;
  outcome: string;
  source: string;
}

// Source: NASA mission pages (nasa.gov/missions) and NASA/JPL press kits
const REAL_MISSIONS: RealMission[] = [
  {
    name: 'MRO',
    year: 2005,
    massKg: 2180,
    powerW: 1000,
    costM: 716,
    dvMs: 2200,
    instruments: 6,
    durationYears: 15,
    outcome: 'Active',
    source: 'nasa.gov/mro',
  },
  {
    name: 'Curiosity',
    year: 2011,
    massKg: 3839,
    powerW: 110,
    costM: 2500,
    dvMs: 680,
    instruments: 10,
    durationYears: 14,
    outcome: 'Active',
    source: 'nasa.gov/msl',
  },
  {
    name: 'JWST',
    year: 2021,
    massKg: 6500,
    powerW: 2000,
    costM: 10000,
    dvMs: 1500,
    instruments: 4,
    durationYears: 10,
    outcome: 'Active',
    source: 'nasa.gov/jwst',
  },
  {
    name: 'Cassini',
    year: 1997,
    massKg: 5712,
    powerW: 628,
    costM: 3270,
    dvMs: 2040,
    instruments: 18,
    durationYears: 20,
    outcome: 'Complete',
    source: 'nasa.gov/cassini',
  },
];

type CellStatus = 'better' | 'warn' | 'danger' | 'neutral';

function cellStatus(user: number, ref: number, lowerIsBetter: boolean): CellStatus {
  if (user === 0) return 'neutral';
  const ratio = user / ref;
  if (lowerIsBetter) {
    if (ratio < 1.2) return 'better';
    if (ratio < 1.5) return 'warn';
    return 'danger';
  } else {
    if (ratio > 0.8) return 'better';
    if (ratio > 0.5) return 'warn';
    return 'danger';
  }
}

const STATUS_COLORS: Record<CellStatus, string> = {
  better:  'text-green-400',
  warn:    'text-yellow-400',
  danger:  'text-red-400',
  neutral: 'text-slate-400',
};

export default function MissionComparison() {
  const { resources, deltaVBudget, spacecraft } = useMissionStore();

  const userInstruments = spacecraft.components.filter((c) =>
    c.componentId.includes('payload') ||
    c.componentId.includes('imager') ||
    c.componentId.includes('spectr') ||
    c.componentId.includes('magnet'),
  ).length;

  const durationYears = (spacecraft.missionDurationMonths ?? 12) / 12;

  const userMission = {
    massKg: resources.totalMass,
    powerW: resources.powerGenerated,
    costM: resources.totalCost,
    dvMs: deltaVBudget?.available ?? 0,
    instruments: userInstruments,
    durationYears,
  };

  type RowKey = keyof typeof userMission;

  const rows: Array<{
    key: RowKey;
    label: string;
    unit: string;
    lowerIsBetter: boolean;
    format: (v: number) => string;
  }> = [
    { key: 'massKg', label: 'Total Mass', unit: 'kg', lowerIsBetter: true, format: (v) => v.toFixed(0) },
    { key: 'powerW', label: 'Power', unit: 'W', lowerIsBetter: false, format: (v) => v.toFixed(0) },
    { key: 'costM', label: 'Est. Cost', unit: '\$M', lowerIsBetter: true, format: (v) => v.toFixed(1) },
    { key: 'dvMs', label: 'ΔV Budget', unit: 'm/s', lowerIsBetter: false, format: (v) => v.toFixed(0) },
    { key: 'instruments', label: 'Instruments', unit: '', lowerIsBetter: false, format: (v) => v.toFixed(0) },
    { key: 'durationYears', label: 'Duration', unit: 'yr', lowerIsBetter: false, format: (v) => v.toFixed(1) },
  ];

  // Callouts vs MRO
  const mro = REAL_MISSIONS[0];
  const massVsMRO = userMission.massKg > 0
    ? ((userMission.massKg - mro.massKg) / mro.massKg) * 100
    : null;
  const powerVsCuriosity = userMission.powerW > 0
    ? ((userMission.powerW - REAL_MISSIONS[1].powerW) / REAL_MISSIONS[1].powerW) * 100
    : null;
  const costVsJWST = userMission.costM > 0
    ? ((userMission.costM - REAL_MISSIONS[2].costM) / REAL_MISSIONS[2].costM) * 100
    : null;

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">📊</span>
        <div>
          <h2 className="text-xl font-bold text-white">Mission Comparison</h2>
          <p className="text-slate-400 text-sm">
            Your design vs. real NASA missions · Source: nasa.gov/missions
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/80">
              <th className="text-left p-3 text-slate-500 font-normal text-xs uppercase tracking-wider">Metric</th>
              <th className="text-right p-3 text-cyan-400 font-bold">Your Mission</th>
              {REAL_MISSIONS.map((m) => (
                <th key={m.name} className="text-right p-3 text-slate-300 font-normal">
                  <div>{m.name}</div>
                  <div className="text-slate-600 text-[10px]">{m.year}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const userVal = userMission[row.key];
              return (
                <tr key={row.key} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors">
                  <td className="p-3 text-slate-400 text-xs uppercase tracking-wider">
                    {row.label}
                    {row.unit ? <span className="text-slate-600 ml-1 normal-case">({row.unit})</span> : null}
                  </td>
                  <td className="p-3 text-right font-bold text-cyan-300">
                    {row.format(userVal)}
                  </td>
                  {REAL_MISSIONS.map((m) => {
                    const refVal = m[row.key as keyof RealMission] as number;
                    const st = cellStatus(userVal, refVal, row.lowerIsBetter);
                    return (
                      <td key={m.name} className={`p-3 text-right ${STATUS_COLORS[st]}`}>
                        {row.format(refVal)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Outcome row */}
            <tr className="bg-slate-900/40">
              <td className="p-3 text-slate-400 text-xs uppercase tracking-wider">Outcome</td>
              <td className="p-3 text-right text-slate-500 italic text-xs">In Design</td>
              {REAL_MISSIONS.map((m) => (
                <td key={m.name} className="p-3 text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      m.outcome === 'Active'
                        ? 'text-green-400 border-green-700/40 bg-green-900/20'
                        : 'text-blue-400 border-blue-700/40 bg-blue-900/20'
                    }`}
                  >
                    {m.outcome}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Callout cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {massVsMRO !== null && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">vs. MRO</div>
            <div className={`text-lg font-bold font-mono ${massVsMRO > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {massVsMRO > 0 ? '+' : ''}{massVsMRO.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Your design is {Math.abs(massVsMRO).toFixed(1)}%{' '}
              {massVsMRO > 0 ? 'heavier' : 'lighter'} than MRO ({mro.massKg} kg)
            </div>
          </div>
        )}
        {powerVsCuriosity !== null && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">vs. Curiosity</div>
            <div className={`text-lg font-bold font-mono ${powerVsCuriosity > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {powerVsCuriosity > 0 ? '+' : ''}{powerVsCuriosity.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Your power budget is {Math.abs(powerVsCuriosity).toFixed(1)}%{' '}
              {powerVsCuriosity > 0 ? 'more' : 'less'} than Curiosity ({REAL_MISSIONS[1].powerW} W)
            </div>
          </div>
        )}
        {costVsJWST !== null && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">vs. JWST</div>
            <div className={`text-lg font-bold font-mono ${costVsJWST < 0 ? 'text-green-400' : 'text-yellow-400'}`}>
              {costVsJWST > 0 ? '+' : ''}{costVsJWST.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Your mission costs {Math.abs(costVsJWST).toFixed(1)}%{' '}
              {costVsJWST < 0 ? 'less' : 'more'} than JWST (\${REAL_MISSIONS[2].costM.toLocaleString()}M)
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-700 italic">
        * Real mission data sourced from nasa.gov/missions, NASA press kits, and JPL mission pages. 
        Cost figures are total lifecycle costs in 2024 USD equivalent.
      </div>
    </div>
  );
}
