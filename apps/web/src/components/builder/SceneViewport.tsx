'use client';
import { useRef, useCallback } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { useBuilderStore } from '@/store/builderStore';
import SceneObject from './SceneObject';

interface Props {
  onDropAsset: (assetId: string, position: [number, number, number]) => void;
}

function SceneFloor({ onDrop }: { onDrop: (pos: [number, number, number]) => void }) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onDrop([Math.round(e.point.x), 0, Math.round(e.point.z)]);
  };
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} onClick={handleClick} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#1a1a2e" transparent opacity={0.01} />
    </mesh>
  );
}

export default function SceneViewport({ onDropAsset }: Props) {
  const { sceneObjects, selectedObjectId, isPlaying, selectObject, setPlaying } = useBuilderStore();
  const dropAssetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropAssetIdRef.current = e.dataTransfer.getData('assetId') || dropAssetIdRef.current;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('assetId');
    if (assetId) {
      // Place at a default position; user can adjust in properties
      onDropAsset(assetId, [0, 0, 0]);
    }
  }, [onDropAsset]);

  const handleFloorDrop = useCallback((pos: [number, number, number]) => {
    if (dropAssetIdRef.current) {
      onDropAsset(dropAssetIdRef.current, pos);
      dropAssetIdRef.current = null;
    }
  }, [onDropAsset]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <button
          onClick={() => setPlaying(!isPlaying)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>
        {!isPlaying && (
          <span className="px-3 py-1.5 rounded-full text-xs text-gray-400 bg-black/40 border border-white/10">
            {sceneObjects.length} object{sceneObjects.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Canvas
        shadows
        camera={{ position: [8, 8, 8], fov: 50 }}
        onPointerMissed={() => !isPlaying && selectObject(null)}
        style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="night" />

        <Grid
          position={[0, -0.5, 0]}
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#2a2a4a"
          sectionSize={4}
          sectionThickness={1}
          sectionColor="#3a3a6a"
          fadeDistance={30}
          infiniteGrid
        />

        <SceneFloor onDrop={handleFloorDrop} />

        {sceneObjects.map((obj) => (
          <SceneObject
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedObjectId}
            onSelect={selectObject}
            isPlaying={isPlaying}
          />
        ))}

        {!isPlaying && <OrbitControls makeDefault />}
      </Canvas>

      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none border-2 border-green-500/40 rounded" />
      )}
    </div>
  );
}
