# Space Mission Design Game

**NASA Space Apps Challenge 2026** | Interactive Mission Planning & Simulation Platform

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](/)

---

## 🚀 Overview

An award-targeted, scientifically rigorous web application that lets users design complete space missions from scratch — selecting destinations, assembling spacecraft from real component specs, matching launch vehicles, and simulating orbital dynamics in real time using live JPL ephemeris data and Keplerian orbital mechanics.

---

## 🌐 Demo

**Live URL**: _Deploy to Vercel (see Installation Guide)_

---

## ✨ Features

| Feature | Description |
|---|---|
| **6 Destinations** | LEO, SSO, GTO, Lunar Orbit, Sun–Earth L2, Mars Transfer |
| **22 Components** | NASA-heritage specs: structure, power, propulsion, comms, payload, thermal |
| **6 Launch Vehicles** | Electron → SLS Block 1, with real payload capacities |
| **Live JPL Data** | Planet positions via JPL Horizons API (real heliocentric ephemeris) |
| **Keplerian Physics** | Newton–Raphson propagator, Tsiolkovsky rocket equation, Hohmann transfer |
| **Mission Control** | Real-time telemetry dashboard with subsystem health monitoring |
| **Solar System 3D** | Interactive 3D explorer with all 8 planets at real JPL positions |
| **Trajectory Designer** | Hohmann transfer calculator with vis-viva formula display |
| **Failure Lab** | 5 failure scenarios with causal chain analysis and fix guidance |
| **Mission Comparison** | Compare your design vs. MRO, Curiosity, JWST, Cassini |
| **Random Events** | Solar particle events, sensor degradation, comm blackouts |
| **Mission Report** | Grade S/A/B/C/F with science yield, budget efficiency, failure tree |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript strict mode)
- **3D Graphics**: Three.js via `@react-three/fiber` + `@react-three/drei`
- **State**: Zustand + Immer
- **Styling**: Tailwind CSS v3
- **Physics**: Custom Keplerian propagator + vis-viva engine (zero external dependencies)
- **Data**: JPL Horizons API (live), NASA NTRS references, NASA NSSDC

---

## 📸 Screenshots

_Add screenshots after deployment_

---

## 🔬 NASA Data Usage

| Data Source | Purpose |
|---|---|
| JPL Horizons API | Real-time heliocentric planet positions (AU) |
| NASA NSSDC | Orbital parameters: semiMajorAxis, eccentricity, inclination |
| NASA mission archives | Real spacecraft specs for MRO, Curiosity, JWST, Cassini |
| NASA NTRS | Engineering references for propulsion, power, comms |

---

## 👥 Team

Built for NASA Space Apps Challenge 2026.

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
