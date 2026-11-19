# Installation Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git

## Clone & Install

```bash
git clone <your-repo-url>
cd space-mission-game
npm install
```

## Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## Environment Variables

No API keys required. The JPL Horizons API is public and rate-limit free for reasonable use.

Optional `.env.local` (not required):
```
# If you deploy behind a proxy that blocks external requests, set this:
# NEXT_PUBLIC_HORIZONS_BASE_URL=https://your-proxy.example.com
```

## Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deploys.

## Deploy to Netlify

```bash
npx netlify deploy --prod
```

## TypeScript Check

```bash
npx tsc --noEmit
```

Expected: Exit 0, zero errors.
