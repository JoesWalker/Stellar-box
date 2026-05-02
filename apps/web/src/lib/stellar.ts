import { SorobanRpc, Networks, Contract, TransactionBuilder, BASE_FEE, TimeoutInfinite } from '@stellar/stellar-sdk';

export function getSorobanRpc(): SorobanRpc.Server {
  const url = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';
  return new SorobanRpc.Server(url, { allowHttp: url.startsWith('http://') });
}

export function getNetworkPassphrase(): string {
  return process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? Networks.TESTNET;
}

export const CONTRACT_IDS = {
  land: process.env.NEXT_PUBLIC_LAND_CONTRACT_ID ?? '',
  asset: process.env.NEXT_PUBLIC_ASSET_CONTRACT_ID ?? '',
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID ?? '',
} as const;

export async function invokeContract(
  contractId: string,
  method: string,
  args: Parameters<Contract['call']>[1][],
  signerAddress: string,
  signTransaction: (xdr: string) => Promise<string>,
): Promise<SorobanRpc.Api.GetTransactionResponse> {
  const server = getSorobanRpc();
  const passphrase = getNetworkPassphrase();
  const account = await server.getAccount(signerAddress);

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: passphrase })
    .addOperation(contract.call(method, ...args))
    .setTimeout(TimeoutInfinite)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signedXdr = await signTransaction(prepared.toXDR());

  const { hash } = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, passphrase),
  );

  // Poll for result
  let result: SorobanRpc.Api.GetTransactionResponse;
  do {
    await new Promise((r) => setTimeout(r, 1000));
    result = await server.getTransaction(hash);
  } while (result.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND);

  return result;
}
