'use client';
import { useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { SceneObject as SceneObjectType } from '@/store/builderStore';

interface Props {
  object: SceneObjectType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDrag?: (id: string, position: [number, number, number]) => void;
  isPlaying: boolean;
}

export default function SceneObject({ object, isSelected, onSelect, isPlaying }: Props) {
  const meshRef = useRef<THREE.Mesh>(null); // eslint-disable-line @typescript-eslint/no-unused-vars

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (isPlaying) return;
    e.stopPropagation();
    onSelect(object.id);
  };

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
    >
      <mesh ref={meshRef} onClick={handleClick} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={object.color} />
        {isSelected && !isPlaying && (
          <Edges color="#a855f7" lineWidth={2} />
        )}
      </mesh>
    </group>
  );
}
