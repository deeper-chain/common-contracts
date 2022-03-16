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
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
  
    expect(await wdpr.balanceOf(deployer.address))
      .to
      .equal(ethers.utils.parseEther('1'))
    expect(await deployer.provider.getBalance(wdpr.address))
      .to
      .equal(ethers.utils.parseEther('1'))
  })
  it('Should withdraw', async function() {
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
    await expect(wdpr.withdraw(ethers.utils.parseEther('1')))
      .to
      .emit(wdpr, 'Withdrawal')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
  
    expect(await wdpr.balanceOf(deployer.address))
      .to
      .equal(ethers.utils.parseEther('0'))
    expect(await deployer.provider.getBalance(wdpr.address))
      .to
      .equal(ethers.utils.parseEther('0'))
  })
  it('Should not withdraw more', async function() {
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
  
    await expect(wdpr.withdraw(ethers.utils.parseEther('2')))
      .to.be.revertedWith('WDPR: withdraw amount exceeds balance')
    expect(await wdpr.balanceOf(deployer.address))
      .to
      .equal(ethers.utils.parseEther('1'))
    expect(await deployer.provider.getBalance(wdpr.address))
      .to
      .equal(ethers.utils.parseEther('1'))
  })
  it('Should work with AcceptDPRAsWDPR', async function() {
    const acceptDPRAsWDPR = await (await ethers.getContractFactory('AcceptDPRAsWDPR')).deploy(wdpr.address)
    await acceptDPRAsWDPR.deployed()
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
    await expect(wdpr.approve(acceptDPRAsWDPR.address, ethers.utils.parseUnits('0.3', 'ether')))
      .to
      .emit(wdpr, 'Approval')
      .withArgs(deployer.address, acceptDPRAsWDPR.address, ethers.utils.parseUnits('0.3', 'ether'))
    await expect(() => acceptDPRAsWDPR.acceptWDPR(ethers.utils.parseUnits('0.3', 'ether')))
      .to
      .changeTokenBalances(wdpr, [deployer, acceptDPRAsWDPR], [
        ethers.utils.parseUnits('-0.3', 'ether'),
        ethers.utils.parseUnits('0.3', 'ether')])
    
  })
  it('Should work with TransferFromCaller', async function() {
    const acceptDPRAsWDPR = await (await ethers.getContractFactory('AcceptDPRAsWDPR')).deploy(wdpr.address)
    await acceptDPRAsWDPR.deployed()
    const transferFromCaller = await (await ethers.getContractFactory('TransferFromCaller')).deploy(wdpr.address)
    await transferFromCaller.deployed()
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
    
    await expect(wdpr.approve(transferFromCaller.address, ethers.utils.parseUnits('0.2', 'ether')))
      .to
      .emit(wdpr, 'Approval')
      .withArgs(deployer.address, transferFromCaller.address, ethers.utils.parseUnits('0.2', 'ether'))
    
    await expect(() => transferFromCaller.transferFromTest(ethers.utils.parseUnits('0.2', 'ether'), acceptDPRAsWDPR.address))
      .to
      .changeTokenBalances(wdpr, [deployer, acceptDPRAsWDPR], [
        ethers.utils.parseUnits('-0.2', 'ether'),
        ethers.utils.parseUnits('0.2', 'ether')])
  })
  
  it('Should work with TransferOnBehalf', async function() {
    const acceptDPRAsWDPR = await (await ethers.getContractFactory('AcceptDPRAsWDPR')).deploy(wdpr.address)
    await acceptDPRAsWDPR.deployed()
    const transferOnBehalf = await (await ethers.getContractFactory('TransferOnBehalf')).deploy(wdpr.address)
    await transferOnBehalf.deployed()
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
    
    await expect(wdpr.approve(transferOnBehalf.address, ethers.utils.parseUnits('1', 'ether')))
      .to
      .emit(wdpr, 'Approval')
      .withArgs(deployer.address, transferOnBehalf.address, ethers.utils.parseUnits('1', 'ether'))
    
    await expect(() => transferOnBehalf.transferWDPRAsWDPR(ethers.utils.parseUnits('0.2', 'ether'), acceptDPRAsWDPR.address))
      .to
      .changeTokenBalances(wdpr, [deployer, acceptDPRAsWDPR], [
        ethers.utils.parseUnits('-0.2', 'ether'),
        ethers.utils.parseUnits('0.2', 'ether')])
    await expect(() => transferOnBehalf.transferWDPRAsDPR(ethers.utils.parseUnits('0.2', 'ether'), acceptDPRAsWDPR.address))
      .to
      .changeTokenBalances(wdpr, [deployer, acceptDPRAsWDPR], [
        ethers.utils.parseUnits('-0.2', 'ether'),
        ethers.utils.parseUnits('0.2', 'ether')])
    await expect(() => transferOnBehalf.transferDPRAsWDPR(acceptDPRAsWDPR.address,{value:ethers.utils.parseUnits('0.2', 'ether')} ))
      .to
      .changeTokenBalances(wdpr, [ acceptDPRAsWDPR], [
        ethers.utils.parseUnits('0.2', 'ether')])
      .to
      .changeEtherBalances([deployer],[ethers.utils.parseUnits('-0.2', 'ether')])
    await expect(() => transferOnBehalf.transferDPRAsDPR(acceptDPRAsWDPR.address, { value: ethers.utils.parseUnits('0.2', 'ether') }))
      .to
      .changeTokenBalances(wdpr, [acceptDPRAsWDPR], [
        ethers.utils.parseUnits('0.2', 'ether')])
      .to
      .changeEtherBalances([deployer], [ethers.utils.parseUnits('-0.2', 'ether')])
  })
  
})
