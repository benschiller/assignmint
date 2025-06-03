'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getEscrowContract, getSigner, ESCROW_CONTRACT_ADDRESS } from '../../utils/ethers';
import { ethers } from 'ethers';
import propertyData from '../../../../hardhat/nfts/33404778.json'; // Import the NFT data

// Assignment Price from hardhat/nfts/33404778.json
const ASSIGNMENT_PRICE_XDC = propertyData.assignmentPrice;
const ASSIGNMENT_PRICE_WEI = ethers.parseEther(ASSIGNMENT_PRICE_XDC.toString());

const BuyerPage: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [paymentMade, setPaymentMade] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [propertyDetails, setPropertyDetails] = useState<any>(null); // State to store property data

  const fetchStatus = useCallback(async (signer: ethers.Signer) => {
    try {
      const currentAccount = await signer.getAddress();
      setAccount(currentAccount);

      // For the buyer page MVP, we don't have a specific status to fetch from the contract
      // on load, other than confirming the wallet is connected.
      // A more complete implementation might check if this account has already made a payment.
      setMessage('Wallet connected. Ready to make payment.');

    } catch (error: any) {
      console.error('Error fetching status:', error);
      setMessage(`Error fetching status: ${error.message}`);
      setAccount(null); // Clear account if status fetch fails
    }
  }, []);


  useEffect(() => {
    // Set property details from the imported JSON
    setPropertyDetails(propertyData);

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Wallet disconnected
        setAccount(null);
        setPaymentMade(false);
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
                    setPaymentMade(false);
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
        setMessage('Wallet connected. Ready to make payment.');
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

  const makePayment = async () => {
    setLoading(true);
    setMessage(`Making payment of ${ASSIGNMENT_PRICE_XDC} XDC...`);
    try {
      const signer = await getSigner(); // Get signer for the transaction
      if (signer) {
        const escrowContract = await getEscrowContract(signer);
         if (escrowContract) {
            const tx = await escrowContract.makePayment({ value: ASSIGNMENT_PRICE_WEI });
            await tx.wait();
            setPaymentMade(true);
            setMessage('Payment made successfully.');
         } else {
            setMessage('Could not connect to Escrow contract.');
         }
      } else {
        setMessage('Wallet not connected.');
      }
    } catch (error: any) {
      console.error('Error making payment:', error);
      setMessage(`Error making payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Buyer Page</h1>

      {propertyDetails && (
        <div style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Property Details</h2>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {propertyDetails.responsivePhotos && propertyDetails.responsivePhotos.length > 0 && (
              <div style={{ flexShrink: 0 }}>
                <img
                  src={propertyDetails.responsivePhotos[0].mixedSources.jpeg[0].url}
                  alt="Property"
                  style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                />
              </div>
            )}
            <div>
              <p><strong>Address:</strong> {propertyDetails.address.streetAddress}, {propertyDetails.address.city}, {propertyDetails.address.state} {propertyDetails.address.zipcode}</p>
              <p><strong>Bedrooms:</strong> {propertyDetails.bedrooms}</p>
              <p><strong>Bathrooms:</strong> {propertyDetails.bathrooms}</p>
              <p><strong>Description:</strong> {propertyDetails.description}</p>
              <p><strong>Assignment Price:</strong> {propertyDetails.assignmentPrice} XDC</p>
            </div>
          </div>
        </div>
      )}

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
          {paymentMade ? (
            <p>Payment Status: Payment Made</p>
          ) : (
            <button onClick={makePayment} disabled={loading || paymentMade}
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
              {loading ? 'Processing Payment...' : `Make Payment (${ASSIGNMENT_PRICE_XDC} XDC)`}
            </button>
          )}
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default BuyerPage;
