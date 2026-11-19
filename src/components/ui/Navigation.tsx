'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMissionStore } from '@/lib/store/useMissionStore';

const NAV_ITEMS = [
  { href: '/', label: 'Mission', icon: '🚀' },
  { href: '/solar-system', label: 'Solar System', icon: '🪐' },
  { href: '/tools', label: 'Tools', icon: '🛸' },
];

export default function Navigation() {
  const { mission, currentStep, resetMission } = useMissionStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const missionActive = mission.destination !== null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-black/70 border-b border-slate-800 backdrop-blur-md flex items-center px-4 md:px-6 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-white font-bold tracking-wider text-sm">
        <span className="text-cyan-400">◆</span>
        <span className="hidden sm:inline">SPACE MISSION</span>
      </Link>

      <div className="hidden md:flex items-center gap-1 ml-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Mission status pill */}
      {missionActive && (
        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-700/40 text-xs font-mono text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{mission.destination?.name}</span>
          <span className="text-slate-500">Step {currentStep + 1}/4</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {missionActive && (
          <button
            onClick={resetMission}
            className="hidden md:block text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded"
          >
            Reset Mission
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-12 left-0 right-0 bg-black/90 border-b border-slate-800 p-4 flex flex-col gap-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          {missionActive && (
            <button
              onClick={() => { resetMission(); setMenuOpen(false); }}
              className="text-left px-3 py-2 text-red-400 text-sm"
            >
              Reset Mission
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
