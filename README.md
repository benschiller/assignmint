# AssignMint MVP: Decentralized Real Estate Escrow

This project showcases a Minimal Viable Product (MVP) for a decentralized wholesale real estate escrow system, leveraging an ERC-721 NFT as the property token and native XDC for payments. It features a Solidity smart contract for secure asset exchange and a Next.js frontend for user interaction.

[Watch the Full Walkthrough](https://www.youtube.com/watch?v=bRWp-E8s7x8)

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

## 🔗 Onchain Links

*  **GOAT Transfer:** https://testnet.xdcscan.com/tx/0x0091139615bd71536f2edb5212152fdb00f3708e8b99ad379d73ed4e9b1feda8
*  **Escrow Execution:** https://testnet.xdcscan.com/tx/0x584a900a0c859f7f351c1790aadcb584320ef2c1fd54a01314f07815ce3679f5
*  **AssignMint NFT Token Tracker:** https://testnet.xdcscan.com/token/0x9Ea53fb0e3fBe9C690cE3Fd7Ae751407509B4921
*  **Wholesaler Wallet:** https://testnet.xdcscan.com/address/0x160B2312eafEFbc31Dc258dE867D6a7383Efd39e
*  **Seller Wallet:** https://testnet.xdcscan.com/address/0x35d4B604D461A41d5e72981B2915e7c930664275
*  **Buyer Wallet:** https://testnet.xdcscan.com/address/0xE1f36Bfaa571A6235369a9918CfDE2bF87cfF9c2
