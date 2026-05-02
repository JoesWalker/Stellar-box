'use client';

import { useWallet } from '@/providers/WalletProvider';

function truncate(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, isConnected, connect, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-stellar-gold-400 font-mono bg-space-800 px-3 py-1.5 rounded-lg border border-stellar-gold-500/30">
          {truncate(address)}
        </span>
        <button
          onClick={disconnect}
          className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-space-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connect} className="btn-primary text-sm">
      Connect Wallet
    </button>
  );
}
