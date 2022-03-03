/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
/* eslint-disable prettier/prettier */
import { expect } from "chai";
import { ethers, network } from "hardhat";

const MyERC20TokenAbi = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"BURN_DIVIDEND","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BURN_DIVISOR","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TOKEN_PRICE_IN_WEI","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"destroyContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"extractEther","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
const PairAbi = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]

describe("Staker", function () {
  let Staker, staker: any, signers: any[], myERC20Token: any, pairContract: any, signer: any;

  const FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab";
  const MERC_ADDRESS = "0x2681E46b62395c10Fa89468d637bB629bD76EE88";
  const PAIR_ADDRESS = "0x8E581692aEEd27A4E090Efd8eDF015062a2D7335";
  const TEN_MINUTES = 600;
  const PERCENTAGE = 1;

  beforeEach(async () => {
    Staker = await ethers.getContractFactory("Staker");
    staker = await Staker.deploy(
      FACTORY_ADDRESS, 
      WETH_ADDRESS,
      MERC_ADDRESS,
      TEN_MINUTES,
      PERCENTAGE,
      PAIR_ADDRESS
    );

    await staker.deployed();

    signers = await ethers.getSigners();
    signer = await ethers.getSigner(process.env.METAMASK_PUBLIC_KEY);

    myERC20Token = await ethers.getContractAt(MyERC20TokenAbi, MERC_ADDRESS);
    pairContract = await ethers.getContractAt(PairAbi, PAIR_ADDRESS);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [process.env.METAMASK_PUBLIC_KEY],
    });
  });

  afterEach(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [{
          forking: {
            jsonRpcUrl: process.env.RINKEBY_URL,
            blockNumber: 10264465,
          },
      }]
    });
  });

  it("Should initialize correctly", async () => {
    expect(await staker.admin()).to.equal(signers[0].address);
    expect((await (await staker.factoryAddress()).toLowerCase())).to.equal(FACTORY_ADDRESS.toLowerCase());
    expect((await staker.tokenAAddress()).toLowerCase()).to.equal(WETH_ADDRESS.toLowerCase());
    expect((await staker.tokenBAddress()).toLowerCase()).to.equal(MERC_ADDRESS.toLowerCase());
    expect(await staker.freezeTime()).to.equal(600);
    expect(await staker.percentage()).to.equal(1);
    expect(((await staker.pairAddress()).toLowerCase())).to.equal(PAIR_ADDRESS.toLowerCase());
  });

  it("Should stake correctly", async () => {
    await expect(staker.connect(signer).stake(10**11)).to.be.revertedWith("Insufficient allowance");

    // give pool token allowance to Staker for
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)
    expect(await pairContract.allowance(signer.address, staker.address)).to.be.equal(allowableLiquidityTokenAmount);

    // stake and check if Staker correctly added new Stake
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);
    const stake0 = await staker.connect(signer).stakesByAddress(process.env.METAMASK_PUBLIC_KEY, 0);
    expect(stake0.amount).to.be.equal(allowableLiquidityTokenAmount);
  });

  it("Should claim correctly", async () => {
    await expect(staker.connect(signer).stake(10**11)).to.be.revertedWith("Insufficient allowance");

    // give pool token allowance to Staker for
    const allowableLiquidityTokenAmount = await pairContract.balanceOf(signer.address);
    await pairContract.connect(signer).approve(staker.address, allowableLiquidityTokenAmount)
    expect(await pairContract.allowance(signer.address, staker.address)).to.be.equal(allowableLiquidityTokenAmount);

    // stake and check if Staker correctly added new Stake
    await staker.connect(signer).stake(allowableLiquidityTokenAmount);
    const stake0 = await staker.connect(signer).stakesByAddress(process.env.METAMASK_PUBLIC_KEY, 0);
    expect(stake0.amount).to.be.equal(allowableLiquidityTokenAmount);

    const timestampBefore = (await ethers.provider.getBlock("latest")).timestamp;

    // fast forward 10 minutes and try to claim reward
    await network.provider.request({
      method: "evm_increaseTime",
      params: [600]
    });

    await network.provider.request({
      method: "evm_mine",
      params: []
    });

    const timestampAfter = (await ethers.provider.getBlock("latest")).timestamp;

    //await staker.connect(signer).claim();
    console.log( myERC20Token(MERC_ADDRESS) )
  });
});

// it("Should check native balance with native transfer to contract", async () => {
//   const ethAmount = parseEther("1.0"); // exactly 1 ETH

//   // record balance before any action
//   const ethBalanceBefore = await signers[0].getBalance();

//   // only send tx, exact amount of gas used is unknown until tx is mined
//   const sentTx = await exchange.exchange(nativeEth, usdc.address, ethAmount, 0, { value: ethAmount })

//   // wait until tx is mined
//   const minedTx = await sentTx.wait();

//   // after tx is mined, we know everyting about this tx
//   const fee = minedTx.effectiveGasPrice.mul(minedTx.cumulativeGasUsed);

//   // fetch balance after all actions
//   const ethBalanceAfter = await signers[0].getBalance();

//   // check balance - substract value sent to contract and exact fee
//   expect(ethBalanceAfter).to.be.equal(ethBalanceBefore.sub(ethAmount).sub(fee));
// })

    // await expect(() => token.transfer(walletTo.address, 200))
    //   .to.changeTokenBalances(token, [wallet, walletTo], [-200, 200]);
