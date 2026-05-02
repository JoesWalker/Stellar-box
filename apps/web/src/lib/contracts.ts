import { nativeToScVal, scValToNative, xdr } from '@stellar/stellar-sdk';
import { CONTRACT_IDS, getSorobanRpc, invokeContract } from './stellar';

interface WalletContext {
  address: string;
  signTransaction: (xdr: string) => Promise<string>;
}

export async function mintLand(
  wallet: WalletContext,
  x: number,
  y: number,
  size: number,
  uri: string,
) {
  return invokeContract(
    CONTRACT_IDS.land,
    'mint_land',
    [
      nativeToScVal(wallet.address, { type: 'address' }),
      nativeToScVal(x, { type: 'i32' }),
      nativeToScVal(y, { type: 'i32' }),
      nativeToScVal(size, { type: 'u32' }),
      nativeToScVal(uri, { type: 'string' }),
    ],
    wallet.address,
    wallet.signTransaction,
  );
}

export async function mintAsset(
  wallet: WalletContext,
  name: string,
  type: string,
  uri: string,
) {
  return invokeContract(
    CONTRACT_IDS.asset,
    'mint_asset',
    [
      nativeToScVal(wallet.address, { type: 'address' }),
      nativeToScVal(name, { type: 'string' }),
      nativeToScVal(type, { type: 'string' }),
      nativeToScVal(uri, { type: 'string' }),
    ],
    wallet.address,
    wallet.signTransaction,
  );
}

export async function listAsset(
  wallet: WalletContext,
  nftContract: string,
  tokenId: bigint,
  price: bigint,
) {
  return invokeContract(
    CONTRACT_IDS.marketplace,
    'list_asset',
    [
      nativeToScVal(nftContract, { type: 'address' }),
      nativeToScVal(tokenId, { type: 'u64' }),
      nativeToScVal(price, { type: 'i128' }),
    ],
    wallet.address,
    wallet.signTransaction,
  );
}

export async function buyAsset(wallet: WalletContext, listingId: bigint) {
  return invokeContract(
    CONTRACT_IDS.marketplace,
    'buy_asset',
    [nativeToScVal(listingId, { type: 'u64' })],
    wallet.address,
    wallet.signTransaction,
  );
}

export interface Listing {
  id: bigint;
  seller: string;
  nftContract: string;
  tokenId: bigint;
  price: bigint;
}

export async function getListings(): Promise<Listing[]> {
  const server = getSorobanRpc();
  try {
    const result = await server.getContractData(
      CONTRACT_IDS.marketplace,
      xdr.ScVal.scvLedgerKeyContractInstance(),
    );
    // Parse listings from contract storage — returns raw scVal; decode as needed
    return scValToNative(result.val) as Listing[];
  } catch {
    return [];
  }
}
