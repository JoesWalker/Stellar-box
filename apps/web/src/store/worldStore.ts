import { create } from 'zustand';

export interface Land {
  id: string;
  x: number;
  y: number;
  size: number;
  uri: string;
  owner: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  uri: string;
  owner: string;
}

interface WorldState {
  selectedLand: Land | null;
  ownedLands: Land[];
  ownedAssets: Asset[];
  selectLand: (land: Land | null) => void;
  setOwnedLands: (lands: Land[]) => void;
  setOwnedAssets: (assets: Asset[]) => void;
  addLand: (land: Land) => void;
  addAsset: (asset: Asset) => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  selectedLand: null,
  ownedLands: [],
  ownedAssets: [],
  selectLand: (land) => set({ selectedLand: land }),
  setOwnedLands: (lands) => set({ ownedLands: lands }),
  setOwnedAssets: (assets) => set({ ownedAssets: assets }),
  addLand: (land) => set((s) => ({ ownedLands: [...s.ownedLands, land] })),
  addAsset: (asset) => set((s) => ({ ownedAssets: [...s.ownedAssets, asset] })),
}));
