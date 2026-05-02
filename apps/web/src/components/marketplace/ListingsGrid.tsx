'use client';

import { MarketListing } from '../../hooks/useListings';
import ListingCard from './ListingCard';

interface Props {
  listings: MarketListing[] | undefined;
  isLoading: boolean;
  onBuy: (listing: MarketListing) => void;
}

function SkeletonCard() {
  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-8 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export default function ListingsGrid({ listings, isLoading, onBuy }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🌌</div>
        <h3 className="text-lg font-semibold text-white mb-2">No listings found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} onBuy={onBuy} />
      ))}
    </div>
  );
}
