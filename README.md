# Stellar Freelance Escrow & Reputation dApp

A decentralized freelancing platform built on Stellar blockchain where clients lock project funds in Soroban escrow contracts, freelancers submit work, clients approve it, payment auto-releases on-chain, and both parties' on-chain reputation updates automatically as a direct result of that release — verifiable, not just claimed.

## 🎯 One-line Pitch

A decentralized freelancing platform where a client locks project funds in a Soroban escrow contract, a freelancer submits work, the client approves it, payment auto-releases on-chain, and both parties' on-chain reputation updates automatically as a direct result of that release — verifiable, not just claimed.

## 🏗️ Architecture

This is a hybrid architecture with three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                       React Frontend                             │
│  pages/  ProjectList · ProjectDetail · CreateProject · Verifier │
│  components/  WalletButton · StatusBadge · ReputationGauge      │
│  context/  WalletContext (Freighter state)                     │
│  services/  walletService.ts · stellarService.ts · apiService.ts│
└───────────┬─────────────────────────────────┬───────────────────┘
            │ trust-critical writes           │ reads / cache
            │ (build→sim→sign→submit)         │ (fast, no RPC round trip)
            ▼                                 ▼
┌─────────────────────────────┐    ┌─────────────────────────────────┐
│   Soroban RPC (testnet)      │    │   Backend (Express + MongoDB)    │
│                             │    │   routes/  projects · reputation │
│  Escrow Contract (Rust)     │    │   services/ eventIndexer.js      │
│   - create_project          │    │             (polls getEvents,    │
│   - accept_project          │───▶│              writes to Mongo)    │
│   - submit_work             │    │   models/  ProjectCache, RepCache │
│   - approve_and_release ──┐ │    │   NO admin key that can move     │
│   - refund                │ │    │   funds or write reputation      │
│                           │ │    └─────────────────────────────────┘
│  Reputation Contract      │ │
│   - record_completion ◀───┘ │   (cross-contract call, same tx,
│   - get_score(address)     │    triggered by client's own signed
└───────────────────────────┘    approve_and_release call)
```

### Key Architectural Decision

**We moved the trust-critical write off the backend and onto the contract itself, because our source-of-truth event is on-chain rather than external.**

The backend never holds an admin key that can move escrow funds or trigger reputation updates. Reputation updates happen via cross-contract calls from the escrow contract's `approve_and_release` function, restricted to being called only by the escrow contract itself.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Rust and Cargo
- Stellar CLI (`stellar`)
- Freighter Wallet extension
- MongoDB (local or cloud)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/Sharayu-github/FreelanceStellarRoad.RiseIn.git
   cd FreelanceStellarRoad.RiseIn
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install workspace dependencies:**
   ```bash
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

4. **Start development servers:**
   ```bash
   # Start backend (Terminal 1)
   cd backend && npm run dev
   
   # Start frontend (Terminal 2) 
   cd frontend && npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:8000`.

## 📁 Project Structure

```
/
├── contracts/           # Soroban smart contracts (Rust)
│   ├── escrow/         # Main escrow contract
│   ├── reputation/     # Reputation management contract
│   └── shared/         # Shared types and utilities
├── backend/            # Node.js/Express API server
│   ├── src/
│   │   ├── models/     # MongoDB models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── index.ts    # Main server file
│   └── package.json
├── frontend/           # React/TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── services/   # API and blockchain services
│   │   ├── context/    # React context providers
│   │   └── App.tsx     # Main app component
│   └── package.json
├── deploy.sh           # Contract deployment script
└── README.md
```

## 🔗 Key Features

### For Clients
- **Create Projects**: Post project details with escrow deposit
- **Review Work**: Approve or request changes to submissions
- **Automatic Payment**: Funds release automatically on approval
- **Reputation Tracking**: Build verifiable on-chain reputation

### For Freelancers
- **Browse Projects**: Find available projects with locked funds
- **Submit Work**: Provide deliverables for client review
- **Guaranteed Payment**: Get paid immediately on approval
- **Build Reputation**: Earn verifiable completion records

### For Everyone
- **Reputation Lookup**: View anyone's verifiable work history
- **Transparent Escrow**: All funds and releases are on-chain
- **No Platform Risk**: No admin keys can move user funds

## 🔒 Security Model

1. **Escrow Security**: Funds are locked in smart contracts, not controlled by any admin
2. **Reputation Integrity**: Updates only happen through successful project completion
3. **Cross-Contract Calls**: Reputation updates are atomic with fund releases
4. **Access Control**: Reputation contract only accepts calls from escrow contract
5. **No Admin Keys**: Backend cannot move funds or write reputation data

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **@stellar/stellar-sdk** for blockchain interaction
- **@stellar/freighter-api** for wallet integration
- **React Router** for navigation
- **Lucide React** for icons

### Backend  
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **@stellar/stellar-sdk** for contract events
- **CORS** and security middleware

### Smart Contracts
- **Rust** with Soroban SDK
- **Cargo workspace** for organization
- **Cross-contract calls** for atomic operations
- **Event emission** for frontend sync

## 🧪 Testing

```bash
# Run all tests
npm test

# Test contracts only
cd contracts && cargo test

# Test backend only
cd backend && npm test

# Test frontend only
cd frontend && npm test
```

## 📦 Deployment

### Deploy Smart Contracts

1. **Build contracts:**
   ```bash
   cd contracts
   cargo build --target wasm32-unknown-unknown --release
   ```

2. **Deploy to testnet:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Update contract IDs:**
   ```bash
   # Copy contract IDs from deploy output to .env files
   ```

### Deploy Frontend & Backend

```bash
# Build frontend
cd frontend && npm run build

# Start backend in production
cd backend && npm run build && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Stellar Development Foundation for Soroban
- Stellar community for best practices and examples
- React and Node.js communities for excellent tooling

## 📚 Documentation

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)

## ⚡ Live Demo

Visit the deployed application: [Coming Soon]

## 🐛 Known Issues

- Some npm audit warnings (development dependencies only)
- Contract deployment requires Stellar CLI setup
- MongoDB connection required for backend

## 🗺️ Roadmap

- [ ] Deploy to Stellar mainnet
- [ ] Add multi-freelancer bidding
- [ ] Implement dispute resolution
- [ ] Add fiat on/off ramp integration
- [ ] Mobile app development
- [ ] Advanced reputation metrics

---

**Built with ❤️ on Stellar blockchain**