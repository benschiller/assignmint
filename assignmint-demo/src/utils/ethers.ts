import { ethers } from 'ethers';
import EscrowABI from './Escrow.json';
import AssignNFTABI from './assignNFT.json';

// Deployed Contract Addresses (from docs/nextjs-app-plan.md)
export const ESCROW_CONTRACT_ADDRESS = "0xE6ce262E7146FF88ea0Ad070BBeA9fbA2b32603E";
export const ASSIGNMINT_NFT_CONTRACT_ADDRESS = "0x9Ea53fb0e3fBe9C690cE3Fd7Ae751407509B4921";

// Contract ABIs
export const EscrowContractABI = EscrowABI.abi;
export const AssignNFTContractABI = AssignNFTABI.abi;

// Helper function to get the provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

// Helper function to get the signer
export const getSigner = async () => {
  const provider = getProvider();
  if (provider) {
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  }
  return null;
};

// Helper function to get the Escrow contract instance
export const getEscrowContract = async (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  const provider = getProvider();
  if (!provider) return null;

  const currentSignerOrProvider = signerOrProvider || await getSigner();
  if (!currentSignerOrProvider) return null;

  return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, EscrowContractABI, currentSignerOrProvider);
};

// Helper function to get the AssignNFT contract instance
export const getAssignNFTContract = async (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  const provider = getProvider();
  if (!provider) return null;

  const currentSignerOrProvider = signerOrProvider || await getSigner();
  if (!currentSignerOrProvider) return null;

  return new ethers.Contract(ASSIGNMINT_NFT_CONTRACT_ADDRESS, AssignNFTContractABI, currentSignerOrProvider);
};
