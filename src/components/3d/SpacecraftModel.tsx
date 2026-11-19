'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpacecraftModelProps {
  position: { x: number; y: number; z: number };
  hasSolarPanels?: boolean;
  hasHighGainAntenna?: boolean;
}

export default function SpacecraftModel({
  position,
  hasSolarPanels = true,
  hasHighGainAntenna = false,
}: SpacecraftModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle tumble to show it's a live object
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.set(position.x, position.y, position.z);
    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
  });

  const gold = '#d4a853';
  const silver = '#a0a8b0';
  const dark = '#1a2030';
  const blue = '#2060c0';
  const panelCell = '#1a3a6a';

  return (
    <group ref={groupRef}>
      {/* ── Main bus body ─────────────────────────── */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.3, 0.4]} />
        <meshStandardMaterial color={dark} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* MLI gold foil panels on bus */}
      <mesh position={[0, 0.151, 0]}>
        <boxGeometry args={[0.29, 0.002, 0.39]} />
        <meshStandardMaterial color={gold} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.151, 0]}>
        <boxGeometry args={[0.29, 0.002, 0.39]} />
        <meshStandardMaterial color={gold} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ── Solar panels ───────────────────────────── */}
      {hasSolarPanels && (
        <>
          {/* Left wing */}
          <group position={[-0.5, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.02, 0.28]} />
              <meshStandardMaterial color={panelCell} roughness={0.5} metalness={0.3} />
            </mesh>
            {/* Panel grid lines */}
            {[-0.2, 0, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.011, 0]}>
                <boxGeometry args={[0.005, 0.001, 0.26]} />
                <meshBasicMaterial color={blue} />
              </mesh>
            ))}
            {[-0.08, 0.08].map((z, i) => (
              <mesh key={i} position={[0, 0.011, z]}>
                <boxGeometry args={[0.58, 0.001, 0.005]} />
                <meshBasicMaterial color={blue} />
              </mesh>
            ))}
          </group>

          {/* Right wing */}
          <group position={[0.5, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.02, 0.28]} />
              <meshStandardMaterial color={panelCell} roughness={0.5} metalness={0.3} />
            </mesh>
            {[-0.2, 0, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.011, 0]}>
                <boxGeometry args={[0.005, 0.001, 0.26]} />
                <meshBasicMaterial color={blue} />
              </mesh>
            ))}
          </group>

          {/* Panel boom */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.3, 0.02, 0.02]} />
            <meshStandardMaterial color={silver} roughness={0.3} metalness={0.8} />
          </mesh>
        </>
      )}

      {/* ── High-gain antenna dish ─────────────────── */}
      {hasHighGainAntenna && (
        <group position={[0, 0.25, -0.1]} rotation={[Math.PI * 0.15, 0, 0]}>
          {/* Dish */}
          <mesh>
            <coneGeometry args={[0.18, 0.08, 16, 1, true]} />
            <meshStandardMaterial color={silver} roughness={0.2} metalness={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Feed horn */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
            <meshStandardMaterial color={dark} roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Strut */}
          <mesh position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.14, 6]} />
            <meshStandardMaterial color={silver} roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      )}

      {/* ── Thruster nozzle ────────────────────────── */}
      <mesh position={[0, 0, 0.22]}>
        <coneGeometry args={[0.07, 0.1, 12]} />
        <meshStandardMaterial color={silver} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* ── Star tracker box ───────────────────────── */}
      <mesh position={[0.12, 0.17, 0.1]}>
        <boxGeometry args={[0.05, 0.05, 0.08]} />
        <meshStandardMaterial color={dark} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* ── Spacecraft glow (active) ───────────────── */}
      <pointLight color="#4fc3f7" intensity={0.4} distance={1.5} />
    </group>
  );
}
