# Architecture

## System Overview

```
Browser (Client)
│
├── Next.js App Router (src/app/)
│   ├── / (page.tsx)              — Landing + Game Steps router
│   ├── /solar-system             — 3D Solar System Explorer
│   └── /api/horizons             — JPL Horizons proxy (server-side)
│
├── State Layer (Zustand + Immer)
│   └── useMissionStore           — Single source of truth for all game state
│
├── Physics Engine (pure TS, no deps)
│   ├── kepler.ts                 — Keplerian propagator (Newton-Raphson)
│   ├── deltaV.ts                 — Tsiolkovsky, Isp, propellant calculations
│   └── visviva.ts                — vis-viva, Hohmann, link budget, solar power
│
├── Data Layer
│   ├── destinations.ts           — 6 orbital destinations (NASA NSSDC params)
│   ├── componentsCatalog.ts      — 22 spacecraft components (NASA heritage)
│   └── launchVehicles.ts         — 6 launch vehicles (real payload capacities)
│
├── 3D Layer (@react-three/fiber)
│   ├── SolarSystem.tsx           — Full solar system with JPL positions
│   ├── OrbitScene.tsx            — Mission orbit canvas
│   ├── PlanetRenderer.tsx        — Procedural planet geometry
│   └── SpacecraftModel.tsx       — Procedural spacecraft geometry
│
└── UI Components
    ├── steps/                    — 4 game steps (Destination→Assembly→Rocket→Sim)
    ├── dashboard/                — Mission Control + TelemetryGauge + EventLog
    ├── trajectory/               — TrajectoryDesigner + FormulaCard
    ├── failure/                  — FailureLab (5 scenarios)
    ├── comparison/               — MissionComparison (vs MRO/Curiosity/JWST/Cassini)
    └── ui/                       — Header, ResourceHUD, AssemblyPanel, MissionReport, Navigation
```

## Data Flow

```
User Input
    │
    ▼
useMissionStore (Zustand)
    │── setDestination() → reads destinations.ts
    │── addComponent()   → reads componentsCatalog.ts → recomputes ResourceSummary
    │── setLauncher()    → reads launchVehicles.ts → runs computeDeltaVBudget()
    │── startSimulation()→ generates orbit trail via kepler.ts
    │── tickSimulation() → propagates state, fires random events, updates telemetry
    └── endSimulation()  → computes MissionReport with grade + failure tree
         │
         ▼
    React Components (read store with useMissionStore hook)
         │
         ▼
    3D Canvas (R3F) ← orbit trail + planet positions
```

## API Integration Pattern

```
Client: src/lib/api/horizons.ts
    │── getPlanetPosition(bodyName, date)
    │      └── fetch('/api/horizons?command=199&startTime=...')
    │                │
    │                ▼ (server-side, avoids CORS)
    │          src/app/api/horizons/route.ts
    │                └── fetch('https://ssd.jpl.nasa.gov/api/horizons.api?...')
    │                       └── parse $$SOE/$$EOE CSV block → {x,y,z} in AU
    │
    └── On error/unavailable: return PLANET_FALLBACK_POSITIONS (J2000 static positions)
```

## Component Hierarchy

```
layout.tsx
  └── Navigation (persistent top bar)
      └── page.tsx
            ├── LandingPage (when no mission active)
            └── [GameSteps]
                  ├── Header (step progress)
                  ├── DestinationStep
                  ├── ComponentStep
                  │     ├── AssemblyPanel
                  │     └── ResourceHUD
                  ├── RocketStep
                  └── SimulationStep
                        ├── OrbitScene (R3F)
                        └── MissionReport
```

## State Machine (Game Steps)

```
Step 0: Destination
  → User picks orbit/destination
  → setDestination() stores OrbitalDestination

Step 1: Assembly
  → User adds components (addComponent / removeComponent)
  → ResourceSummary recomputed live
  → 7-condition validation before advance

Step 2: Launcher
  → User picks LaunchVehicle
  → computeDeltaVBudget() runs with current wet mass + best Isp
  → Mass compatibility bar shown

Step 3: Simulation
  → requestAnimationFrame tick loop (dt capped at 100ms)
  → tickSimulation(dt * speedMultiplier)
  → Random events fire at probability 0.0003/s × speedMultiplier
  → endSimulation() → computeScore() → MissionReport

Step 4: Report
  → Grade S/A/B/C/F, score breakdown, failure tree if failed
```
