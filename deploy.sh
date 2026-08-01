#!/bin/bash
set -e

echo "🚀 Deploying Stellar Freelance Escrow dApp..."

# Build contracts
echo "📦 Building contracts..."
cd contracts
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
echo "🌐 Deploying to Stellar testnet..."

# Deploy shared types (if needed)
echo "Deploying shared contract..."
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/shared.wasm \
  --source admin \
  --network testnet

# Deploy reputation contract
echo "Deploying reputation contract..."
REPUTATION_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/reputation_contract.wasm \
  --source admin \
  --network testnet)

echo "Reputation contract deployed: $REPUTATION_ID"

# Deploy escrow contract
echo "Deploying escrow contract..."
ESCROW_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow_contract.wasm \
  --source admin \
  --network testnet)

echo "Escrow contract deployed: $ESCROW_ID"

# Initialize contracts
echo "🔧 Initializing contracts..."

# Get admin address
ADMIN_ADDRESS=$(stellar keys address admin)

# Initialize reputation contract
stellar contract invoke \
  --id $REPUTATION_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --escrow_contract $ESCROW_ID

# Initialize escrow contract
stellar contract invoke \
  --id $ESCROW_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --reputation_contract $REPUTATION_ID

# Save contract IDs
echo "💾 Saving contract IDs..."
cat > contract-ids.json << EOF
{
  "escrow": "$ESCROW_ID",
  "reputation": "$REPUTATION_ID",
  "network": "testnet",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ Deployment complete!"
echo "Escrow Contract: $ESCROW_ID"
echo "Reputation Contract: $REPUTATION_ID"
echo "Contract IDs saved to contract-ids.json"