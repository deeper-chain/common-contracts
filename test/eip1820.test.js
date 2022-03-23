process.env.CONFIG_PRODUCT = 'main'
process.env.CONFIG_ENV = 'dev'
process.env.CONFIG_NETWORK = 'local'
const config = require('../config')

const hre = require('hardhat')
const { ethers } = hre
const eip1820 = require('../logic/eip1820')
const { expect } = require('chai')

let p = { p: Promise.resolve() };
// put this line with a breakpoint as async breakpoint
// usage: assign a promise to p.p and step over
// while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)
describe('eip1820', function() {
  let wdpr
  let deployer
  let alice
  let ERC1820Registry
  beforeEach(async function() {
    
    ;([deployer, alice] = await ethers.getSigners())
    
    ERC1820Registry = await eip1820.deploy(deployer, ethers.utils.parseUnits('0.2', 'ether'))
    
  })
  it('Should work', async function() {
    let tx = await ERC1820Registry.setInterfaceImplementer(deployer.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('test')), deployer.address)
    await tx.wait()
    let result = await ERC1820Registry.getInterfaceImplementer(deployer.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('test')))
    expect(result).to.equal(deployer.address)
  })
  it('Should work with ERC777', async function() {
    const WDPR = await ethers.getContractFactory('WDPR')
    while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)
    wdpr = await WDPR.deploy()
    await wdpr.deployed()
    
    const gold = await (await ethers.getContractFactory('GOLD')).deploy(ethers.utils.parseUnits('1', 'ether'), [])
    await gold.deployed()
    const goldToWDPRERC777TokensRecipient = await (await ethers.getContractFactory('GOLDToWDPRERC777TokensRecipient')).deploy(gold.address, wdpr.address)
    await goldToWDPRERC777TokensRecipient.deployed()
    
    await expect(wdpr.deposit({ value: ethers.utils.parseEther('1') }))
      .to
      .emit(wdpr, 'Deposit')
      .withArgs(deployer.address, ethers.utils.parseEther('1'))
    
    await expect(wdpr.approve(goldToWDPRERC777TokensRecipient.address, ethers.utils.parseUnits('1', 'ether'),{gasLimit:5000000}))
      .to
      .emit(wdpr, 'Approval')
      .withArgs(deployer.address, goldToWDPRERC777TokensRecipient.address, ethers.utils.parseUnits('1', 'ether'))
    
    let tx = await ERC1820Registry.setInterfaceImplementer(deployer.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ERC777TokensRecipient')), goldToWDPRERC777TokensRecipient.address)
    await tx.wait()
    let result = await ERC1820Registry.getInterfaceImplementer(deployer.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ERC777TokensRecipient')))
    expect(result).to.equal(goldToWDPRERC777TokensRecipient.address)
    
    await expect(() => gold.transfer(alice.address, ethers.utils.parseUnits('1', 'ether')))
      .to
      .changeTokenBalances(gold, [deployer, alice], [
        ethers.utils.parseUnits('-1', 'ether'),
        ethers.utils.parseUnits('1', 'ether')])
    
    await expect(() => gold.connect(alice)
      .transfer(deployer.address, ethers.utils.parseUnits('1', 'ether')))
      .to
      .changeTokenBalances(wdpr, [deployer, alice], [
        ethers.utils.parseUnits('-1', 'ether'),
        ethers.utils.parseUnits('1', 'ether')])
  })
})
