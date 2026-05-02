import { useQuery } from '@tanstack/react-query';
import { Asset } from '../store/worldStore';

export type AssetCategory = 'LAND' | 'Character' | 'Item' | 'Building' | 'Vehicle';

export interface MarketListing {
  id: string;
  name: string;
  category: AssetCategory;
  price: string; // stroops as string (JSON-safe)
  seller: string;
  imageColor: string;
  createdAt: string;
}

export interface ListingFilters {
  category?: AssetCategory;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'recent' | 'price_asc' | 'price_desc';
  search?: string;
}

async function fetchListings(filters: ListingFilters): Promise<MarketListing[]> {
  const res = await fetch('/api/listings');
  if (!res.ok) throw new Error('Failed to fetch listings');
  const { listings } = await res.json();
  let results: MarketListing[] = listings;

  if (filters.category) results = results.filter((l) => l.category === filters.category);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((l) => l.name.toLowerCase().includes(q));
  }
  if (filters.minPrice != null)
    results = results.filter((l) => Number(l.price) / 1e7 >= filters.minPrice!);
  if (filters.maxPrice != null)
    results = results.filter((l) => Number(l.price) / 1e7 <= filters.maxPrice!);
  if (filters.sort === 'price_asc')
    results.sort((a, b) => Number(a.price) - Number(b.price));
  else if (filters.sort === 'price_desc')
    results.sort((a, b) => Number(b.price) - Number(a.price));
  else results.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return results;
}

async function fetchListing(id: string): Promise<MarketListing | null> {
  const res = await fetch('/api/listings');
  if (!res.ok) return null;
  const { listings } = await res.json();
  return (listings as MarketListing[]).find((l) => l.id === id) ?? null;
}

async function fetchOwnedAssets(address: string): Promise<Asset[]> {
  return [
    { id: '1', name: 'My Land #42', type: 'LAND', uri: '', owner: address },
    { id: '2', name: 'Sword of Stars', type: 'Item', uri: '', owner: address },
    { id: '3', name: 'Space Cruiser', type: 'Vehicle', uri: '', owner: address },
  ];
}

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id),
    enabled: !!id,
  });
}

export function useOwnedAssets(address: string | null) {
  return useQuery({
    queryKey: ['ownedAssets', address],
    queryFn: () => fetchOwnedAssets(address!),
    enabled: !!address,
  });
}
