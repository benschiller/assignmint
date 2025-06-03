
# Next.js MVP Demo for Existing Deployed Contracts

## 1. Deployed Contract Details

- **Escrow Contract Address:**  
  `0xE6ce262E7146FF88ea0Ad070BBeA9fbA2b32603E`
- **NFT Contract Address:**  
  `0x9Ea53fb0e3fBe9C690cE3Fd7Ae751407509B4921`  
  (This is the `assignNFT.sol` instance used in `deployEscrow.js`)
- **Token ID:**  
  `0` (as hardcoded in your `deployEscrow.js` output)
- **Purchase Price:**  
  `78.0 XDC`
- **Assignment Price:**  
  `85.8 XDC`

---

## 2. Chosen Technologies

- **Frontend Framework:** Next.js
- **Styling:** Plain CSS Modules (Next.js default)
- **Web3 Library:** Ethers.js (version 6)
- **Wallet Interaction:** MetaMask browser extension

---

## 3. Essential Data for Frontend

- **Contract Addresses:**
  - `ESCROW_CONTRACT_ADDRESS = "0xE6ce262E7146FF88ea0Ad070BBeA9fbA2b32603E"`
  - `ASSIGNMINT_NFT_CONTRACT_ADDRESS = "0x9Ea53fb0e3fBe9C690cE3Fd7Ae751407509B4921"`
- **Contract ABIs:**  
  You will need the ABIs for both `Escrow.sol` and `assignNFT.sol`.  
  These ABI JSON files are in your Hardhat project's `hardhat/artifacts/contracts/` directory:
  - `hardhat/artifacts/contracts/Escrow.sol/Escrow.json`
  - `hardhat/artifacts/contracts/assignNFT.sol/assignNFT.json`
- **Action:**  
  Copy these two `.json` files into your Next.js project (e.g., into a `utils/` or `constants/` directory).

---

## 4. Implementation Plan

### A. Global Ethers.js Setup

- Create a file to handle connecting to MetaMask and instantiating your contract objects using the deployed addresses and copied ABIs.

### B. Wholesaler Page

- This page will handle the **"Approve NFT"** and **"Deposit NFT"** actions.

### C. Buyer Page

- This page will handle the **"Make Payment"** actions.
