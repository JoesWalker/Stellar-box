import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalLands: 40,
    totalAssets: 128,
    activeListings: 24,
    totalVolume: '4200000000000',
    recentTransactions: [],
  });
}
