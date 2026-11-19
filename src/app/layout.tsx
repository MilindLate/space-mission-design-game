import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/ui/Navigation';

export const metadata: Metadata = {
  title: 'Space Mission Design Game — NASA Space Apps Challenge 2026',
  description:
    'Design, build, and launch your own space mission. Configure spacecraft subsystems, balance mass/power/cost constraints, and simulate orbital mechanics in real time.',
  keywords: ['NASA', 'space', 'mission', 'orbital mechanics', 'spacecraft', 'simulation', 'game'],
  openGraph: {
    title: 'Space Mission Design Game',
    description: 'NASA Space Apps Challenge 2026 — Interactive Mission Planner',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {/* Starfield backdrop */}
        <div className="starfield" aria-hidden="true" />
        {/* Stars particles (pure CSS — no library needed) */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 15% 25%, #fff8 0%, transparent 100%),
              radial-gradient(1px 1px at 42% 70%, #fff6 0%, transparent 100%),
              radial-gradient(1px 1px at 78% 15%, #fff9 0%, transparent 100%),
              radial-gradient(1px 1px at 60% 85%, #fff5 0%, transparent 100%),
              radial-gradient(1px 1px at 90% 50%, #fff7 0%, transparent 100%),
              radial-gradient(1px 1px at 5%  90%, #fff6 0%, transparent 100%),
              radial-gradient(1px 1px at 33% 40%, #fff4 0%, transparent 100%),
              radial-gradient(1px 1px at 70% 60%, #fff8 0%, transparent 100%),
              radial-gradient(1px 1px at 25% 10%, #fff5 0%, transparent 100%),
              radial-gradient(1px 1px at 55% 30%, #fff7 0%, transparent 100%)
            `,
          }}
        />
        <div className="relative z-10 min-h-dvh flex flex-col">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
