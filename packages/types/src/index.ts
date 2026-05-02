// ── Land & Assets ────────────────────────────────────────────────────────────

export interface LandParcel {
  id: string;
  x: number;
  y: number;
  size: number;
  owner: string;
  metadataUrl: string;
  price?: string;
  isListed: boolean;
}

export interface VoxelAsset {
  id: string;
  name: string;
  type: string;
  creator: string;
  voxelUrl: string;
  thumbnailUrl: string;
  metadataUrl: string;
  price?: string;
  isListed: boolean;
}

export interface VoxelMetadata {
  name: string;
  type: string;
  creator: string;
  description?: string;
}

export interface AssetUploadResult {
  voxelCid: string;
  voxelUrl: string;
  thumbnailCid: string;
  thumbnailUrl: string;
}

// ── Marketplace ───────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  assetId: string;
  assetType: "land" | "voxel";
  seller: string;
  price: string;
  currency: string;
  createdAt: number;
  expiresAt?: number;
}

// ── Scene ─────────────────────────────────────────────────────────────────────

export type BehaviorTrigger = "onClick" | "onProximity" | "onTimer" | "onLoad";
export type BehaviorAction = "playAnimation" | "playSound" | "teleport" | "openUrl" | "runScript";

export interface Behavior {
  id: string;
  trigger: BehaviorTrigger;
  action: BehaviorAction;
  params: Record<string, unknown>;
}

export interface SceneObject {
  id: string;
  assetId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  behaviors: Behavior[];
}

// ── Config ────────────────────────────────────────────────────────────────────

export interface GameConfig {
  worldSize: number;
  parcelSize: number;
  maxObjectsPerParcel: number;
  currency: string;
  network: string;
}

export interface ContractIds {
  landRegistry: string;
  assetMarketplace: string;
  governance?: string;
}

export interface NetworkConfig {
  network: "mainnet" | "testnet" | "futurenet";
  rpcUrl: string;
  horizonUrl: string;
  passphrase: string;
  contracts: ContractIds;
}

// ── API Helpers ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
