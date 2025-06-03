'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAssignNFTContract, getEscrowContract, getSigner } from '../../utils/ethers';
import { ethers } from 'ethers';

const WholesalerPage: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [nftApproved, setNftApproved] = useState<boolean>(false);
  const [nftDeposited, setNftDeposited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const fetchStatus = useCallback(async (signer: ethers.Signer) => {
    try {
      const currentAccount = await signer.getAddress();
      setAccount(currentAccount);

      const escrowContract = await getEscrowContract(signer);
      const assignNFTContract = await getAssignNFTContract(signer);

      if (escrowContract && assignNFTContract) {
        // Check NFT approval status
        const approvedAddress = await assignNFTContract.getApproved(0); // Assuming Token ID 0
        setNftApproved(approvedAddress === escrowContract.target);

        // Check NFT deposited status
        const deposited = await escrowContract.nftDeposited();
        setNftDeposited(deposited);

        setMessage('Status checked.');
      } else {
        setMessage('Could not connect to contracts.');
      }
    } catch (error: any) {
      console.error('Error fetching status:', error);
      setMessage(`Error fetching status: ${error.message}`);
      setAccount(null); // Clear account if status fetch fails
    }
  }, []);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Wallet disconnected
        setAccount(null);
        setNftApproved(false);
        setNftDeposited(false);
        setMessage('Wallet disconnected. Please connect your wallet.');
      } else {
        // Account changed or connected
        const signer = await getSigner(); // Get signer for the new account
        if (signer) {
          fetchStatus(signer);
        }
      }
    };

    // Listen for account changes (MetaMask)
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // Check initial connection status without requesting accounts
    if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts: string[]) => {
                if (accounts.length > 0) {
                    // Already connected, fetch status
                    getSigner().then(signer => {
                        if (signer) {
                            fetchStatus(signer);
                        }
                    });
                } else {
                    setAccount(null);
                    setNftApproved(false);
                    setNftDeposited(false);
                    setMessage('Please connect your wallet.');
                }
            })
            .catch((err: any) => {
                console.error('Error checking initial accounts:', err);
                setMessage(`Error checking initial accounts: ${err.message}`);
                setAccount(null);
            });
    } else {
        setMessage('MetaMask not found.');
    }


    return () => {
      // Clean up event listener
      if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [fetchStatus]); // Add fetchStatus to dependency array

  const connectWallet = async () => {
    setLoading(true);
    setMessage('Connecting wallet...');
    try {
      const signer = await getSigner(); // This requests accounts
      if (signer) {
        fetchStatus(signer); // Fetch status after successful connection
        setMessage('Wallet connected.');
      } else {
        setMessage('MetaMask not found or connection failed.');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setMessage(`Error connecting wallet: ${error.message}`);
      setAccount(null); // Clear account on connection failure
    } finally {
      setLoading(false);
    }
  };

  const approveNFT = async () => {
    setLoading(true);
    setMessage('Approving NFT...');
    try {
      const signer = await getSigner(); // Get signer for the transaction
      if (signer) {
        const assignNFTContract = await getAssignNFTContract(signer);
        const escrowContract = await getEscrowContract(signer);
        if (assignNFTContract && escrowContract) {
          const tx = await assignNFTContract.approve(escrowContract.target, 0); // Assuming Token ID 0
          await tx.wait();
          setNftApproved(true);
          setMessage('NFT approved successfully.');
        } else {
           setMessage('Could not connect to NFT or Escrow contract.');
        }
      } else {
        setMessage('Wallet not connected.');
      }
    } catch (error: any) {
      console.error('Error approving NFT:', error);
      setMessage(`Error approving NFT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const depositNFT = async () => {
    setLoading(true);
    setMessage('Depositing NFT...');
    try {
      const signer = await getSigner(); // Get signer for the transaction
      if (signer) {
        const escrowContract = await getEscrowContract(signer);
         if (escrowContract) {
            const tx = await escrowContract.depositNFT();
            await tx.wait();
            setNftDeposited(true);
            setMessage('NFT deposited successfully.');
         } else {
            setMessage('Could not connect to Escrow contract.');
         }
      } else {
        setMessage('Wallet not connected.');
      }
    } catch (error: any) {
      console.error('Error depositing NFT:', error);
      setMessage(`Error depositing NFT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Wholesaler Page</h1>
      {!account ? (
        <button onClick={connectWallet} disabled={loading}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            border: 'none',
            fontSize: '16px',
            margin: '5px'
          }}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <p>NFT Approved: {nftApproved ? 'Yes' : 'No'}</p>
          <p>NFT Deposited: {nftDeposited ? 'Yes' : 'No'}</p>

          {!nftApproved && (
            <button onClick={approveNFT} disabled={loading || nftApproved}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                border: 'none',
                fontSize: '16px',
                margin: '5px'
              }}
            >
              {loading ? 'Approving...' : 'Approve NFT'}
            </button>
          )}

          {nftApproved && !nftDeposited && (
            <button onClick={depositNFT} disabled={loading || nftDeposited}
              style={{
                backgroundColor: '#008CBA',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                border: 'none',
                fontSize: '16px',
                margin: '5px'
              }}
            >
              {loading ? 'Depositing...' : 'Deposit NFT'}
            </button>
          )}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default WholesalerPage;
