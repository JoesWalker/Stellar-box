'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CreatorToolbar from '../../components/creator/CreatorToolbar';
import ColorPalette from '../../components/creator/ColorPalette';
import ExportModal from '../../components/creator/ExportModal';
import { useVoxelStore } from '../../store/voxelStore';

// Canvas must be client-only
const VoxelEditor = dynamic(() => import('../../components/creator/VoxelEditor'), { ssr: false });

export default function CreatePage() {
  const [showExport, setShowExport] = useState(false);
  const { voxels, activeTool } = useVoxelStore();

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top toolbar */}
      <CreatorToolbar onExport={() => setShowExport(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — color palette */}
        <aside className="w-56 bg-gray-900 border-r border-gray-800 overflow-y-auto flex-shrink-0">
          <ColorPalette />

          {/* Layers / info panel */}
          <div className="p-3 border-t border-gray-800 space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Info</p>
            <div className="text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Voxels</span>
                <span className="text-purple-400 font-mono">{voxels.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Tool</span>
                <span className="text-purple-400 capitalize">{activeTool}</span>
              </div>
              <div className="flex justify-between">
                <span>Grid</span>
                <span className="text-gray-400">16×16×16</span>
              </div>
            </div>
          </div>

          {/* Controls help */}
          <div className="p-3 border-t border-gray-800 space-y-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Controls</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>🖱 Left click — use tool</li>
              <li>🖱 Right drag — rotate</li>
              <li>🖱 Middle drag — pan</li>
              <li>🖱 Scroll — zoom</li>
              <li>⌨ Ctrl+Z — undo</li>
              <li>⌨ Ctrl+Y — redo</li>
            </ul>
          </div>
        </aside>

        {/* 3D viewport */}
        <main className="flex-1 relative">
          <VoxelEditor />

          {/* Tool indicator overlay */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-300 pointer-events-none">
            Tool: <span className="text-purple-400 capitalize font-medium">{activeTool}</span>
            {' · '}
            {voxels.size} voxel{voxels.size !== 1 ? 's' : ''}
          </div>
        </main>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
