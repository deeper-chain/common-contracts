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
  let wdpr
  let acceptDPRAsWDPR
  let deployer
  let failed = false
  // Skip test if any prior test in this describe failed
  beforeEach(function() {
    if (failed) this.skip()
  })
  afterEach(function() {
    if (!failed) failed = this.currentTest.state === 'failed'
  })
  
  before(async function() {
    this.timeout(30000)
    await hre.run('compile')
    
    ;([deployer] = await ethers.getSigners())
    console.log(`network:`, await deployer.provider.getNetwork())
    
    console.log(`deployer.address:`, deployer.address)
    console.log(`deployer.balance:`, await deployer.getBalance())
    
    wdpr = await findOrDeploy('WDPR')
    acceptDPRAsWDPR = await findOrDeploy('AcceptDPRAsWDPR', wdpr.address)
  })
  it('Should deposit', async function() {
    expect(await wdpr.symbol()).to.equal('WDPR')
    
    let oldBalance = await wdpr.balanceOf(deployer.address)
    let tx = await wdpr.deposit({ value: ethers.utils.parseUnits('100', 'gwei') })
    
    // wait until the transaction is mined
    await tx.wait()
    let newBalance = await wdpr.balanceOf(deployer.address)
    
    expect(newBalance.sub(oldBalance))
      .to
      .equal(ethers.utils.parseUnits('100', 'gwei'))
  })
  it('Should accept WDPR', async function() {
    
    let tx = await wdpr.approve(acceptDPRAsWDPR.address, ethers.utils.parseUnits('5', 'gwei'))
    await tx.wait()
    
    tx = await acceptDPRAsWDPR.acceptWDPR(ethers.utils.parseUnits('5', 'gwei'))
    await tx.wait()
  })
  it('Should accept DPR', async function() {
    
    let tx = await acceptDPRAsWDPR.acceptDPR({ value: ethers.utils.parseUnits('5', 'gwei') })
    await tx.wait()
  })
})
