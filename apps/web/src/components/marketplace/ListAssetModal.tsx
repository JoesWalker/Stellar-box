'use client';

import { useState } from 'react';
import { useWallet } from '../../providers/WalletProvider';
import { useOwnedAssets } from '../../hooks/useListings';
import { useListAsset } from '../../hooks/useMarketplace';
import { Asset } from '../../store/worldStore';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

const NFT_CONTRACT = process.env.NEXT_PUBLIC_ASSET_CONTRACT_ID ?? 'CASSET...';

export default function ListAssetModal({ onClose, onSuccess }: Props) {
  const { address } = useWallet();
  const { data: assets, isLoading } = useOwnedAssets(address);
  const { mutate, isPending, error } = useListAsset();

  const [selected, setSelected] = useState<Asset | null>(null);
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    if (!selected || !price) return;
    const priceBigInt = BigInt(Math.round(parseFloat(price) * 1e7));
    mutate(
      { nftContract: NFT_CONTRACT, tokenId: BigInt(selected.id), price: priceBigInt },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-6">List Asset for Sale</h2>

        {/* Asset selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
            Select Asset
          </label>
          {isLoading ? (
            <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ) : !assets?.length ? (
            <p className="text-gray-500 text-sm py-4 text-center">No owned assets found.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelected(asset)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    selected?.id === asset.id
                      ? 'border-purple-500/60 bg-purple-600/10'
                      : 'border-white/8 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-xs text-purple-300">
                    {asset.type[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price input */}
        <div className="mb-6">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
            Price (SVRS)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 pr-16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-400 font-medium">
              SVRS
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-4 text-center">
            Failed to list asset. Please try again.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !selected || !price || parseFloat(price) <= 0}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {isPending ? 'Listing…' : 'List Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}
