import { NextResponse } from 'next/server';

// Mock owned land parcels — replace with indexer DB query once deployed
const MOCK_LANDS = Array.from({ length: 40 }, (_, i) => ({
  id: `land-${i}`,
  x: Math.floor(Math.random() * 100),
  y: Math.floor(Math.random() * 100),
  size: 1,
  uri: `ipfs://mock/land-${i}`,
  owner: `G${Math.random().toString(36).slice(2, 58).toUpperCase()}`,
}));

export async function GET() {
  return NextResponse.json({ lands: MOCK_LANDS, total: MOCK_LANDS.length });
}
