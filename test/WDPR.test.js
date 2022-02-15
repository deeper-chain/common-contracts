const { expect } = require('chai')

// make sure hardhat will use local network
process.env.HARDHAT_NETWORK = undefined
const { ethers } = require('hardhat')

describe('WDPR basic', function() {
  it('Should work', async function() {
    const [deployer] = await ethers.getSigners()
    
    console.log(`deployer.address:`, deployer.address)
    console.log(`deployer.balance:`, await deployer.getBalance())
    const WDPR = await ethers.getContractFactory('WDPR')
    const wdpr = await WDPR.deploy()
    await wdpr.deployed()
    
    console.log(`wdpr.address:`, wdpr.address)
    expect(await wdpr.symbol()).to.equal('WDPR')
    
    let tx = await wdpr.deposit({ value: ethers.utils.parseEther('1.0') })
    
    // wait until the transaction is mined
    await tx.wait()
    
    expect(await wdpr.balanceOf(deployer.address)).to.equal(BigInt(1e18))
  })
})
