'use client';
import { useEffect, useRef } from 'react';
import { Land } from '@/store/worldStore';

const GRID = 100;
const CELL = 2; // px per cell
const SIZE = GRID * CELL; // 200px

interface Props {
  lands: Land[];
  selectedCoords: { x: number; y: number } | null;
}

export default function MiniMap({ lands, selectedCoords }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Grid lines (subtle)
    ctx.strokeStyle = '#1a1a3a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i += 10) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    // Owned parcels
    ctx.fillStyle = '#7c3aed';
    lands.forEach(({ x, y }) => {
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    });

    // Selected
    if (selectedCoords) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(selectedCoords.x * CELL, selectedCoords.y * CELL, CELL + 1, CELL + 1);
    }

    // Border
    ctx.strokeStyle = '#7c3aed44';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, SIZE, SIZE);
  }, [lands, selectedCoords]);

  return (
    <div className="absolute bottom-4 left-4 z-20 rounded-lg overflow-hidden border border-purple-900/50 shadow-lg shadow-purple-900/20">
      <div className="bg-black/60 backdrop-blur-sm px-2 py-1 text-xs text-purple-300 font-medium">
        World Map — 100×100
      </div>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block" />
    </div>
  );
}
