'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useMissionStore } from '@/lib/store/useMissionStore';
import Header from '@/components/ui/Header';
import DestinationStep from '@/components/steps/DestinationStep';
import ComponentStep from '@/components/steps/ComponentStep';
import RocketStep from '@/components/steps/RocketStep';
import MissionReport from '@/components/ui/MissionReport';
import { DESTINATIONS } from '@/lib/data/destinations';
import type { OrbitalDestination } from '@/types';

const SimulationStep = dynamic(() => import('@/components/steps/SimulationStep'), { ssr: false });

/* ── Difficulty tiers ──────────────────────────────────────── */
const MISSIONS = [
  {
    destId: 'LEO', level: 1, difficulty: 'Beginner', diffClass: 'badge-easy',
    title: 'Earth Sentinel', subtitle: 'Low Earth Orbit · 400 km',
    desc: 'Your first mission. Deploy an Earth observation satellite into LEO. Learn the basics of spacecraft design.',
    icon: '🌍', xpReward: 100, unlocked: true,
  },
  {
    destId: 'SSO', level: 2, difficulty: 'Easy', diffClass: 'badge-easy',
    title: 'Sun Chaser', subtitle: 'Sun-Synchronous Orbit · 507 km',
    desc: 'Maintain constant solar illumination for precision Earth imaging. Master power budgets.',
    icon: '🛰️', xpReward: 200, unlocked: true,
  },
  {
    destId: 'GTO', level: 3, difficulty: 'Medium', diffClass: 'badge-medium',
    title: 'Orbital Relay', subtitle: 'Geostationary Transfer · 35,786 km',
    desc: 'Place a comm satellite in GTO. Navigate the Van Allen radiation belts and manage thermal stress.',
    icon: '📡', xpReward: 400, unlocked: true,
  },
  {
    destId: 'LUNAR', level: 4, difficulty: 'Hard', diffClass: 'badge-hard',
    title: 'Lunar Pathfinder', subtitle: 'Lunar Orbit · 100 km',
    desc: 'Send a probe to orbit the Moon. Tight ΔV budget, limited DSN contact, and long-duration power needs.',
    icon: '🌙', xpReward: 800, unlocked: true,
  },
  {
    destId: 'L2', level: 5, difficulty: 'Expert', diffClass: 'badge-extreme',
    title: 'Deep Eye', subtitle: 'Sun–Earth L2 · 1.5M km',
    desc: 'Deploy an observatory to the L2 Lagrange point. No second chances — like JWST, perfection is required.',
    icon: '🔭', xpReward: 1500, unlocked: true,
  },
  {
    destId: 'MARS', level: 6, difficulty: 'Legendary', diffClass: 'badge-legendary',
    title: 'Red Pioneer', subtitle: 'Mars Transfer · 9+ months',
    desc: 'The ultimate challenge. Design a Mars mission from scratch. Limited solar power, extreme ΔV, 20-min comms delay.',
    icon: '🔴', xpReward: 3000, unlocked: true,
  },
];

function LandingPage() {
  const { setDestination, setStep } = useMissionStore();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  function handleSelectMission(destId: string) {
    const dest = DESTINATIONS.find((d: OrbitalDestination) => d.id === destId);
    if (dest) {
      setDestination(dest);
      setStep(0);
    }
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white overflow-x-hidden nebula-1">
      {/* Animated stars */}
      <div className="stars-layer" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-mono uppercase tracking-[0.2em] fade-up">
          <span className="w-2 h-2 rounded-full bg-cyan-400 glow-cyan" />
          NASA Space Apps Challenge 2026
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">SPACE MISSION</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(14,165,233,0.3)]">
            DESIGN GAME
          </span>
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-slate-400 mb-12 leading-relaxed fade-up" style={{ animationDelay: '0.2s' }}>
          Design spacecraft. Solve engineering trade-offs. Launch missions.
          <br className="hidden md:block" />
          Real <span className="text-cyan-400 font-medium">JPL Horizons</span> data.
          Real <span className="text-blue-400 font-medium">orbital physics</span>.
          Real <span className="text-purple-400 font-medium">mission challenges</span>.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 fade-up" style={{ animationDelay: '0.3s' }}>
          <a
            href="#missions"
            className="btn-primary text-lg px-10 py-4"
          >
            🚀 Choose Your Mission
          </a>
          <a
            href="/solar-system"
            className="btn-ghost text-lg px-8 py-4"
          >
            🪐 Explore Solar System
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-sm font-mono text-slate-500 fade-up" style={{ animationDelay: '0.4s' }}>
          {[
            ['6', 'LEVELS'],
            ['22', 'COMPONENTS'],
            ['6', 'ROCKETS'],
            ['∞', 'COMBINATIONS'],
          ].map(([val, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-cyan-400">{val}</span>
              <span className="text-[10px] tracking-[0.15em]">{label}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-slate-500 tracking-widest">SCROLL TO PLAY</span>
          <div className="w-5 h-8 rounded-full border-2 border-slate-600 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-slate-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Mission Select (Level-based) ──────────────────────── */}
      <section id="missions" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">
            <div className="w-8 h-px bg-slate-700" />
            SELECT MISSION
            <div className="w-8 h-px bg-slate-700" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Choose Your Challenge
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Each mission is a real-world space engineering challenge. Start from beginner and work up to legendary.
          </p>
        </div>

        {/* Mission grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {MISSIONS.map((m) => (
            <button
              key={m.destId}
              onClick={() => handleSelectMission(m.destId)}
              onMouseEnter={() => setHoveredLevel(m.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`mission-card text-left group ${m.unlocked ? '' : 'locked'}`}
            >
              {/* Level number corner */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700/50">
                {m.level}
              </div>

              {/* Icon */}
              <div className={`text-5xl mb-4 transition-transform duration-500 ${hoveredLevel === m.level ? 'scale-110' : ''}`}>
                {m.icon}
              </div>

              {/* Difficulty */}
              <span className={`badge ${m.diffClass} mb-3 inline-block`}>
                {m.difficulty}
              </span>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {m.title}
              </h3>
              <p className="text-xs font-mono text-slate-500 mb-3">{m.subtitle}</p>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{m.desc}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5 text-xs text-yellow-500/80">
                  <span>⭐</span>
                  <span className="font-mono font-bold">{m.xpReward} XP</span>
                </div>
                {m.unlocked ? (
                  <span className="text-xs text-cyan-500 font-semibold group-hover:text-cyan-300 transition-colors">
                    LAUNCH →
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">🔒 Locked</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto nebula-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {[
            {
              icon: '📡', title: 'Live NASA Data',
              body: 'Real planet positions from JPL Horizons API. Real spacecraft specs from NASA mission heritage.',
              gradient: 'from-cyan-500/10 to-transparent',
            },
            {
              icon: '⚛️', title: 'Real Physics Engine',
              body: 'Newton–Raphson propagator, Tsiolkovsky equation, Hohmann transfers — not faked, not simplified.',
              gradient: 'from-blue-500/10 to-transparent',
            },
            {
              icon: '💥', title: 'Failure Laboratory',
              body: 'Learn why missions fail. Power shortfalls, mass overruns, comm blackouts — interactive failure analysis.',
              gradient: 'from-orange-500/10 to-transparent',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`panel p-6 bg-gradient-to-br ${card.gradient} hover:border-slate-600 transition-all duration-300`}
            >
              <span className="text-4xl mb-4 block float">{card.icon}</span>
              <h3 className="font-bold text-white text-base mb-2">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compare teaser ────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <div className="panel panel-gold p-8 text-center">
          <div className="text-5xl mb-4 float">🏆</div>
          <h3 className="text-2xl font-black text-white mb-3">
            Compete Against Real Missions
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Your spacecraft is compared to MRO, Curiosity, JWST, and Cassini.
            <br />Can you design a better mission than NASA?
          </p>
          <a href="#missions" className="btn-primary px-8">
            Accept the Challenge →
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/50 py-10 text-center">
        <div className="text-xs text-slate-700 font-mono leading-relaxed">
          NASA Space Apps Challenge 2026 · JPL Horizons · NASA NTRS · NASA NSSDC
          <br />
          Physics: Bate, Mueller &amp; White · Curtis · Vallado
        </div>
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
    <div className="min-h-screen bg-[#020408] text-white nebula-1">
      <div className="stars-layer" />
      <Header />
      <main className="relative z-10 pt-[140px] pb-8 px-4 max-w-6xl mx-auto">
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
