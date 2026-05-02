'use client';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export default function WorldControls() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(50, 80, 50);
    camera.lookAt(50, 0, 50);
  }, [camera]);

  return (
    <OrbitControls
      enableRotate={false}
      enablePan={true}
      enableZoom={true}
      minZoom={0.5}
      maxZoom={8}
      panSpeed={1.2}
      zoomSpeed={1.2}
      mouseButtons={{ LEFT: 2, MIDDLE: 1, RIGHT: 2 } as never}
    />
  );
}
