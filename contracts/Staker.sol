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

    uint256 constant public AMOUNT_MULTIPLIER_UNIT = 10**11;
    uint16 constant public TIME_MULTIPLIER_UNIT = 600;

    // limitation on percentage
    modifier onlyWithinBounds(uint8 _percentage) {
        require(_percentage >= 1 && _percentage <= 10 && percentage != _percentage, "Only values between 1 and 10 are allowed");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Unauthorized");
        _;
    }

    // tokenA - WETH, tokenB - MERC
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

        // fetch balance and allowance
        uint lpTokenBalance = IUniswapV2Pair(pairAddress).balanceOf(msg.sender);
        uint allowanceLimit = IUniswapV2Pair(pairAddress).allowance(msg.sender, address(this));

        // check if staking conditions are met
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
            if(block.timestamp - stakes[index].timestamp >= freezeTime) {
                returnableAmount += stakes[index].amount;
                rewardAmount += calculateReward(stakes[index].amount, block.timestamp - stakes[index].timestamp, percentage);

                delete stakes[index];
            }
        }

        // transfer reward to staker address
        MyEIP20Interface(tokenBAddress).transfer(msg.sender, rewardAmount);
        IUniswapV2Pair(pairAddress).transfer(msg.sender, returnableAmount);
    }

    function adjust(uint256 _freezeTime, uint8 _percentage) external onlyWithinBounds(_percentage) onlyAdmin {
        freezeTime = _freezeTime;
        percentage = _percentage;
    }

    function calculateReward(uint256 lpTokenAmount, uint256 stakingTime, uint8 _percentage) internal pure returns (uint256) {
        if(stakingTime < TIME_MULTIPLIER_UNIT || lpTokenAmount < AMOUNT_MULTIPLIER_UNIT) return 0;

        uint256 timeMultiplier = stakingTime / TIME_MULTIPLIER_UNIT;
        uint256 amountMultiplier = lpTokenAmount / AMOUNT_MULTIPLIER_UNIT;

        return timeMultiplier * amountMultiplier * _percentage;
    }

    function destroyContract() external onlyAdmin {
        selfdestruct(payable(admin));
    }
}