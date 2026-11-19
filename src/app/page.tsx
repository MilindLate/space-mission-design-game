'use client';

import dynamic from 'next/dynamic';
import { useMissionStore } from '@/lib/store/useMissionStore';
import Header from '@/components/ui/Header';
import DestinationStep from '@/components/steps/DestinationStep';
import ComponentStep from '@/components/steps/ComponentStep';
import RocketStep from '@/components/steps/RocketStep';
import MissionReport from '@/components/ui/MissionReport';
import { DESTINATIONS } from '@/lib/data/destinations';
import type { OrbitalDestination } from '@/types';

const SimulationStep = dynamic(() => import('@/components/steps/SimulationStep'), { ssr: false });

// Quick-start mission presets mapping to destination IDs
const QUICK_STARTS: Array<{
  label: string;
  icon: string;
  destId: string;
  tagline: string;
}> = [
  { label: 'Earth Observation', icon: '🌍', destId: 'LEO', tagline: 'Low Earth Orbit · 400–600 km' },
  { label: 'Lunar Mission', icon: '🌙', destId: 'LUNAR', tagline: 'Lunar Orbit · 100 km' },
  { label: 'Mars Expedition', icon: '🔴', destId: 'MARS', tagline: 'Mars Transfer · ~9 months' },
  { label: 'Sun–Earth L2', icon: '🔭', destId: 'L2', tagline: 'Lagrange Point · 1.5M km' },
  { label: 'Asteroid Belt', icon: '☄️', destId: 'GTO', tagline: 'GTO · 35,786 km apogee' },
];

function LandingPage() {
  const { setDestination, setStep } = useMissionStore();

  function handleQuickStart(destId: string) {
    const dest = DESTINATIONS.find((d: OrbitalDestination) => d.id === destId);
    if (dest) {
      setDestination(dest);
      setStep(0);
    }
  }

  function handleLaunchMission() {
    setStep(0);
  }

  return (
    <div className="min-h-screen bg-[#050a14] text-white overflow-x-hidden">
      {/* Starfield layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="stars" />
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* NASA badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-mono uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          NASA Space Apps Challenge 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
          <span className="text-white">SPACE MISSION</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            DESIGN GAME
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
          Design, simulate, and optimize real space missions using{' '}
          <span className="text-cyan-400 font-semibold">JPL Horizons ephemeris</span>,{' '}
          <span className="text-blue-400 font-semibold">Keplerian orbital mechanics</span>, and
          NASA-validated spacecraft component data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={handleLaunchMission}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            🚀 Design Your Mission →
          </button>
          <a
            href="/solar-system"
            className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold text-lg hover:border-cyan-500 hover:text-cyan-400 transition-all"
          >
            🪐 Explore Solar System
          </a>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-mono text-slate-400 border-t border-slate-800 pt-8 w-full max-w-3xl">
          {[
            ['22', 'Spacecraft Components'],
            ['6', 'Launch Vehicles'],
            ['6', 'Mission Destinations'],
            ['Real', 'JPL Ephemeris Data'],
            ['Keplerian', 'Orbital Physics'],
          ].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-cyan-400 font-bold text-lg">{val}</span>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Start ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-white mb-3">Quick Mission Start</h2>
        <p className="text-center text-slate-400 text-sm mb-10">
          Pick a mission type to jump straight to spacecraft assembly
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {QUICK_STARTS.map((qs) => (
            <button
              key={qs.destId}
              onClick={() => handleQuickStart(qs.destId)}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-cyan-500 hover:bg-slate-800/80 transition-all text-center"
            >
              <span className="text-4xl">{qs.icon}</span>
              <span className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors">
                {qs.label}
              </span>
              <span className="text-xs text-slate-500">{qs.tagline}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📡',
              title: 'Real NASA/JPL Data',
              body: 'Planet positions from JPL Horizons API (live ephemeris). Spacecraft component specs from NASA mission heritage databases. No fabricated data.',
              color: 'cyan',
            },
            {
              icon: '⚛️',
              title: 'Keplerian Physics Engine',
              body: 'Full Newton–Raphson orbital propagator, Tsiolkovsky rocket equation, Hohmann transfer ΔV calculator, and vis-viva velocity solver.',
              color: 'blue',
            },
            {
              icon: '💥',
              title: 'Mission Failure Lab',
              body: 'Understand why real missions fail — power shortfalls, mass overruns, communication blackouts — through interactive failure tree analysis.',
              color: 'orange',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`p-6 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-${card.color}-500/50 transition-all`}
            >
              <span className="text-3xl mb-4 block">{card.icon}</span>
              <h3 className="font-bold text-white text-lg mb-2">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Teaser ─────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800/60 p-8 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-white mb-3">
            Compare Against Real NASA Missions
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
            See how your spacecraft design stacks up against MRO, Curiosity, JWST, and Cassini.
            Real mass, power, cost, and ΔV data from NASA mission archives.
          </p>
          <button
            onClick={handleLaunchMission}
            className="px-6 py-3 rounded-lg border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/10 transition-all"
          >
            Start designing to compare →
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center text-xs text-slate-600 font-mono">
        Built for NASA Space Apps Challenge 2026 · Data: JPL Horizons, NASA NTRS, NASA NSSDC
        <br />
        Orbital mechanics: Bate, Mueller &amp; White · Curtis · Vallado
      </footer>
    </div>
  );
}

export default function Home() {
  const { currentStep, mission, report } = useMissionStore();
  const missionActive = mission.destination !== null;

  if (!missionActive && currentStep === 0 && !report) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      <Header />
      <main className="pt-16">
        {report ? (
          <MissionReport />
        ) : currentStep === 0 ? (
          <DestinationStep />
        ) : currentStep === 1 ? (
          <ComponentStep />
        ) : currentStep === 2 ? (
          <RocketStep />
        ) : (
          <SimulationStep />
        )}
      </main>
    </div>
  );
}
