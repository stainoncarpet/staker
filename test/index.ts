/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
/* eslint-disable prettier/prettier */

import { expect } from "chai";
import { ethers, network } from "hardhat";
import { FACTORY_ADDRESS, FREEZE_TIME, MERC_ADDRESS, MyERC20TokenAbi, PairAbi, PAIR_ADDRESS, PERCENTAGE, WETH_ADDRESS } from "../hardhat.config";

describe("Staker", function () {
  let Staker, staker: any, signers: any[], myERC20Token: any, pairContract: any, signer: any, timeUnit: number, stakingTime: number;

  beforeEach(async () => {
    Staker = await ethers.getContractFactory("Staker");
    staker = await Staker.deploy(FACTORY_ADDRESS, WETH_ADDRESS, MERC_ADDRESS, FREEZE_TIME, PERCENTAGE, PAIR_ADDRESS);

    await staker.deployed();

    signers = await ethers.getSigners();
    signer = await ethers.getSigner(process.env.METAMASK_PUBLIC_KEY);

    myERC20Token = await ethers.getContractAt(MyERC20TokenAbi, MERC_ADDRESS);
    pairContract = await ethers.getContractAt(PairAbi, PAIR_ADDRESS);

    timeUnit = await staker.TIME_MULTIPLIER_UNIT();

    await network.provider.request({ method: "hardhat_impersonateAccount", params: [process.env.METAMASK_PUBLIC_KEY]});

    await myERC20Token.connect(signer).transfer(staker.address, 500000000)
  });

  afterEach(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [{
          forking: {
            jsonRpcUrl: process.env.RINKEBY_URL,
            blockNumber: 10264465,
          }
      }]
    });
  });

  it("Should initialize correctly", async () => {
    expect(await staker.admin()).to.equal(signers[0].address);
    expect((await (await staker.factoryAddress()).toLowerCase())).to.equal(FACTORY_ADDRESS.toLowerCase());
    expect((await staker.tokenAAddress()).toLowerCase()).to.equal(WETH_ADDRESS.toLowerCase());
    expect((await staker.tokenBAddress()).toLowerCase()).to.equal(MERC_ADDRESS.toLowerCase());
    expect(await staker.freezeTime()).to.equal(FREEZE_TIME);
    expect(await staker.percentage()).to.equal(PERCENTAGE);
    expect(((await staker.pairAddress()).toLowerCase())).to.equal(PAIR_ADDRESS.toLowerCase());
  });

  it("Should get destroyed correctly", async () => {
    expect(await staker.admin()).to.equal(signers[0].address);
    await expect(staker.connect(signers[1]).destroyContract()).to.be.revertedWith("Unauthorized");
    await staker.destroyContract();
    await expect(staker.admin()).to.be.reverted;
  });

  it("Should stake correctly", async () => {
    // try to stake without allowance
    await expect(staker.connect(signer).stake(10**11)).to.be.revertedWith("Insufficient allowance");

    // give pool token allowance to Staker
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)
    expect(await pairContract.allowance(signer.address, staker.address)).to.be.equal(allowableLiquidityTokenAmount);

    // try to stake incorrect amounts
    await expect(staker.connect(signer).stake(0)).to.be.revertedWith("Amount must be non-zero");
    await expect(staker.connect(signer).stake(allowableLiquidityTokenAmount + 100)).to.be.revertedWith("Insufficient balance");

    // stake all liquidity and check if Staker correctly added new Stake
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);
    const stake0 = await staker.connect(signer).stakesByAddress(signer.address, 0);
    expect(stake0.amount).to.be.equal(allowableLiquidityTokenAmount);
  });

  it("Should claim correctly", async () => {
    // give pool token allowance to Staker for
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)
    expect(await pairContract.allowance(signer.address, staker.address)).to.be.equal(allowableLiquidityTokenAmount);

    // stake and check if Staker correctly added new Stake
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);

    // fast forward 5 minutes and try to claim reward
    await network.provider.request({ method: "evm_increaseTime", params: [300] });
    await network.provider.request({ method: "evm_mine", params: [] });
    const mercBalanceBeforeClaim0 = await myERC20Token.balanceOf(signer.address);
    await staker.connect(signer).claim();
    const mercBalanceAfterClaim0 = await myERC20Token.balanceOf(signer.address);
    // no reward for staking for less than 10 minutes
    expect(mercBalanceAfterClaim0.sub(mercBalanceBeforeClaim0)).to.be.equal(0);

    // fast forward 10 minutes and try to claim reward
    await network.provider.request({ method: "evm_increaseTime", params: [timeUnit] });
    await network.provider.request({ method: "evm_mine", params: [] });
    const mercBalanceBeforeClaim = await myERC20Token.balanceOf(signer.address);
    await staker.connect(signer).claim();
    const mercBalanceAfterClaim = await myERC20Token.balanceOf(signer.address);
    // 19 mercwei for staking 1999999999000 lpwei for 10 minutes at default 1%
    expect(mercBalanceAfterClaim.sub(mercBalanceBeforeClaim)).to.be.equal(19);

    // fast forward 10 minutes and try to claim reward once again
    await network.provider.request({ method: "evm_increaseTime", params: [timeUnit] });
    await network.provider.request({ method: "evm_mine", params: [] });
    const mercBalanceBeforeClaim2 = await myERC20Token.balanceOf(signer.address);
    await staker.connect(signer).claim();
    const mercBalanceAfterClaim2 = await myERC20Token.balanceOf(signer.address);
    // stake timestamp should have been updated -- for another 10 minutes there should be another 19 mercwei, not 38
    expect(mercBalanceAfterClaim2.sub(mercBalanceBeforeClaim2)).to.be.equal(19);
  });

  it("Should adjust freeze time and percentage correctly", async () => {
    // try incorrect conditions
    await expect(staker.connect(signers[1]).adjust(1600, 2)).to.be.revertedWith("Unauthorized");
    await expect(staker.adjust(1800, 22)).to.be.revertedWith("Only values between 1 and 10 are allowed");

    await staker.adjust(1800, 2)

    // state should be changed correctly
    expect(await staker.freezeTime()).to.be.equal(1800);
    expect(await staker.percentage()).to.be.equal(2);

    // give pool token allowance to Staker
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)

    // stake all liquidity
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);

    // for the same amount of liquidity token, reward should be two times higher than before, 19x2=38
    await network.provider.request({ method: "evm_increaseTime", params: [timeUnit] });
    await network.provider.request({ method: "evm_mine", params: [] });
    const mercBalanceBeforeClaim = await myERC20Token.balanceOf(signer.address);
    await staker.connect(signer).claim();
    const mercBalanceAfterClaim = await myERC20Token.balanceOf(signer.address);
    expect(mercBalanceAfterClaim.sub(mercBalanceBeforeClaim)).to.be.equal(38);
  });

  it("Should unstake correctly", async () => {
    // give pool token allowance to Staker for
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)

    // stake and check if Staker correctly added new Stake
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);
    const stake0 = await staker.connect(signer).stakesByAddress(signer.address, 0);
    expect(stake0.amount).to.be.equal(allowableLiquidityTokenAmount);

    // unstake before freeze timeperiod expires, sooner than default 600 seconds expires
    stakingTime = timeUnit - 100;
    await network.provider.request({ method: "evm_increaseTime", params: [stakingTime] });
    await network.provider.request({ method: "evm_mine", params: [] });

    // liquidity tokens should belong to Staker, EOA shouldn't have any
    const eoaLiquidityPoolBalance = await pairContract.balanceOf(signer.address);
    expect(eoaLiquidityPoolBalance).to.be.equal(0);
    const stakerContractLiquidityPoolBalance = await pairContract.balanceOf(staker.address);
    expect(stakerContractLiquidityPoolBalance).to.be.equal(allowableLiquidityTokenAmount);

    await staker.connect(signer).unstake();

    // unstaking in this case shouldn't have caused any changes since freeze time period hasn't expired yet
    const eoaLiquidityPoolBalance2 = await pairContract.balanceOf(signer.address);
    expect(eoaLiquidityPoolBalance2).to.be.equal(0);
    const stakerContractLiquidityPoolBalance2 = await pairContract.balanceOf(staker.address);
    expect(stakerContractLiquidityPoolBalance2).to.be.equal(allowableLiquidityTokenAmount);

    // unstake after freeze time period expires and reward becomes availle
    stakingTime = timeUnit + 100
    await network.provider.request({ method: "evm_increaseTime", params: [stakingTime] });
    await network.provider.request({ method: "evm_mine", params: [] });

    // liquidity tokens should belong to Staker, EOA shouldn't have any
    const eoaLiquidityPoolBalance3 = await pairContract.balanceOf(signer.address);
    expect(eoaLiquidityPoolBalance3).to.be.equal(0);
    const stakerContractLiquidityPoolBalance3 = await pairContract.balanceOf(staker.address);
    expect(stakerContractLiquidityPoolBalance3).to.be.equal(allowableLiquidityTokenAmount);

    await staker.connect(signer).unstake();

    // after unstaking, liquidity tokens should return to EOA, Staker shouldn't have any
    const eoaLiquidityPoolBalance4 = await pairContract.balanceOf(signer.address);
    expect(eoaLiquidityPoolBalance4).to.be.equal(allowableLiquidityTokenAmount);
    const stakerContractLiquidityPoolBalance4 = await pairContract.balanceOf(staker.address);
    expect(stakerContractLiquidityPoolBalance4).to.be.equal(0);
  });

  it("Unstaking should trigger automatic claim and increase MERC balance", async () => {
    // give pool token allowance to Staker for
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)

    // stake
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);

    // fast forward to in between first and second reward round, 1 full round in
    stakingTime = timeUnit + 500;
    await network.provider.request({ method: "evm_increaseTime", params: [stakingTime] });
    await network.provider.request({ method: "evm_mine", params: [] });

    const mercBalanceBeforeUnstake = await myERC20Token.balanceOf(signer.address);
    await staker.connect(signer).unstake();
    const mercBalanceAfterUnstake = await myERC20Token.balanceOf(signer.address);

    // 19 mercwei for staking 1999999999000 lpwei for 18 minutes 20 seconds at default 1%, or none if freeze time period hasn't expired
    expect(mercBalanceAfterUnstake.sub(mercBalanceBeforeUnstake)).to.be.equal(19 * Math.floor(stakingTime / FREEZE_TIME));
  });
});