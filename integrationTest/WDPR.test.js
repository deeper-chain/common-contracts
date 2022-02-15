const config = require('../config')
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers } = hre

const { expect } = require('chai')

const findOrDeploy = require('../logic/findOrDeploy')

describe('WDPR integration test', function() {
  it('Should work', async function() {
    const [deployer] = await ethers.getSigners()
    
    console.log(`deployer.address:`, deployer.address)
    console.log(`deployer.balance:`, await deployer.getBalance())
    const wdpr = await findOrDeploy('WDPR')
    
    console.log(`wdpr.address:`, wdpr.address)
    expect(await wdpr.symbol()).to.equal('WDPR')
    
    let oldBalance = await wdpr.balanceOf(deployer.address)
    let tx = await wdpr.deposit({ value: ethers.utils.parseEther('1.0') })
    
    // wait until the transaction is mined
    await tx.wait()
    let newBalance = await wdpr.balanceOf(deployer.address)
  
    expect(newBalance.sub(oldBalance)).to.equal(BigInt(1e18))
  })
})
