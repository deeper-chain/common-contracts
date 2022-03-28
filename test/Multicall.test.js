process.env.CONFIG_PRODUCT = 'main'
process.env.CONFIG_ENV = 'dev'
process.env.CONFIG_NETWORK = 'local'
const config = require('../config')

// make sure hardhat will use local network
process.env.HARDHAT_NETWORK = 'hardhat'
const hre = require('hardhat')
const { ethers } = hre

const { expect } = require('chai')

const { Contract, Provider } = require('ethcall')

let p = { p: Promise.resolve() }
// put this line with a breakpoint as async breakpoint
// usage: assign a promise to p.p and step over
// while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)

describe('Multicall basic', function() {
  let wdpr
  let multiCall3
  let deployer
  
  before(async function() {
  
    ;([deployer] = await ethers.getSigners())
    const WDPR = await ethers.getContractFactory('WDPR')
    wdpr = await WDPR.deploy()
    await wdpr.deployed()
  
    multiCall3 = await (await ethers.getContractFactory('Multicall3')).deploy()
    await multiCall3.deployed()
  })
  it('Should work deployless', async function() {
    while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)
  
    const ethcallProvider = new Provider()
  
    await ethcallProvider.init(deployer.provider)
  
    const wdprContract = new Contract(wdpr.address, wdpr.interface.fragments)
  
    const ret = await ethcallProvider.tryEach([
      wdprContract.symbol(), wdprContract.name(), wdprContract.decimals()], [])
    console.log(`ret:`, ret)
    expect(ret).to.deep.equal(['WDPR', 'Wrapped DPR', 18])
  })
  
  it('Should work deployful', async function() {
    while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)
  
    const ethcallProvider = new Provider()
  
    await ethcallProvider.init(deployer.provider)
    ethcallProvider.multicall3 = {
      address: multiCall3.address,
      block: 0
    }
    const wdprContract = new Contract(wdpr.address, wdpr.interface.fragments)
  
    const ret = await ethcallProvider.tryEach([
      wdprContract.symbol(), wdprContract.name(), wdprContract.decimals()], [])
    console.log(`ret:`, ret)
    expect(ret).to.deep.equal(['WDPR', 'Wrapped DPR', 18])
  })
})
