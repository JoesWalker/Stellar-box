'use client';
import { Canvas } from '@react-three/fiber';
import { Stars, Grid } from '@react-three/drei';
import { Suspense, useState, useCallback } from 'react';
import { Land } from '@/store/worldStore';
import { useLandMap } from '@/hooks/useWorldData';
import LandParcels from './LandParcel';
import WorldControls from './WorldControls';

interface Props {
  onSelectLand: (land: Land | null, x: number, y: number) => void;
  selectedId: string | null;
}

function Scene({ onSelectLand, selectedId }: Props) {
  const landMap = useLandMap();

  return (
    <>
      {/* Ambient + directional lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1.2} castShadow />
      <pointLight position={[50, 30, 50]} color="#7c3aed" intensity={0.6} />

      {/* Starfield background */}
      <Stars radius={200} depth={60} count={3000} factor={3} fade speed={0.5} />

      {/* Ground grid */}
      <Grid
        position={[49.5, -0.11, 49.5]}
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#1e1b4b"
        sectionSize={10}
        sectionThickness={0.8}
        sectionColor="#4c1d95"
        fadeDistance={120}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Land parcels */}
      <LandParcels
        landMap={landMap}
        selectedId={selectedId}
        onSelect={onSelectLand}
      />

      {/* Subtle fog */}
      <fog attach="fog" args={['#050510', 80, 200]} />
    </>
  );
}

export default function WorldMap({ onSelectLand, selectedId }: Props) {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 6, position: [50, 80, 50], near: 0.1, far: 500 }}
      shadows
      gl={{ antialias: true }}
      style={{ background: '#050510' }}
    >
      <Suspense fallback={null}>
        <Scene onSelectLand={onSelectLand} selectedId={selectedId} />
        <WorldControls />
      </Suspense>
    </Canvas>
  );
}
