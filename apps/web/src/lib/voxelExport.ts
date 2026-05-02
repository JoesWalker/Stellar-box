import * as THREE from 'three';
import type { VoxelData } from '../store/voxelStore';

export interface VoxelJSON {
  version: number;
  voxels: Record<string, VoxelData>;
}

export function voxelMapToJSON(voxels: Map<string, VoxelData>): VoxelJSON {
  const data: Record<string, VoxelData> = {};
  voxels.forEach((v, k) => { data[k] = v; });
  return { version: 1, voxels: data };
}

export function voxelMapToGLTF(voxels: Map<string, VoxelData>): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);

  voxels.forEach((voxel, k) => {
    const [x, y, z] = k.split(',').map(Number);
    const mat = new THREE.MeshStandardMaterial({ color: voxel.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
  });

  return group;
}

export function generateThumbnail(voxels: Map<string, VoxelData>): string {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f0f1a';
  ctx.fillRect(0, 0, size, size);

  if (voxels.size === 0) return canvas.toDataURL('image/png');

  // Simple isometric projection
  const scale = 6;
  const ox = size / 2;
  const oy = size / 2;

  const entries = Array.from(voxels.entries()).map(([k, v]) => {
    const [x, y, z] = k.split(',').map(Number);
    return { x, y, z, color: v.color };
  });

  // Sort back-to-front for painter's algorithm
  entries.sort((a, b) => (a.x + a.z - a.y) - (b.x + b.z - b.y));

  entries.forEach(({ x, y, z, color }) => {
    const sx = (x - z) * scale * 0.866 + ox;
    const sy = (x + z) * scale * 0.5 - y * scale + oy;

    // Top face
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy - scale);
    ctx.lineTo(sx + scale * 0.866, sy - scale * 0.5);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx - scale * 0.866, sy - scale * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = shadeColor(color, -30);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + scale * 0.866, sy - scale * 0.5);
    ctx.lineTo(sx + scale * 0.866, sy + scale * 0.5);
    ctx.lineTo(sx, sy + scale);
    ctx.closePath();
    ctx.fill();

    // Left face
    ctx.fillStyle = shadeColor(color, -60);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - scale * 0.866, sy - scale * 0.5);
    ctx.lineTo(sx - scale * 0.866, sy + scale * 0.5);
    ctx.lineTo(sx, sy + scale);
    ctx.closePath();
    ctx.fill();
  });

  return canvas.toDataURL('image/png');
}

function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}
