/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import { task } from "hardhat/config";

const NETWORK = "rinkeby";

export const runTasks = async () => {
    task("stake", "Stake Uniswap Liquidity Provider Token for MyERC20Token")
        .addParam("staker", "Staker contract address")
        .addParam("pair", "Pair contract address")
        .addParam("amount", "Amount of Uniswap Liquidity Token to stake")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Staker.sol/Staker.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const stakerContractInstance = new hre.ethers.Contract(taskArguments.staker, contractSchema.abi, walletOwner);

            const stakeTx = await stakerContractInstance.stake(taskArguments.amount);

            console.log("Receipt: ", stakeTx);
        })
    ;

    task("unstake", "Withdraw Uniswap Liquidity Provider Token from Staker")
        .addParam("staker", "Staker contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Staker.sol/Staker.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const stakerContractInstance = new hre.ethers.Contract(taskArguments.staker, contractSchema.abi, walletOwner);

            const unstakeTx = await stakerContractInstance.unstake();

            console.log("Receipt: ", unstakeTx);
        })
    ;

    task("claim", "Mint MyERC20Token be sending ETH")
        .addParam("staker", "Staker contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Staker.sol/Staker.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const stakerContractInstance = new hre.ethers.Contract(taskArguments.staker, contractSchema.abi, walletOwner);

            const claimTx = await stakerContractInstance.claim();

            console.log("Receipt: ", claimTx);
        })
    ;

    task("destroy", "Destroy contract")
        .addParam("address", "Contract address")
        .setAction(async (taskArguments, hre) => {
            const contractSchema = require("../artifacts/contracts/Staker.sol/Staker.json");

            const alchemyProvider = new hre.ethers.providers.AlchemyProvider(NETWORK, process.env.ALCHEMY_KEY);
            const walletOwner = new hre.ethers.Wallet(process.env.METAMASK_PRIVATE_KEY, alchemyProvider);
            const contractInstance = new hre.ethers.Contract(taskArguments.address, contractSchema.abi, walletOwner);

            const tx = await contractInstance.destroyContract();

            console.log("Receipt: ", tx);
        })
    ;
};