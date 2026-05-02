'use client';
import { useState } from 'react';

export interface AssetTemplate {
  id: string;
  name: string;
  color: string;
  emoji: string;
  category: string;
}

const TEMPLATES: AssetTemplate[] = [
  { id: 'tpl-chest', name: 'Treasure Chest', color: '#c8a84b', emoji: '📦', category: 'Props' },
  { id: 'tpl-portal', name: 'Portal', color: '#8b5cf6', emoji: '🌀', category: 'Props' },
  { id: 'tpl-npc', name: 'NPC', color: '#10b981', emoji: '🧑', category: 'Characters' },
  { id: 'tpl-platform', name: 'Platform', color: '#6b7280', emoji: '⬛', category: 'Terrain' },
  { id: 'tpl-coin', name: 'SVRS Coin', color: '#f59e0b', emoji: '🪙', category: 'Tokens' },
  { id: 'tpl-wall', name: 'Wall', color: '#78716c', emoji: '🧱', category: 'Terrain' },
  { id: 'tpl-tree', name: 'Tree', color: '#22c55e', emoji: '🌲', category: 'Nature' },
  { id: 'tpl-light', name: 'Light Orb', color: '#fde68a', emoji: '💡', category: 'Effects' },
];

// Mock owned NFT assets
const MY_ASSETS: AssetTemplate[] = [
  { id: 'nft-001', name: 'Land #42', color: '#7c3aed', emoji: '🏔️', category: 'Land' },
  { id: 'nft-002', name: 'Voxel Ship', color: '#0ea5e9', emoji: '🚀', category: 'Asset' },
  { id: 'nft-003', name: 'Crystal', color: '#06b6d4', emoji: '💎', category: 'Asset' },
];

function AssetCard({ asset }: { asset: AssetTemplate }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('assetId', asset.id);
    e.dataTransfer.setData('assetName', asset.name);
    e.dataTransfer.setData('assetColor', asset.color);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group flex flex-col items-center gap-1 p-2 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/40 cursor-grab active:cursor-grabbing transition-all select-none"
      title={`Drag to place ${asset.name}`}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: asset.color + '33', border: `1px solid ${asset.color}44` }}
      >
        {asset.emoji}
      </div>
      <span className="text-xs text-gray-400 text-center leading-tight truncate w-full text-center">
        {asset.name}
      </span>
    </div>
  );
}

export default function AssetLibrary() {
  const [tab, setTab] = useState<'mine' | 'templates'>('templates');
  const [search, setSearch] = useState('');

  const assets = tab === 'mine' ? MY_ASSETS : TEMPLATES;
  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['templates', 'mine'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'mine' ? 'My Assets' : 'Templates'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-600 text-xs mt-8">No assets found</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((a) => <AssetCard key={a.id} asset={a} />)}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-white/10">
        <p className="text-xs text-gray-600 text-center">Drag assets to the scene</p>
      </div>
    </div>
  );
}
