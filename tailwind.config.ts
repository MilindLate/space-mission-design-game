import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          bg:      '#020408',
          surface: '#080f1a',
          panel:   '#0d1a2d',
          border:  '#1a2d4a',
          accent:  '#0ea5e9',
          green:   '#22c55e',
          yellow:  '#eab308',
          red:     '#ef4444',
          purple:  '#a855f7',
          text:    '#e2e8f0',
          muted:   '#64748b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'glow-pulse 1.5s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
