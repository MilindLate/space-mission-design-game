// ============================================================
// Orbital Destinations Catalog
// Sources: NASA JPL Horizons, NSSDC Orbital Data, ESA ESOC
// ============================================================

import type { OrbitalDestination } from '@/types';

export const DESTINATIONS: OrbitalDestination[] = [
  {
    id: 'LEO',
    name: 'Low Earth Orbit',
    description:
      'The workhorse of space operations. Altitudes of 160–2,000 km with ~90-min orbital periods. Ideal for Earth observation, technology demos, and crewed missions.',
    centralBody: 'Earth',
    semiMajorAxis: 6778,       // 400 km altitude + Earth radius 6378 km
    eccentricity: 0.001,
    inclination: 28.5,
    requiredDeltaV: 9400,      // m/s from ground; ~3200 from upper atmosphere
    minDurationMonths: 6,
    solarIrradiance: 1361,     // W/m² at 1 AU
    radiationLevel: 'low',
    dsnContactHoursPerDay: 8,
    scienceOpportunityScore: 60,
    color: '#4FC3F7',
    bodyRadius: 1.0,
  },
  {
    id: 'SSO',
    name: 'Sun-Synchronous Orbit',
    description:
      'A near-polar orbit (~98°) that precesses at the same rate Earth orbits the Sun, giving consistent lighting for imaging. Used by Landsat, Sentinel, and most Earth-observation missions.',
    centralBody: 'Earth',
    semiMajorAxis: 7071,       // ~700 km altitude
    eccentricity: 0.001,
    inclination: 98.2,
    requiredDeltaV: 9600,
    minDurationMonths: 6,
    solarIrradiance: 1361,
    radiationLevel: 'low',
    dsnContactHoursPerDay: 6,
    scienceOpportunityScore: 75,
    color: '#81C784',
    bodyRadius: 1.0,
  },
  {
    id: 'GTO',
    name: 'Geostationary Transfer Orbit',
    description:
      'An elliptical orbit (perigee ~200 km, apogee ~35,786 km) used as a staging orbit to reach GEO. High radiation exposure during Van Allen belt transits requires hardened components.',
    centralBody: 'Earth',
    semiMajorAxis: 24371,      // (200 + 35786)/2 + 6378
    eccentricity: 0.731,
    inclination: 5.0,
    requiredDeltaV: 11500,
    minDurationMonths: 12,
    solarIrradiance: 1361,
    radiationLevel: 'high',
    dsnContactHoursPerDay: 10,
    scienceOpportunityScore: 65,
    color: '#FFB74D',
    bodyRadius: 1.0,
  },
  {
    id: 'LUNAR',
    name: 'Lunar Orbit',
    description:
      'A 100 km circular orbit around the Moon (~1738 km radius). Enables surface mapping, resource prospecting, and relay communications for surface assets. Used by LRO, Chandrayaan, KPLO.',
    centralBody: 'Moon',
    semiMajorAxis: 1838,       // 100 km altitude + Moon radius 1738 km
    eccentricity: 0.002,
    inclination: 90.0,
    requiredDeltaV: 15900,     // TLI + LOI total budget
    minDurationMonths: 12,
    solarIrradiance: 1361,
    radiationLevel: 'medium',
    dsnContactHoursPerDay: 4,
    scienceOpportunityScore: 85,
    color: '#B0BEC5',
    bodyRadius: 0.27,
  },
  {
    id: 'L2',
    name: 'Sun-Earth Lagrange Point L2',
    description:
      'A gravitationally stable point 1.5 million km from Earth, always on the night side. Ideal for deep-space observatories (Webb, Planck, Euclid). Requires halo orbit maintenance.',
    centralBody: 'Sun',
    semiMajorAxis: 151500000,  // ~1.01 AU
    eccentricity: 0.016,
    inclination: 0.1,
    requiredDeltaV: 13200,     // TCM + halo injection
    minDurationMonths: 24,
    solarIrradiance: 1321,     // slightly less than 1 AU
    radiationLevel: 'medium',
    dsnContactHoursPerDay: 3,
    scienceOpportunityScore: 95,
    color: '#CE93D8',
    bodyRadius: 0.5,
  },
  {
    id: 'MARS',
    name: 'Mars Transfer Orbit',
    description:
      'A Hohmann-like interplanetary trajectory to Mars using a ~7-month cruise. Arrival at ~400 km Mars orbit. Extreme communication delays (3–22 min one-way) demand autonomous fault management.',
    centralBody: 'Mars',
    semiMajorAxis: 3796,       // 400 km altitude + Mars radius 3396 km
    eccentricity: 0.005,
    inclination: 93.0,
    requiredDeltaV: 23900,     // TMI + MOI combined
    minDurationMonths: 24,
    solarIrradiance: 590,      // W/m² at 1.52 AU
    radiationLevel: 'extreme',
    dsnContactHoursPerDay: 2,
    scienceOpportunityScore: 100,
    color: '#EF9A9A',
    bodyRadius: 0.53,
  },
];

export const getDestinationById = (id: string): OrbitalDestination | undefined =>
  DESTINATIONS.find((d) => d.id === id);
