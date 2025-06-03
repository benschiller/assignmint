# NFT Minting Plan (XDC Apothem)

This document outlines the simplified process for minting an ERC-721 NFT on the XDC Apothem testnet using Hardhat and OpenZeppelin contracts, suitable for a hackathon demo.

## Overview

We will:
1.  Set up a Hardhat project.
2.  Install necessary dependencies (`@openzeppelin/contracts`, `dotenv`).
3.  Create a basic ERC-721 smart contract.
4.  Configure Hardhat to connect to the XDC Apothem network.
5.  Write a script to deploy the smart contract.
6.  Prepare environment variables for sensitive information (private key, RPC URL).
7.  Deploy the contract to XDC Apothem.
8.  Write a script to mint an NFT using the deployed contract.
9.  Discuss simple NFT metadata and image hosting.

## Step-by-Step Guide

### 1. Hardhat Project Setup

Initialize a new Node.js project and install Hardhat. Run these commands in your project root directory:

```bash
npm init -y
npm install --save-dev hardhat
npx hardhat
```

When prompted by `npx hardhat`, choose "Create a JavaScript project". This will create `hardhat.config.js`, `contracts/`, `scripts/`, and `test/` folders in your root.

### 2. Install Dependencies

Install OpenZeppelin contracts (for standard ERC-721 implementation) and `dotenv` (to manage environment variables):

```bash
npm install @openzeppelin/contracts dotenv
```

### 3. Create NFT Smart Contract (`contracts/MyNFT.sol`)

Create a new file `contracts/MyNFT.sol` and add the following code. This defines a basic ERC-721 contract where the owner can mint new tokens.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("MyHackathonNFT", "MHT") // Name: MyHackathonNFT, Symbol: MHT
        Ownable(initialOwner)
    {}

    function mint(address to, string memory uri)
        public
        onlyOwner // Only the contract owner can mint
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++; // Increment token ID
        _safeMint(to, tokenId); // Safely mint the token to 'to' address
        _setTokenURI(tokenId, uri); // Set the metadata URI for the token
        return tokenId;
    }
}
```

### 4. Configure Hardhat for XDC Apothem (`hardhat.config.js`)

Modify your `hardhat.config.js` to include the XDC Apothem testnet configuration. This allows Hardhat to deploy and interact with the XDC network.

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables from .env

const XDC_APOTHEM_RPC_URL = process.env.XDC_APOTHEM_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Solidity compiler version
  networks: {
    xdcApothem: {
      url: XDC_APOTHEM_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 51, // XDC Apothem testnet chain ID
      gasPrice: 1000000000, // 1 Gwei, adjust if needed for network congestion
    },
  },
};
```

### 5. Create a Deployment Script (`scripts/deploy.js`)

Create a new file `scripts/deploy.js`. This script will deploy your `MyNFT` contract to the specified network.

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory for MyNFT
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  // Deploy the contract, passing the deployer's address as the initial owner
  const myNFT = await MyNFT.deploy(deployer.address);

  await myNFT.waitForDeployment(); // Wait for the contract to be deployed

  console.log("MyNFT deployed to:", myNFT.target); // Log the deployed contract address
}

// Execute the deployment function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 6. Prepare Environment Variables (`.env`)

Create a file named `.env` in the root of your Hardhat project (same level as `hardhat.config.js`). **This file should NEVER be committed to version control.**
