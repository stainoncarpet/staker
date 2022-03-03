/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ETHERSCAN_API_KEY: string;
      ALCHEMY_KEY: string;
      METAMASK_PRIVATE_KEY: string;
      COINMARKETCAP_API_KEY: string;
      RINKEBY_URL: string;
    }
  }
}

const NETWORK = "rinkeby";

task("get", "Mint MyERC20Token be sending ETH")
  .addParam("address", "Contract address")
  .addParam("eth", "Amount of ETH to swap for MyERC20Token")
  .setAction(async (taskArguments, hre) => {
    const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
    const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);

    const donationTransaction = await walletOwner.sendTransaction({ to: taskArguments.address, value: taskArguments.eth });

    console.log("Receipt: ", donationTransaction);
  })
;

task("destroy", "Destroy contract")
  .addParam("address", "Contract address")
  .setAction(async (taskArguments, hre) => {
      const contractSchema = require("./artifacts/contracts/Staker.sol/Staker.json");

      const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
      const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
      const contractInstance = new hre.ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

      const approveTx = await contractInstance.destroyContract();
      
      console.log("Receipt: ", approveTx);
  })
;



const config: HardhatUserConfig = {
  solidity: "0.8.11",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
    },
    hardhat: {
      forking: {
        url: process.env.RINKEBY_URL,
        blockNumber: 10264465
      }
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
