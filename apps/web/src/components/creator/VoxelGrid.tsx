'use client';

import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useVoxelStore } from '../../store/voxelStore';

const GRID = 16;

export default function VoxelGrid() {
  const { voxels, activeTool, activeColor, placeVoxel, removeVoxel } = useVoxelStore();
  const [ghost, setGhost] = useState<[number, number, number] | null>(null);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.face) return;
    const pos = getTargetPos(e);
    if (pos) setGhost(pos);
  };

  const handlePointerLeave = () => setGhost(null);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!e.face) return;

    const [x, y, z] = getClickPos(e);

    if (activeTool === 'erase') {
      // clicked on an existing voxel — remove it
      const hitKey = getHitKey(e);
      if (hitKey) {
        const [hx, hy, hz] = hitKey.split(',').map(Number);
        removeVoxel(hx, hy, hz);
      }
    } else if (activeTool === 'paint') {
      const hitKey = getHitKey(e);
      if (hitKey) {
        const [hx, hy, hz] = hitKey.split(',').map(Number);
        placeVoxel(hx, hy, hz, activeColor);
      }
    } else if (activeTool === 'place') {
      if (x >= 0 && x < GRID && y >= 0 && y < GRID && z >= 0 && z < GRID) {
        placeVoxel(x, y, z, activeColor);
      }
    }
  };

  return (
    <group>
      {/* Floor grid plane for placing first voxels */}
      <mesh
        position={[GRID / 2 - 0.5, -0.5, GRID / 2 - 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={(e) => {
          e.stopPropagation();
          const lp = e.point.clone();
          const x = Math.floor(lp.x + 0.5);
          const z = Math.floor(lp.z + 0.5);
          if (x >= 0 && x < GRID && z >= 0 && z < GRID) setGhost([x, 0, z]);
        }}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => {
          e.stopPropagation();
          const lp = e.point.clone();
          const x = Math.floor(lp.x + 0.5);
          const z = Math.floor(lp.z + 0.5);
          if (activeTool === 'place' && x >= 0 && x < GRID && z >= 0 && z < GRID) {
            placeVoxel(x, 0, z, activeColor);
          }
        }}
      >
        <planeGeometry args={[GRID, GRID]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.4} />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[GRID, GRID, '#334155', '#1e293b']}
        position={[GRID / 2 - 0.5, -0.5, GRID / 2 - 0.5]}
      />

      {/* Placed voxels */}
      {Array.from(voxels.entries()).map(([k, v]) => {
        const [x, y, z] = k.split(',').map(Number);
        return (
          <mesh
            key={k}
            position={[x, y, z]}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
            userData={{ voxelKey: k }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={v.color} />
          </mesh>
        );
      })}

      {/* Ghost voxel */}
      {ghost && activeTool === 'place' && (
        <mesh position={ghost}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={activeColor} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function getHitKey(e: ThreeEvent<MouseEvent | PointerEvent>): string | null {
  return e.object.userData?.voxelKey ?? null;
}

function getTargetPos(e: ThreeEvent<PointerEvent>): [number, number, number] | null {
  if (!e.face) return null;
  const normal = e.face.normal.clone().applyQuaternion(e.object.quaternion);
  const pos = e.object.position.clone().add(normal).round();
  return [pos.x, pos.y, pos.z];
}

function getClickPos(e: ThreeEvent<MouseEvent>): [number, number, number] {
  if (!e.face) return [0, 0, 0];
  const normal = e.face.normal.clone().applyQuaternion(e.object.quaternion);
  const pos = e.object.position.clone().add(normal).round();
  return [pos.x, pos.y, pos.z];
}
