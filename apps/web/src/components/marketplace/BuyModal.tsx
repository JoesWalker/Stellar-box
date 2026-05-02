'use client';

import { MarketListing } from '../../hooks/useListings';
import { useBuyAsset } from '../../hooks/useMarketplace';

interface Props {
  listing: MarketListing;
  walletBalance?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BuyModal({ listing, walletBalance = 0, onClose, onSuccess }: Props) {
  const { mutate, isPending, error } = useBuyAsset();
  const price = Number(listing.price) / 1e7;
  const gasFee = 0.00001;
  const canAfford = walletBalance >= price;

  const handleConfirm = () => {
    // listing.id used as a placeholder until real contract IDs are available
    mutate(BigInt(listing.id.replace('listing-', '') || '0'), {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });
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

        <h2 className="text-xl font-bold text-white mb-6">Confirm Purchase</h2>

        {/* Item preview */}
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl mb-6">
          <div
            className="w-14 h-14 rounded-xl shrink-0"
            style={{ background: listing.imageColor, opacity: 0.8 }}
          />
          <div>
            <p className="font-semibold text-white">{listing.name}</p>
            <p className="text-xs text-gray-400">{listing.category}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Seller: {listing.seller.slice(0, 8)}...{listing.seller.slice(-4)}
            </p>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Item price</span>
            <span className="text-white font-medium">{price.toLocaleString()} SVRS</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Network fee (est.)</span>
            <span className="text-white">{gasFee} XLM</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
            <span className="text-gray-400">Your balance</span>
            <span className={canAfford ? 'text-emerald-400' : 'text-red-400'}>
              {walletBalance.toLocaleString()} SVRS
            </span>
          </div>
        </div>

        {!canAfford && (
          <p className="text-red-400 text-xs mb-4 text-center">
            Insufficient SVRS balance to complete this purchase.
          </p>
        )}

        {error && (
          <p className="text-red-400 text-xs mb-4 text-center">
            Transaction failed. Please try again.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || !canAfford}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {isPending ? 'Confirming…' : 'Confirm Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
