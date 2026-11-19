'use client';

import { useEffect, useRef } from 'react';

export interface LogEntry {
  id: string;
  time: number; // seconds elapsed
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  resolved?: boolean;
}

const TYPE_STYLES: Record<LogEntry['type'], { dot: string; text: string }> = {
  info:     { dot: '#3b82f6', text: '#94a3b8' },
  warning:  { dot: '#eab308', text: '#fde047' },
  critical: { dot: '#ef4444', text: '#fca5a5' },
  success:  { dot: '#22c55e', text: '#86efac' },
};

function formatMET(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function EventLog({ events }: { events: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        fontFamily: 'monospace',
        background: 'rgba(2, 4, 8, 0.8)',
        borderTop: '1px solid #1e293b',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {events.length === 0 && (
        <div style={{ color: '#475569', fontSize: '11px', margin: 'auto' }}>
          No events logged
        </div>
      )}
      {events.map((e) => {
        const style = TYPE_STYLES[e.type];
        return (
          <div
            key={e.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '11px',
              opacity: e.resolved ? 0.5 : 1,
            }}
          >
            <span style={{ color: '#475569', flexShrink: 0 }}>{formatMET(e.time)}</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: style.dot,
                marginTop: '3px',
                flexShrink: 0,
              }}
            />
            <span style={{ color: style.text, flex: 1 }}>{e.message}</span>
            {e.resolved && (
              <span style={{ color: '#22c55e', fontSize: '10px', flexShrink: 0 }}>✓</span>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
