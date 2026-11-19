# API Documentation

## `/api/horizons` — JPL Horizons Proxy

**Method**: GET  
**Description**: Server-side proxy to JPL Horizons API. Returns heliocentric position and velocity of any solar system body for a given date. Avoids CORS restrictions.

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | ✅ | JPL body ID (e.g. `'499'` for Mars) |
| `startTime` | string | ✅ | Start date in `YYYY-Mon-DD` format (e.g. `2025-Jan-15`) |
| `stopTime` | string | ✅ | Stop date, 1 day after startTime |

### Body IDs

| Body | ID |
|------|----|
| Sun | 10 |
| Mercury | 199 |
| Venus | 299 |
| Earth | 399 |
| Moon | 301 |
| Mars | 499 |
| Jupiter | 599 |
| Saturn | 699 |
| Uranus | 799 |
| Neptune | 899 |

### Success Response (200)

```json
{
  "body": "499",
  "jd": 2460692.5,
  "position": {
    "x": 1.234,
    "y": -0.567,
    "z": 0.012
  },
  "velocity": {
    "vx": 0.001234,
    "vy": -0.005678,
    "vz": 0.000123
  },
  "unit": "AU"
}
```

Units: positions in AU, velocities in AU/day.

### Fallback Response (200, when JPL unavailable)

```json
{
  "error": "JPL API timeout",
  "fallback": true
}
```

The client (`src/lib/api/horizons.ts`) automatically uses `PLANET_FALLBACK_POSITIONS` when `fallback: true`.

### Example Call

```javascript
const res = await fetch('/api/horizons?command=499&startTime=2025-Jan-15&stopTime=2025-Jan-16');
const data = await res.json();
// data.position.x, data.position.y, data.position.z in AU
```

---

## Client API: `src/lib/api/horizons.ts`

### `getPlanetPosition(bodyName, date?)`

```typescript
import { getPlanetPosition } from '@/lib/api/horizons';

const pos = await getPlanetPosition('Mars', new Date('2025-01-15'));
// pos: { x, y, z, vx, vy, vz, jd, fallback? }
```

Results are cached in-memory per `bodyName + dateString` to avoid redundant requests.

### `getAllPlanetPositions(date?)`

```typescript
import { getAllPlanetPositions } from '@/lib/api/horizons';

const positions = await getAllPlanetPositions(new Date());
// positions: Record<string, HorizonsPosition>
// Keys: 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'
```

Fetches all 8 planets in parallel via `Promise.all`.

---

## Physics API: `src/lib/physics/visviva.ts`

```typescript
import { visViva, escapeVelocity, hohmannTransfer, GM } from '@/lib/physics/visviva';

// Orbital speed at 400 km LEO
const v = visViva(GM.Earth, 6771, 6771); // 7.669 km/s

// Hohmann transfer: LEO → GEO
const result = hohmannTransfer(6771, 42164, GM.Earth);
// result.dv1, result.dv2, result.totalDV, result.transferTimeDays
```

---

## State API: `src/lib/store/useMissionStore.ts`

The Zustand store exposes the full `MissionStoreState` type (see `src/types/index.ts`).

```typescript
import { useMissionStore } from '@/lib/store/useMissionStore';

function MyComponent() {
  const { resources, deltaVBudget, mission, currentStep } = useMissionStore();
  const { totalMass, powerGenerated, totalCost } = resources;
}
```

Key read-only computed values updated automatically on every action:
- `resources: ResourceSummary` — mass, power, cost, data rate, storage, reliability
- `deltaVBudget: DeltaVBudget | null` — available ΔV, required ΔV, feasibility
- `isValidForLaunch: boolean` — all 7 checklist conditions met
