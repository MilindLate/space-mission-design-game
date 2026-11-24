'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMissionStore } from '@/lib/store/useMissionStore';
import { Rocket, Globe, Wrench, Menu, X, RotateCcw } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Mission', icon: <Rocket className="w-4 h-4" /> },
  { href: '/solar-system', label: 'Solar System', icon: <Globe className="w-4 h-4" /> },
  { href: '/tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
];

export default function Navigation() {
  const { mission, currentStep, resetMission } = useMissionStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const missionActive = mission.destination !== null;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-slate-800/60 flex items-center px-4 md:px-6 gap-4"
      style={{ background: 'rgba(2, 4, 8, 0.85)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-white font-bold tracking-wider text-sm group">
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
          <Rocket className="w-3.5 h-3.5 text-white" />
        </span>
        <span className="hidden sm:inline">SPACE MISSION</span>
      </Link>

      <div className="hidden md:flex items-center gap-1 ml-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Mission status pill */}
      {missionActive && (
        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-xl bg-cyan-900/20 border border-cyan-700/30 text-xs font-mono text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{mission.destination?.name}</span>
          <span className="text-slate-600">Step {currentStep + 1}/4</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {missionActive && (
          <button
            onClick={resetMission}
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-all"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-12 left-0 right-0 border-b border-slate-800/60 p-4 flex flex-col gap-2 md:hidden"
          style={{ background: 'rgba(2, 4, 8, 0.95)', backdropFilter: 'blur(20px)' }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/50 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          {missionActive && (
            <button
              onClick={() => { resetMission(); setMenuOpen(false); }}
              className="text-left px-3 py-2.5 text-red-400 text-sm flex items-center gap-2.5 rounded-xl hover:bg-red-500/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Mission
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
