/* eslint-disable prettier/prettier */
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Staker", function () {
  it("Should initialize", async () => {
    const Staker = await ethers.getContractFactory("Staker");
    const staker = await Staker.deploy(
      "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", 
      "0xc778417e063141139fce010982780140aa0cd5ab",
      "0x2681E46b62395c10Fa89468d637bB629bD76EE88",
      600,
      1,
      "0x8E581692aEEd27A4E090Efd8eDF015062a2D7335"
    );
  
    await staker.deployed();

    const signers = await ethers.getSigners();

    expect(1).to.equal(1);
  });
});