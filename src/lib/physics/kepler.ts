// ============================================================
// Keplerian Orbital Propagator
// Implements two-body problem orbital mechanics
// Reference: Bate, Mueller & White "Fundamentals of Astrodynamics"
// NASA JPL standard orbital element definitions
// ============================================================

import type { KeplerianElements, CartesianState } from '@/types';

// ── Gravitational parameters μ = GM (km³/s²) ────────────────
export const MU: Record<string, number> = {
  Earth: 398600.4418,
  Moon: 4902.8001,
  Mars: 42828.375,
  Sun: 1.32712440018e11,
};

const DEG2RAD = Math.PI / 180;

/**
 * Solve Kepler's equation M = E - e·sin(E) for eccentric anomaly E
 * using Newton-Raphson iteration. Converges in <10 iterations for e < 1.
 */
export function solveKeplerEquation(M: number, e: number): number {
  let E = M; // initial guess
  for (let i = 0; i < 100; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/**
 * Convert eccentric anomaly E to true anomaly ν (radians)
 */
export function eccentricToTrueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2),
  );
}

/**
 * Propagate Keplerian elements forward by dt seconds.
 * Returns new true anomaly in degrees.
 */
export function propagateOrbit(elements: KeplerianElements, dtSeconds: number): number {
  const { a, e, mu } = elements;
  // Mean motion n = sqrt(μ / a³) rad/s
  const n = Math.sqrt(mu / (a * a * a));

  // Current eccentric anomaly
  const nu0 = elements.trueAnomaly * DEG2RAD;
  const E0 = 2 * Math.atan2(
    Math.sqrt(1 - e) * Math.sin(nu0 / 2),
    Math.sqrt(1 + e) * Math.cos(nu0 / 2),
  );
  const M0 = E0 - e * Math.sin(E0);

  // Propagate mean anomaly
  const M = M0 + n * dtSeconds;
  const E = solveKeplerEquation(M, e);
  const nu = eccentricToTrueAnomaly(E, e);

  return (nu / DEG2RAD + 360) % 360;
}

/**
 * Convert Keplerian elements to Cartesian ECI state vector (km, km/s)
 * Reference: Algorithm 10 from Curtis "Orbital Mechanics for Engineering Students"
 */
export function keplerianToCartesian(elements: KeplerianElements): CartesianState {
  const { a, e, i, omega, argPeri, trueAnomaly, mu } = elements;
  const iRad = i * DEG2RAD;
  const omegaRad = omega * DEG2RAD;
  const argPeriRad = argPeri * DEG2RAD;
  const nuRad = trueAnomaly * DEG2RAD;

  // Semi-latus rectum
  const p = a * (1 - e * e);
  // Radius
  const r = p / (1 + e * Math.cos(nuRad));

  // Position in perifocal frame
  const xPerif = r * Math.cos(nuRad);
  const yPerif = r * Math.sin(nuRad);

  // Velocity in perifocal frame
  const sqrtMuP = Math.sqrt(mu / p);
  const vxPerif = -sqrtMuP * Math.sin(nuRad);
  const vyPerif = sqrtMuP * (e + Math.cos(nuRad));

  // Rotation matrices: perifocal → ECI
  const cosO = Math.cos(omegaRad);
  const sinO = Math.sin(omegaRad);
  const cosW = Math.cos(argPeriRad);
  const sinW = Math.sin(argPeriRad);
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);

  // Combined rotation matrix row vectors
  const Qxx = cosO * cosW - sinO * sinW * cosI;
  const Qxy = -cosO * sinW - sinO * cosW * cosI;
  const Qyx = sinO * cosW + cosO * sinW * cosI;
  const Qyy = -sinO * sinW + cosO * cosW * cosI;
  const Qzx = sinW * sinI;
  const Qzy = cosW * sinI;

  return {
    x: Qxx * xPerif + Qxy * yPerif,
    y: Qyx * xPerif + Qyy * yPerif,
    z: Qzx * xPerif + Qzy * yPerif,
    vx: Qxx * vxPerif + Qxy * vyPerif,
    vy: Qyx * vxPerif + Qyy * vyPerif,
    vz: Qzx * vxPerif + Qzy * vyPerif,
  };
}

/**
 * Compute orbital period in seconds
 */
export function orbitalPeriod(semiMajorAxis: number, mu: number): number {
  return 2 * Math.PI * Math.sqrt((semiMajorAxis ** 3) / mu);
}

/**
 * Generate an array of 3D position points for one full orbit (for trail rendering)
 * Returns array of [x, y, z] in km, scaled to render units (÷ scaleFactor)
 */
export function generateOrbitTrail(
  elements: KeplerianElements,
  numPoints = 128,
  scaleFactor = 10000,
): Array<[number, number, number]> {
  const trail: Array<[number, number, number]> = [];
  for (let i = 0; i < numPoints; i++) {
    const nu = (i / numPoints) * 360;
    const state = keplerianToCartesian({ ...elements, trueAnomaly: nu });
    trail.push([state.x / scaleFactor, state.z / scaleFactor, state.y / scaleFactor]);
  }
  return trail;
}
