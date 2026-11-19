// ============================================================
// Launch Vehicles Catalog
// Sources: NASA Launch Services Program, SpaceX, RocketLab,
// ULA, Arianespace public payload-user guides (2024–2026)
// ============================================================

import type { LaunchVehicle } from '@/types';

export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  {
    id: 'electron',
    name: 'Electron',
    manufacturer: 'Rocket Lab',
    description:
      'Small-lift vehicle for dedicated SmallSat missions. Kick Stage upper stage provides precise orbit insertion. Perfect for LEO/SSO CubeSat constellations.',
    payloadToLEO: 300,
    payloadToGTO: 0,
    payloadToEscape: 0,
    launchCostM: 8.5,
    fairingDiameterM: 1.2,
    fairingHeightM: 2.5,
    upperStageDeltaV: 1800,
    compatibleDestinations: ['LEO', 'SSO'],
    reliability: 0.91,
    nasaRef: 'NASA-LSP-2024-ELECT',
  },
  {
    id: 'falcon9',
    name: 'Falcon 9 Block 5',
    manufacturer: 'SpaceX',
    description:
      'Two-stage orbital rocket with reusable first stage. Workhorse of commercial launch with proven heritage across hundreds of missions including ISS cargo, Starlink, and JPSS.',
    payloadToLEO: 22800,
    payloadToGTO: 8300,
    payloadToEscape: 4000,
    launchCostM: 67,
    fairingDiameterM: 5.2,
    fairingHeightM: 13.1,
    upperStageDeltaV: 3400,
    compatibleDestinations: ['LEO', 'SSO', 'GTO', 'LUNAR'],
    reliability: 0.98,
    nasaRef: 'NASA-LSP-2024-F9',
  },
  {
    id: 'falcon_heavy',
    name: 'Falcon Heavy',
    manufacturer: 'SpaceX',
    description:
      'Triple-core variant of Falcon 9. Currently the most capable operational US launch vehicle. Used for DSOG, ViaSat-3, and Psyche mission.',
    payloadToLEO: 63800,
    payloadToGTO: 26700,
    payloadToEscape: 16800,
    launchCostM: 150,
    fairingDiameterM: 5.2,
    fairingHeightM: 13.1,
    upperStageDeltaV: 3400,
    compatibleDestinations: ['LEO', 'SSO', 'GTO', 'LUNAR', 'L2', 'MARS'],
    reliability: 0.97,
    nasaRef: 'NASA-LSP-2024-FH',
  },
  {
    id: 'vulcan_centaur',
    name: 'Vulcan Centaur',
    manufacturer: 'United Launch Alliance',
    description:
      'Next-generation ULA rocket replacing Atlas V. Centaur V upper stage with RL10 engines delivers high C3 for interplanetary missions. Debuted 2024.',
    payloadToLEO: 27200,
    payloadToGTO: 13100,
    payloadToEscape: 7200,
    launchCostM: 110,
    fairingDiameterM: 5.4,
    fairingHeightM: 15.5,
    upperStageDeltaV: 4200,
    compatibleDestinations: ['LEO', 'SSO', 'GTO', 'LUNAR', 'L2', 'MARS'],
    reliability: 0.97,
    nasaRef: 'NASA-LSP-2024-VC',
  },
  {
    id: 'sls_block1',
    name: 'SLS Block 1',
    manufacturer: 'NASA / Boeing',
    description:
      'NASA\'s Space Launch System. Highest payload capacity to TLI and escape of any current US vehicle. Designed for Artemis lunar missions and deep-space science flagships.',
    payloadToLEO: 95000,
    payloadToGTO: 42000,
    payloadToEscape: 27000,
    launchCostM: 2200,
    fairingDiameterM: 8.4,
    fairingHeightM: 19.0,
    upperStageDeltaV: 5200,
    compatibleDestinations: ['LEO', 'GTO', 'LUNAR', 'L2', 'MARS'],
    reliability: 0.96,
    nasaRef: 'NASA-TM-2022-SLS-B1',
  },
  {
    id: 'new_glenn',
    name: 'New Glenn',
    manufacturer: 'Blue Origin',
    description:
      'Heavy-lift reusable orbital vehicle. 7m fairing diameter offers the widest commercial fairing, ideal for large space telescopes and high-power communications satellites.',
    payloadToLEO: 45000,
    payloadToGTO: 13000,
    payloadToEscape: 6000,
    launchCostM: 130,
    fairingDiameterM: 7.0,
    fairingHeightM: 17.6,
    upperStageDeltaV: 3800,
    compatibleDestinations: ['LEO', 'SSO', 'GTO', 'LUNAR', 'L2'],
    reliability: 0.95,
    nasaRef: 'NASA-LSP-2024-NG',
  },
];

export const getLaunchVehicleById = (id: string): LaunchVehicle | undefined =>
  LAUNCH_VEHICLES.find((v) => v.id === id);
