# Space Mission Design Game

**Interactive Mission Planning & Orbital Simulation Platform**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-orange)](/)

---

## 🚀 Overview

A scientifically grounded, interactive web application that puts players in the role of a Lead Space Mission Architect. Users design real space missions from scratch — choosing planetary destinations, assembling spacecraft subsystems under rigid mass, power, and thermal constraints, selecting launch vehicles, and running real-time 60 FPS orbital simulations driven by live NASA/JPL ephemerides and Keplerian astrodynamics.

---

## 🏛 System Architecture

The application is built on a modular client-first architecture with Next.js 14 App Router, Three.js (React Three Fiber), Zustand + Immer for reactive state management, and a zero-dependency TypeScript physics engine.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (UI/UX)                         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
┌───────────────┐          ┌───────────────────┐          ┌──────────────────┐
│  Next.js 14   │          │ Reactive State    │          │ 3D Graphics      │
│  App Router   │          │ (Zustand + Immer) │          │ (Three.js / R3F) │
├───────────────┤          ├───────────────────┤          ├──────────────────┤
│ • / (Game)    │◄────────►│ • Mission State   │─────────►│ • OrbitScene     │
│ • /solar-sys  │          │ • Spacecraft Bus  │          │ • SolarSystem    │
│ • /tools      │          │ • Resource HUD    │          │ • Spacecraft     │
│ • /api/horiz  │          │ • Simulation Loop │          │ • PlanetRenderer │
└───────┬───────┘          └─────────┬─────────┘          └──────────────────┘
        │                            │
        │                            ▼
        │                  ┌───────────────────┐
        │                  │ Physics Engine    │
        │                  │ (Pure TypeScript) │
        │                  ├───────────────────┤
        │                  │ • kepler.ts       │
        │                  │ • deltaV.ts       │
        │                  │ • visviva.ts      │
        │                  └───────────────────┘
        ▼
┌───────────────────┐
│ External APIs     │
├───────────────────┤
│ • JPL Horizons    │ (Server-side proxy avoids CORS; pulls real J2000 planetary vectors)
└───────────────────┘
```

### Architectural Layers

1. **Presentation Layer (`src/app/`, `src/components/`)**:
   - Modern glassmorphism UI with Tailwind CSS.
   - 4-step mission workflow: Destination Selection $\rightarrow$ Spacecraft Assembly $\rightarrow$ Rocket Matching $\rightarrow$ Orbital Simulation.
   - Dedicated tools: 3D Solar System Explorer, Trajectory Designer, Failure Lab, and Mission Control.

2. **Reactive State Layer (`src/lib/store/useMissionStore.ts`)**:
   - Single source of truth powered by Zustand + Immer.
   - Synchronous constraint validation and automated resource matrix recomputations on every subsystem modification.

3. **Astrodynamics & Physics Engine (`src/lib/physics/`)**:
   - High-precision orbital mechanics operating with zero third-party math libraries.
   - Implements two-body Keplerian propagation, Newton-Raphson solvers, vis-viva velocity calculations, Tsiolkovsky $\Delta V$ budgets, and RF link budgets.

4. **3D Visualization Layer (`src/components/3d/`)**:
   - React Three Fiber (`@react-three/fiber`) & Drei (`@react-three/drei`).
   - Dynamic 3D spacecraft mesh synthesis based on installed components (bus, arrays, antennas).
   - Real-time animated orbital trails, central body spheres with procedural shaders, and Keplerian ellipse rendering.

5. **API & Data Layer (`src/lib/api/`, `src/lib/data/`)**:
   - Serverless Next.js API route (`/api/horizons`) proxying NASA/JPL Horizons Ephemeris system.
   - Verified aerospace catalogs: 6 orbital destinations, 22 spacecraft components, and 6 orbital launch vehicles.

---

## ⚙️ Core Functions & Astrodynamics Algorithms

### 1. Keplerian Orbit Propagation (`src/lib/physics/kepler.ts`)

Propagates the spacecraft position and velocity forward in time under two-body Newtonian gravity.

* **`solveKeplerEquation(M, e)`**:
  Solves Kepler's transcendental equation $M = E - e \cdot \sin(E)$ for eccentric anomaly $E$ using Newton-Raphson iteration:
  $$E_{k+1} = E_k - \frac{E_k - e \cdot \sin(E_k) - M}{1 - e \cdot \cos(E_k)}$$
  *(Iterates until $|E_{k+1} - E_k| < 10^{-10}$, converging in $<10$ cycles for $e < 1$).*

* **`eccentricToTrueAnomaly(E, e)`**:
  Converts eccentric anomaly $E$ to true anomaly $\nu$:
  $$\nu = 2 \cdot \arctan2\left(\sqrt{1+e} \cdot \sin\frac{E}{2}, \sqrt{1-e} \cdot \cos\frac{E}{2}\right)$$

* **`orbitalToCartesian(elements, mu)`**:
  Transforms Keplerian elements $(a, e, i, \Omega, \omega, \nu)$ into 3D Cartesian vectors $(\mathbf{r}, \mathbf{v})$ in inertial space using 3-1-3 Euler rotation matrices.

* **`generateOrbitTrail(elements, mu, numPoints)`**:
  Computes continuous 3D path coordinates for Three.js line rendering.

---

### 2. Rocket Propulsion & $\Delta V$ Budgeting (`src/lib/physics/deltaV.ts`)

Validates whether a spacecraft design has sufficient propellant to complete its trajectory burns.

* **`tsiolkovskydV(ispSeconds, dryMassKg, propellantMassKg)`**:
  Calculates available velocity change using the Tsiolkovsky Rocket Equation:
  $$\Delta V = I_{\text{sp}} \cdot g_0 \cdot \ln\left(\frac{m_{\text{dry}} + m_{\text{prop}}}{m_{\text{dry}}}\right) \quad (g_0 = 9.80665 \text{ m/s}^2)$$

* **`propellantRequired(ispSeconds, dryMassKg, targetDeltaV)`**:
  Calculates the required propellant mass to achieve a desired $\Delta V$:
  $$m_{\text{prop}} = m_{\text{dry}} \cdot \left(\exp\left(\frac{\Delta V}{I_{\text{sp}} \cdot g_0}\right) - 1\right)$$

* **`computeDeltaVBudget(destination, spacecraft, launcher)`**:
  Evaluates total mission $\Delta V$ demand against spacecraft capabilities:
  $$\Delta V_{\text{total}} = \Delta V_{\text{transfer}} + \Delta V_{\text{insertion}} + \Delta V_{\text{station-keeping}}$$
  $$\text{Margin} = \Delta V_{\text{available}} - \Delta V_{\text{total}}$$

---

### 3. Orbital Energy, Transfers & Communications (`src/lib/physics/visviva.ts`)

* **`visViva(mu, r, a)`**:
  Calculates orbital speed at any radius $r$ along an orbit of semi-major axis $a$:
  $$v = \sqrt{\mu \left(\frac{2}{r} - \frac{1}{a}\right)}$$

* **`hohmannDeltaV(r1, r2, mu)`**:
  Computes impulse velocities $\Delta V_1$ and $\Delta V_2$ for co-planar elliptical transfer between circular orbits.

* **`escapeVelocity(mu, r)`**:
  Calculates parabolic escape velocity from distance $r$:
  $$v_{\text{esc}} = \sqrt{\frac{2\mu}{r}}$$

* **`solarIrradiance(rAU)`**:
  Computes solar flux at distance $r$ via the Inverse-Square Law:
  $$S(r) = \frac{S_0}{r^2} \quad (S_0 = 1361 \text{ W/m}^2 \text{ at 1 AU})$$

* **`solarArrayPower(areaM2, rAU, efficiency, sunAngleDeg)`**:
  Calculates electrical output from photovoltaic solar panels:
  $$P_{\text{gen}} = S(r) \cdot A \cdot \eta \cdot \cos(\theta)$$

* **`friisPathLoss(distKm, freqHz)` & `linkMarginDb(...)`**:
  Calculates radio frequency path attenuation and link margin for communications with Earth Deep Space Network (DSN).

---

## 🎮 Game Loop & Operational Workflow

The core gameplay progresses through four tightly coupled engineering phases:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     STEP 1      │     │     STEP 2      │     │     STEP 3      │     │     STEP 4      │
│   DESTINATION   │────►│    ASSEMBLY     │────►│ ROCKET MATCHING │────►│   SIMULATION    │
│                 │     │                 │     │                 │     │                 │
│ Choose 1 of 6   │     │ Configure bus,  │     │ Match wet mass  │     │ 60 FPS live     │
│ orbital targets │     │ power, engine,  │     │ to launcher     │     │ orbit run &     │
│ (LEO to Mars)   │     │ comms & payload │     │ payload capacity│     │ anomaly handling│
└─────────────────┘     └─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                                                 │
                                                                                 ▼
                                                                        ┌─────────────────┐
                                                                        │ MISSION REPORT  │
                                                                        │ Grades S/A/B/C/F│
                                                                        │ XP & Diagnostics│
                                                                        └─────────────────┘
```

1. **Step 1: Destination Selection**:
   - Choose between **LEO** (Beginner), **SSO** (Easy), **GTO** (Medium), **Lunar Orbit** (Hard), **Sun–Earth L2** (Expert), or **Mars Transfer** (Legendary).
   - Establishes environmental parameters: gravitational parameter $\mu$, solar irradiance $S$, radiation exposure, and minimum mission duration.

2. **Step 2: Spacecraft Assembly (Subsystem Trade-Offs)**:
   - Configure 6 subsystems: Structure, Power, Propulsion, Communications, Scientific Payload, and Thermal Control.
   - Live **Resource Trade-off Matrix** recalculates total mass, peak/continuous power balance, cost, downlink rate, data storage, and average reliability.
   - Enforces 7 engineering readiness checks before launch authorization.

3. **Step 3: Launch Vehicle Matching**:
   - Compare spacecraft wet mass against 6 real rockets (Electron, Falcon 9, Falcon Heavy, Ariane 6, SLS Block 1, Starship).
   - Evaluates launch cost, fairing envelope volume, and destination reachability.

4. **Step 4: Real-Time Simulation & Mission Control**:
   - 60 FPS numerical propagation loop running Keplerian dynamics with $1\times, 10\times, 100\times$ time acceleration.
   - Real-time telemetry monitoring: velocity, orbital radius, battery state of charge, science data return, and communication window status.
   - **Anomaly Engine**: Injects realistic emergencies (micrometeoroid punctures, solar proton events, reaction wheel drift, antenna mispointing) requiring player command intervention.

5. **Debriefing & Mission Scoring**:
   - Evaluates mission completion %, mass efficiency, budget adherence, and resolved events into standardized grades ($S, A, B, C, F$) with XP rewards.
   - If a failure occurs, provides an interactive **Root-Cause Failure Tree** detailing the causal chain that led to mission termination.

---

## ✨ Features Summary

| Module | Capabilities |
|---|---|
| **6 Destinations** | LEO, SSO, GTO, Lunar Orbit, Sun–Earth L2, Mars Transfer |
| **22 Subsystems** | Real specs: composite bus, solar panels, RTG, ion thrusters, bipropellant, X-band/Ka-band antennas, hyperspectral cameras, magnetometers |
| **6 Launch Vehicles** | Electron, Falcon 9, Falcon Heavy, Ariane 6, SLS Block 1, Starship |
| **Live JPL Data** | Real-time planet coordinates fetched via NASA/JPL Horizons API proxy |
| **Physics Engine** | Newton-Raphson Keplerian propagator, Tsiolkovsky $\Delta V$, Vis-Viva, Hohmann transfers |
| **3D Solar System** | Full interactive 3D solar system with accurate orbital planes and scales |
| **Trajectory Designer** | Interactive Hohmann transfer calculator with live formula cards |
| **Failure Lab** | What-if failure simulation with causal chain diagnostics |
| **Historical Comparison**| Benchmark custom designs against MRO, Curiosity, JWST, and Cassini |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, React 18, TypeScript Strict Mode)
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **State Management**: Zustand + Immer
- **Styling**: Tailwind CSS v3 with custom glassmorphism and space-themed UI design system
- **Icons**: Lucide React
- **Physics**: Zero-dependency astrodynamics engine (`kepler.ts`, `deltaV.ts`, `visviva.ts`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/MilindLate/space-mission-design-game.git

# Navigate to project folder
cd space-mission-design-game

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch the mission designer.

---

## 👥 About

An open-source interactive space mission design and astrodynamics platform combining game mechanics with real aerospace engineering principles.

---

## 📄 Documentation

- [Architecture](ARCHITECTURE.md)
- [Scientific Model](SCIENTIFIC_MODEL.md)
- [Data Sources](DATA_SOURCES.md)
- [Installation Guide](INSTALLATION_GUIDE.md)
- [User Guide](USER_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Testing Report](TESTING_REPORT.md)
- [Development Progress](DEVELOPMENT_PROGRESS.md)
