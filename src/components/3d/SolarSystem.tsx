'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetPos {
  x: number;
  y: number;
  z: number;
}

interface SolarSystemProps {
  planetPositions: Record<string, PlanetPos>;
  onPlanetClick: (name: string) => void;
  activeMissionTarget?: string;
}

const AU = 5; // 1 AU = 5 render units

const PLANET_CONFIG: Record<
  string,
  { radius: number; color: string; auDist: number }
> = {
  Mercury: { radius: 0.08, color: '#b5b5b5', auDist: 0.39 },
  Venus:   { radius: 0.15, color: '#e8cda0', auDist: 0.72 },
  Earth:   { radius: 0.18, color: '#4fc3f7', auDist: 1.00 },
  Mars:    { radius: 0.12, color: '#cf6a4c', auDist: 1.52 },
  Jupiter: { radius: 0.50, color: '#c88b3a', auDist: 5.20 },
  Saturn:  { radius: 0.40, color: '#e4d191', auDist: 9.58 },
  Uranus:  { radius: 0.25, color: '#7de8e8', auDist: 19.2 },
  Neptune: { radius: 0.22, color: '#4b70dd', auDist: 30.1 },
};

function buildOrbitRing(radiusAU: number): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radiusAU * AU, 0, Math.sin(angle) * radiusAU * AU]);
  }
  return points;
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color="#ffe57a" emissive="#ffaa00" emissiveIntensity={1.2} />
      <pointLight color="#fff8e0" intensity={3} distance={200} />
    </mesh>
  );
}

function Planet({
  name,
  position,
  config,
  onClick,
  isTarget,
}: {
  name: string;
  position: PlanetPos;
  config: { radius: number; color: string };
  onClick: () => void;
  isTarget: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  const scaledPos: [number, number, number] = [
    position.x * AU,
    position.y * AU,
    position.z * AU,
  ];

  return (
    <group position={scaledPos}>
      {/* Target ring */}
      {isTarget && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.radius * 1.6, config.radius * 1.9, 64]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Saturn ring */}
      {name === 'Saturn' && (
        <mesh rotation={[Math.PI / 2 - 0.47, 0, 0]}>
          <ringGeometry args={[config.radius * 1.4, config.radius * 2.1, 64]} />
          <meshBasicMaterial color="#c8b46a" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh
        ref={ref}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[config.radius, 24, 24]} />
        <meshStandardMaterial
          color={config.color}
          emissive={hovered || isTarget ? config.color : '#000'}
          emissiveIntensity={hovered || isTarget ? 0.3 : 0}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={8} center>
          <div
            style={{
              background: 'rgba(5,10,20,0.9)',
              border: '1px solid #22d3ee',
              borderRadius: '6px',
              padding: '4px 10px',
              color: '#e2e8f0',
              fontSize: '11px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SolarSystem({
  planetPositions,
  onPlanetClick,
  activeMissionTarget,
}: SolarSystemProps) {
  return (
    <Canvas camera={{ position: [0, 20, 40], fov: 55 }}>
      <color attach="background" args={['#020408']} />
      <ambientLight intensity={0.15} />
      <Stars radius={300} depth={60} count={3000} factor={4} fade />

      <Sun />

      {Object.entries(PLANET_CONFIG).map(([name, cfg]) => {
        const pos = planetPositions[name] ?? { x: cfg.auDist, y: 0, z: 0 };
        // Orbit ring
        const orbitPoints = buildOrbitRing(cfg.auDist);
        return (
          <group key={name}>
            <Line
              points={orbitPoints}
              color="#334155"
              lineWidth={0.5}
              transparent
              opacity={0.5}
            />
            <Planet
              name={name}
              position={pos}
              config={cfg}
              onClick={() => onPlanetClick(name)}
              isTarget={activeMissionTarget === name}
            />
          </group>
        );
      })}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        minDistance={5}
        maxDistance={120}
        enablePan={false}
      />
    </Canvas>
  );
}
