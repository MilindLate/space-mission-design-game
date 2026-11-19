/** NAIF/JPL body IDs for major solar system bodies */
export const BODY_IDS: Record<string, string> = {
  Sun: '10',
  Mercury: '199',
  Venus: '299',
  Earth: '399',
  Moon: '301',
  Mars: '499',
  Jupiter: '599',
  Saturn: '699',
  Uranus: '799',
  Neptune: '899',
};

/** Heliocentric position and velocity in AU / AU·day⁻¹ */
export interface HorizonsPosition {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  jd: number;
  fallback?: boolean;
}

/**
 * Approximate heliocentric positions (AU) for J2000.0 (JD 2451545.0).
 * Velocities are mean orbital velocities converted to AU/day.
 * Used when the JPL Horizons API is unavailable.
 */
export const PLANET_FALLBACK_POSITIONS: Record<string, HorizonsPosition> = {
  Mercury: {
    x: 0.3871,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.02576, // ~47.9 km/s → AU/day
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Venus: {
    x: 0.7233,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.02020, // ~35.0 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Earth: {
    x: 1.0,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.01720, // ~29.8 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Mars: {
    x: 1.5237,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.01328, // ~24.1 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Jupiter: {
    x: 5.2034,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.00752, // ~13.1 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Saturn: {
    x: 9.5371,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.00557, // ~9.7 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Uranus: {
    x: 19.1913,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.00392, // ~6.8 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
  Neptune: {
    x: 30.0690,
    y: 0.0,
    z: 0.0,
    vx: 0.0,
    vy: 0.00312, // ~5.4 km/s
    vz: 0.0,
    jd: 2451545.0,
    fallback: true,
  },
};

/** Month abbreviations for Horizons date format (YYYY-Mon-DD) */
const MONTH_ABBREV = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Format a Date as "YYYY-Mon-DD" for the Horizons API */
function formatHorizonsDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = MONTH_ABBREV[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Module-level cache: key = bodyName + dateStr */
const positionCache = new Map<string, HorizonsPosition>();

/** Shape of the route.ts success response */
interface HorizonsRouteSuccess {
  body: string;
  jd: number;
  position: { x: number; y: number; z: number };
  velocity: { vx: number; vy: number; vz: number };
  unit: string;
}

/** Shape of the route.ts error/fallback response */
interface HorizonsRouteError {
  error: string;
  fallback: boolean;
}

type HorizonsRouteResponse = HorizonsRouteSuccess | HorizonsRouteError;

function isErrorResponse(r: HorizonsRouteResponse): r is HorizonsRouteError {
  return 'fallback' in r && (r as HorizonsRouteError).fallback === true;
}

/**
 * Fetch the heliocentric position of a solar system body from the
 * local /api/horizons proxy (which calls JPL Horizons).
 *
 * Falls back to PLANET_FALLBACK_POSITIONS on any error.
 */
export async function getPlanetPosition(
  bodyName: string,
  date?: Date
): Promise<HorizonsPosition> {
  const resolvedDate = date ?? new Date();
  const startStr = formatHorizonsDate(resolvedDate);

  const cacheKey = bodyName + startStr;
  const cached = positionCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const bodyId = BODY_IDS[bodyName];
  if (!bodyId) {
    return { ...(PLANET_FALLBACK_POSITIONS[bodyName] ?? PLANET_FALLBACK_POSITIONS['Earth']), fallback: true };
  }

  // stopTime = startTime + 1 day
  const stopDate = new Date(resolvedDate);
  stopDate.setUTCDate(stopDate.getUTCDate() + 1);
  const stopStr = formatHorizonsDate(stopDate);

  try {
    const url =
      `/api/horizons?command=${encodeURIComponent(bodyId)}` +
      `&startTime=${encodeURIComponent(startStr)}` +
      `&stopTime=${encodeURIComponent(stopStr)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as HorizonsRouteResponse;

    if (isErrorResponse(data)) {
      const fallback = { ...(PLANET_FALLBACK_POSITIONS[bodyName] ?? PLANET_FALLBACK_POSITIONS['Earth']), fallback: true };
      positionCache.set(cacheKey, fallback);
      return fallback;
    }

    const result: HorizonsPosition = {
      x: data.position.x,
      y: data.position.y,
      z: data.position.z,
      vx: data.velocity.vx,
      vy: data.velocity.vy,
      vz: data.velocity.vz,
      jd: data.jd,
      fallback: false,
    };

    positionCache.set(cacheKey, result);
    return result;
  } catch {
    const fallback = { ...(PLANET_FALLBACK_POSITIONS[bodyName] ?? PLANET_FALLBACK_POSITIONS['Earth']), fallback: true };
    positionCache.set(cacheKey, fallback);
    return fallback;
  }
}

/** The 8 planets (excluding Sun/Moon) for getAllPlanetPositions */
const PLANETS = [
  'Mercury', 'Venus', 'Earth', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune',
] as const;

/**
 * Fetch heliocentric positions for all 8 planets in parallel.
 * Falls back gracefully per-planet on error.
 */
export async function getAllPlanetPositions(
  date?: Date
): Promise<Record<string, HorizonsPosition>> {
  const results = await Promise.all(
    PLANETS.map((planet) => getPlanetPosition(planet, date))
  );

  return Object.fromEntries(
    PLANETS.map((planet, i) => [planet, results[i]])
  );
}
