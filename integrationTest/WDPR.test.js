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


let p = { p: Promise.resolve() };
// put this line with a breakpoint as async breakpoint
// usage: assign a promise to p.p and step over
// while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)

describe('WDPR integration test', function() {
  let wdpr
  let acceptDPRAsWDPR
  let transferFromCaller
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
    transferFromCaller = await findOrDeploy('TransferFromCaller', wdpr.address)
  
  })
  
  it('Should deposit', async function() {
    expect(await wdpr.symbol()).to.equal('WDPR')
    
    let oldBalance = await wdpr.balanceOf(deployer.address)
    let tx = await wdpr.deposit({ value: ethers.utils.parseUnits('1', 'ether') })
    
    // wait until the transaction is mined
    await tx.wait()
    let newBalance = await wdpr.balanceOf(deployer.address)
    
    expect(newBalance.sub(oldBalance))
      .to
      .equal(ethers.utils.parseUnits('1', 'ether'))
  })
  it('Should accept WDPR', async function() {
  
    try {
      let tx = await wdpr.approve(acceptDPRAsWDPR.address, ethers.utils.parseUnits('0.2', 'ether'),{gasLimit: 5000000})
      await tx.wait()
      tx = await acceptDPRAsWDPR.acceptWDPR(ethers.utils.parseUnits('0.2', 'ether'))
      await tx.wait()
    }catch (e) {
      while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)
  
    }
  })
  
  it('Should accept DPR', async function() {
    
    let tx = await acceptDPRAsWDPR.acceptDPR({ value: ethers.utils.parseUnits('0.2', 'ether') })
  
    tx = await deployer.sendTransaction({to: acceptDPRAsWDPR.address,value: ethers.utils.parseUnits('0.2', 'ether')})
    await tx.wait()
    
  })
  it('Should work with transferFromCaller', async function() {
  
    let oldBalance = await wdpr.balanceOf(acceptDPRAsWDPR.address)
    let tx = await wdpr.approve(transferFromCaller.address, ethers.utils.parseUnits('0.2', 'ether'), { gasLimit: 5000000 })
  
    tx = await transferFromCaller.transferFromTest(ethers.utils.parseUnits('0.2', 'ether'), acceptDPRAsWDPR.address, { gasLimit: 5000000 })
    await tx.wait()
  
    let newBalance = await wdpr.balanceOf(acceptDPRAsWDPR.address)
  
    expect(newBalance.sub(oldBalance))
      .to
      .equal(ethers.utils.parseUnits('0.2', 'ether'))
  })
  it('Should work with transferFromCaller, revert if more than approved', async function() {
    
    let oldBalance = await wdpr.balanceOf(acceptDPRAsWDPR.address)
    let tx = await wdpr.approve(transferFromCaller.address, ethers.utils.parseUnits('0.2', 'ether'), { gasLimit: 5000000 })
    
    let txProm  = transferFromCaller.transferFromTest(ethers.utils.parseUnits('0.201', 'ether'), acceptDPRAsWDPR.address, { gasLimit: 5000000 })
    await expect(txProm).to.revertedWith('WDPR: request exceeds allowance')
    
    let newBalance = await wdpr.balanceOf(acceptDPRAsWDPR.address)
    
    expect(newBalance.sub(oldBalance))
      .to
      .equal(ethers.utils.parseUnits('0', 'ether'))
  })
  
  it('Should withdraw', async function() {
    
    let oldBalance=await wdpr.balanceOf(deployer.address)
    let tx = await wdpr.withdraw(oldBalance.div(2))
    await tx.wait()
    let newBalance = await wdpr.balanceOf(deployer.address)
  
    expect(newBalance.sub(oldBalance))
      .to
      .equal(oldBalance.div(2))
  })
  it('Should withdraw no more', async function() {
  
    let oldBalance = await wdpr.balanceOf(deployer.address)
    let txProm = wdpr.withdraw(oldBalance.add(1))
  
    await expect(txProm).to.revertedWith('WDPR: withdraw amount exceeds balance')

  })
})
