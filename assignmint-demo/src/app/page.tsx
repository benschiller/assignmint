import React from "react";
import ReactMarkdown from "react-markdown";

const markdownContent = `
# AssignMint MVP: Decentralized Real Estate Escrow

This project showcases a Minimal Viable Product (MVP) for a decentralized wholesale real estate escrow system, leveraging an ERC-721 NFT as the property token and native XDC for payments. It features a Solidity smart contract for secure asset exchange and a Next.js frontend for user interaction.

## ✨ Core Functionality

*   **Buyer Transfers Funds with GOAT:** The buyer securely transfers funds from their vault to their wallet using GOAT, which utilizes AI-powered Natural Language Processing (NLP) for the transfer.
*   **Wholesaler Deposits NFT:** The wholesaler deposits their \`assignMint\` ERC-721 NFT into the escrow contract.
*   **Buyer Makes Payment:** The buyer pays the agreed \`assignmentPrice\` in XDC to the escrow contract.
*   **Automated Execution:** Upon successful deposit and payment, the smart contract automatically:
    *   Transfers the \`purchasePrice\` to the Seller.
    *   Transfers the wholesaler's profit (\`assignmentPrice - purchasePrice\`) to the Wholesaler.
    *   Transfers the \`assignMint\` NFT to the Buyer.

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
`;

export default function Home() {
  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 style={{ fontSize: "2.5em", marginBottom: "0.5em" }} {...props} />,
          h2: ({node, ...props}) => <h2 style={{ fontSize: "1.8em", marginTop: "1em", marginBottom: "0.5em" }} {...props} />,
          // You can add more components here like p, ul, li for finer control if needed
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}
