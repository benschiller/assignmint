import hre from "hardhat";

async function main() {
    // The first signer is the deployer (wholesaler)
    const [wholesaler] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account (wholesaler):", wholesaler.address);

    const Escrow = await hre.ethers.getContractFactory("Escrow", wholesaler);

    // Hardcoded values for testing
    const sellerAddress = "0x35d4B604D461A41d5e72981B2915e7c930664275";
    const buyerAddress = "0xE1f36Bfaa571A6235369a9918CfDE2bF87cfF9c2";
    const nftContractAddress = "0x9Ea53fb0e3fBe9C690cE3Fd7Ae751407509B4921";
    const tokenId = "0";
    const purchasePrice = hre.ethers.parseEther("78.000");
    const assignmentPrice = hre.ethers.parseEther("85.800");

    const escrow = await Escrow.deploy(
        sellerAddress,
        buyerAddress,
        nftContractAddress,
        tokenId,
        purchasePrice,
        assignmentPrice
    );

    await escrow.waitForDeployment();

    console.log("Escrow contract deployed to:", escrow.target);
    console.log("Constructor arguments:");
    console.log(`  Seller: ${sellerAddress}`);
    console.log(`  Buyer: ${buyerAddress}`);
    console.log(`  NFT Contract: ${nftContractAddress}`);
    console.log(`  Token ID: ${tokenId}`);
    console.log(`  Purchase Price: ${hre.ethers.formatEther(purchasePrice)} XDC`);
    console.log(`  Assignment Price: ${hre.ethers.formatEther(assignmentPrice)} XDC`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
