import { create } from 'zustand';

export type TriggerType = 'OnClick' | 'OnCollide' | 'OnEnter' | 'OnTimer';
export type ActionType = 'PlayAnimation' | 'Teleport' | 'ShowMessage' | 'GiveToken' | 'PlaySound';

export interface Behavior {
  id: string;
  trigger: TriggerType;
  action: ActionType;
  params: Record<string, string | number>;
}

export interface SceneObject {
  id: string;
  assetId: string;
  name: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  behaviors: Behavior[];
}

interface BuilderState {
  sceneObjects: SceneObject[];
  selectedObjectId: string | null;
  isPlaying: boolean;
  addObject: (obj: Omit<SceneObject, 'behaviors'>) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  selectObject: (id: string | null) => void;
  addBehavior: (objectId: string, behavior: Omit<Behavior, 'id'>) => void;
  removeBehavior: (objectId: string, behaviorId: string) => void;
  updateBehavior: (objectId: string, behaviorId: string, patch: Partial<Behavior>) => void;
  setPlaying: (playing: boolean) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  sceneObjects: [],
  selectedObjectId: null,
  isPlaying: false,

  addObject: (obj) =>
    set((s) => ({ sceneObjects: [...s.sceneObjects, { ...obj, behaviors: [] }] })),

  removeObject: (id) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.filter((o) => o.id !== id),
      selectedObjectId: s.selectedObjectId === id ? null : s.selectedObjectId,
    })),

  updateObject: (id, patch) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),

  selectObject: (id) => set({ selectedObjectId: id }),

  addBehavior: (objectId, behavior) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) =>
        o.id === objectId
          ? { ...o, behaviors: [...o.behaviors, { ...behavior, id: crypto.randomUUID() }] }
          : o
      ),
    })),

  removeBehavior: (objectId, behaviorId) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) =>
        o.id === objectId
          ? { ...o, behaviors: o.behaviors.filter((b) => b.id !== behaviorId) }
          : o
      ),
    })),

  updateBehavior: (objectId, behaviorId, patch) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) =>
        o.id === objectId
          ? {
              ...o,
              behaviors: o.behaviors.map((b) => (b.id === behaviorId ? { ...b, ...patch } : b)),
            }
          : o
      ),
    })),

  setPlaying: (playing) => set({ isPlaying: playing }),
}));
