'use client';
import { useBuilderStore, SceneObject } from '@/store/builderStore';
import BehaviorEditor from './BehaviorEditor';

function Vec3Input({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: [number, number, number];
  onChange: (v: [number, number, number]) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
      <div className="grid grid-cols-3 gap-1">
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{axis}</span>
            <input
              type="number"
              step={step}
              value={Number(value[i].toFixed(2))}
              onChange={(e) => {
                const next = [...value] as [number, number, number];
                next[i] = parseFloat(e.target.value) || 0;
                onChange(next);
              }}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded pl-6 pr-1 py-1.5 text-sm text-white text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PropertiesPanel() {
  const { sceneObjects, selectedObjectId, updateObject, removeObject } = useBuilderStore();
  const obj: SceneObject | undefined = sceneObjects.find((o) => o.id === selectedObjectId);

  if (!obj) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm p-4 text-center">
        <div className="text-3xl mb-2">🎯</div>
        <p>Select an object in the scene to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <input
            value={obj.name}
            onChange={(e) => updateObject(obj.id, { name: e.target.value })}
            className="bg-transparent text-white font-semibold text-sm border-b border-transparent hover:border-white/20 focus:border-purple-500 outline-none w-full"
          />
          <p className="text-xs text-gray-500 mt-0.5">ID: {obj.id.slice(0, 8)}</p>
        </div>
        <button
          onClick={() => removeObject(obj.id)}
          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/30 rounded"
        >
          Delete
        </button>
      </div>

      {/* Color */}
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={obj.color}
            onChange={(e) => updateObject(obj.id, { color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          />
          <span className="text-sm text-gray-400">{obj.color}</span>
        </div>
      </div>

      {/* Transform */}
      <Vec3Input
        label="Position"
        value={obj.position}
        onChange={(v) => updateObject(obj.id, { position: v })}
      />
      <Vec3Input
        label="Rotation"
        value={obj.rotation}
        onChange={(v) => updateObject(obj.id, { rotation: v })}
        step={0.01}
      />
      <Vec3Input
        label="Scale"
        value={obj.scale}
        onChange={(v) => updateObject(obj.id, { scale: v })}
      />

      {/* Behaviors */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Behaviors</h3>
        <BehaviorEditor objectId={obj.id} behaviors={obj.behaviors} />
      </div>
    </div>
  );
}
