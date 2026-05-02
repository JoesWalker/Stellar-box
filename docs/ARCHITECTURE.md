# StellarVerse Architecture

## Table of Contents

- [System Overview](#system-overview)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Indexer Architecture](#indexer-architecture)
- [Storage Architecture](#storage-architecture)
- [Tokenomics](#tokenomics)

---

## System Overview

StellarVerse is a layered system where each tier has a single responsibility:

```
┌──────────────────────────────────────────────────────────────┐
│  Client Layer                                                 │
│  Next.js 14 · Three.js · Stellar Wallets Kit · Zustand       │
└────────────────────────────┬─────────────────────────────────┘
                             │  XDR transactions / RPC calls
┌────────────────────────────▼─────────────────────────────────┐
│  Blockchain Layer                                             │
│  Stellar Network · Soroban Smart Contracts · Horizon API     │
└────────────────────────────┬─────────────────────────────────┘
                             │  Contract events (SSE / WS)
┌────────────────────────────▼─────────────────────────────────┐
│  Indexer Layer                                                │
│  Express · PostgreSQL 15 · Horizon WebSocket listener        │
└────────────────────────────┬─────────────────────────────────┘
                             │  REST API
┌────────────────────────────▼─────────────────────────────────┐
│  Storage Layer                                                │
│  IPFS via Pinata (metadata)  ·  Arweave (permanent assets)   │
└──────────────────────────────────────────────────────────────┘
```

**Key design principles:**

- **On-chain authority** — ownership, transfers, and marketplace escrow live entirely in Soroban contracts. The indexer is read-only and can be rebuilt from chain history at any time.
- **Near-zero fees** — Stellar's fee model makes micro-transactions viable for land purchases and asset trades.
- **5-second finality** — Stellar's consensus gives users immediate confirmation without waiting for block confirmations.
- **Decentralized storage** — asset metadata is stored on IPFS; permanent voxel data is pinned to Arweave so it survives any single service going offline.

---

## Smart Contract Architecture

### Contract Interaction Diagram

```
  User Wallet
      │
      │  invoke
      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Marketplace Contract                    │
│                                                             │
│  list_land()   ──────────────────────────────────────────► │──► LandNFT.transfer_from()
│  list_asset()  ──────────────────────────────────────────► │──► AssetNFT.transfer_from()
│  buy()         ──► SVRSToken.transfer_from(buyer, escrow)  │
│                    SVRSToken.transfer(escrow, seller)       │
│                    LandNFT.transfer_from(seller, buyer)     │
│  cancel()      ──► LandNFT.transfer_from(escrow, seller)   │
└─────────────────────────────────────────────────────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
┌──────────┐        ┌──────────┐        ┌──────────────┐
│ LandNFT  │        │ AssetNFT │        │  SVRSToken   │
│          │        │          │        │  (SEP-41)    │
│ mint()   │        │ mint()   │        │              │
│ transfer │        │ transfer │        │ transfer()   │
│ metadata │        │ metadata │        │ approve()    │
│ owner_of │        │ owner_of │        │ balance()    │
└──────────┘        └──────────┘        └──────────────┘
```

### Contract Responsibilities

| Contract | Responsibility | Key State |
|----------|---------------|-----------|
| **LandNFT** | Mint and transfer land parcels (x,y coordinates) | `owner: Map<u64, Address>`, `metadata: Map<u64, LandMetadata>` |
| **AssetNFT** | Mint and transfer voxel asset NFTs | `owner: Map<u64, Address>`, `metadata: Map<u64, AssetMetadata>` |
| **SVRSToken** | SEP-41 fungible token, 3B fixed supply | `balance: Map<Address, i128>`, `allowance: Map<(Address,Address), i128>` |
| **Marketplace** | Escrow-based listing and purchase | `listings: Map<u64, Listing>` |

### Authorization Model

All state-mutating functions require `require_auth()` on the relevant signer:

- **Minting** — admin only (set at `initialize`)
- **Transfer** — current owner or approved operator
- **Marketplace listing** — token owner
- **Marketplace purchase** — buyer (approves SVRS spend before calling `buy`)

---

## Frontend Architecture

```
apps/web/src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout, providers
│   ├── page.tsx                # Landing / world entry
│   ├── marketplace/page.tsx    # Marketplace UI
│   └── profile/page.tsx        # User inventory
│
├── components/
│   ├── world/
│   │   ├── World.tsx           # R3F Canvas root
│   │   ├── LandGrid.tsx        # 16×16 parcel grid
│   │   ├── VoxelAsset.tsx      # Instanced voxel mesh
│   │   └── CameraControls.tsx  # Orbit / fly controls
│   ├── marketplace/
│   │   ├── ListingCard.tsx
│   │   ├── BuyModal.tsx
│   │   └── CreateListing.tsx
│   └── wallet/
│       ├── ConnectButton.tsx   # Stellar Wallets Kit trigger
│       └── WalletProvider.tsx  # Kit context wrapper
│
├── hooks/
│   ├── useLandNFT.ts           # TanStack Query + contract calls
│   ├── useMarketplace.ts
│   └── useSVRSBalance.ts
│
└── store/
    ├── worldStore.ts           # Zustand: camera, selected parcel
    └── walletStore.ts          # Zustand: connected address, network
```

### Data Flow

```
User action
    │
    ▼
React component
    │  calls hook
    ▼
TanStack Query (cache + background refetch)
    │  on mutation
    ▼
stellar-client package
    │  builds + signs XDR
    ▼
Stellar Wallets Kit  ──►  User wallet (Freighter / xBull / Lobstr)
    │  signed XDR
    ▼
Soroban RPC  ──►  Stellar Network
    │  event
    ▼
Indexer  ──►  PostgreSQL  ──►  REST API  ──►  TanStack Query invalidation
```

---

## Indexer Architecture

The indexer is a stateless Node.js service that replays and streams Stellar contract events into PostgreSQL for fast querying.

```
apps/indexer/src/
├── indexer.ts          # Entry point, Horizon WS connection
├── handlers/
│   ├── landEvents.ts   # LandMinted, LandTransferred
│   ├── assetEvents.ts  # AssetMinted, AssetTransferred
│   ├── tokenEvents.ts  # Transfer, Approve
│   └── marketEvents.ts # Listed, Sold, Cancelled
└── db/
    ├── schema.sql      # Table definitions
    ├── migrations/     # Versioned migrations
    └── queries.ts      # Typed pg queries
```

### Event Processing Pipeline

```
Horizon WebSocket (contract events)
    │
    ▼
Event dispatcher (indexer.ts)
    │  routes by contract ID + topic
    ▼
Handler (e.g. marketEvents.ts)
    │  decodes XDR values
    ▼
PostgreSQL upsert
    │
    ▼
REST API (Express)  ──►  Frontend
```

**Replay:** On startup the indexer checks the last processed ledger in PostgreSQL and replays any missed events from Horizon's `/events` endpoint before switching to the live WebSocket stream.

---

## Storage Architecture

### IPFS Flow (Pinata)

```
Creator uploads voxel asset
    │
    ▼
Frontend  ──►  Pinata API  ──►  IPFS network
    │           returns CID
    ▼
AssetNFT.mint(owner, metadata_uri="ipfs://<CID>")
    │
    ▼
On-chain: token_id → ipfs://<CID>
    │
    ▼
Frontend resolves: https://gateway.pinata.cloud/ipfs/<CID>
```

### Arweave Flow (permanent storage)

```
High-value / permanent assets
    │
    ▼
Frontend  ──►  Arweave gateway  ──►  Arweave network
    │           returns txId
    ▼
AssetNFT.mint(owner, metadata_uri="ar://<txId>")
```

### Metadata Schema

```json
{
  "name": "Parcel (12, 34)",
  "description": "A 16×16 voxel land parcel in StellarVerse",
  "image": "ipfs://<CID>",
  "attributes": [
    { "trait_type": "x", "value": 12 },
    { "trait_type": "y", "value": 34 },
    { "trait_type": "biome", "value": "desert" },
    { "trait_type": "elevation", "value": 3 }
  ]
}
```

---

## Tokenomics

### SVRS Token

| Property | Value |
|----------|-------|
| Name | StellarVerse Token |
| Symbol | SVRS |
| Standard | SEP-41 (Soroban fungible token) |
| Total Supply | 3,000,000,000 SVRS (fixed, no mint after genesis) |
| Decimals | 7 |

### Distribution

```
  Total Supply: 3,000,000,000 SVRS
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  Ecosystem Fund      ████████████  30%   900,000,000   │
  │  Team & Advisors     ██████████    25%   750,000,000   │
  │  Public Sale         ████████      20%   600,000,000   │
  │  Staking Rewards     ██████        15%   450,000,000   │
  │  Treasury            ████          10%   300,000,000   │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
```

| Allocation | % | Amount | Vesting |
|-----------|---|--------|---------|
| Ecosystem Fund | 30% | 900,000,000 | Released over 4 years via DAO proposals |
| Team & Advisors | 25% | 750,000,000 | 1-year cliff, 3-year linear vest |
| Public Sale | 20% | 600,000,000 | Unlocked at TGE |
| Staking Rewards | 15% | 450,000,000 | Emitted per epoch to stakers |
| Treasury | 10% | 300,000,000 | Multisig controlled, operational reserve |

### Token Utility

- **Land purchases** — buy and sell land parcels in the marketplace
- **Asset trading** — trade voxel assets peer-to-peer
- **Staking** — stake SVRS to earn a share of marketplace fees
- **Governance** — vote on DAO proposals (Phase 3+)
- **Creator rewards** — earn SVRS when other users interact with your world
