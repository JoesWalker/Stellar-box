'use client';
import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Land } from '@/store/worldStore';

const GRID = 100;
const GAP = 0.08;
const SIZE = 1 - GAP;
const COLOR_AVAILABLE = new THREE.Color('#1a1a2e');
const COLOR_OWNED = new THREE.Color('#7c3aed');
const COLOR_SELECTED = new THREE.Color('#f59e0b');
const COLOR_HOVER = new THREE.Color('#a78bfa');

interface Props {
  landMap: Map<string, Land>;
  selectedId: string | null;
  onSelect: (land: Land | null, x: number, y: number) => void;
}

export default function LandParcels({ landMap, selectedId, onSelect }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const hoveredRef = useRef<number | null>(null);
  const count = GRID * GRID;

  const { dummy, colorArray } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const colorArray = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = i % GRID;
      const y = Math.floor(i / GRID);
      dummy.position.set(x, 0, y);
      dummy.scale.set(SIZE, 0.2, SIZE);
      dummy.updateMatrix();
      const key = `${x},${y}`;
      const land = landMap.get(key);
      const isSelected = land?.id === selectedId;
      const color = isSelected ? COLOR_SELECTED : land ? COLOR_OWNED : COLOR_AVAILABLE;
      color.toArray(colorArray, i * 3);
    }
    return { dummy, colorArray };
  }, [landMap, selectedId, count]);

  // Apply matrices and colors on mount / when data changes
  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    for (let i = 0; i < count; i++) {
      const x = i % GRID;
      const y = Math.floor(i / GRID);
      const isHovered = hoveredRef.current === i;
      dummy.position.set(x, isHovered ? 0.15 : 0, y);
      dummy.scale.set(SIZE, isHovered ? 0.35 : 0.2, SIZE);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  // Set colors once
  useMemo(() => {
    if (!meshRef.current) return;
    const attr = new THREE.InstancedBufferAttribute(colorArray, 3);
    meshRef.current.geometry.setAttribute('color', attr);
  }, [colorArray]);

  const handlePointerMove = useCallback((e: THREE.Event & { instanceId?: number }) => {
    e.stopPropagation?.();
    hoveredRef.current = e.instanceId ?? null;
  }, []);

  const handlePointerOut = useCallback(() => {
    hoveredRef.current = null;
  }, []);

  const handleClick = useCallback((e: THREE.Event & { instanceId?: number }) => {
    e.stopPropagation?.();
    const id = e.instanceId;
    if (id == null) return;
    const x = id % GRID;
    const y = Math.floor(id / GRID);
    const land = landMap.get(`${x},${y}`) ?? null;
    onSelect(land, x, y);
  }, [landMap, onSelect]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      onPointerMove={handlePointerMove as never}
      onPointerOut={handlePointerOut}
      onClick={handleClick as never}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </boxGeometry>
      <meshStandardMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}
