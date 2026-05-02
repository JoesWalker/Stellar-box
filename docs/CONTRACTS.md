# Smart Contracts Reference

All StellarVerse contracts are written in Rust using the Soroban SDK v20.0.0 and deployed to the Stellar network.

## Table of Contents

- [LandNFT](#landnft)
- [AssetNFT](#assetnft)
- [SVRSToken](#svrstoken)
- [Marketplace](#marketplace)
- [Deployment](#deployment)

---

## LandNFT

Manages ownership of land parcels. Each parcel is identified by a unique `token_id` derived from its `(x, y)` grid coordinates.

### Data Types

```rust
pub struct LandMetadata {
    pub x: u32,
    pub y: u32,
    pub biome: String,
    pub elevation: u32,
    pub metadata_uri: String,   // ipfs:// or ar://
}
```

### Functions

#### `initialize(env, admin: Address)`

One-time setup. Sets the contract admin who can mint new parcels.

#### `mint(env, to: Address, token_id: u64, metadata: LandMetadata)`

Mints a new land parcel NFT.

- **Auth:** admin
- **Errors:** `AlreadyMinted` if `token_id` exists

#### `transfer(env, from: Address, to: Address, token_id: u64)`

Transfers ownership of a parcel.

- **Auth:** `from`
- **Errors:** `NotOwner`, `NotFound`

#### `approve(env, owner: Address, spender: Address, token_id: u64)`

Approves `spender` to transfer a specific parcel on behalf of `owner`.

- **Auth:** `owner`

#### `owner_of(env, token_id: u64) → Address`

Returns the current owner of a parcel. Read-only.

#### `metadata(env, token_id: u64) → LandMetadata`

Returns the metadata for a parcel. Read-only.

#### `total_supply(env) → u64`

Returns the total number of minted parcels.

### Events Emitted

| Event | Topics | Data |
|-------|--------|------|
| `land_minted` | `["land_minted", token_id]` | `{ to, metadata }` |
| `land_transferred` | `["land_transferred", token_id]` | `{ from, to }` |
| `land_approved` | `["land_approved", token_id]` | `{ owner, spender }` |

---

## AssetNFT

Manages voxel asset NFTs that can be placed on land parcels.

### Data Types

```rust
pub struct AssetMetadata {
    pub name: String,
    pub asset_type: String,     // "building", "decoration", "vehicle", etc.
    pub voxel_data_uri: String, // ipfs:// CID of voxel data
    pub metadata_uri: String,
    pub creator: Address,
}
```

### Functions

#### `initialize(env, admin: Address)`

One-time setup.

#### `mint(env, to: Address, token_id: u64, metadata: AssetMetadata)`

Mints a new voxel asset NFT.

- **Auth:** admin or `metadata.creator` (open minting with creator set to caller)

#### `transfer(env, from: Address, to: Address, token_id: u64)`

Transfers an asset NFT.

- **Auth:** `from`

#### `approve(env, owner: Address, spender: Address, token_id: u64)`

Approves a spender for a specific asset.

- **Auth:** `owner`

#### `owner_of(env, token_id: u64) → Address`

Returns the current owner.

#### `metadata(env, token_id: u64) → AssetMetadata`

Returns asset metadata.

#### `creator_of(env, token_id: u64) → Address`

Returns the original creator (for royalty calculations).

### Events Emitted

| Event | Topics | Data |
|-------|--------|------|
| `asset_minted` | `["asset_minted", token_id]` | `{ to, metadata }` |
| `asset_transferred` | `["asset_transferred", token_id]` | `{ from, to }` |

---

## SVRSToken

SEP-41 compliant fungible token. Fixed supply of 3,000,000,000 SVRS minted at initialization.

### Functions

#### `initialize(env, admin: Address, name: String, symbol: String, decimals: u32)`

Mints the full supply to `admin`. Can only be called once.

#### `transfer(env, from: Address, to: Address, amount: i128)`

Transfers SVRS tokens.

- **Auth:** `from`
- **Errors:** `InsufficientBalance`

#### `transfer_from(env, spender: Address, from: Address, to: Address, amount: i128)`

Transfers on behalf of `from` using an existing allowance.

- **Auth:** `spender`
- **Errors:** `InsufficientAllowance`, `InsufficientBalance`

#### `approve(env, from: Address, spender: Address, amount: i128, expiration_ledger: u32)`

Sets an allowance for `spender` to spend `from`'s tokens.

- **Auth:** `from`

#### `balance(env, id: Address) → i128`

Returns the token balance of `id`.

#### `allowance(env, from: Address, spender: Address) → i128`

Returns the current allowance.

#### `name(env) → String` / `symbol(env) → String` / `decimals(env) → u32`

SEP-41 metadata getters.

#### `total_supply(env) → i128`

Returns 3,000,000,000 × 10^7 (fixed).

### Events Emitted

| Event | Topics | Data |
|-------|--------|------|
| `transfer` | `["transfer", from, to]` | `amount` |
| `approve` | `["approve", from, spender]` | `{ amount, expiration_ledger }` |

---

## Marketplace

Escrow-based marketplace for trading LandNFT and AssetNFT tokens for SVRS.

### Data Types

```rust
pub enum AssetType { Land, Asset }

pub struct Listing {
    pub seller: Address,
    pub asset_type: AssetType,
    pub token_id: u64,
    pub price: i128,        // in SVRS stroops (7 decimals)
    pub active: bool,
}
```

### Functions

#### `initialize(env, admin: Address, land_nft: Address, asset_nft: Address, svrs_token: Address, fee_bps: u32)`

Sets up the marketplace with contract addresses and fee in basis points (e.g. `250` = 2.5%).

#### `list(env, seller: Address, asset_type: AssetType, token_id: u64, price: i128) → u64`

Creates a listing. Transfers the NFT into marketplace escrow.

- **Auth:** `seller` (must have approved marketplace as operator)
- **Returns:** `listing_id`

#### `buy(env, buyer: Address, listing_id: u64)`

Purchases a listing. Transfers SVRS from buyer to seller (minus fee), transfers NFT to buyer.

- **Auth:** `buyer` (must have approved SVRS spend ≥ `price`)
- **Errors:** `ListingNotFound`, `ListingInactive`, `InsufficientBalance`

#### `cancel(env, seller: Address, listing_id: u64)`

Cancels an active listing and returns the NFT to the seller.

- **Auth:** `seller`

#### `get_listing(env, listing_id: u64) → Listing`

Returns listing details. Read-only.

#### `get_fee_bps(env) → u32`

Returns the current marketplace fee in basis points.

#### `set_fee_bps(env, admin: Address, fee_bps: u32)`

Updates the fee. **Auth:** admin.

### Events Emitted

| Event | Topics | Data |
|-------|--------|------|
| `listed` | `["listed", listing_id]` | `{ seller, asset_type, token_id, price }` |
| `sold` | `["sold", listing_id]` | `{ buyer, seller, price, fee }` |
| `cancelled` | `["cancelled", listing_id]` | `{ seller, token_id }` |

---

## Deployment

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli

# Fund a testnet account
soroban keys generate deployer --network testnet
soroban keys fund deployer --network testnet
```

### Automated Deployment

```bash
# Deploy all 4 contracts and save IDs to .env.contracts
./scripts/deploy-contracts.sh

# Source the contract IDs into your shell
source .env.contracts
```

### Manual Deployment (Testnet)

```bash
cd contracts

# 1. Build all contracts
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy SVRSToken
SVRS_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/svrs_token.wasm \
  --source deployer \
  --network testnet)

# 3. Initialize SVRSToken
soroban contract invoke \
  --id $SVRS_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer) \
  --name "StellarVerse Token" \
  --symbol "SVRS" \
  --decimals 7

# 4. Deploy LandNFT
LAND_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/land_nft.wasm \
  --source deployer \
  --network testnet)

soroban contract invoke \
  --id $LAND_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer)

# 5. Deploy AssetNFT
ASSET_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/asset_nft.wasm \
  --source deployer \
  --network testnet)

soroban contract invoke \
  --id $ASSET_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer)

# 6. Deploy Marketplace
MARKET_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/marketplace.wasm \
  --source deployer \
  --network testnet)

soroban contract invoke \
  --id $MARKET_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(soroban keys address deployer) \
  --land-nft $LAND_ID \
  --asset-nft $ASSET_ID \
  --svrs-token $SVRS_ID \
  --fee-bps 250
```

### Mainnet Deployment

```bash
STELLAR_NETWORK=mainnet ./scripts/deploy-contracts.sh
```

> ⚠️ Mainnet deployment requires a funded account with real XLM. Ensure all contracts have been audited before mainnet deployment.

### Useful Soroban CLI Commands

```bash
# Check a contract's WASM hash
soroban contract info --id $LAND_ID --network testnet

# Read contract state
soroban contract read --id $LAND_ID --network testnet

# Invoke a read-only function
soroban contract invoke \
  --id $LAND_ID \
  --network testnet \
  -- owner_of \
  --token-id 1

# Get SVRS balance
soroban contract invoke \
  --id $SVRS_ID \
  --network testnet \
  -- balance \
  --id $(soroban keys address deployer)

# Watch contract events
soroban events \
  --id $MARKET_ID \
  --network testnet \
  --start-ledger 1000000
```
