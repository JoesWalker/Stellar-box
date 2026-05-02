'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface WalletContextValue {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Lazy-load the kit only on the client to avoid SSR issues
let kitInstance: import('@creit.tech/stellar-wallets-kit').StellarWalletsKit | null = null;

async function getKit() {
  if (kitInstance) return kitInstance;
  const { StellarWalletsKit, WalletNetwork, allowAllModules, FREIGHTER_ID } =
    await import('@creit.tech/stellar-wallets-kit');
  const network =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
      ? WalletNetwork.PUBLIC
      : WalletNetwork.TESTNET;
  kitInstance = new StellarWalletsKit({
    network,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
  });
  return kitInstance;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    const kit = await getKit();
    await kit.openModal({
      onWalletSelected: async (option: { id: string }) => {
        kit.setWallet(option.id);
        const { address: addr } = await kit.getAddress();
        setAddress(addr);
      },
    });
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const kit = await getKit();
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        address: address ?? undefined,
      });
      return signedTxXdr;
    },
    [address],
  );

  return (
    <WalletContext.Provider
      value={{ address, isConnected: !!address, connect, disconnect, signTransaction }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
