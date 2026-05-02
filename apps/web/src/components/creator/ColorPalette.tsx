'use client';

import { useVoxelStore } from '../../store/voxelStore';

const PALETTE = [
  '#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899',
  '#fca5a5','#fdba74','#fde047','#86efac','#5eead4','#93c5fd','#c4b5fd','#f9a8d4',
  '#7f1d1d','#7c2d12','#713f12','#14532d','#134e4a','#1e3a8a','#4c1d95','#831843',
  '#ffffff','#d1d5db','#9ca3af','#6b7280','#374151','#1f2937','#111827','#000000',
];

export default function ColorPalette() {
  const { activeColor, setActiveColor } = useVoxelStore();

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs text-gray-400 uppercase tracking-wider">Palette</p>
      <div className="grid grid-cols-8 gap-1">
        {PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => setActiveColor(color)}
            className="w-6 h-6 rounded transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              outline: activeColor === color ? '2px solid white' : '2px solid transparent',
              outlineOffset: '1px',
            }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">Custom</label>
        <input
          type="color"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
        />
        <span className="text-xs text-gray-300 font-mono">{activeColor}</span>
      </div>
    </div>
  );
}
