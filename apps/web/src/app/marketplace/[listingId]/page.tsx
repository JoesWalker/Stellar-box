'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useListing } from '../../../hooks/useListings';
import BuyModal from '../../../components/marketplace/BuyModal';

// Mock price history
const PRICE_HISTORY = [
  { date: '4/26', price: 3200 },
  { date: '4/27', price: 3500 },
  { date: '4/28', price: 3100 },
  { date: '4/29', price: 3800 },
  { date: '4/30', price: 4200 },
  { date: '5/1', price: 3900 },
  { date: '5/2', price: 4500 },
];

function PriceChart({ data }: { data: typeof PRICE_HISTORY }) {
  const max = Math.max(...data.map((d) => d.price));
  const min = Math.min(...data.map((d) => d.price));
  const range = max - min || 1;
  const w = 400;
  const h = 120;
  const pad = 10;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.price - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
        Price History (SVRS)
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 120 }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const [x, y] = points[i].split(',').map(Number);
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="#8b5cf6" />
          );
        })}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d) => (
          <span key={d.date} className="text-xs text-gray-600">{d.date}</span>
        ))}
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useListing(listingId);
  const [showBuy, setShowBuy] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#080810] pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Listing not found.</p>
        <button onClick={() => router.back()} className="text-purple-400 hover:text-purple-300 text-sm">
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  const price = Number(listing.price) / 1e7;

  return (
    <div className="min-h-screen bg-[#080810] pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden border border-white/8">
            <div className="relative" style={{ width: 160, height: 160 }}>
              <div
                className="absolute"
                style={{
                  width: 112,
                  height: 56,
                  background: listing.imageColor,
                  filter: 'brightness(1.3)',
                  transform: 'skewX(-30deg) translateX(24px)',
                  top: 0,
                }}
              />
              <div
                className="absolute"
                style={{
                  width: 80,
                  height: 96,
                  background: listing.imageColor,
                  filter: 'brightness(0.7)',
                  left: 0,
                  top: 48,
                }}
              />
              <div
                className="absolute"
                style={{
                  width: 80,
                  height: 96,
                  background: listing.imageColor,
                  filter: 'brightness(0.9)',
                  right: 0,
                  top: 48,
                }}
              />
            </div>
            <div
              className="absolute inset-0 opacity-20 blur-3xl"
              style={{ background: listing.imageColor }}
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-widest">
                {listing.category}
              </span>
              <h1 className="text-3xl font-bold text-white mt-1">{listing.name}</h1>
              <p className="text-sm text-gray-500 mt-2">
                Listing ID: #{listing.id}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Seller</span>
                <span className="text-white font-mono text-xs">
                  {listing.seller.slice(0, 10)}...{listing.seller.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Contract</span>
                <span className="text-white font-mono text-xs">
                  {listing.nftContract.slice(0, 10)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Listed</span>
                <span className="text-white text-xs">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Current Price</p>
              <p className="text-4xl font-bold text-white">
                {price.toLocaleString()}{' '}
                <span className="text-xl font-normal text-purple-400">SVRS</span>
              </p>
            </div>

            <button
              onClick={() => setShowBuy(true)}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Price chart */}
        <div className="mt-8">
          <PriceChart data={PRICE_HISTORY} />
        </div>
      </div>

      {showBuy && (
        <BuyModal listing={listing} onClose={() => setShowBuy(false)} />
      )}
    </div>
  );
}
