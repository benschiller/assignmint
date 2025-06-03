const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const AssignNFT = await hre.ethers.getContractFactory("assignNFT");
  const assignNFT = await AssignNFT.deploy(deployer.address);

  await assignNFT.waitForDeployment();

  console.log("assignNFT deployed to:", assignNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
