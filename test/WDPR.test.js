process.env.CONFIG_PRODUCT = 'main'
process.env.CONFIG_ENV = 'dev'
process.env.CONFIG_NETWORK = 'local'
const config = require('../config')

// make sure hardhat will use local network
process.env.HARDHAT_NETWORK = 'hardhat'
const hre = require('hardhat')
const { ethers } = hre

const { expect } = require('chai')

describe('WDPR basic', function() {
  let wdpr
  let deployer
  
  beforeEach(async function() {

    ;([deployer] = await ethers.getSigners())
    const WDPR = await ethers.getContractFactory('WDPR')
    wdpr = await WDPR.deploy()
    await wdpr.deployed()
    
  })
  it('Should deploy', async function() {
    expect(await wdpr.symbol()).to.equal('WDPR')
  })
  it('Should deposit', async function() {
    let tx = await wdpr.deposit({ value: ethers.utils.parseEther('1') })
    await tx.wait()
    expect(await wdpr.balanceOf(deployer.address))
      .to
      .equal(ethers.utils.parseEther('1'))
    expect(await deployer.provider.getBalance(wdpr.address))
      .to
      .equal(ethers.utils.parseEther('1'))
  })
  it('Should withdraw', async function() {
    let tx = await wdpr.deposit({ value: ethers.utils.parseEther('1') })
    await tx.wait()
    tx = await wdpr.withdraw(ethers.utils.parseEther('1'))
    await tx.wait()
    
    expect(await wdpr.balanceOf(deployer.address))
      .to
      .equal(ethers.utils.parseEther('0'))
    expect(await deployer.provider.getBalance(wdpr.address))
      .to
      .equal(ethers.utils.parseEther('0'))
  })
  it('Should not withdraw more', async function() {
    let tx = await wdpr.deposit({ value: ethers.utils.parseEther('1') })
    await tx.wait()
    tx = wdpr.withdraw(ethers.utils.parseEther('2'))
    await expect(tx)
      .to.be.revertedWith('WDPR: withdraw amount exceeds balance')
    expect(await wdpr.balanceOf(deployer.address))
      .to
      .equal(ethers.utils.parseEther('1'))
    expect(await deployer.provider.getBalance(wdpr.address))
      .to
      .equal(ethers.utils.parseEther('1'))
  })
  
})
