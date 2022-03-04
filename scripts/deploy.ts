/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */

import { ethers } from "hardhat";
import { FACTORY_ADDRESS, FREEZE_TIME, MERC_ADDRESS, PAIR_ADDRESS, PERCENTAGE, WETH_ADDRESS } from "../hardhat.config";

const main = async () => {
  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy(FACTORY_ADDRESS, WETH_ADDRESS, MERC_ADDRESS, FREEZE_TIME, PERCENTAGE, PAIR_ADDRESS);

  await staker.deployed();

  console.log("Staker deployed to:", staker.address, "by", await staker.signer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
