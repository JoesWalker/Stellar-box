'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import VoxelGrid from './VoxelGrid';
import { useVoxelStore } from '../../store/voxelStore';

export default function VoxelEditor() {
  const { undo, redo } = useVoxelStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return (
    <Canvas
      camera={{ position: [20, 20, 20], fov: 50 }}
      className="w-full h-full"
      shadows
    >
      <color attach="background" args={['#0f0f1a']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <Environment preset="night" />

      <VoxelGrid />

      <OrbitControls
        makeDefault
        mouseButtons={{
          LEFT: undefined as any,   // left click reserved for voxel placement
          MIDDLE: 1,                // pan
          RIGHT: 2,                 // rotate
        }}
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={80}
      />
    </Canvas>
  );
}
