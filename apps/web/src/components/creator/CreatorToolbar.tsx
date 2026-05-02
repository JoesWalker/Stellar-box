'use client';

import { useVoxelStore, type Tool } from '../../store/voxelStore';

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: 'place',  label: 'Place',  icon: '🧱' },
  { id: 'erase',  label: 'Erase',  icon: '🗑️' },
  { id: 'paint',  label: 'Paint',  icon: '🎨' },
  { id: 'select', label: 'Select', icon: '🔲' },
];

interface Props {
  onExport: () => void;
}

export default function CreatorToolbar({ onExport }: Props) {
  const { activeTool, setActiveTool, activeColor, setActiveColor, undo, redo, clear, history, future } = useVoxelStore();

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
      {/* Tools */}
      <div className="flex gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            title={t.label}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTool === t.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Color quick-pick */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded border-2 border-gray-600 cursor-pointer"
          style={{ backgroundColor: activeColor }}
        />
        <input
          type="color"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer opacity-0 absolute"
          style={{ marginLeft: 0 }}
        />
      </div>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!history.length}
        className="px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40"
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        onClick={redo}
        disabled={!future.length}
        className="px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40"
        title="Redo (Ctrl+Y)"
      >
        ↪ Redo
      </button>
      <button
        onClick={clear}
        className="px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-300 hover:bg-red-700"
        title="Clear all"
      >
        🗑 Clear
      </button>

      <div className="flex-1" />

      {/* Export */}
      <button
        onClick={onExport}
        className="px-4 py-1.5 rounded text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors"
      >
        ✨ Mint as NFT
      </button>
    </div>
  );
}
