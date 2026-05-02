export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface LandNFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NFTAttribute[];
}

export interface AssetNFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  properties: {
    creators: { address: string; share: number }[];
    files: { uri: string; type: string }[];
    category: string;
  };
  attributes: NFTAttribute[];
}

export function buildLandMetadata(
  x: number,
  y: number,
  size: number,
  imageUrl: string
): LandNFTMetadata {
  return {
    name: `StellarVerse Land (${x}, ${y})`,
    description: `A ${size}x${size} parcel of virtual land in StellarVerse at coordinates (${x}, ${y}).`,
    image: imageUrl,
    attributes: [
      { trait_type: "X Coordinate", value: x },
      { trait_type: "Y Coordinate", value: y },
      { trait_type: "Size", value: size },
      { trait_type: "Area", value: size * size },
    ],
  };
}

export function buildAssetMetadata(
  name: string,
  type: string,
  creator: string,
  voxelUrl: string,
  thumbnailUrl: string,
  attributes: NFTAttribute[] = []
): AssetNFTMetadata {
  return {
    name,
    description: `A ${type} voxel asset created by ${creator} for StellarVerse.`,
    image: thumbnailUrl,
    animation_url: voxelUrl,
    properties: {
      creators: [{ address: creator, share: 100 }],
      files: [
        { uri: thumbnailUrl, type: "image/png" },
        { uri: voxelUrl, type: "application/json" },
      ],
      category: "voxel",
    },
    attributes: [
      { trait_type: "Type", value: type },
      { trait_type: "Creator", value: creator },
      ...attributes,
    ],
  };
}
