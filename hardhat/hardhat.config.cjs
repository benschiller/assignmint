require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

const config = {
  solidity: "0.8.28",
  networks: {
    xdcApothem: {
      url: process.env.RPC_PROVIDER_URL || "",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 51,
      gasPrice: 12500000000,
    },
  },
};

module.exports = config;
