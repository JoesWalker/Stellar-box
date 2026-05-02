'use client';

import { AssetCategory, ListingFilters } from '../../hooks/useListings';

const CATEGORIES: AssetCategory[] = ['LAND', 'Character', 'Item', 'Building', 'Vehicle'];

interface Props {
  filters: ListingFilters;
  onChange: (f: ListingFilters) => void;
}

export default function FilterSidebar({ filters, onChange }: Props) {
  const set = (patch: Partial<ListingFilters>) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-64 shrink-0 space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => set({ category: undefined })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters.category
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => set({ category: filters.category === cat ? undefined : cat })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === cat
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Price Range (SVRS)
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ''}
              onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ''}
              onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Sort By
        </h3>
        <div className="space-y-1">
          {[
            { value: 'recent', label: 'Recently Listed' },
            { value: 'price_asc', label: 'Price: Low → High' },
            { value: 'price_desc', label: 'Price: High → Low' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set({ sort: value as ListingFilters['sort'] })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (filters.sort ?? 'recent') === value
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {(filters.category || filters.minPrice || filters.maxPrice) && (
        <button
          onClick={() => onChange({ sort: filters.sort })}
          className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
