# Development Guide

## Table of Contents

- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Testing Contracts](#testing-contracts)
- [Frontend Development](#frontend-development)
- [Indexer Development](#indexer-development)
- [Common Issues](#common-issues)

---

## Environment Setup

### Required Tools

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20.x | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| npm | ≥ 10.x | Bundled with Node |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Soroban CLI | ≥ 20.x | `cargo install --locked soroban-cli` |
| Docker | ≥ 24.x | [docker.com](https://docker.com) |
| PostgreSQL | 15 | Via Docker (see below) |

### Automated Setup

The fastest way to get started:

```bash
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

This script will:
1. Check for required tools and print install instructions for any that are missing
2. Install all npm dependencies (`npm install`)
3. Copy `.env.example` → `.env`
4. Start PostgreSQL via Docker Compose
5. Run database migrations

### Manual Setup

```bash
# 1. Install npm dependencies
npm install

# 2. Add wasm target for Rust
rustup target add wasm32-unknown-unknown

# 3. Copy environment file
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and PINATA keys

# 4. Start PostgreSQL
docker run -d \
  --name stellarverse-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stellarverse \
  -p 5432:5432 \
  postgres:15

# 5. Run migrations
psql $DATABASE_URL -f apps/indexer/src/db/schema.sql
```

### Testnet Account

```bash
# Generate a deployer key
soroban keys generate deployer --network testnet

# Fund it from the testnet friendbot
soroban keys fund deployer --network testnet

# Print the address
soroban keys address deployer
```

---

## Running Locally

### All Services

```bash
npm run dev
```

Turborepo starts both `apps/web` and `apps/indexer` in parallel with output multiplexed in the terminal.

| Service | URL |
|---------|-----|
| Web frontend | http://localhost:3000 |
| Indexer API | http://localhost:3001 |

### Individual Services

```bash
# Frontend only
npm run dev --filter=web

# Indexer only
npm run dev --filter=indexer
```

### Build for Production

```bash
npm run build
```

### Lint & Format

```bash
# TypeScript
npm run lint

# Rust
cd contracts && cargo fmt && cargo clippy --deny warnings
```

---

## Testing Contracts

### Unit Tests

Each contract has unit tests in its `src/lib.rs` using the Soroban test environment:

```bash
# Run all contract tests
cd contracts && cargo test

# Run tests for a specific contract
cargo test -p land-nft
cargo test -p asset-nft
cargo test -p svrs-token
cargo test -p marketplace

# Run with output (useful for debugging)
cargo test -p marketplace -- --nocapture
```

### Test Structure

Tests use `soroban_sdk::testutils` to create an in-process Stellar environment:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_mint_and_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LandNftContract);
        let client = LandNftContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        env.mock_all_auths();
        client.initialize(&admin);
        // ... test assertions
    }
}
```

### Integration Tests

After deploying to testnet, verify contracts with the Soroban CLI:

```bash
source .env.contracts

# Mint a test land parcel
soroban contract invoke \
  --id $NEXT_PUBLIC_LAND_NFT_CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- mint \
  --to $(soroban keys address deployer) \
  --token-id 1 \
  --metadata '{"x":0,"y":0,"biome":"plains","elevation":1,"metadata_uri":"ipfs://test"}'

# Verify ownership
soroban contract invoke \
  --id $NEXT_PUBLIC_LAND_NFT_CONTRACT_ID \
  --network testnet \
  -- owner_of \
  --token-id 1
```

---

## Frontend Development

### Project Structure

```
apps/web/src/
├── app/            # Next.js App Router pages
├── components/     # React components
├── hooks/          # Data-fetching hooks (TanStack Query)
└── store/          # Global state (Zustand)
```

### Adding a New Page

1. Create `apps/web/src/app/your-page/page.tsx`
2. Export a default React component
3. Add navigation link in `components/layout/Nav.tsx`

### Calling a Contract

Use the shared `stellar-client` package:

```typescript
import { StellarClient } from '@stellarverse/stellar-client'

const client = new StellarClient({
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!,
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE!,
})

// Read (no auth needed)
const owner = await client.landNft.ownerOf(tokenId)

// Write (requires wallet signature)
const tx = await client.landNft.transfer(from, to, tokenId)
const signed = await walletKit.sign(tx)
await client.submitTransaction(signed)
```

### Wallet Integration

The app uses `@creit.tech/stellar-wallets-kit` to support Freighter, xBull, Lobstr, and other Stellar wallets:

```typescript
import { StellarWalletsKit, WalletNetwork } from '@creit.tech/stellar-wallets-kit'

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
})

await kit.openModal({ onWalletSelected: (wallet) => { /* ... */ } })
const { address } = await kit.getAddress()
```

### Environment Variables

All `NEXT_PUBLIC_*` variables are available in the browser. Never put secrets in `NEXT_PUBLIC_*` variables.

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_LAND_NFT_CONTRACT_ID=C...
NEXT_PUBLIC_ASSET_NFT_CONTRACT_ID=C...
NEXT_PUBLIC_SVRS_TOKEN_CONTRACT_ID=C...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=C...
```

---

## Indexer Development

### Architecture

The indexer connects to Horizon's WebSocket endpoint and processes contract events in real time, writing them to PostgreSQL.

### Running the Indexer

```bash
npm run dev --filter=indexer
```

The indexer will:
1. Connect to `NEXT_PUBLIC_HORIZON_URL`
2. Subscribe to events from all 4 contract IDs
3. Replay any events since the last processed ledger
4. Expose a REST API on `INDEXER_PORT` (default 3001)

### Adding a New Event Handler

1. Add the handler in `apps/indexer/src/handlers/`
2. Register it in `apps/indexer/src/indexer.ts`
3. Add the corresponding DB table/query in `apps/indexer/src/db/`

```typescript
// apps/indexer/src/handlers/myEvents.ts
export async function handleMyEvent(event: ContractEvent, db: Pool) {
  const { topics, value } = event
  // decode XDR topics and value
  await db.query(
    'INSERT INTO my_events (ledger, ...) VALUES ($1, ...) ON CONFLICT DO NOTHING',
    [event.ledger, ...]
  )
}
```

### REST API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/lands` | All minted land parcels |
| `GET` | `/lands/:tokenId` | Single parcel |
| `GET` | `/assets` | All minted asset NFTs |
| `GET` | `/marketplace/listings` | Active listings |
| `GET` | `/marketplace/listings/:id` | Single listing |
| `GET` | `/accounts/:address/lands` | Lands owned by address |
| `GET` | `/accounts/:address/assets` | Assets owned by address |

---

## Common Issues

### `soroban: command not found`

Install the Soroban CLI:

```bash
cargo install --locked soroban-cli
# Ensure ~/.cargo/bin is in your PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

### `error[E0463]: can't find crate for 'std'` when building contracts

The wasm32 target is missing:

```bash
rustup target add wasm32-unknown-unknown
```

### PostgreSQL connection refused

Start the database container:

```bash
docker start stellarverse-db
# or if not created yet:
docker run -d --name stellarverse-db \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stellarverse -p 5432:5432 postgres:15
```

### `Module not found: stellar-sdk` in Next.js

The webpack config in `apps/web/next.config.js` adds fallbacks for Node.js built-ins. If you see this error, ensure `next.config.js` has:

```js
config.resolve.fallback = { fs: false, net: false, tls: false }
```

### Wallet not connecting on testnet

Ensure your wallet extension (e.g. Freighter) is set to **Testnet** mode, and that `NEXT_PUBLIC_STELLAR_NETWORK=testnet` is set in `.env`.

### Contract invocation returns `HostError: Error(Auth, InvalidAction)`

The transaction is missing a required `require_auth()` signature. Make sure the wallet has signed the transaction and the correct address is being passed as the authorizing party.

### Indexer falls behind / misses events

The indexer stores the last processed ledger in the `indexer_state` table. To force a full replay from a specific ledger:

```sql
UPDATE indexer_state SET last_ledger = 1000000;
```

Then restart the indexer service.
