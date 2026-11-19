'use client';

import { useState } from 'react';
import { useMissionStore } from '@/lib/store/useMissionStore';
import { COMPONENTS_CATALOG, getComponentsByCategory } from '@/lib/data/componentsCatalog';
import { Plus, Minus, Info } from 'lucide-react';
import type { SpacecraftComponent } from '@/types';

const CATEGORIES: { id: SpacecraftComponent['category']; label: string }[] = [
  { id: 'structure',      label: '🛰 Structure' },
  { id: 'power',         label: '⚡ Power' },
  { id: 'propulsion',    label: '🔥 Propulsion' },
  { id: 'communications',label: '📡 Comms' },
  { id: 'payload',       label: '🔭 Payload' },
  { id: 'thermal',       label: '🌡 Thermal' },
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
      className={`component-card ${isSelected ? 'selected' : ''} ${incompatible ? 'opacity-40' : ''}`}
      title={incompatible ? `Not compatible with selected destination` : ''}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold text-[var(--space-text)] leading-tight truncate">
              {component.name}
            </span>
            {component.radiationHardened && (
              <span className="text-[9px] px-1 rounded bg-[var(--space-purple)]/20 text-[var(--space-purple)] shrink-0">
                RAD-HARD
              </span>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-[var(--space-muted)] mt-1">
            <span>⚖ {component.mass}kg</span>
            {component.powerDraw < 0
              ? <span className="text-[var(--space-green)]">⚡+{Math.abs(component.powerDraw)}W</span>
              : <span>⚡{component.powerDraw}W</span>
            }
            <span>💲{component.cost}M</span>
            {component.dataRateMbps > 0 && <span>📡{component.dataRateMbps}Mbps</span>}
            {component.storageGB > 0 && <span>💾{component.storageGB}GB</span>}
            <span>🛡{(component.reliability * 100).toFixed(0)}%</span>
          </div>

          {/* Description on expand */}
          {showInfo && (
            <p className="text-[10px] text-[var(--space-muted)] mt-1.5 leading-relaxed">
              {component.description}
              <span className="block mt-1 text-[var(--space-accent)]/70">Ref: {component.nasaRef}</span>
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
            className="text-[var(--space-muted)] hover:text-[var(--space-accent)] transition-colors"
            aria-label="Toggle info"
          >
            <Info className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onRemove}
              disabled={count === 0 || incompatible}
              className="w-5 h-5 rounded flex items-center justify-center border border-[var(--space-border)] text-[var(--space-muted)] hover:border-[var(--space-red)] hover:text-[var(--space-red)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Remove"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="w-4 text-center text-xs font-mono font-bold text-[var(--space-text)]">
              {count}
            </span>
            <button
              onClick={onAdd}
              disabled={atMax || incompatible}
              className="w-5 h-5 rounded flex items-center justify-center border border-[var(--space-border)] text-[var(--space-muted)] hover:border-[var(--space-green)] hover:text-[var(--space-green)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Add"
            >
              <Plus className="w-2.5 h-2.5" />
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

  return (
    <div className="panel flex flex-col overflow-hidden h-full">
      {/* Category tabs */}
      <div className="flex overflow-x-auto border-b border-[var(--space-border)] shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              px-3 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors border-b-2
              ${activeCategory === cat.id
                ? 'border-[var(--space-accent)] text-[var(--space-accent)]'
                : 'border-transparent text-[var(--space-muted)] hover:text-[var(--space-text)]'
              }
            `}
          >
            {cat.label}
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
        <div className="border-t border-[var(--space-border)] p-3 shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-[var(--space-muted)] mb-1.5">
            Installed ({installedComponents.reduce((s, e) => s + e.count, 0)} items)
          </div>
          <div className="flex flex-wrap gap-1">
            {installedComponents.map((entry) => {
              const comp = COMPONENTS_CATALOG.find((c) => c.id === entry.componentId);
              if (!comp) return null;
              return (
                <span
                  key={entry.componentId}
                  className="text-[9px] px-1.5 py-0.5 rounded-full border border-[var(--space-accent)]/40 text-[var(--space-accent)]"
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
