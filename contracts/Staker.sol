// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.11 <0.9.0;

import "./IUniswapV2Pair.sol";
import "./IUniswapV2Factory.sol";
import "./IStaker.sol";
import "./MyEIP20Interface.sol";

contract Staker is IStaker {
    struct Stake {
        uint256 timestamp;
        uint256 amount;
    }

    mapping(address => Stake[]) public stakesByAddress;

    address public immutable admin;
    address public immutable factoryAddress;
    address public immutable tokenAAddress;
    address public immutable tokenBAddress;
    address public immutable pairAddress;

    uint256 public freezeTime;
    uint8 public percentage;

    // limitation on percentage
    modifier onlyWithinBounds(uint8 _percentage) {
        require(_percentage >= 1 && _percentage <= 10 && percentage != _percentage, "Incorrect value");
        _;
    }

    // tokenA - WETH, tokenB - MyERC20Token
    constructor(address _factoryAddress, address _tokenAAddress, address _tokenBAddress, uint256 _freezeTime, uint8 _percentage, address _pairAddress) onlyWithinBounds(_percentage) {
        admin = msg.sender;
        factoryAddress = _factoryAddress;
        tokenAAddress = _tokenAAddress;
        tokenBAddress = _tokenBAddress;
        freezeTime = _freezeTime;
        percentage = _percentage;
        pairAddress = _pairAddress;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be non-zero");

        // fetch balance and check if conditions are met
        uint lpTokenBalance = IUniswapV2Pair(pairAddress).balanceOf(msg.sender);
        uint allowanceLimit = IUniswapV2Pair(pairAddress).allowance(msg.sender, address(this));
        require(lpTokenBalance >= amount, "Insufficient balance");
        require(allowanceLimit >= amount, "Insufficient allowance");

        // take custody of lp tokens
        IUniswapV2Pair(pairAddress).transferFrom(msg.sender, address(this), amount);

        // register stake
        Stake memory newStake = Stake({timestamp: block.timestamp, amount: amount});
        (stakesByAddress[msg.sender]).push(newStake);
    }

    function claim() external {
        Stake[] storage stakes = stakesByAddress[msg.sender];
        uint256 rewardAmount = 0;

        for (uint256 index = 0; index < stakes.length; index++) {
            rewardAmount += calculateReward(stakes[index].amount, block.timestamp - stakes[index].timestamp, percentage);

            // start new staking period
            stakes[index].timestamp = block.timestamp;
        }

        // transfer reward to staker address
        MyEIP20Interface(tokenBAddress).transfer(msg.sender, rewardAmount);
    }

    function unstake() external {
        Stake[] storage stakes = stakesByAddress[msg.sender];
        uint256 returnableAmount = 0;
        uint256 rewardAmount = 0;

        // find matured stakes, remove them from registry, pay reward for staking
        for (uint256 index = 0; index < stakes.length; index++) {
            if((stakes[index].timestamp + freezeTime) <= block.timestamp) {
                returnableAmount += stakes[index].amount;
                rewardAmount += calculateReward(stakes[index].amount, block.timestamp - stakes[index].timestamp, percentage);

                delete stakes[index];
            }
        }

        // transfer reward to staker address
        MyEIP20Interface(tokenBAddress).transfer(msg.sender, rewardAmount);
        IUniswapV2Pair(pairAddress).transfer(msg.sender, returnableAmount);
    }

    function adjust(uint256 _freezeTime, uint8 _percentage) external onlyWithinBounds(_percentage) {
        require(msg.sender == admin, "Unauthorized");
        freezeTime = _freezeTime;
        percentage = _percentage;
    }

    function calculateReward(uint256 lpTokenAmount, uint256 stakingTime, uint8 _percentage) internal pure returns (uint256) {
        if(stakingTime < 600 || lpTokenAmount < 10**11) return 0;

        uint256 timeMultiplier = stakingTime / 600; // ten minutes
        uint256 amountMultiplier = lpTokenAmount / 10**11;

        return timeMultiplier * amountMultiplier * _percentage;
    }

    function destroyContract() external {
        require(msg.sender == admin, "Only admin can trigger contract destruction");
        selfdestruct(payable(admin));
    }
}