import { SorobanRpc, xdr } from '@stellar/stellar-sdk';
import { query } from '../db/client';

const RPC_URL = process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';
const LAND_CONTRACT = process.env.LAND_CONTRACT_ID ?? '';
const ASSET_CONTRACT = process.env.ASSET_CONTRACT_ID ?? '';
const MARKETPLACE_CONTRACT = process.env.MARKETPLACE_CONTRACT_ID ?? '';

const server = new SorobanRpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith('http://') });

let lastLedger = 0;
let polling = false;

async function getStartLedger(): Promise<number> {
  if (lastLedger > 0) return lastLedger;
  const latest = await server.getLatestLedger();
  // Start from ~5 min ago (one ledger ≈ 5s → 60 ledgers)
  return Math.max(0, latest.sequence - 60);
}

async function handleEvent(event: SorobanRpc.Api.RawEventResponse): Promise<void> {
  if (!event.topic || !event.value) return;

  const topics = event.topic.map((t) => xdr.ScVal.fromXDR(t, 'base64'));
  const value = xdr.ScVal.fromXDR(event.value, 'base64');
  const eventName = topics[0]?.sym()?.toString();
  const txHash = event.txHash ?? '';

  switch (eventName) {
    case 'land_minted': {
      const tokenId = topics[1]?.u64()?.toString() ?? '';
      const owner = topics[2]?.address()?.toString() ?? '';
      const fields = value.map() ?? [];
      const get = (k: string) => fields.find((e) => e.key().sym()?.toString() === k)?.val();
      await query(
        `INSERT INTO lands (token_id, owner, x, y, size, uri, tx_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (token_id) DO NOTHING`,
        [
          tokenId, owner,
          parseInt(get('x')?.i32()?.toString() ?? '0'),
          parseInt(get('y')?.i32()?.toString() ?? '0'),
          parseInt(get('size')?.u32()?.toString() ?? '1'),
          get('uri')?.str()?.toString() ?? '',
          txHash,
        ]
      );
      await query(
        `INSERT INTO transactions (tx_hash, type, from_address, to_address) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [txHash, 'land_minted', null, owner]
      );
      break;
    }
    case 'asset_minted': {
      const tokenId = topics[1]?.u64()?.toString() ?? '';
      const owner = topics[2]?.address()?.toString() ?? '';
      const fields = value.map() ?? [];
      const get = (k: string) => fields.find((e) => e.key().sym()?.toString() === k)?.val();
      await query(
        `INSERT INTO assets (token_id, owner, name, asset_type, uri, creator, tx_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (token_id) DO NOTHING`,
        [
          tokenId, owner,
          get('name')?.str()?.toString() ?? '',
          get('asset_type')?.sym()?.toString() ?? '',
          get('uri')?.str()?.toString() ?? '',
          get('creator')?.address()?.toString() ?? owner,
          txHash,
        ]
      );
      await query(
        `INSERT INTO transactions (tx_hash, type, from_address, to_address) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [txHash, 'asset_minted', null, owner]
      );
      break;
    }
    case 'listing_created': {
      const listingId = topics[1]?.u64()?.toString() ?? '';
      const seller = topics[2]?.address()?.toString() ?? '';
      const fields = value.map() ?? [];
      const get = (k: string) => fields.find((e) => e.key().sym()?.toString() === k)?.val();
      await query(
        `INSERT INTO listings (listing_id, seller, nft_contract, token_id, price, tx_hash)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (listing_id) DO NOTHING`,
        [
          listingId, seller,
          get('nft_contract')?.address()?.toString() ?? '',
          get('token_id')?.u64()?.toString() ?? '',
          parseFloat(get('price')?.i128()?.toString() ?? '0') / 1e7,
          txHash,
        ]
      );
      await query(
        `INSERT INTO transactions (tx_hash, type, from_address) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [txHash, 'listing_created', seller]
      );
      break;
    }
    case 'asset_sold': {
      const listingId = topics[1]?.u64()?.toString() ?? '';
      const buyer = topics[2]?.address()?.toString() ?? '';
      const fields = value.map() ?? [];
      const get = (k: string) => fields.find((e) => e.key().sym()?.toString() === k)?.val();
      const price = parseFloat(get('price')?.i128()?.toString() ?? '0') / 1e7;
      const seller = get('seller')?.address()?.toString() ?? '';
      await query(`UPDATE listings SET active = FALSE WHERE listing_id = $1`, [listingId]);
      await query(
        `INSERT INTO transactions (tx_hash, type, from_address, to_address, amount) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [txHash, 'asset_sold', seller, buyer, price]
      );
      break;
    }
    default:
      break;
  }
}

async function poll(): Promise<void> {
  if (polling) return;
  polling = true;
  try {
    const startLedger = await getStartLedger();
    const contracts = [LAND_CONTRACT, ASSET_CONTRACT, MARKETPLACE_CONTRACT].filter(Boolean);
    if (!contracts.length) return;

    const response = await server.getEvents({
      startLedger,
      filters: [{ type: 'contract', contractIds: contracts }],
      limit: 100,
    });

    for (const event of response.events) {
      await handleEvent(event as unknown as SorobanRpc.Api.RawEventResponse);
    }

    if (response.latestLedger) {
      lastLedger = response.latestLedger + 1;
    }
  } catch (err) {
    console.error('Indexer poll error:', err);
  } finally {
    polling = false;
  }
}

export function startIndexer(): void {
  console.log('Starting Stellar event indexer...');
  poll();
  setInterval(poll, 5000);
}
