'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import PlanetRenderer from './PlanetRenderer';
import SpacecraftModel from './SpacecraftModel';
import type { OrbitalDestination, SimulationState } from '@/types';

// ── Auto-rotating camera rig ────────────────────────────────
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.05;
    // Gentle drift when user isn't interacting
    camera.position.x = Math.sin(t) * 0.3 + camera.position.x * 0.99;
  });
  return null;
}

// ── Orbit trail line ─────────────────────────────────────────
function OrbitTrail({ points, color }: { points: Array<[number, number, number]>; color: string }) {
  if (points.length < 2) return null;
  // Close the loop by appending the first point
  const closed = [...points, points[0]];
  return (
    <Line
      points={closed}
      color={color}
      lineWidth={1.2}
      transparent
      opacity={0.5}
    />
  );
}

// ── Grid plane ───────────────────────────────────────────────
function ReferenceGrid() {
  return (
    <gridHelper
      args={[12, 20, '#1a2d4a', '#0d1a2e']}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// ── Main scene contents ──────────────────────────────────────
interface SceneProps {
  destination: OrbitalDestination;
  simulation: SimulationState;
  hasSolarPanels: boolean;
  hasHighGainAntenna: boolean;
}

function Scene({ destination, simulation, hasSolarPanels, hasHighGainAntenna }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-8, -4, -6]} intensity={0.5} color="#4fc3f7" />

      {/* Starfield backdrop */}
      <Stars radius={80} depth={50} count={4000} factor={4} saturation={0} fade speed={0.5} />

      {/* Reference plane */}
      <ReferenceGrid />

      {/* Planet */}
      <PlanetRenderer destination={destination} />

      {/* Orbit trail */}
      <OrbitTrail points={simulation.trailPoints} color={destination.color} />

      {/* Spacecraft */}
      <SpacecraftModel
        position={simulation.position}
        hasSolarPanels={hasSolarPanels}
        hasHighGainAntenna={hasHighGainAntenna}
      />

      {/* Camera auto-drift */}
      <CameraRig />

      {/* User controls */}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={18}
        autoRotate={!simulation.running}
        autoRotateSpeed={0.4}
        makeDefault
      />
    </>
  );
}

// ── Loading fallback (shown while Three.js hydrates) ─────────
function CanvasLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center text-[var(--space-muted)] text-sm gap-2">
      <div className="w-4 h-4 border-2 border-[var(--space-accent)] border-t-transparent rounded-full animate-spin" />
      Initialising 3D Engine…
    </div>
  );
}

// ── Public component ─────────────────────────────────────────
interface OrbitSceneProps {
  destination: OrbitalDestination;
  simulation: SimulationState;
  hasSolarPanels?: boolean;
  hasHighGainAntenna?: boolean;
}

export default function OrbitScene({
  destination,
  simulation,
  hasSolarPanels = true,
  hasHighGainAntenna = false,
}: OrbitSceneProps) {
  return (
    <div className="orbit-canvas-container w-full h-full">
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          shadows
          camera={{ position: [6, 3, 6], fov: 55, near: 0.1, far: 500 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: 'transparent' }}
        >
          <Scene
            destination={destination}
            simulation={simulation}
            hasSolarPanels={hasSolarPanels}
            hasHighGainAntenna={hasHighGainAntenna}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
