process.env.CONFIG_PRODUCT = 'main'
process.env.CONFIG_ENV = 'dev'
process.env.CONFIG_NETWORK = 'local'
const config = require('../config')

// make sure hardhat will use local network
process.env.HARDHAT_NETWORK = 'hardhat'
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers } = hre

const { expect } = require('chai')

const findOrDeploy = require('../logic/findOrDeploy')

let p = { p: Promise.resolve() }
// put this line with a breakpoint as async breakpoint
// usage: assign a promise to p.p and step over
// while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)

describe('deeperMachine unit test', function() {
  let DeeperMachine
  let deployer
  let A
  
  beforeEach(async function() {
    ;([deployer, A] = await ethers.getSigners())
    
    DeeperMachine = await findOrDeploy.noVerify('DeeperMachine')
  })
  
  it('Should publish a task', async function() {
    
    let tx = await DeeperMachine.publishTask('docker_url', 'params', 1, [], {
      value: ethers.utils.parseUnits('10', 'ether')
    })
    await tx.wait()
  })
  it('Should race a task', async function() {
    
    let tx = await DeeperMachine.publishTask('docker_url', 'params', 1, [], {
      value: ethers.utils.parseUnits('10', 'ether')
    })
    await tx.wait()
    tx = await DeeperMachine.connect(A).raceSubIndexForTask(1)
    await tx.wait()
  })
  it('Should race a task for receiver', async function() {
    
    let tx = await DeeperMachine.publishTask('docker_url', 'params', 1, [deployer.address], {
      value: ethers.utils.parseUnits('10', 'ether')
    })
    await tx.wait()
    tx = await DeeperMachine.raceSubIndexForTask(1)
    await tx.wait()
  })
  it('Should fail to race a task for non-receiver', async function() {
    
    let tx = await DeeperMachine.publishTask('docker_url', 'params', 1, [deployer.address], {
      value: ethers.utils.parseUnits('10', 'ether')
    })
    await tx.wait()
    await expect(DeeperMachine.connect(A).raceSubIndexForTask(1))
      .to
      .revertedWith('Invalid task receiver')
  })
  
})
