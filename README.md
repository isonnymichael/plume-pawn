# Pinjam

**Pinjam** is a decentralized pawnshop application (DApp) built on top of the [Plume Network](https://plumenetwork.xyz). It enables users to pawn tokenized real-world assets (RWAs) using NFTs issued and managed by Plume’s asset tokenization system.

This project leverages Plume infrastructure and a custom smart contract to manage the full pawn lifecycle — including asset locking, loan funding, redemption, and liquidation.

---

## 💡 Features

- Pawn NFTs backed by real-world assets
- Redeem pawned assets before due date
- Liquidate expired pawns
- Provide liquidity and earn APY on locked assets

---

## 🏗️ Tech Stack

| Layer         | Technology                   |
|---------------|------------------------------|
| Frontend      | React + Vite                 |
| Wallet / Web3 | Thirdweb SDK + Ethers.js     |
| Smart Contract| Solidity                     |
| Backend       | Node.js + Express            |
| Network       | Plume Network                |

---

## 📦 Project Structure

```bash
pinjam/
├── contracts/             # Smart contract for pawn logic
├── frontend/              # React frontend app (DApp)
├── backend/               # Node.js backend API
└── README.md              # This file
