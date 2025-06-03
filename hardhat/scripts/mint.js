import hre from "hardhat";

async function main() {
  // Get the signer (the wallet that will send the transaction)
  const [minter] = await hre.ethers.getSigners();
  
  // Replace with the address of your deployed assignNFT contract
  const contractAddress = "0x9Ea53fb0e3fBe9C690cE3Fd7Ae751407509B4921";
  
  // Get a contract instance using its ABI and address
  const assignNFT = await hre.ethers.getContractAt("assignNFT", contractAddress);

  // The address you want to mint the NFT to (e.g., the minter's address)
  const recipientAddress = minter.address; 
  
  // The URL pointing to your NFT's metadata JSON file
  const tokenURI = "https://gateway.lighthouse.storage/ipfs/bafkreih7l6retqmup4dd4dhjw7guhxgs7munqdgolc72z7jiwealovjwjy"; 

  console.log(`Attempting to mint NFT for ${recipientAddress} with URI: ${tokenURI}`);
  
  // Call the mint function on your deployed contract
  const tx = await assignNFT.mint(recipientAddress, tokenURI);
  
  // Wait for the transaction to be mined and confirmed on the blockchain
  await tx.wait(); 
  
  console.log("NFT minted successfully! Transaction hash:", tx.hash);
  console.log("Check your wallet and a blockchain explorer using the contract address and transaction hash.");
}

// Handle errors during execution
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});