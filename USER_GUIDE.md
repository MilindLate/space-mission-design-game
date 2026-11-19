# User Guide

## Getting Started

1. Open the app at [localhost:3000](http://localhost:3000) (or deployed URL)
2. You'll see the **Landing Page** with mission type quick-start options
3. Click **"🚀 Design Your Mission →"** or pick a mission type tile to begin

---

## Step 1: Choose Your Destination

- Browse the 6 available orbital destinations:
  - **LEO** — Low Earth Orbit (400 km, easiest, lowest ΔV)
  - **SSO** — Sun-Synchronous Orbit (great for Earth observation)
  - **GTO** — Geostationary Transfer (communications satellites)
  - **Lunar Orbit** — Moon science missions
  - **L2** — Sun–Earth Lagrange Point (astronomical observatories like JWST)
  - **Mars Transfer** — Interplanetary missions (hardest, highest ΔV)

- Each card shows radiation level, DSN contact hours, solar irradiance, and science score
- Choose mission duration (6 / 12 / 24 / 60 months)
- Click **"Select Mission"** then **"Proceed to Spacecraft Assembly →"**

---

## Step 2: Spacecraft Assembly

### Component Categories
| Tab | Components |
|-----|-----------|
| Structure | Satellite buses (3U to large) |
| Power | Solar arrays, RTGs, batteries |
| Propulsion | Chemical, ion drives, monoprop |
| Comms | S-Band, X-Band, Ka-Band |
| Payload | Cameras, spectrometers, magnetometers |
| Thermal | Radiators, MLI blankets |

### Resource HUD
Watch the live gauges:
- **Mass** — must stay below launch vehicle payload capacity
- **Power** — generated must exceed peak duty cycle draw
- **Cost** — total component + launch cost
- **Data Rate** — science instruments vs. storage + downlink
- **ΔV Budget** — available vs. required for your destination

### Validation Checklist
Before proceeding, the system checks:
1. ✅ Primary structure installed
2. ✅ Power generation > continuous load
3. ✅ Propulsion system present
4. ✅ At least one communication system
5. ✅ At least one science payload
6. ✅ Thermal management installed
7. ✅ Total cost within budget

---

## Step 3: Launch Vehicle

- Choose from 6 launch vehicles
- The compatibility bar shows: `[your mass] / [LV capacity]` — must be green
- ΔV budget panel shows required vs. available ΔV
- Select vehicle and click **"Proceed to Mission Simulation →"**

---

## Step 4: Simulation

- Click **▶ Start Mission**
- Watch your spacecraft orbit in 3D
- Use speed controls: **1×**, **10×**, **100×**
- **Random events** will fire — read them carefully and click **"Resolve"** quickly
  - Unresolved events reduce your final score
- Click **"End Mission"** when ready to see your results

---

## Mission Report

Your mission is graded **S / A / B / C / F** based on:
- Scientific Data Yield (35%)
- Mass Efficiency (25%)
- Power Management (20%)
- Mission Completion (20%)
- Minus penalties for unresolved events

---

## Extra Features

### Solar System Explorer
Click **"🪐 Explore Solar System"** from the landing page to see all 8 planets at real JPL Horizons positions.

### Trajectory Designer
Inside the game (accessible from the trajectory step) — compute Hohmann transfer burns and transfer time with formula explanations.

### Failure Lab
See 5 common mission failure modes and check if your current design is vulnerable.

### Mission Comparison
Compare your design against MRO, Curiosity, JWST, and Cassini in a side-by-side table.
