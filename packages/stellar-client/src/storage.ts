import axios from "axios";
import Arweave from "arweave";
import type { VoxelMetadata, AssetUploadResult } from "@stellarverse/types";

const IPFS_GATEWAY = process.env.IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";
const PINATA_API = "https://api.pinata.cloud";

export function buildIPFSUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * 2 ** i));
    }
  }
  throw new Error("unreachable");
}

function pinataHeaders() {
  const jwt = process.env.PINATA_JWT;
  if (jwt) return { Authorization: `Bearer ${jwt}` };
  const key = process.env.PINATA_API_KEY;
  const secret = process.env.PINATA_API_SECRET;
  if (key && secret) return { pinata_api_key: key, pinata_secret_api_key: secret };
  throw new Error("Pinata credentials not set (PINATA_JWT or PINATA_API_KEY/SECRET)");
}

export async function uploadToIPFS(
  file: Buffer,
  filename: string,
  metadata: object
): Promise<{ cid: string; url: string }> {
  return withRetry(async () => {
    const form = new FormData();
    form.append("file", new Blob([file]), filename);
    form.append("pinataMetadata", JSON.stringify({ name: filename, keyvalues: metadata }));

    const { data } = await axios.post(`${PINATA_API}/pinning/pinFileToIPFS`, form, {
      headers: { ...pinataHeaders(), "Content-Type": "multipart/form-data" },
    });

    const cid: string = data.IpfsHash;
    return { cid, url: buildIPFSUrl(cid) };
  });
}

export async function getFromIPFS(cid: string): Promise<Buffer> {
  return withRetry(async () => {
    const { data } = await axios.get<ArrayBuffer>(buildIPFSUrl(cid), {
      responseType: "arraybuffer",
    });
    return Buffer.from(data);
  });
}

function getArweave(): Arweave {
  return Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });
}

export async function uploadToArweave(
  file: Buffer,
  tags: { name: string; value: string }[]
): Promise<{ id: string; url: string }> {
  return withRetry(async () => {
    const arweave = getArweave();
    const keyJson = process.env.ARWEAVE_KEY_JSON;
    if (!keyJson) throw new Error("ARWEAVE_KEY_JSON env var not set");
    const key = JSON.parse(keyJson);

    const tx = await arweave.createTransaction({ data: file }, key);
    for (const { name, value } of tags) tx.addTag(name, value);
    await arweave.transactions.sign(tx, key);

    const res = await arweave.transactions.post(tx);
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`Arweave upload failed: ${res.status}`);
    }

    return { id: tx.id, url: `https://arweave.net/${tx.id}` };
  });
}

export async function uploadVoxelAsset(
  voxelJSON: object,
  thumbnail: Buffer,
  metadata: VoxelMetadata
): Promise<AssetUploadResult> {
  const voxelBuffer = Buffer.from(JSON.stringify(voxelJSON));

  const [voxel, thumb] = await Promise.all([
    uploadToIPFS(voxelBuffer, `${metadata.name}.json`, { type: "voxel", creator: metadata.creator }),
    uploadToIPFS(thumbnail, `${metadata.name}_thumb.png`, { type: "thumbnail", creator: metadata.creator }),
  ]);

  return {
    voxelCid: voxel.cid,
    voxelUrl: voxel.url,
    thumbnailCid: thumb.cid,
    thumbnailUrl: thumb.url,
  };
}
