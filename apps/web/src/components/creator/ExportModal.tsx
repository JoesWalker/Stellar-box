'use client';

import { useState } from 'react';
import { useVoxelStore } from '../../store/voxelStore';
import { mintAsset } from '../../lib/contracts';
import { voxelMapToJSON, generateThumbnail } from '../../lib/voxelExport';
import { useWallet } from '../../providers/WalletProvider';

const ASSET_TYPES = ['Character', 'Item', 'Building', 'Vehicle'] as const;
type AssetType = typeof ASSET_TYPES[number];

type Stage = 'form' | 'uploading' | 'minting' | 'done' | 'error';

interface Props {
  onClose: () => void;
}

export default function ExportModal({ onClose }: Props) {
  const { voxels } = useVoxelStore();
  const wallet = useWallet();

  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('Character');
  const [stage, setStage] = useState<Stage>('form');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleMint = async () => {
    if (!name.trim()) return;
    if (!wallet.isConnected) { setError('Connect your wallet first.'); return; }

    try {
      setStage('uploading');
      setProgress('Generating thumbnail…');
      const thumbnail = generateThumbnail(voxels);

      setProgress('Preparing metadata…');
      const json = voxelMapToJSON(voxels);

      setProgress('Uploading to IPFS…');
      const res = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type: assetType, voxels: json, thumbnail }),
      });

      if (!res.ok) throw new Error('IPFS upload failed');
      const { uri } = await res.json();

      setStage('minting');
      setProgress('Minting NFT on Stellar…');
      await mintAsset(wallet, name, assetType, uri);

      setStage('done');
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
      setStage('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Mint Voxel Asset as NFT</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {stage === 'form' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Asset Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Voxel Character"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Asset Type</label>
              <div className="grid grid-cols-2 gap-2">
                {ASSET_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setAssetType(t)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      assetType === t
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {voxels.size} voxel{voxels.size !== 1 ? 's' : ''} in this asset
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleMint}
              disabled={!name.trim() || voxels.size === 0}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold transition-colors"
            >
              ✨ Mint NFT
            </button>
          </div>
        )}

        {(stage === 'uploading' || stage === 'minting') && (
          <div className="text-center py-8 space-y-4">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-300">{progress}</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl">🎉</div>
            <p className="text-white font-semibold">NFT minted successfully!</p>
            <button onClick={onClose} className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white">
              Close
            </button>
          </div>
        )}

        {stage === 'error' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-red-400">{error}</p>
            <button onClick={() => setStage('form')} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
