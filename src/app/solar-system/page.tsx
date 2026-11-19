'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllPlanetPositions, PLANET_FALLBACK_POSITIONS } from '@/lib/api/horizons';
import { orbitalPeriodSeconds, GM } from '@/lib/physics/visviva';

type PlanetPos = { x: number; y: number; z: number; vx: number; vy: number; vz: number; jd: number; fallback?: boolean };

const SolarSystem = dynamic(() => import('@/components/3d/SolarSystem'), { ssr: false });

// Distance from Sun in AU given heliocentric position
function distanceAU(pos: PlanetPos): number {
  return Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
}

const PLANET_SMA_KM: Record<string, number> = {
  Mercury: 57_909_050,
  Venus:   108_208_000,
  Earth:   149_598_023,
  Mars:    227_939_200,
  Jupiter: 778_570_000,
  Saturn:  1_433_530_000,
  Uranus:  2_872_460_000,
  Neptune: 4_495_060_000,
};

const PLANET_DESTINATION_MAP: Record<string, string> = {
  Mars: 'MARS',
  Moon: 'LUNAR',
  Earth: 'LEO',
};

export default function SolarSystemPage() {
  const [positions, setPositions] = useState<Record<string, PlanetPos>>(PLANET_FALLBACK_POSITIONS as Record<string, PlanetPos>);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    getAllPlanetPositions(new Date())
      .then((pos) => {
        setPositions(pos as Record<string, PlanetPos>);
        const anyFallback = Object.values(pos).some((p) => p.fallback);
        setUsingFallback(anyFallback);
      })
      .catch(() => setUsingFallback(true))
      .finally(() => setLoading(false));
  }, []);

  function handlePlanetClick(name: string) {
    setSelected(name);
  }

  const selectedPos = selected ? positions[selected] : null;
  const selectedDistAU = selectedPos ? distanceAU(selectedPos) : null;
  const selectedSMA = selected ? PLANET_SMA_KM[selected] : null;
  const selectedPeriodDays = selectedSMA
    ? orbitalPeriodSeconds(selectedSMA, GM.Sun) / 86400
    : null;

  const destId = selected ? PLANET_DESTINATION_MAP[selected] : null;

  return (
    <div className="relative h-screen w-screen bg-[#020408] text-white overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 h-12 bg-black/50 border-b border-slate-800 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-mono">
          ← Back to Mission
        </Link>
        <span className="text-cyan-400 font-mono text-sm font-bold tracking-widest">
          SOLAR SYSTEM EXPLORER
        </span>
        <span className="text-slate-500 font-mono text-xs">
          {new Date().toISOString().slice(0, 10)}
        </span>
      </div>

      {/* 3D Canvas — full screen */}
      <div className="absolute inset-0 z-0">
        <SolarSystem
          planetPositions={positions}
          onPlanetClick={handlePlanetClick}
          activeMissionTarget={selected ?? undefined}
        />
      </div>

      {/* Left info panel */}
      <div className="absolute top-12 left-0 bottom-0 z-10 w-64 bg-black/70 border-r border-slate-800 backdrop-blur-md p-4 flex flex-col gap-4">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          {loading ? '⟳ Fetching JPL Horizons…' : usingFallback ? '⚠ Offline — cached positions' : '✓ Live JPL Horizons data'}
        </div>

        {!selected && (
          <div className="text-slate-400 text-sm mt-4">
            Click any planet to explore its orbital data.
          </div>
        )}

        {selected && selectedPos && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white">{selected}</h2>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="text-slate-500">Distance from Sun</div>
              <div className="text-cyan-400">{selectedDistAU?.toFixed(3)} AU</div>

              <div className="text-slate-500">In km</div>
              <div className="text-slate-300">{((selectedDistAU ?? 0) * 149_598_023).toLocaleString()} km</div>

              {selectedPeriodDays !== null && (
                <>
                  <div className="text-slate-500">Orbital Period</div>
                  <div className="text-cyan-400">
                    {selectedPeriodDays > 365
                      ? `${(selectedPeriodDays / 365.25).toFixed(1)} yr`
                      : `${selectedPeriodDays.toFixed(0)} days`}
                  </div>
                </>
              )}

              <div className="text-slate-500">Position X</div>
              <div className="text-slate-300">{selectedPos.x.toFixed(3)} AU</div>
              <div className="text-slate-500">Position Y</div>
              <div className="text-slate-300">{selectedPos.y.toFixed(3)} AU</div>
              <div className="text-slate-500">Position Z</div>
              <div className="text-slate-300">{selectedPos.z.toFixed(3)} AU</div>
            </div>

            {destId ? (
              <Link
                href={`/?target=${destId}`}
                className="mt-2 w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold text-center transition-colors"
              >
                Design mission to {selected} →
              </Link>
            ) : (
              <div className="mt-2 text-xs text-slate-600 italic">No mission profile for this body yet</div>
            )}
          </div>
        )}

        {/* Planet list */}
        <div className="mt-auto border-t border-slate-800 pt-4">
          <div className="text-xs font-mono text-slate-500 mb-2 uppercase">Planets</div>
          <div className="flex flex-col gap-1">
            {Object.keys(PLANET_SMA_KM).map((name) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={`text-left px-2 py-1 rounded text-sm transition-colors ${
                  selected === name ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
