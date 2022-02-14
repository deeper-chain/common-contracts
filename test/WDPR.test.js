const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WDPR basic", function () {
  it("Should work", async function () {
    const WDPR = await ethers.getContractFactory("WDPR");
    const wdpr = await WDPR.deploy();
    await wdpr.deployed();

    expect(await wdpr.symbol()).to.equal("WDPR");

    let tx = await wdpr.deposit({value: ethers.utils.parseEther("1.0")});

    // wait until the transaction is mined
    await tx.wait();
  
    const [deployer] = await ethers.getSigners();
  
    expect(await wdpr.balanceOf(deployer.address)).to.equal(BigInt(1e18));
  });
});
