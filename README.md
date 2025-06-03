# AssignMint MVP: Decentralized Real Estate Escrow

This project showcases a Minimal Viable Product (MVP) for a decentralized wholesale real estate escrow system, leveraging an ERC-721 NFT as the property token and native XDC for payments. It features a Solidity smart contract for secure asset exchange and a Next.js frontend for user interaction.

## ✨ Core Functionality

*   **Buyer Transfers Funds with GOAT:** The buyer securely transfers funds from their vault to their wallet using GOAT, which utilizes AI-powered Natural Language Processing (NLP) for the transfer.
*   **Wholesaler Deposits NFT:** The wholesaler deposits their `assignMint` ERC-721 NFT into the escrow contract.
*   **Buyer Makes Payment:** The buyer pays the agreed `assignmentPrice` in XDC to the escrow contract.
*   **Automated Execution:** Upon successful deposit and payment, the smart contract automatically:
    *   Transfers the `purchasePrice` to the Seller.
    *   Transfers the wholesaler's profit (`assignmentPrice - purchasePrice`) to the Wholesaler.
    *   Transfers the `assignMint` NFT to the Buyer.

## 🚀 Technologies Used

*   **Blockchain:** XDC Apothem Network
*   **Agent Wallet:** GOAT (AI-powered NLP)
*   **Framework:** Vercel AI
*   **Smart Contracts:** Solidity, Hardhat
*   **NFT Standard:** ERC-721 (AssignMint NFT)
*   **Frontend:** Next.js
*   **Web3 Interaction:** Ethers.js (v6)
*   **Browser Extension:** MetaMask
*   **AI Integration:** OpenAI SDKs
