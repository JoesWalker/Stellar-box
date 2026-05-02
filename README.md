<div align="center">

```
███████╗████████╗███████╗██╗     ██╗      █████╗ ██████╗ ██╗   ██╗███████╗██████╗ ███████╗███████╗
██╔════╝╚══██╔══╝██╔════╝██║     ██║     ██╔══██╗██╔══██╗██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
███████╗   ██║   █████╗  ██║     ██║     ███████║██████╔╝██║   ██║█████╗  ██████╔╝███████╗█████╗
╚════██║   ██║   ██╔══╝  ██║     ██║     ██╔══██║██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝
███████║   ██║   ███████╗███████╗███████╗██║  ██║██║  ██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗
╚══════╝   ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝
```

**The Open Metaverse on Stellar**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-blueviolet)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-gold)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444)](https://turbo.build)
[![Status](https://img.shields.io/badge/Status-Phase%201%20(30%25)-orange)](https://github.com)

</div>

---

## What is StellarVerse?

StellarVerse is a fully decentralized, voxel-based metaverse and gaming platform built natively on the **Stellar blockchain** using **Soroban smart contracts**. It is conceptually similar to The Sandbox — users can own virtual land parcels as NFTs, create 3D voxel assets, build interactive games without writing code, and trade everything in a trustless on-chain marketplace.

Unlike Ethereum-based metaverses, StellarVerse is built on Stellar's infrastructure, which provides:

- **~5 second transaction finality** — actions feel instant
- **Near-zero fees** — minting an NFT costs fractions of a cent
- **Soroban smart contracts** — Rust-based, auditable, deterministic on-chain logic
- **SEP-41 token standard** — the native SVRS utility token follows Stellar's fungible token standard
- **Native wallet support** — Freighter, Lobstr, and any Stellar-compatible wallet

> *"Not just a game. A universe you own."*

---

## How It Works — End to End

### 1. Connect Your Wallet

Users connect a Stellar wallet (Freighter or Lobstr) via the **Stellar Wallets Kit** integration. The wallet signs all on-chain transactions — minting, buying, selling — without ever exposing private keys to the app. The frontend reads the user's public key and queries their owned NFTs from the indexer.

### 2. Own Land (LandNFT Contract)

The world is a **100×100 grid** of land parcels — 10,000 unique plots. Each parcel is an NFT managed by the `LandNFT` Soroban contract. Owning a parcel gives you the right to build on it and publish experiences. Land is minted by the admin (or via a future public sale contract) and transferred on-chain. Metadata (coordinates, size, IPFS URI) is stored in Soroban's persistent ledger storage.

```
Parcel (42, 17)
  ├── owner: GABC...XYZ  (Stellar address)
  ├── size: 1×1
  └── uri: ipfs://Qm.../land-42-17.json
```

### 3. Create Voxel Assets (AssetNFT Contract)

The **Voxel Creator** is a browser-based 3D editor (built with Three.js / React Three Fiber) where users sculpt objects on a 16×16×16 voxel grid. When finished:

1. The voxel data is serialized to JSON and a thumbnail PNG is generated in-browser
2. Both are uploaded to **IPFS via Pinata** — the CID becomes the asset's permanent URI
3. The user signs a `mint` transaction on the `AssetNFT` Soroban contract
4. The NFT is recorded on-chain with the IPFS URI pointing to the full voxel data

Asset types include: Characters, Items, Buildings, and Vehicles.

### 4. Build Games (No-Code Game Builder)

The **Game Builder** is a three-panel visual editor:

- **Left panel** — Asset Library: drag your owned NFT assets into the scene
- **Center panel** — 3D Scene Viewport: place, move, and scale objects on your land parcel
- **Right panel** — Properties & Behaviors: attach trigger→action logic to any object without writing code

**Behavior system example:**
```
Trigger: OnClick
Action:  ShowMessage("Welcome to my world!")

Trigger: OnCollide
Action:  GiveToken(10 SVRS)

Trigger: OnTimer (every 5s)
Action:  PlayAnimation("spin")
```

The completed game is exported as a `GameConfig` JSON file, uploaded to IPFS, and linked to the land parcel on-chain. Visitors who enter the parcel load this config and the experience runs in their browser.

### 5. Trade in the Marketplace (Marketplace Contract)

The `Marketplace` Soroban contract handles all trading trustlessly:

1. **Seller** calls `list_asset(nft_contract, token_id, price)` — the contract verifies ownership and records the listing on-chain
2. **Buyer** calls `buy_asset(listing_id)` — the contract atomically transfers SVRS tokens from buyer to seller AND transfers the NFT from seller to buyer in a single transaction
3. If the sale falls through, the seller calls `cancel_listing(listing_id)`

No escrow service, no intermediary. The contract enforces the swap atomically — either both transfers happen or neither does.

### 6. SVRS Token (SEP-41)

**SVRS** is the native utility token of StellarVerse, implemented as a SEP-41 compliant Soroban contract (Stellar's equivalent of ERC-20). Total supply: **3,000,000,000 SVRS**.

| Use Case | Description |
|---|---|
| Marketplace payments | Buy and sell land and assets |
| Game rewards | Builders reward players with SVRS |
| Staking (Phase 3) | Stake SVRS to earn platform fees |
| Governance (Phase 3) | Vote on platform upgrades |
| Land rental (Phase 3) | Rent parcels for SVRS per epoch |

Token distribution:
- 30% — Ecosystem & creator grants
- 25% — Team (4-year vesting, 1-year cliff)
- 20% — Public sale
- 15% — Staking rewards pool
- 10% — Treasury

### 7. Event Indexer

Soroban contracts emit events (e.g. `land_minted`, `asset_sold`, `listing_created`). The **Indexer** service (Node.js + Express) polls the Soroban RPC every 5 seconds for new contract events and writes them to a **PostgreSQL** database. The frontend queries the indexer's REST API instead of hitting the blockchain directly for read-heavy operations like the world map and marketplace listings — keeping the UI fast.

```
Soroban RPC  →  Indexer (polls every 5s)  →  PostgreSQL
                                          ↓
                              REST API  ←  Next.js frontend
                         /lands  /assets  /listings  /stats
```

### 8. Decentralized Storage

All asset data lives off-chain on content-addressed storage:

- **IPFS via Pinata** — voxel JSON, thumbnails, game configs, NFT metadata
- **Arweave** — permanent archival of high-value assets (optional, for creators who want guaranteed permanence)

The Soroban contracts store only the IPFS CID (e.g. `ipfs://QmXyz...`) — the actual data is fetched from the IPFS gateway by the frontend. This keeps on-chain storage costs minimal while keeping data verifiable and decentralized.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        StellarVerse Platform                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     Next.js 14 Frontend                       │    │
│  │                                                               │    │
│  │  / (landing)  /world  /create  /build  /marketplace          │    │
│  │                                                               │    │
│  │  Three.js World Map  │  Voxel Editor  │  Game Builder        │    │
│  │  Marketplace UI      │  Wallet Kit    │  React Query Cache   │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
│                               │                                        │
│            ┌──────────────────┼──────────────────┐                   │
│            ▼                  ▼                  ▼                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐        │
│  │  Soroban RPC    │  │  Indexer API │  │  IPFS Gateway    │        │
│  │  (read/write)   │  │  (read only) │  │  (asset data)    │        │
│  └────────┬────────┘  └──────┬───────┘  └──────────────────┘        │
│           │                  │                                         │
│  ┌────────▼──────────────────▼──────────────────────────────────┐    │
│  │                  Stellar Network (Testnet / Mainnet)           │    │
│  │                                                               │    │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐  │    │
│  │  │  LandNFT   │  │  AssetNFT  │  │  SVRS    │  │ Market  │  │    │
│  │  │  Contract  │  │  Contract  │  │  Token   │  │ place   │  │    │
│  │  └────────────┘  └────────────┘  └──────────┘  └─────────┘  │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                               │                                        │
│  ┌────────────────────────────▼──────────────────────────────────┐   │
│  │           Indexer Service (Express + PostgreSQL)               │   │
│  │     Polls Soroban events → stores in DB → serves REST API     │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                               │                                        │
│  ┌────────────────────────────▼──────────────────────────────────┐   │
│  │              Decentralized Storage                             │   │
│  │              IPFS (Pinata)  │  Arweave (permanent)            │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

</content>
</invoke>

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Smart Contracts | Rust + Soroban SDK | 20.0.0 | On-chain NFT, token, and marketplace logic |
| Blockchain | Stellar Network | — | Settlement, finality, wallet auth |
| Frontend | Next.js (App Router) | 14.2.3 | Web application, SSR, API routes |
| 3D Engine | Three.js + React Three Fiber | 0.165.0 / 8.16.8 | World map, voxel editor, game builder |
| 3D Helpers | @react-three/drei | 9.105.4 | OrbitControls, Stars, Grid, Environment |
| State | Zustand | 4.5.2 | Client-side global state |
| Data Fetching | TanStack Query | 5.40.0 | Server state, caching, mutations |
| Styling | Tailwind CSS | 3.4.4 | Utility-first dark space theme |
| Animation | Framer Motion | 11.2.10 | Page and component animations |
| Wallet | Stellar Wallets Kit | 1.2.0 | Freighter, Lobstr, multi-wallet modal |
| Stellar SDK | @stellar/stellar-sdk | 12.0.0 | Transaction building, Soroban RPC calls |
| Indexer | Express + PostgreSQL | 4.19.2 / 15 | Off-chain event indexing, REST API |
| Storage | IPFS via Pinata | — | Voxel data, thumbnails, NFT metadata |
| Storage (archival) | Arweave | — | Permanent asset storage |
| Monorepo | Turborepo | 2.0.9 | Build orchestration, caching |
| Language | TypeScript | 5.4.5 | End-to-end type safety |

---

## Monorepo Structure

```
stellar-box/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx          # Landing page
│   │   │   │   ├── world/page.tsx    # 3D world map
│   │   │   │   ├── create/page.tsx   # Voxel asset creator
│   │   │   │   ├── build/page.tsx    # No-code game builder
│   │   │   │   ├── marketplace/      # Marketplace + listing detail
│   │   │   │   └── api/              # Next.js API routes (lands, listings, stats)
│   │   │   ├── components/
│   │   │   │   ├── layout/           # Navbar, ConnectWalletButton
│   │   │   │   ├── world/            # WorldMap, LandParcel, MiniMap, LandInfoPanel
│   │   │   │   ├── creator/          # VoxelEditor, VoxelGrid, ColorPalette, ExportModal
│   │   │   │   ├── builder/          # GameBuilder, SceneViewport, AssetLibrary, BehaviorEditor
│   │   │   │   └── marketplace/      # ListingsGrid, ListingCard, BuyModal, FilterSidebar
│   │   │   ├── hooks/                # useWorldData, useListings, useMarketplace
│   │   │   ├── lib/                  # stellar.ts, contracts.ts, voxelExport.ts, gameExport.ts
│   │   │   ├── providers/            # WalletProvider, QueryClientProvider
│   │   │   └── store/                # worldStore, voxelStore, builderStore
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── indexer/                      # Event indexer service
│       ├── src/
│       │   ├── index.ts              # Express server entry point
│       │   ├── indexer/
│       │   │   └── stellarIndexer.ts # Soroban RPC event poller
│       │   ├── routes/               # /lands /assets /listings /stats
│       │   ├── db/
│       │   │   ├── client.ts         # PostgreSQL pool
│       │   │   └── schema.sql        # Tables: lands, assets, listings, transactions
│       │   └── middleware/cors.ts
│       └── package.json
│
├── contracts/                        # Soroban smart contracts (Rust)
│   ├── land-nft/src/lib.rs           # Land parcel NFT contract
│   ├── asset-nft/src/lib.rs          # Voxel asset NFT contract
│   ├── svrs-token/src/lib.rs         # SVRS SEP-41 fungible token
│   ├── marketplace/src/lib.rs        # Trustless marketplace
│   └── Cargo.toml                    # Workspace manifest
│
├── packages/
│   ├── stellar-client/               # IPFS/Arweave upload, NFT metadata builders
│   └── types/                        # Shared TypeScript types across all apps
│
├── scripts/
│   ├── deploy-contracts.sh           # Build + deploy all 4 contracts to testnet/mainnet
│   └── setup-dev.sh                  # Install deps, start PostgreSQL, run migrations
│
├── docs/
│   ├── ARCHITECTURE.md               # Deep-dive system design
│   ├── CONTRACTS.md                  # Full contract API reference
│   └── DEVELOPMENT.md                # Developer workflows
│
├── .env.example                      # All required environment variables
├── package.json                      # Root npm workspace
├── turbo.json                        # Turborepo pipeline config
└── README.md
```

---

## Smart Contracts

All contracts are written in Rust using the Soroban SDK and compiled to WASM. They run on the Stellar network with deterministic execution and sub-cent transaction fees.

### LandNFT

Manages the 10,000 land parcels (100×100 grid). Each token ID maps to a unique `(x, y)` coordinate.

```rust
// Key functions
fn initialize(env: Env, admin: Address)
fn mint(env: Env, to: Address, x: i32, y: i32, size: u32, uri: String) -> u32
fn transfer(env: Env, from: Address, to: Address, token_id: u32)
fn approve(env: Env, approved: Address, token_id: u32)
fn owner_of(env: Env, token_id: u32) -> Address
fn token_uri(env: Env, token_id: u32) -> String
fn total_supply(env: Env) -> u32
```

Storage layout uses Soroban's **persistent** storage for per-token data (owner, metadata) and **instance** storage for global state (admin, total supply).

### AssetNFT

Manages voxel asset NFTs. Each token stores the creator address and an IPFS URI pointing to the full voxel JSON + thumbnail.

```rust
fn mint(env: Env, to: Address, name: String, asset_type: String, uri: String) -> u32
fn transfer(env: Env, from: Address, to: Address, token_id: u32)
fn owner_of(env: Env, token_id: u32) -> Address
fn token_uri(env: Env, token_id: u32) -> String
```

### SVRSToken (SEP-41)

Full SEP-41 fungible token implementation. Total supply: 3,000,000,000 SVRS (7 decimal places, stored as stroops).

```rust
fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32)
fn mint(env: Env, to: Address, amount: i128)
fn transfer(env: Env, from: Address, to: Address, amount: i128)
fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128)
fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32)
fn balance(env: Env, id: Address) -> i128
fn allowance(env: Env, from: Address, spender: Address) -> i128
fn burn(env: Env, from: Address, amount: i128)
```

### Marketplace

Handles trustless peer-to-peer trading. A listing locks the NFT's sale terms on-chain. The `buy_asset` function performs an **atomic cross-contract swap** — SVRS payment and NFT transfer happen in the same transaction or both revert.

```rust
fn initialize(env: Env, admin: Address, svrs_token: Address)
fn list_asset(env: Env, seller: Address, nft_contract: Address, token_id: u32, price: i128) -> u32
fn buy_asset(env: Env, buyer: Address, listing_id: u32)
fn cancel_listing(env: Env, seller: Address, listing_id: u32)
fn get_listing(env: Env, listing_id: u32) -> Listing
```

The contract verifies seller ownership via a cross-contract call to the NFT contract before creating a listing, preventing fraudulent listings.

### Deploy to Testnet

```bash
# Requires: Rust, soroban-cli, funded testnet account in ~/.config/soroban/identity/
./scripts/deploy-contracts.sh
# Outputs contract IDs to .env.contracts
```

### Deploy to Mainnet

```bash
STELLAR_NETWORK=mainnet ./scripts/deploy-contracts.sh
```

See [docs/CONTRACTS.md](docs/CONTRACTS.md) for the full API reference, error codes, and emitted events.

---

## Frontend Pages

### `/` — Landing Page

Animated starfield hero with feature cards linking to each section. Explains the platform value proposition and CTAs to explore the world or view the marketplace.

### `/world` — 3D World Map

Full-screen Three.js canvas rendering the 100×100 land grid using **instanced meshes** (10,000 parcels in a single draw call for performance). Features:

- Top-down orthographic camera with pan and zoom
- Color-coded parcels: purple = owned, dark = available, gold = selected
- Click any parcel to open the Land Info Panel (owner, coordinates, buy/visit/manage)
- Coordinate search (`x, y` → jump to parcel)
- 2D minimap canvas overlay showing the full grid
- Starfield background and purple point lighting for atmosphere

### `/create` — Voxel Asset Creator

Browser-based 3D voxel editor on a 16×16×16 grid. Features:

- **Tools**: Place, Erase, Paint, Select
- **Color palette**: 32 preset colors + custom color picker
- **Undo/Redo**: Full history stack (Ctrl+Z / Ctrl+Y)
- **Ghost voxel**: Preview placement before clicking
- **Export**: Serializes voxel data to JSON, generates isometric thumbnail PNG, uploads both to IPFS via Pinata, then calls `AssetNFT.mint` on-chain

### `/build` — No-Code Game Builder

Three-panel layout for building interactive experiences on your land:

- **Asset Library** (left): Drag owned NFT assets or templates into the scene
- **Scene Viewport** (center): 3D canvas with drag-to-place, click-to-select, Play/Stop preview mode
- **Properties Panel** (right): Edit position/rotation/scale, attach behaviors

**Behavior system** — visual trigger→action pairs:

| Trigger | Action |
|---|---|
| OnClick | ShowMessage(text) |
| OnCollide | GiveToken(amount) |
| OnEnter | PlayAnimation(name) |
| OnTimer(interval) | Teleport(x, y, z) |

Export produces a `GameConfig` JSON uploaded to IPFS and linked to the land parcel on-chain.

### `/marketplace` — Marketplace

Full NFT marketplace UI:

- **Listings grid**: Responsive card grid with CSS isometric voxel previews
- **Filters**: Category (LAND / Character / Item / Building / Vehicle), price range, sort order
- **Search**: Filter by name
- **Buy flow**: Confirmation modal with price breakdown, balance check, wallet signing
- **List flow**: Select owned asset, set SVRS price, sign listing transaction
- **Listing detail** (`/marketplace/[id]`): Large preview, metadata, 7-day price history chart

---

## Indexer Service

The indexer bridges the blockchain and the frontend for read-heavy operations.

**How it works:**

1. On startup, connects to PostgreSQL and applies `schema.sql`
2. Polls the Soroban RPC every 5 seconds for new contract events
3. Decodes XDR event payloads and upserts records into the database
4. Serves a REST API consumed by the Next.js frontend

**REST API endpoints:**

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health check |
| GET | `/lands` | Paginated land parcels, filter by `owner` |
| GET | `/lands/:tokenId` | Single land parcel |
| GET | `/lands/coords/:x/:y` | Land at coordinates |
| GET | `/assets` | Paginated assets, filter by `owner`, `asset_type` |
| GET | `/assets/:tokenId` | Single asset |
| GET | `/listings` | Paginated listings, filter by `active`, price range |
| GET | `/listings/:listingId` | Single listing |
| GET | `/stats` | Platform stats: total lands, assets, volume |

**Database schema:**

```sql
lands        (id, token_id, owner, x, y, size, uri, minted_at, tx_hash)
assets       (id, token_id, owner, name, asset_type, uri, creator, minted_at, tx_hash)
listings     (id, listing_id, seller, nft_contract, token_id, price, active, created_at, tx_hash)
transactions (id, tx_hash, type, from_address, to_address, amount, created_at)
```

---

## Quick Start

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20.x | [nodejs.org](https://nodejs.org) |
| Rust | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Soroban CLI | ≥ 20.x | `cargo install --locked soroban-cli` |
| Docker | ≥ 24.x | [docker.com](https://docker.com) (for PostgreSQL) |

### 1. Clone & Install

```bash
git clone https://github.com/your-org/stellar-box.git
cd stellar-box
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Key variables to set:

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stellarverse
PINATA_JWT=your_pinata_jwt_token
```

### 3. Deploy Contracts (Testnet)

```bash
# Requires a funded testnet identity in soroban-cli
./scripts/deploy-contracts.sh
# Contract IDs are saved to .env.contracts — copy them into .env
```

### 4. Run Development Servers

```bash
# All services via Turborepo
npm run dev

# Or individually:
npm run dev --filter=web       # → http://localhost:3000
npm run dev --filter=indexer   # → http://localhost:3001
```

### 5. Run Contract Tests

```bash
cd contracts
cargo test
```

---

## Development Roadmap

### Phase 1 — Foundation ✅ *(Q2 2026 — 30% complete)*
- [x] Turborepo monorepo with Next.js 14, Rust, TypeScript
- [x] All 4 Soroban smart contracts (LandNFT, AssetNFT, SVRSToken, Marketplace)
- [x] Stellar Wallets Kit integration (Freighter, Lobstr)
- [x] Three.js world map with instanced mesh rendering
- [x] Browser-based voxel asset creator with IPFS export
- [x] No-code game builder with behavior scripting
- [x] Marketplace UI with buy/list/cancel flows
- [x] Event indexer with PostgreSQL
- [x] IPFS/Arweave storage package

### Phase 2 — World Engine 🔨 *(Q3 2026)*
- [ ] Real-time multiplayer via WebSocket
- [ ] Avatar system with customizable voxel characters
- [ ] In-world game runtime (behavior execution engine)
- [ ] Land parcel building mode (place assets on owned land)
- [ ] World discovery feed

### Phase 3 — Economy 💰 *(Q4 2026)*
- [ ] SVRS staking with on-chain rewards distribution
- [ ] Marketplace auction support
- [ ] Creator royalties on secondary sales
- [ ] Land rental contracts (SVRS per epoch)
- [ ] DAO governance module

### Phase 4 — Social & Scale 🌐 *(Q1 2027)*
- [ ] User profiles and social graph
- [ ] Events and live experiences
- [ ] Mobile-responsive world viewer
- [ ] Creator monetization dashboard
- [ ] World search and discovery

### Phase 5 — Ecosystem 🚀 *(Q2 2027)*
- [ ] Third-party builder SDK
- [ ] Cross-chain bridge (Ethereum ↔ Stellar)
- [ ] AI-assisted world generation
- [ ] Mainnet launch
- [ ] DAO handoff

---

## Contributing

1. Fork the repository
2. Run `./scripts/setup-dev.sh` to bootstrap your environment
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Make your changes and add tests
5. Run `npm run lint && npm run test` — all checks must pass
6. Open a pull request against `main`

**Commit convention** ([Conventional Commits](https://www.conventionalcommits.org/)):

```
feat(marketplace): add auction support
fix(land-nft): correct ownership transfer auth
docs(contracts): update LandNFT API reference
```

**Code standards:**
- Rust: `cargo fmt` + `cargo clippy --deny warnings`
- TypeScript: ESLint + Prettier (config in root)

---

## Documentation

| Document | Description |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flows, tokenomics |
| [docs/CONTRACTS.md](docs/CONTRACTS.md) | Full smart contract API reference |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Developer setup and workflows |

---

## License

MIT © 2026 StellarVerse Contributors

---

<div align="center">

Built with ❤️ on [Stellar](https://stellar.org) · [Discord](#) · [Twitter](#) · [Docs](docs/)

</div>
