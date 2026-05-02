import { NextResponse } from 'next/server';

const CATEGORIES = ['LAND', 'Character', 'Item', 'Building', 'Vehicle'] as const;
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];

const MOCK_LISTINGS = Array.from({ length: 24 }, (_, i) => ({
  id: `listing-${i}`,
  name: `Asset #${i + 1}`,
  category: CATEGORIES[i % CATEGORIES.length],
  price: String((Math.floor(Math.random() * 9000) + 100) * 1e7),
  seller: `G${Math.random().toString(36).slice(2, 58).toUpperCase()}`,
  imageColor: COLORS[i % COLORS.length],
  createdAt: new Date(Date.now() - i * 3_600_000).toISOString(),
}));

export async function GET() {
  return NextResponse.json({ listings: MOCK_LISTINGS, total: MOCK_LISTINGS.length });
}
