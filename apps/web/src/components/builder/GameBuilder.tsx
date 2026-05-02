'use client';
import { useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { exportGameToJSON } from '@/lib/gameExport';
import SceneViewport from './SceneViewport';
import AssetLibrary from './AssetLibrary';
import PropertiesPanel from './PropertiesPanel';

// Color palette for new objects
const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
let colorIdx = 0;

export default function GameBuilder() {
  const { sceneObjects, addObject } = useBuilderStore();

  const handleDropAsset = useCallback(
    (assetId: string, position: [number, number, number]) => {
      const color = COLORS[colorIdx % COLORS.length];
      colorIdx++;
      addObject({
        id: crypto.randomUUID(),
        assetId,
        name: assetId.replace(/^(tpl-|nft-)/, '').replace(/-/g, ' '),
        color,
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      });
    },
    [addObject]
  );

  const handleExport = () => {
    const config = exportGameToJSON(sceneObjects);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-bold text-sm">🎮 Game Builder</span>
          <span className="text-gray-600 text-xs">|</span>
          <span className="text-gray-500 text-xs">Untitled Game</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 transition-colors"
          >
            Export JSON
          </button>
          <button className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors">
            Publish
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Asset Library */}
        <div className="w-48 shrink-0 border-r border-white/10 bg-black/10 overflow-hidden">
          <AssetLibrary />
        </div>

        {/* Center: Viewport */}
        <div className="flex-1 min-w-0">
          <SceneViewport onDropAsset={handleDropAsset} />
        </div>

        {/* Right: Properties */}
        <div className="w-56 shrink-0 border-l border-white/10 bg-black/10 overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
