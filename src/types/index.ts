// ============================================================
// Space Mission Design Game — Type Definitions
// NASA Space Apps Challenge 2026
// All specs derived from NASA technical publications
// ============================================================

// ── Orbital Destinations ────────────────────────────────────

export type OrbitId =
  | 'LEO'
  | 'SSO'
  | 'GTO'
  | 'LUNAR'
  | 'L2'
  | 'MARS';

export interface OrbitalDestination {
  id: OrbitId;
  name: string;
  description: string;
  centralBody: 'Earth' | 'Moon' | 'Mars' | 'Sun';
  /** Semi-major axis in km */
  semiMajorAxis: number;
  /** Orbital eccentricity */
  eccentricity: number;
  /** Inclination in degrees */
  inclination: number;
  /** Required delta-V from LEO in m/s */
  requiredDeltaV: number;
  /** Minimum mission duration in months */
  minDurationMonths: number;
  /** Available solar irradiance W/m² */
  solarIrradiance: number;
  /** Radiation environment (GEO equivalents) */
  radiationLevel: 'low' | 'medium' | 'high' | 'extreme';
  /** DSN contact hours per day */
  dsnContactHoursPerDay: number;
  /** Scientific opportunity score 0–100 */
  scienceOpportunityScore: number;
  /** Color for 3D rendering */
  color: string;
  /** Size scale factor for 3D rendering */
  bodyRadius: number;
}

// ── Spacecraft Components ────────────────────────────────────

export type ComponentCategory =
  | 'structure'
  | 'power'
  | 'propulsion'
  | 'communications'
  | 'payload'
  | 'thermal';

export interface SpacecraftComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  /** Dry mass in kg */
  mass: number;
  /** Continuous power draw in Watts (negative = generated) */
  powerDraw: number;
  /** Peak power draw in Watts */
  peakPowerDraw: number;
  /** Cost in millions USD */
  cost: number;
  /** Data rate produced in Mbps (payloads only) */
  dataRateMbps: number;
  /** Solid-state storage in GB (comms/structure) */
  storageGB: number;
  /** Mission reliability score 0–1 */
  reliability: number;
  /** Requires radiation hardening for high-rad orbits */
  radiationHardened: boolean;
  /** Compatible destinations */
  compatibleDestinations: OrbitId[];
  /** Whether only one instance is allowed */
  unique: boolean;
  /** Max count that can be installed */
  maxCount: number;
  /** NASA reference / source */
  nasaRef: string;
}

// ── Launch Vehicles ───────────────────────────────────────────

export interface LaunchVehicle {
  id: string;
  name: string;
  manufacturer: string;
  description: string;
  /** Payload to LEO in kg */
  payloadToLEO: number;
  /** Payload to GTO in kg */
  payloadToGTO: number;
  /** Payload to escape trajectory (TLI/TMI) in kg */
  payloadToEscape: number;
  /** Launch cost in millions USD */
  launchCostM: number;
  /** Fairing diameter in meters */
  fairingDiameterM: number;
  /** Fairing usable height in meters */
  fairingHeightM: number;
  /** Onboard delta-V capability in m/s (upper stage) */
  upperStageDeltaV: number;
  /** Destinations this vehicle can reach */
  compatibleDestinations: OrbitId[];
  /** Reliability score 0–1 */
  reliability: number;
  nasaRef: string;
}

// ── Physics ───────────────────────────────────────────────────

export interface KeplerianElements {
  /** Semi-major axis in km */
  a: number;
  /** Eccentricity */
  e: number;
  /** Inclination in degrees */
  i: number;
  /** Right ascension of ascending node in degrees */
  omega: number;
  /** Argument of periapsis in degrees */
  argPeri: number;
  /** True anomaly at epoch in degrees */
  trueAnomaly: number;
  /** Gravitational parameter of central body μ in km³/s² */
  mu: number;
}

export interface CartesianState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface DeltaVBudget {
  /** LEO insertion m/s */
  leoInsertion: number;
  /** Transfer burn m/s */
  transferBurn: number;
  /** Orbit insertion at destination m/s */
  destinationInsertion: number;
  /** Station keeping reserve m/s */
  stationKeeping: number;
  /** Total required m/s */
  total: number;
  /** Available from spacecraft wet mass and engine Isp */
  available: number;
  /** Margin: available - total */
  margin: number;
  /** Whether the mission is feasible */
  feasible: boolean;
}

// ── Mission Duration ──────────────────────────────────────────

export type MissionDurationMonths = 6 | 12 | 24 | 60;

// ── Store State ───────────────────────────────────────────────

export type GameStep = 0 | 1 | 2 | 3 | 4;

export interface SpacecraftConfig {
  /** Installed component IDs with count */
  components: Array<{ componentId: string; count: number }>;
  /** Propellant mass in kg (set by engine selection) */
  propellantMass: number;
  /** Mission duration chosen by player */
  missionDurationMonths: MissionDurationMonths;
}

export interface MissionConfig {
  destination: OrbitalDestination | null;
  primaryObjective: string;
}

export interface ResourceSummary {
  totalMass: number;
  dryMass: number;
  propellantMass: number;
  powerGenerated: number;
  peakPowerDraw: number;
  continuousPowerDraw: number;
  totalCost: number;
  dataRateMbps: number;
  storageGB: number;
  averageReliability: number;
}

export interface ResourceConstraint {
  label: string;
  current: number;
  max: number;
  unit: string;
  status: 'ok' | 'warning' | 'critical';
}

// ── Simulation ────────────────────────────────────────────────

export type EventType =
  | 'solar_particle_event'
  | 'sensor_degradation'
  | 'comms_blackout'
  | 'micrometeorite_impact'
  | 'battery_fault'
  | 'thruster_anomaly';

export type EventSeverity = 'info' | 'warning' | 'critical';

export interface MissionEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  message: string;
  /** Action the player must take */
  requiredAction: string;
  /** Score penalty if unresolved */
  penaltyPoints: number;
  /** Power impact in watts if unresolved */
  powerImpact: number;
  /** Resolved by player */
  resolved: boolean;
  /** Simulation time in seconds when event fired */
  firedAt: number;
}

export interface SimulationState {
  running: boolean;
  /** Simulation elapsed time in seconds */
  elapsedSeconds: number;
  /** Total mission duration in seconds */
  totalDurationSeconds: number;
  /** Speed multiplier 1x, 10x, 100x */
  speedMultiplier: 1 | 10 | 100;
  /** Spacecraft position in 3D space (scaled) */
  position: { x: number; y: number; z: number };
  /** Orbit trail points */
  trailPoints: Array<[number, number, number]>;
  /** Active events */
  events: MissionEvent[];
  /** Resolved events */
  resolvedEvents: MissionEvent[];
  /** Score components */
  scienceYield: number;
  powerHealth: number;
  /** Accumulated penalty */
  penaltyTotal: number;
  /** Did the mission complete */
  completed: boolean;
  failed: boolean;
  failureReason: string | null;
}

// ── Mission Report ────────────────────────────────────────────

export interface MissionReport {
  missionName: string;
  destination: string;
  duration: number;
  launchVehicle: string;
  finalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  scientificDataGB: number;
  budgetEfficiencyPct: number;
  massEfficiencyPct: number;
  missionCompletionPct: number;
  eventsResolved: number;
  eventsMissed: number;
  penaltyPoints: number;
  failureTree: string[] | null;
  timeline: Array<{ time: string; event: string; impact: string }>;
}

// ── Full Store Interface ───────────────────────────────────────

export interface MissionStoreState {
  // Navigation
  currentStep: GameStep;

  // Mission config
  mission: MissionConfig;
  spacecraft: SpacecraftConfig;
  selectedLauncher: LaunchVehicle | null;
  simulation: SimulationState;
  report: MissionReport | null;

  // Computed (derived)
  resources: ResourceSummary;
  deltaVBudget: DeltaVBudget | null;
  isValidForLaunch: boolean;

  // Actions
  setStep: (step: GameStep) => void;
  setDestination: (dest: OrbitalDestination) => void;
  setMissionDuration: (months: MissionDurationMonths) => void;
  addComponent: (componentId: string) => void;
  removeComponent: (componentId: string) => void;
  setLauncher: (vehicle: LaunchVehicle) => void;
  startSimulation: () => void;
  tickSimulation: (dt: number) => void;
  setSimSpeed: (speed: 1 | 10 | 100) => void;
  resolveEvent: (eventId: string) => void;
  endSimulation: () => void;
  resetMission: () => void;
}
