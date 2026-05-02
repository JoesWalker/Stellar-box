'use client';

import { useState } from 'react';
import { useListings, ListingFilters, MarketListing } from '../../hooks/useListings';
import { useWallet } from '../../providers/WalletProvider';
import FilterSidebar from '../../components/marketplace/FilterSidebar';
import ListingsGrid from '../../components/marketplace/ListingsGrid';
import BuyModal from '../../components/marketplace/BuyModal';
import ListAssetModal from '../../components/marketplace/ListAssetModal';

export default function MarketplacePage() {
  const { isConnected } = useWallet();
  const [filters, setFilters] = useState<ListingFilters>({ sort: 'recent' });
  const [search, setSearch] = useState('');
  const [buyTarget, setBuyTarget] = useState<MarketListing | null>(null);
  const [showList, setShowList] = useState(false);

  const { data: listings, isLoading } = useListings({ ...filters, search: search || undefined });

  return (
    <div className="min-h-screen bg-[#080810] pt-20">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#0a0a14]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Marketplace
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {listings?.length ?? '—'} listings
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search assets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {isConnected && (
              <button
                onClick={() => setShowList(true)}
                className="shrink-0 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                + List Asset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <main className="flex-1 min-w-0">
          <ListingsGrid listings={listings} isLoading={isLoading} onBuy={setBuyTarget} />
        </main>
      </div>

      {buyTarget && (
        <BuyModal listing={buyTarget} onClose={() => setBuyTarget(null)} />
      )}
      {showList && (
        <ListAssetModal onClose={() => setShowList(false)} />
      )}
    </div>
  );
}
