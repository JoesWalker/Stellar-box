import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buyAsset, listAsset } from '../lib/contracts';
import { useWallet } from '../providers/WalletProvider';

export function useBuyAsset() {
  const wallet = useWallet();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: bigint) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      return buyAsset(
        { address: wallet.address, signTransaction: wallet.signTransaction },
        listingId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useListAsset() {
  const wallet = useWallet();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      nftContract,
      tokenId,
      price,
    }: {
      nftContract: string;
      tokenId: bigint;
      price: bigint;
    }) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      return listAsset(
        { address: wallet.address, signTransaction: wallet.signTransaction },
        nftContract,
        tokenId,
        price,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useCancelListing() {
  const wallet = useWallet();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!wallet.address) throw new Error('Wallet not connected');
      // cancel_listing contract call — mirrors buyAsset pattern
      const { invokeContract, CONTRACT_IDS } = await import('../lib/stellar');
      const { nativeToScVal } = await import('@stellar/stellar-sdk');
      return invokeContract(
        CONTRACT_IDS.marketplace,
        'cancel_listing',
        [nativeToScVal(listingId, { type: 'u64' })],
        wallet.address,
        wallet.signTransaction,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}
