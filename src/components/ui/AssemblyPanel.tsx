'use client';

import { useState } from 'react';
import { useMissionStore } from '@/lib/store/useMissionStore';
import { COMPONENTS_CATALOG, getComponentsByCategory } from '@/lib/data/componentsCatalog';
import { Plus, Minus, Info, Cpu, Zap, Flame, Radio, Telescope, Thermometer } from 'lucide-react';
import type { SpacecraftComponent } from '@/types';

const CATEGORIES: { id: SpacecraftComponent['category']; label: string; icon: React.ReactNode }[] = [
  { id: 'structure',       label: 'Structure',  icon: <Cpu className="w-3 h-3" /> },
  { id: 'power',           label: 'Power',      icon: <Zap className="w-3 h-3" /> },
  { id: 'propulsion',      label: 'Propulsion', icon: <Flame className="w-3 h-3" /> },
  { id: 'communications',  label: 'Comms',      icon: <Radio className="w-3 h-3" /> },
  { id: 'payload',         label: 'Payload',    icon: <Telescope className="w-3 h-3" /> },
  { id: 'thermal',         label: 'Thermal',    icon: <Thermometer className="w-3 h-3" /> },
];

interface ComponentCardProps {
  component: SpacecraftComponent;
  count: number;
  destinationId?: string;
  onAdd: () => void;
  onRemove: () => void;
}

function ComponentCard({ component, count, destinationId, onAdd, onRemove }: ComponentCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const incompatible = destinationId
    ? !component.compatibleDestinations.includes(destinationId as never)
    : false;
  const atMax = count >= component.maxCount;
  const isSelected = count > 0;

  return (
    <div
      className={`component-card ${isSelected ? 'selected' : ''} ${incompatible ? 'opacity-30 pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-white leading-tight truncate">
              {component.name}
            </span>
            {component.radiationHardened && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold">
                RAD-HARD
              </span>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 mt-1">
            <span className="font-mono">⚖ {component.mass}kg</span>
            {component.powerDraw < 0
              ? <span className="text-green-400 font-mono">⚡+{Math.abs(component.powerDraw)}W</span>
              : <span className="font-mono">⚡{component.powerDraw}W</span>
            }
            <span className="text-yellow-400 font-mono">💲{component.cost}M</span>
            {component.dataRateMbps > 0 && <span className="font-mono">📡{component.dataRateMbps}Mbps</span>}
            {component.storageGB > 0 && <span className="font-mono">💾{component.storageGB}GB</span>}
            <span className="font-mono">🛡{(component.reliability * 100).toFixed(0)}%</span>
          </div>

          {/* Description on expand */}
          {showInfo && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {component.description}
              </p>
              <span className="block mt-1.5 text-[9px] text-cyan-500/60 font-mono">Ref: {component.nasaRef}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              showInfo ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10'
            }`}
            aria-label="Toggle info"
          >
            <Info className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onRemove}
              disabled={count === 0}
              className="w-6 h-6 rounded-lg flex items-center justify-center border border-slate-700 text-slate-500 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              aria-label="Remove"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className={`w-5 text-center text-xs font-mono font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
              {count}
            </span>
            <button
              onClick={onAdd}
              disabled={atMax}
              className="w-6 h-6 rounded-lg flex items-center justify-center border border-slate-700 text-slate-500 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              aria-label="Add"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssemblyPanel() {
  const [activeCategory, setActiveCategory] = useState<SpacecraftComponent['category']>('structure');
  const addComponent = useMissionStore((s) => s.addComponent);
  const removeComponent = useMissionStore((s) => s.removeComponent);
  const installedComponents = useMissionStore((s) => s.spacecraft.components);
  const destinationId = useMissionStore((s) => s.mission.destination?.id);

  const components = getComponentsByCategory(activeCategory);

  function getCount(id: string): number {
    return installedComponents.find((e) => e.componentId === id)?.count ?? 0;
  }

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="panel flex flex-col overflow-hidden h-full">
      {/* Category tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800/60 shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2
              ${activeCategory === cat.id
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }
            `}
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {components.map((comp) => (
          <ComponentCard
            key={comp.id}
            component={comp}
            count={getCount(comp.id)}
            destinationId={destinationId}
            onAdd={() => addComponent(comp.id)}
            onRemove={() => removeComponent(comp.id)}
          />
        ))}
      </div>

      {/* Installed summary */}
      {installedComponents.length > 0 && (
        <div className="border-t border-slate-800/60 p-3 shrink-0 bg-slate-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Installed
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {installedComponents.reduce((s, e) => s + e.count, 0)} items
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {installedComponents.map((entry) => {
              const comp = COMPONENTS_CATALOG.find((c) => c.id === entry.componentId);
              if (!comp) return null;
              return (
                <span
                  key={entry.componentId}
                  className="text-[9px] px-2 py-1 rounded-lg border border-cyan-500/30 text-cyan-400/80 bg-cyan-500/5 font-mono"
                >
                  {comp.name.split('(')[0].trim()} ×{entry.count}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
