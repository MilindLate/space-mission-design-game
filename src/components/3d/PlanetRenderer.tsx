'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitalDestination } from '@/types';

interface PlanetRendererProps {
  destination: OrbitalDestination;
}

// Body color palette — no texture loading required, works offline
const BODY_COLORS: Record<string, { main: string; emissive: string; atmosphere?: string }> = {
  Earth: { main: '#1a6b9e', emissive: '#0a2a40', atmosphere: '#4fc3f720' },
  Moon:  { main: '#8a8a8a', emissive: '#1a1a1a' },
  Mars:  { main: '#c1440e', emissive: '#3a0a00', atmosphere: '#c1440e15' },
  Sun:   { main: '#ffd700', emissive: '#ff8c00' },
};

export default function PlanetRenderer({ destination }: PlanetRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const bodyKey = destination.centralBody;
  const colors = BODY_COLORS[bodyKey] ?? BODY_COLORS.Earth;
  const radius = destination.bodyRadius * 1.5; // scaled render radius

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y = t * 0.07;
      cloudRef.current.rotation.x = Math.sin(t * 0.03) * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = -t * 0.02;
    }
  });

  return (
    <group>
      {/* Core planet sphere */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color={colors.main}
          emissive={colors.emissive}
          emissiveIntensity={0.3}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Cloud layer (Earth only) */}
      {bodyKey === 'Earth' && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[radius * 1.015, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.25}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Atmosphere glow ring (Earth & Mars) */}
      {colors.atmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[radius * 1.06, 32, 32]} />
          <meshBasicMaterial
            color={colors.atmosphere.slice(0, 7)}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Polar ice caps (Earth & Mars) */}
      {(bodyKey === 'Earth' || bodyKey === 'Mars') && (
        <>
          <mesh position={[0, radius * 0.95, 0]}>
            <sphereGeometry args={[radius * 0.25, 16, 16]} />
            <meshStandardMaterial color="#e8f4fd" roughness={0.9} />
          </mesh>
          <mesh position={[0, -radius * 0.95, 0]}>
            <sphereGeometry args={[radius * 0.2, 16, 16]} />
            <meshStandardMaterial
              color={bodyKey === 'Earth' ? '#e8f4fd' : '#d4c8b8'}
              roughness={0.9}
            />
          </mesh>
        </>
      )}

      {/* Moon surface craters (simple bumps) */}
      {bodyKey === 'Moon' && (
        <>
          {[
            [radius * 0.5, radius * 0.6, 0],
            [-radius * 0.4, radius * 0.3, radius * 0.5],
            [radius * 0.3, -radius * 0.5, radius * 0.4],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <sphereGeometry args={[radius * 0.08, 8, 8]} />
              <meshStandardMaterial color="#6a6a6a" roughness={1} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
