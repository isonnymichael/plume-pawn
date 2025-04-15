# Plume Pawn

**Plume Pawn** is a decentralized pawnshop application (DApp) built on top of the [Plume Network](https://plumenetwork.xyz). It enables users to pawn tokenized real-world assets (RWAs) using NFTs that are already issued and managed by Plume’s asset tokenization system.

This project utilizes the Plume infrastructure for asset tokenization and implements a custom smart contract to manage the pawn lifecycle — including asset locking, redemption, and liquidation.

---

## 🔗 Live Network

> The app is designed for deployment on the **Plume blockchain**. Please ensure wallet compatibility and access to the correct network when testing or deploying.

---

## 💡 Features

- Pawn an NFT in exchange for a loan (secured in smart contract)
- Redeem pawned assets before expiration
- Liquidate unredeemed assets past due date

---

## 🏗️ Tech Stack

| Layer         | Technology                   |
|---------------|------------------------------|
| Frontend      | Vue 3 + Vite                 |
| Wallet / Web3 | Thirdweb SDK + Ethers.js     |
| Smart Contract| Solidity                     |
| Backend       | Node.js + Express            |
| Database      | MySQL                        |
| Network       | Plume Network                |

---

## 📦 Project Structure

```bash
plume-pawn/
├── contracts/             # Smart contract for pawn logic
├── frontend/              # Vue 3 frontend app (DApp)
├── backend/               # Node.js backend API
├── database/              # Schema or migration scripts (MySQL)
├── scripts/               # Contract deployment / management scripts
└── README.md              # This file
