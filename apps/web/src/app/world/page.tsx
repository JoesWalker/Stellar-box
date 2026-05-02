'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Land } from '@/store/worldStore';
import { useWorldData } from '@/hooks/useWorldData';
import LandInfoPanel from '@/components/world/LandInfoPanel';
import MiniMap from '@/components/world/MiniMap';

// Dynamically import Three.js canvas (no SSR)
const WorldMap = dynamic(() => import('@/components/world/WorldMap'), { ssr: false });

export default function WorldPage() {
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ x: number; y: number } | null>(null);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useWorldData();

  const handleSelect = useCallback((land: Land | null, x: number, y: number) => {
    setSelectedLand(land);
    setSelectedCoords({ x, y });
  }, []);

  const handleClose = useCallback(() => {
    setSelectedLand(null);
    setSelectedCoords(null);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = search.split(',').map((s) => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [x, y] = parts;
      const land = data?.lands.find((l) => l.x === x && l.y === y) ?? null;
      handleSelect(land, x, y);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050510]">
      {/* Full-screen 3D canvas */}
      <div className="absolute inset-0">
        <WorldMap
          onSelectLand={handleSelect}
          selectedId={selectedLand?.id ?? null}
        />
      </div>

      {/* Top bar overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-gradient font-bold text-xl">StellarVerse World</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            {isLoading ? 'Loading…' : `${data?.total ?? 0} parcels owned · 100×100 grid`}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="pointer-events-auto flex gap-2">
          <input
            type="text"
            placeholder="x, y (e.g. 42, 17)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/50 border border-purple-900/60 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-44"
          />
          <button type="submit" className="btn-primary text-sm px-3 py-1.5">Go</button>
        </form>
      </div>

      {/* Legend */}
      <div className="absolute top-20 left-4 z-20 card-space p-3 space-y-1.5 text-xs">
        <Legend color="bg-[#7c3aed]" label="Owned" />
        <Legend color="bg-[#1a1a2e]" label="Available" />
        <Legend color="bg-[#f59e0b]" label="Selected" />
      </div>

      {/* Land info panel */}
      <LandInfoPanel land={selectedLand} coords={selectedCoords} onClose={handleClose} />

      {/* Minimap */}
      <MiniMap lands={data?.lands ?? []} selectedCoords={selectedCoords} />

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 z-20 text-xs text-gray-500 text-right space-y-0.5">
        <p>Scroll to zoom · Drag to pan</p>
        <p>Click parcel to inspect</p>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-gray-300">{label}</span>
    </div>
  );
}
