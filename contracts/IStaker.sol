// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.11 <0.9.0;

interface IStaker {
    function stake(uint256 amount) external;
    function claim() external;
    function unstake() external;
}