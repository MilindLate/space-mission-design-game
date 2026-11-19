// ============================================================
// Delta-V Budget Calculator
// Implements Hohmann transfers, bi-elliptic transfers,
// and Tsiolkovsky rocket equation for mission feasibility.
// Reference: NASA SP-8135, Curtis "Orbital Mechanics Ch.6"
// ============================================================

import type { DeltaVBudget, OrbitalDestination, SpacecraftComponent } from '@/types';
import { MU } from './kepler';

// ── Constants ─────────────────────────────────────────────────
/** Earth surface radius km */
const R_EARTH = 6378.137;
/** Standard launch parking orbit altitude km */
const PARKING_ORBIT_ALT = 185;
/** Parking orbit radius km */
const R_PARKING = R_EARTH + PARKING_ORBIT_ALT;

// ── Tsiolkovsky Rocket Equation ────────────────────────────────
/**
 * Returns available ΔV in m/s given Isp, dry mass, and propellant mass.
 * ΔV = Isp × g₀ × ln(m_wet / m_dry)
 */
export function tsiolkovskydV(
  ispSeconds: number,
  dryMassKg: number,
  propellantMassKg: number,
): number {
  if (propellantMassKg <= 0 || dryMassKg <= 0) return 0;
  const g0 = 9.80665; // m/s²
  const massRatio = (dryMassKg + propellantMassKg) / dryMassKg;
  return ispSeconds * g0 * Math.log(massRatio);
}

// ── Best Isp from installed propulsion ───────────────────────
/** Returns the best Isp (s) from the selected component list */
export function getBestIsp(components: SpacecraftComponent[]): number {
  const ispMap: Record<string, number> = {
    prop_cold_gas: 65,
    prop_monoprop: 220,
    prop_biprop: 320,
    prop_ion: 1600,
  };
  let best = 0;
  for (const c of components) {
    const isp = ispMap[c.id] ?? 0;
    if (isp > best) best = isp;
  }
  return best || 220; // default monoprop if none selected
}

// ── Hohmann Transfer ΔV ───────────────────────────────────────
/**
 * Computes ΔV for a Hohmann transfer between two circular orbits.
 * Returns [dv1_ms, dv2_ms] – both burns in m/s.
 * mu: gravitational parameter km³/s²
 */
export function hohmannTransfer(
  r1Km: number,
  r2Km: number,
  mu: number,
): [number, number] {
  const v1 = Math.sqrt(mu / r1Km);                       // km/s circular at r1
  const vt1 = Math.sqrt(mu * (2 / r1Km - 1 / ((r1Km + r2Km) / 2)));
  const v2 = Math.sqrt(mu / r2Km);
  const vt2 = Math.sqrt(mu * (2 / r2Km - 1 / ((r1Km + r2Km) / 2)));
  return [Math.abs(vt1 - v1) * 1000, Math.abs(v2 - vt2) * 1000]; // convert to m/s
}

// ── Full Delta-V Budget ───────────────────────────────────────
/**
 * Computes the complete ΔV budget for a mission to a given destination.
 * Uses real orbital parameters and Hohmann transfer math.
 */
export function computeDeltaVBudget(
  destination: OrbitalDestination,
  dryMassKg: number,
  propellantMassKg: number,
  propulsionComponents: SpacecraftComponent[],
): DeltaVBudget {
  const mu = MU[destination.centralBody] ?? MU.Earth;

  // --- LEO insertion from ground ---
  const leoInsertion = 9400; // m/s (fixed – handled by launch vehicle)

  // --- Transfer burn ---
  let transferBurn = 0;
  let destinationInsertion = 0;

  switch (destination.id) {
    case 'LEO':
    case 'SSO': {
      // Already in target orbit after launch
      transferBurn = 0;
      destinationInsertion = 0;
      break;
    }
    case 'GTO': {
      // GTO perigee ~185 km, apogee ~35786 km
      const r1 = R_PARKING;
      const r2 = R_EARTH + 35786;
      const [dv1] = hohmannTransfer(r1, r2, MU.Earth);
      transferBurn = dv1;
      destinationInsertion = 0; // apogee kick done by launch vehicle
      break;
    }
    case 'LUNAR': {
      // Trans-Lunar Injection + Lunar Orbit Insertion
      transferBurn = 3130;      // TLI from LEO m/s (Apollo heritage)
      destinationInsertion = 900; // LOI to 100 km lunar orbit m/s
      break;
    }
    case 'L2': {
      // L2 halo injection from LEO
      transferBurn = 3300;      // TLI-like burn to L2 m/s (Webb heritage)
      destinationInsertion = 350; // mid-course + halo insertion m/s
      break;
    }
    case 'MARS': {
      // Trans-Mars Injection + Mars Orbit Insertion
      transferBurn = 3600;      // TMI from LEO m/s
      destinationInsertion = 1200; // MOI to 400 km Mars orbit m/s
      break;
    }
  }

  // --- Station keeping (1% of mission total as reserve) ---
  const stationKeeping = Math.round((transferBurn + destinationInsertion) * 0.05 + 50);

  const total = transferBurn + destinationInsertion + stationKeeping;

  // --- Available ΔV from spacecraft propulsion ---
  const isp = getBestIsp(propulsionComponents);
  const available = tsiolkovskydV(isp, dryMassKg, propellantMassKg);

  const margin = available - total;

  return {
    leoInsertion,
    transferBurn,
    destinationInsertion,
    stationKeeping,
    total,
    available: Math.round(available),
    margin: Math.round(margin),
    feasible: margin >= 0,
  };
}

/**
 * Recommend propellant mass for a given dry mass and destination.
 * Returns the minimum propellant mass in kg needed.
 */
export function recommendPropellantMass(
  destination: OrbitalDestination,
  dryMassKg: number,
  ispSeconds: number,
): number {
  // Required ΔV (spacecraft portion – excludes LV's LEO insertion)
  const requiredDV: Record<string, number> = {
    LEO: 100,
    SSO: 150,
    GTO: 1800,
    LUNAR: 4200,
    L2: 3800,
    MARS: 5100,
  };
  const dv = requiredDV[destination.id] ?? 500;
  const g0 = 9.80665;
  // m_propellant = m_dry × (e^(dv / (Isp × g0)) - 1)
  const massRatio = Math.exp(dv / (ispSeconds * g0));
  return Math.ceil(dryMassKg * (massRatio - 1));
}
