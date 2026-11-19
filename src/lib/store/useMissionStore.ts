// ============================================================
// Mission Store — Zustand
// Central state machine for the entire game
// ============================================================
'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { COMPONENTS_CATALOG, getComponentById } from '@/lib/data/componentsCatalog';
import { computeDeltaVBudget, recommendPropellantMass, getBestIsp } from '@/lib/physics/deltaV';
import { propagateOrbit, generateOrbitTrail, MU } from '@/lib/physics/kepler';
import type {
  MissionStoreState,
  GameStep,
  OrbitalDestination,
  LaunchVehicle,
  MissionDurationMonths,
  ResourceSummary,
  SimulationState,
  MissionEvent,
  MissionReport,
  SpacecraftComponent,
} from '@/types';

// ── Helpers ───────────────────────────────────────────────────

function computeResources(
  componentEntries: Array<{ componentId: string; count: number }>,
  propellantMass: number,
): ResourceSummary {
  let dryMass = 0;
  let powerGenerated = 0;
  let continuousPowerDraw = 0;
  let peakPowerDraw = 0;
  let totalCost = 0;
  let dataRateMbps = 0;
  let storageGB = 0;
  let reliabilityProduct = 1;
  let reliabilityCount = 0;

  for (const entry of componentEntries) {
    const comp = getComponentById(entry.componentId);
    if (!comp) continue;
    const n = entry.count;

    dryMass += comp.mass * n;
    totalCost += comp.cost * n;
    storageGB += comp.storageGB * n;
    dataRateMbps += comp.dataRateMbps * n;
    reliabilityProduct *= Math.pow(comp.reliability, n);
    reliabilityCount += n;

    if (comp.powerDraw < 0) {
      powerGenerated += Math.abs(comp.powerDraw) * n;
    } else {
      continuousPowerDraw += comp.powerDraw * n;
    }
    peakPowerDraw += comp.peakPowerDraw * n;
  }

  return {
    totalMass: dryMass + propellantMass,
    dryMass,
    propellantMass,
    powerGenerated,
    peakPowerDraw,
    continuousPowerDraw,
    totalCost,
    dataRateMbps,
    storageGB,
    averageReliability: reliabilityCount > 0 ? Math.pow(reliabilityProduct, 1 / reliabilityCount) : 1,
  };
}

function makeDefaultSimulation(): SimulationState {
  return {
    running: false,
    elapsedSeconds: 0,
    totalDurationSeconds: 0,
    speedMultiplier: 1,
    position: { x: 0, y: 0, z: 0 },
    trailPoints: [],
    events: [],
    resolvedEvents: [],
    scienceYield: 0,
    powerHealth: 100,
    penaltyTotal: 0,
    completed: false,
    failed: false,
    failureReason: null,
  };
}

// ── Random event generator ────────────────────────────────────
let eventCounter = 0;
function generateRandomEvent(
  elapsedSeconds: number,
  destination: OrbitalDestination | null,
): MissionEvent {
  const id = `evt-${++eventCounter}-${Date.now()}`;
  const radiationLevel = destination?.radiationLevel ?? 'low';

  type EventTemplate = Omit<MissionEvent, 'id' | 'resolved' | 'firedAt'>;
  const templates: EventTemplate[] = [
    {
      type: 'solar_particle_event',
      severity: radiationLevel === 'extreme' ? 'critical' : 'warning',
      title: 'Solar Particle Event Detected',
      message: 'A coronal mass ejection is approaching. High-energy protons threaten electronics.',
      requiredAction: 'Switch to safe mode and reduce power draw by 30%',
      penaltyPoints: radiationLevel === 'extreme' ? 15 : 8,
      powerImpact: 50,
    },
    {
      type: 'sensor_degradation',
      severity: 'warning',
      title: 'Payload Sensor Degradation',
      message: 'Detector noise floor rising. Likely radiation-induced charge trapping.',
      requiredAction: 'Anneal detector array — suspend imaging for 2 hours',
      penaltyPoints: 5,
      powerImpact: 20,
    },
    {
      type: 'comms_blackout',
      severity: 'info',
      title: 'Communication Blackout Window',
      message: 'Spacecraft entering ground station shadow. No uplink possible for 47 minutes.',
      requiredAction: 'Buffer science data to onboard recorder',
      penaltyPoints: 0,
      powerImpact: 0,
    },
    {
      type: 'micrometeorite_impact',
      severity: 'warning',
      title: 'Micrometeorite Impact Detected',
      message: 'Vibration sensors indicate small debris strike on solar array panel.',
      requiredAction: 'Run power diagnostics and confirm array voltage output',
      penaltyPoints: 10,
      powerImpact: 80,
    },
    {
      type: 'battery_fault',
      severity: 'critical',
      title: 'Battery Cell Fault',
      message: 'Cell 3 voltage deviation detected. Risk of thermal runaway.',
      requiredAction: 'Isolate battery cell and switch to degraded power mode',
      penaltyPoints: 20,
      powerImpact: 150,
    },
    {
      type: 'thruster_anomaly',
      severity: 'warning',
      title: 'Thruster Valve Anomaly',
      message: 'Propulsion controller reports intermittent valve seat leak.',
      requiredAction: 'Close latch valve and reconfigure attitude control',
      penaltyPoints: 12,
      powerImpact: 10,
    },
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  return { ...template, id, resolved: false, firedAt: elapsedSeconds };
}

// ── Scoring ───────────────────────────────────────────────────
function computeFinalScore(sim: SimulationState, resources: ResourceSummary, launcher: LaunchVehicle | null): number {
  const scienceScore = Math.min(sim.scienceYield / 100, 1) * 35;
  const massEfficiency = launcher
    ? Math.max(0, 1 - resources.totalMass / launcher.payloadToLEO)
    : 0.5;
  const massScore = massEfficiency * 25;
  const budgetScore = Math.min(resources.powerGenerated / Math.max(resources.peakPowerDraw, 1), 1) * 20;
  const completionScore = sim.completed ? 20 : (sim.elapsedSeconds / Math.max(sim.totalDurationSeconds, 1)) * 20;
  const penalty = sim.penaltyTotal;
  return Math.max(0, Math.round(scienceScore + massScore + budgetScore + completionScore - penalty));
}

function scoreToGrade(score: number): MissionReport['grade'] {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 45) return 'C';
  return 'F';
}

// ── Store ─────────────────────────────────────────────────────
export const useMissionStore = create<MissionStoreState>()(
  immer((set, get) => ({
    currentStep: 0,
    mission: { destination: null, primaryObjective: 'Science' },
    spacecraft: { components: [], propellantMass: 0, missionDurationMonths: 12 },
    selectedLauncher: null,
    simulation: makeDefaultSimulation(),
    report: null,
    resources: {
      totalMass: 0,
      dryMass: 0,
      propellantMass: 0,
      powerGenerated: 0,
      peakPowerDraw: 0,
      continuousPowerDraw: 0,
      totalCost: 0,
      dataRateMbps: 0,
      storageGB: 0,
      averageReliability: 1,
    },
    deltaVBudget: null,
    isValidForLaunch: false,

    // ── Actions ──────────────────────────────────────────────

    setStep: (step: GameStep) => set((s) => { s.currentStep = step; }),

    setDestination: (dest: OrbitalDestination) =>
      set((s) => {
        s.mission.destination = dest;
        // Recalculate ΔV budget if launcher already selected
        const { spacecraft, selectedLauncher } = get();
        const propComps = spacecraft.components
          .map((e) => getComponentById(e.componentId))
          .filter((c): c is SpacecraftComponent => !!c && c.category === 'propulsion');
        if (selectedLauncher) {
          const resources = computeResources(spacecraft.components, spacecraft.propellantMass);
          s.deltaVBudget = computeDeltaVBudget(dest, resources.dryMass, spacecraft.propellantMass, propComps);
          s.isValidForLaunch = s.deltaVBudget.feasible && resources.totalMass <= selectedLauncher.payloadToLEO;
        }
      }),

    setMissionDuration: (months: MissionDurationMonths) =>
      set((s) => {
        s.spacecraft.missionDurationMonths = months;
      }),

    addComponent: (componentId: string) =>
      set((s) => {
        const comp = getComponentById(componentId);
        if (!comp) return;

        const existing = s.spacecraft.components.find((e) => e.componentId === componentId);
        if (existing) {
          if (existing.count >= comp.maxCount) return;
          existing.count += 1;
        } else {
          s.spacecraft.components.push({ componentId, count: 1 });
        }

        // Auto-calculate recommended propellant
        const resources = computeResources(s.spacecraft.components, 0);
        const dest = s.mission.destination;
        if (dest) {
          const propComps = s.spacecraft.components
            .map((e) => getComponentById(e.componentId))
            .filter((c): c is SpacecraftComponent => !!c && c.category === 'propulsion');
          const isp = getBestIsp(propComps);
          s.spacecraft.propellantMass = recommendPropellantMass(dest, resources.dryMass, isp);
        }

        const updated = computeResources(s.spacecraft.components, s.spacecraft.propellantMass);
        s.resources = updated;

        // Recompute ΔV budget
        if (dest) {
          const propComps = s.spacecraft.components
            .map((e) => getComponentById(e.componentId))
            .filter((c): c is SpacecraftComponent => !!c && c.category === 'propulsion');
          s.deltaVBudget = computeDeltaVBudget(dest, updated.dryMass, updated.propellantMass, propComps);
          const launcher = s.selectedLauncher;
          s.isValidForLaunch =
            (s.deltaVBudget?.feasible ?? false) &&
            (launcher ? updated.totalMass <= launcher.payloadToLEO : false);
        }
      }),

    removeComponent: (componentId: string) =>
      set((s) => {
        const idx = s.spacecraft.components.findIndex((e) => e.componentId === componentId);
        if (idx === -1) return;
        if (s.spacecraft.components[idx].count > 1) {
          s.spacecraft.components[idx].count -= 1;
        } else {
          s.spacecraft.components.splice(idx, 1);
        }

        const resources = computeResources(s.spacecraft.components, s.spacecraft.propellantMass);
        s.resources = resources;

        const dest = s.mission.destination;
        if (dest) {
          const propComps = s.spacecraft.components
            .map((e) => getComponentById(e.componentId))
            .filter((c): c is SpacecraftComponent => !!c && c.category === 'propulsion');
          s.deltaVBudget = computeDeltaVBudget(dest, resources.dryMass, resources.propellantMass, propComps);
          const launcher = s.selectedLauncher;
          s.isValidForLaunch =
            (s.deltaVBudget?.feasible ?? false) &&
            (launcher ? resources.totalMass <= launcher.payloadToLEO : false);
        }
      }),

    setLauncher: (vehicle: LaunchVehicle) =>
      set((s) => {
        s.selectedLauncher = vehicle;
        const { spacecraft, mission } = get();
        const resources = computeResources(spacecraft.components, spacecraft.propellantMass);
        const dest = mission.destination;
        if (dest) {
          const propComps = spacecraft.components
            .map((e) => getComponentById(e.componentId))
            .filter((c): c is SpacecraftComponent => !!c && c.category === 'propulsion');
          s.deltaVBudget = computeDeltaVBudget(dest, resources.dryMass, resources.propellantMass, propComps);
          s.isValidForLaunch =
            (s.deltaVBudget?.feasible ?? false) && resources.totalMass <= vehicle.payloadToLEO;
        }
      }),

    startSimulation: () =>
      set((s) => {
        const { spacecraft, mission } = get();
        const dest = mission.destination;
        if (!dest) return;

        const totalSecs = spacecraft.missionDurationMonths * 30.44 * 24 * 3600;
        const mu = MU[dest.centralBody] ?? MU.Earth;
        const trail = generateOrbitTrail(
          {
            a: dest.semiMajorAxis,
            e: dest.eccentricity,
            i: dest.inclination,
            omega: 0,
            argPeri: 0,
            trueAnomaly: 0,
            mu,
          },
          128,
          dest.semiMajorAxis / 2.5,
        );

        s.simulation = {
          ...makeDefaultSimulation(),
          running: true,
          totalDurationSeconds: totalSecs,
          trailPoints: trail,
          position: { x: trail[0][0], y: trail[0][1], z: trail[0][2] },
        };
      }),

    tickSimulation: (dt: number) =>
      set((s) => {
        const sim = s.simulation;
        if (!sim.running || sim.completed || sim.failed) return;

        const { mission, spacecraft, resources } = get();
        const dest = mission.destination;
        if (!dest) return;

        const realDt = dt * sim.speedMultiplier;
        sim.elapsedSeconds += realDt;

        // Move spacecraft along orbit
        const mu = MU[dest.centralBody] ?? MU.Earth;
        const scaleFactor = dest.semiMajorAxis / 2.5;
        const trueAnomaly = propagateOrbit(
          { a: dest.semiMajorAxis, e: dest.eccentricity, i: dest.inclination, omega: 0, argPeri: 0, trueAnomaly: 0, mu },
          sim.elapsedSeconds,
        );
        const idx = Math.floor((trueAnomaly / 360) * sim.trailPoints.length) % sim.trailPoints.length;
        const pt = sim.trailPoints[idx] ?? sim.trailPoints[0];
        sim.position = { x: pt[0], y: pt[1], z: pt[2] };

        // Accumulate science yield based on payload data rate + DSN contact
        const dsnFraction = dest.dsnContactHoursPerDay / 24;
        sim.scienceYield = Math.min(
          100,
          sim.scienceYield + (resources.dataRateMbps * dsnFraction * realDt) / 1e6,
        );

        // Random events: chance increases with radiation level
        const eventChancePerSec: Record<string, number> = {
          low: 1 / 3600,
          medium: 1 / 1800,
          high: 1 / 900,
          extreme: 1 / 450,
        };
        const chance = (eventChancePerSec[dest.radiationLevel] ?? 1 / 3600) * realDt;
        if (Math.random() < chance && sim.events.length < 5) {
          sim.events.push(generateRandomEvent(sim.elapsedSeconds, dest));
        }

        // Power drain from unresolved critical events
        const unresolvedPowerImpact = sim.events
          .filter((e) => !e.resolved && e.severity === 'critical')
          .reduce((sum, e) => sum + e.powerImpact, 0);

        const effectivePower = resources.powerGenerated - unresolvedPowerImpact;
        if (effectivePower < resources.continuousPowerDraw) {
          sim.powerHealth = Math.max(0, sim.powerHealth - realDt * 0.01);
        }

        // Failure check
        if (sim.powerHealth <= 0) {
          sim.failed = true;
          sim.running = false;
          sim.failureReason = 'Power subsystem failure — insufficient generation to sustain operations.';
          return;
        }

        // Mission complete
        if (sim.elapsedSeconds >= sim.totalDurationSeconds) {
          sim.completed = true;
          sim.running = false;
        }
      }),

    setSimSpeed: (speed) =>
      set((s) => { s.simulation.speedMultiplier = speed; }),

    resolveEvent: (eventId: string) =>
      set((s) => {
        const idx = s.simulation.events.findIndex((e) => e.id === eventId);
        if (idx === -1) return;
        const event = s.simulation.events[idx];
        event.resolved = true;
        s.simulation.resolvedEvents.push(event);
        s.simulation.events.splice(idx, 1);
      }),

    endSimulation: () =>
      set((s) => {
        const { simulation, resources, selectedLauncher, mission, spacecraft } = get();
        s.simulation.running = false;

        const finalScore = computeFinalScore(simulation, resources, selectedLauncher);
        const grade = scoreToGrade(finalScore);
        const scienceGB = (simulation.scienceYield / 100) *
          resources.dataRateMbps * dest_contactHours(mission.destination) *
          spacecraft.missionDurationMonths * 30.44 * 3600 / 8000;

        const failureTree: string[] | null = simulation.failed
          ? [
              simulation.failureReason ?? 'Unknown failure',
              ...simulation.events.filter((e) => !e.resolved).map((e) => `Unresolved: ${e.title}`),
            ]
          : null;

        s.report = {
          missionName: `${mission.destination?.name ?? 'Unknown'} Mission`,
          destination: mission.destination?.name ?? '—',
          duration: spacecraft.missionDurationMonths,
          launchVehicle: selectedLauncher?.name ?? '—',
          finalScore,
          grade,
          scientificDataGB: Math.round(scienceGB * 10) / 10,
          budgetEfficiencyPct: selectedLauncher
            ? Math.round((1 - resources.totalCost / (selectedLauncher.launchCostM + resources.totalCost)) * 100)
            : 0,
          massEfficiencyPct: selectedLauncher
            ? Math.round((resources.totalMass / selectedLauncher.payloadToLEO) * 100)
            : 0,
          missionCompletionPct: simulation.completed
            ? 100
            : Math.round((simulation.elapsedSeconds / Math.max(simulation.totalDurationSeconds, 1)) * 100),
          eventsResolved: simulation.resolvedEvents.length,
          eventsMissed: simulation.events.filter((e) => !e.resolved).length,
          penaltyPoints: simulation.penaltyTotal,
          failureTree,
          timeline: [
            { time: 'T+0:00', event: 'Launch', impact: `${resources.totalMass} kg to orbit` },
            { time: 'T+1d', event: 'Deployment', impact: 'Systems nominal' },
            {
              time: `T+${Math.round(spacecraft.missionDurationMonths / 2)}mo`,
              event: 'Mid-mission review',
              impact: `Science yield: ${Math.round(simulation.scienceYield)}%`,
            },
          ],
        };
        s.currentStep = 4;
      }),

    resetMission: () =>
      set((s) => {
        s.currentStep = 0;
        s.mission = { destination: null, primaryObjective: 'Science' };
        s.spacecraft = { components: [], propellantMass: 0, missionDurationMonths: 12 };
        s.selectedLauncher = null;
        s.simulation = makeDefaultSimulation();
        s.report = null;
        s.deltaVBudget = null;
        s.isValidForLaunch = false;
        s.resources = {
          totalMass: 0, dryMass: 0, propellantMass: 0,
          powerGenerated: 0, peakPowerDraw: 0, continuousPowerDraw: 0,
          totalCost: 0, dataRateMbps: 0, storageGB: 0, averageReliability: 1,
        };
      }),
  })),
);

// helper used in endSimulation closure
function dest_contactHours(dest: OrbitalDestination | null): number {
  return dest?.dsnContactHoursPerDay ?? 4;
}
