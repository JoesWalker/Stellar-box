CREATE TABLE IF NOT EXISTS lands (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(255) UNIQUE NOT NULL,
  owner VARCHAR(255) NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  size INTEGER NOT NULL DEFAULT 1,
  uri TEXT,
  minted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tx_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(255) UNIQUE NOT NULL,
  owner VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  uri TEXT,
  creator VARCHAR(255) NOT NULL,
  minted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tx_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  listing_id VARCHAR(255) UNIQUE NOT NULL,
  seller VARCHAR(255) NOT NULL,
  nft_contract VARCHAR(255) NOT NULL,
  token_id VARCHAR(255) NOT NULL,
  price NUMERIC(38, 7) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tx_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  amount NUMERIC(38, 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lands_owner ON lands(owner);
CREATE INDEX IF NOT EXISTS idx_lands_coords ON lands(x, y);
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(active);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
