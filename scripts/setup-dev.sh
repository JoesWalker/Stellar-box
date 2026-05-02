#!/usr/bin/env bash
# setup-dev.sh — Bootstrap the StellarVerse development environment
# Usage: ./scripts/setup-dev.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "▶ $*"; }
ok()   { echo "✔ $*"; }
warn() { echo "⚠ $*"; }
fail() { echo "✘ $*" >&2; exit 1; }

has_cmd() { command -v "$1" >/dev/null 2>&1; }

# ── Check required tools ──────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  StellarVerse — Dev Environment Setup"
echo "════════════════════════════════════════════════════════"
echo ""

MISSING=0

check_tool() {
  local cmd="$1"
  local label="$2"
  local install_hint="$3"
  if has_cmd "$cmd"; then
    ok "$label found: $($cmd --version 2>&1 | head -1)"
  else
    warn "$label not found. Install: $install_hint"
    MISSING=$((MISSING + 1))
  fi
}

check_tool node    "Node.js"    "https://nodejs.org  (or: nvm install 20)"
check_tool npm     "npm"        "Bundled with Node.js"
check_tool cargo   "Rust/Cargo" "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
check_tool docker  "Docker"     "https://docker.com"

# soroban-cli is optional at setup time (needed for deploy)
if has_cmd soroban; then
  ok "Soroban CLI found: $(soroban --version 2>&1 | head -1)"
else
  warn "Soroban CLI not found (needed for contract deployment). Install: cargo install --locked soroban-cli"
fi

echo ""

if [ "$MISSING" -gt 0 ]; then
  fail "$MISSING required tool(s) missing. Install them and re-run this script."
fi

# ── npm install ───────────────────────────────────────────────────────────────
log "Installing npm dependencies..."
(cd "$ROOT_DIR" && npm install)
ok "npm dependencies installed."
echo ""

# ── Rust wasm target ──────────────────────────────────────────────────────────
log "Adding wasm32-unknown-unknown Rust target..."
rustup target add wasm32-unknown-unknown
ok "Rust wasm target ready."
echo ""

# ── Environment file ──────────────────────────────────────────────────────────
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

if [ -f "$ENV_FILE" ]; then
  warn ".env already exists — skipping copy. Delete it to reset."
else
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  ok ".env created from .env.example"
  warn "Edit $ENV_FILE and fill in your PINATA_API_KEY and other secrets."
fi
echo ""

# ── PostgreSQL via Docker ─────────────────────────────────────────────────────
DB_CONTAINER="stellarverse-db"

if docker ps -a --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    ok "PostgreSQL container '$DB_CONTAINER' is already running."
  else
    log "Starting existing PostgreSQL container '$DB_CONTAINER'..."
    docker start "$DB_CONTAINER"
    ok "PostgreSQL started."
  fi
else
  log "Creating and starting PostgreSQL container..."
  docker run -d \
    --name "$DB_CONTAINER" \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=stellarverse \
    -p 5432:5432 \
    postgres:15
  ok "PostgreSQL container '$DB_CONTAINER' created and started."
fi

# Wait for Postgres to be ready
log "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 15); do
  if docker exec "$DB_CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then
    ok "PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq 15 ]; then
    fail "PostgreSQL did not become ready in time. Check: docker logs $DB_CONTAINER"
  fi
  sleep 1
done
echo ""

# ── Database migrations ───────────────────────────────────────────────────────
SCHEMA_FILE="$ROOT_DIR/apps/indexer/src/db/schema.sql"

if [ -f "$SCHEMA_FILE" ]; then
  log "Running database migrations..."
  docker exec -i "$DB_CONTAINER" \
    psql -U postgres -d stellarverse < "$SCHEMA_FILE"
  ok "Database schema applied."
else
  warn "Schema file not found at $SCHEMA_FILE — skipping migrations."
  warn "Run migrations manually once the indexer source is in place."
fi
echo ""

# ── Done ──────────────────────────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════"
echo "  Setup complete! Next steps:"
echo ""
echo "  1. Edit .env with your API keys and contract IDs"
echo "  2. Deploy contracts:  ./scripts/deploy-contracts.sh"
echo "  3. Source contract IDs: source .env.contracts"
echo "  4. Start dev servers:  npm run dev"
echo ""
echo "  Web:     http://localhost:3000"
echo "  Indexer: http://localhost:3001"
echo "════════════════════════════════════════════════════════"
