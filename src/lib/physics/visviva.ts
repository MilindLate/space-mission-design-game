/**
 * visviva.ts — Orbital mechanics module for Space Mission Game
 *
 * All distance units: km, velocity: km/s, time: seconds (unless noted).
 * No external imports — pure TypeScript math only.
 */

// ---------------------------------------------------------------------------
// Gravitational parameters μ = GM (km³/s²)
// Source: IAU 2012 / JPL DE430
// ---------------------------------------------------------------------------
export const GM = {
  Sun: 1.32712440018e11,
  Earth: 398600.4418,
  Moon: 4902.8,
  Mars: 42828.3,
} as const;

/**
 * Orbital speed at radius r on an orbit with semi-major axis a.
 * Formula:  v = √[ μ · (2/r − 1/a) ]
 * Source: Bate, Mueller & White, "Fundamentals of Astrodynamics", §2.4
 */
export function visViva(mu: number, r: number, a: number): number {
  const term = a === Infinity ? 2 / r : 2 / r - 1 / a;
  return Math.sqrt(mu * term);
}

/**
 * Minimum speed required to escape a body's gravity from radius r.
 * Formula:  v_esc = √(2μ/r)
 */
export function escapeVelocity(mu: number, r: number): number {
  return Math.sqrt((2 * mu) / r);
}

/**
 * Characteristic energy C3 = v_∞²
 * C3 ≥ 0 means escape; C3 < 0 means bound orbit.
 * Source: Wertz & Larson, "Space Mission Analysis and Design", §6.3
 */
export function c3Energy(vinf: number): number {
  return vinf * vinf;
}

/**
 * Orbital period of an elliptical orbit.
 * Formula:  T = 2π √(a³/μ)
 * Source: Kepler's Third Law; Bate et al. §2.6
 */
export function orbitalPeriodSeconds(sma: number, mu: number): number {
  return 2 * Math.PI * Math.sqrt((sma * sma * sma) / mu);
}

/**
 * Compute the two impulsive ΔV burns for a Hohmann transfer.
 * Source: Curtis, "Orbital Mechanics for Engineering Students", §6.1
 */
export function hohmannTransfer(
  r1: number,
  r2: number,
  mu: number,
): {
  dv1: number;
  dv2: number;
  totalDV: number;
  transferTimeSeconds: number;
  transferTimeDays: number;
  formulaStrings: string[];
} {
  const vc1 = Math.sqrt(mu / r1);
  const vc2 = Math.sqrt(mu / r2);
  const at = (r1 + r2) / 2;
  const vt1 = visViva(mu, r1, at);
  const vt2 = visViva(mu, r2, at);
  const dv1 = Math.abs(vt1 - vc1);
  const dv2 = Math.abs(vc2 - vt2);
  const totalDV = dv1 + dv2;
  const transferTimeSeconds = Math.PI * Math.sqrt((at * at * at) / mu);
  const transferTimeDays = transferTimeSeconds / 86400;

  const formulaStrings = [
    `v_c1 = √(μ/r₁) = ${vc1.toFixed(3)} km/s`,
    `a_t = (r₁ + r₂)/2 = ${at.toFixed(0)} km`,
    `v_t1 = √[μ(2/r₁ − 1/aₜ)] = ${vt1.toFixed(3)} km/s`,
    `Δv₁ = v_t1 − v_c1 = ${dv1.toFixed(3)} km/s`,
    `v_c2 = √(μ/r₂) = ${vc2.toFixed(3)} km/s`,
    `v_t2 = √[μ(2/r₂ − 1/aₜ)] = ${vt2.toFixed(3)} km/s`,
    `Δv₂ = v_c2 − v_t2 = ${dv2.toFixed(3)} km/s`,
    `t_transfer = π√(aₜ³/μ) = ${transferTimeDays.toFixed(1)} days`,
  ];

  return { dv1, dv2, totalDV, transferTimeSeconds, transferTimeDays, formulaStrings };
}

/**
 * Time between successive alignments of two bodies.
 * Formula:  1/T_syn = |1/T1 − 1/T2|
 * Source: Vallado, "Fundamentals of Astrodynamics and Applications", §9.2
 */
export function synodicPeriod(T1: number, T2: number): number {
  return 1 / Math.abs(1 / T1 - 1 / T2);
}

/**
 * Phase angle of target body required at departure for Hohmann rendezvous.
 * Formula:  φ = π − ω₂ · t_H
 * Source: Bate et al. §7.5
 */
export function launchPhaseAngle(
  r1: number,
  r2: number,
  mu: number,
): { radians: number; degrees: number } {
  const at = (r1 + r2) / 2;
  const tH = Math.PI * Math.sqrt((at * at * at) / mu);
  const T2 = orbitalPeriodSeconds(r2, mu);
  const omega2 = (2 * Math.PI) / T2;
  const radians = Math.PI - omega2 * tH;
  const degrees = (radians * 180) / Math.PI;
  return { radians, degrees };
}

/**
 * Received signal power using Friis free-space path loss.
 * FSPL (dB) = 20·log10(d_km) + 20·log10(f_GHz) + 92.45
 * P_rx (dBW) = P_tx(dBW) + G_tx + G_rx − FSPL
 * Source: Friis (1946); SMAD §13.4
 */
export function linkBudget(params: {
  txPowerW: number;
  txGainDBi: number;
  rxGainDBi: number;
  frequencyGHz: number;
  rangeKm: number;
}): number {
  const { txPowerW, txGainDBi, rxGainDBi, frequencyGHz, rangeKm } = params;
  const txPowerDBW = 10 * Math.log10(txPowerW);
  const fspl = 20 * Math.log10(rangeKm) + 20 * Math.log10(frequencyGHz) + 92.45;
  return txPowerDBW + txGainDBi + rxGainDBi - fspl;
}

/**
 * Solar panel power fraction after degradation and distance.
 * fraction = (1/d²) · (1 − rate)^years
 * Source: SMAD §20.4
 */
export function solarPowerFraction(years: number, distanceAU: number): number {
  const ANNUAL_DEGRADATION = 0.005;
  const irradianceFraction = 1 / (distanceAU * distanceAU);
  const ageFraction = Math.pow(1 - ANNUAL_DEGRADATION, years);
  return irradianceFraction * ageFraction;
}
