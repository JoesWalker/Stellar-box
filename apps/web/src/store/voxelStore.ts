import { create } from 'zustand';

export type Tool = 'place' | 'erase' | 'paint' | 'select';

export interface VoxelData {
  color: string;
}

interface HistoryEntry {
  voxels: Map<string, VoxelData>;
}

interface VoxelStore {
  voxels: Map<string, VoxelData>;
  activeTool: Tool;
  activeColor: string;
  history: HistoryEntry[];
  future: HistoryEntry[];

  setActiveTool: (tool: Tool) => void;
  setActiveColor: (color: string) => void;
  placeVoxel: (x: number, y: number, z: number, color: string) => void;
  removeVoxel: (x: number, y: number, z: number) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  exportToJSON: () => object;
}

const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

const snapshot = (voxels: Map<string, VoxelData>): Map<string, VoxelData> =>
  new Map(voxels);

export const useVoxelStore = create<VoxelStore>((set, get) => ({
  voxels: new Map(),
  activeTool: 'place',
  activeColor: '#7c3aed',
  history: [],
  future: [],

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveColor: (color) => set({ activeColor: color }),

  placeVoxel: (x, y, z, color) => {
    const { voxels, history } = get();
    const next = snapshot(voxels);
    next.set(key(x, y, z), { color });
    set({ voxels: next, history: [...history, { voxels: snapshot(voxels) }], future: [] });
  },

  removeVoxel: (x, y, z) => {
    const { voxels, history } = get();
    const next = snapshot(voxels);
    next.delete(key(x, y, z));
    set({ voxels: next, history: [...history, { voxels: snapshot(voxels) }], future: [] });
  },

  undo: () => {
    const { history, voxels, future } = get();
    if (!history.length) return;
    const prev = history[history.length - 1];
    set({
      voxels: snapshot(prev.voxels),
      history: history.slice(0, -1),
      future: [{ voxels: snapshot(voxels) }, ...future],
    });
  },

  redo: () => {
    const { future, voxels, history } = get();
    if (!future.length) return;
    const next = future[0];
    set({
      voxels: snapshot(next.voxels),
      future: future.slice(1),
      history: [...history, { voxels: snapshot(voxels) }],
    });
  },

  clear: () => {
    const { voxels, history } = get();
    set({ voxels: new Map(), history: [...history, { voxels: snapshot(voxels) }], future: [] });
  },

  exportToJSON: () => {
    const { voxels } = get();
    const data: Record<string, VoxelData> = {};
    voxels.forEach((v, k) => { data[k] = v; });
    return { version: 1, voxels: data };
  },
}));
