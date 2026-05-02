'use client';

import { MarketListing } from '../../hooks/useListings';

const BADGE_COLORS: Record<string, string> = {
  LAND: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Character: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Item: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Building: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Vehicle: 'bg-red-500/20 text-red-300 border-red-500/30',
};

interface Props {
  listing: MarketListing;
  onBuy: (listing: MarketListing) => void;
}

function VoxelPreview({ color }: { color: string }) {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
      {/* Voxel cube illusion via CSS */}
      <div className="relative" style={{ width: 80, height: 80 }}>
        {/* Top face */}
        <div
          className="absolute"
          style={{
            width: 56,
            height: 28,
            background: color,
            filter: 'brightness(1.3)',
            transform: 'skewX(-30deg) translateX(12px)',
            top: 0,
          }}
        />
        {/* Left face */}
        <div
          className="absolute"
          style={{
            width: 40,
            height: 48,
            background: color,
            filter: 'brightness(0.7)',
            left: 0,
            top: 24,
          }}
        />
        {/* Right face */}
        <div
          className="absolute"
          style={{
            width: 40,
            height: 48,
            background: color,
            filter: 'brightness(0.9)',
            right: 0,
            top: 24,
          }}
        />
      </div>
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-20 blur-xl"
        style={{ background: color }}
      />
    </div>
  );
}

export default function ListingCard({ listing, onBuy }: Props) {
  const priceDisplay = (Number(listing.price) / 1e7).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const sellerShort = `${listing.seller.slice(0, 6)}...${listing.seller.slice(-4)}`;

  return (
    <div className="group relative bg-[#0f0f1a] border border-white/8 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300 cursor-pointer">
      {/* Thumbnail */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] p-4">
        <VoxelPreview color={listing.imageColor} />
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{listing.name}</h3>
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${BADGE_COLORS[listing.category] ?? ''}`}
          >
            {listing.category}
          </span>
        </div>

        <p className="text-xs text-gray-500">by {sellerShort}</p>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-base font-bold text-white">
              {priceDisplay}{' '}
              <span className="text-xs font-normal text-purple-400">SVRS</span>
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuy(listing);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
