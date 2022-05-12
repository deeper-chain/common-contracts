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

let p = { p: Promise.resolve() }
// put this line with a breakpoint as async breakpoint
// usage: assign a promise to p.p and step over
// while (p.t !== p.p) p.r = await (p.t = p.p).catch(e => e)

describe('deeperMachine integration test', function() {
  let DeeperMachine
  let acceptDPRAsWDPR
  let transferFromCaller
  let deployer
  let A
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
    
    ;([deployer,A] = await ethers.getSigners())
    console.log(`network:`, await deployer.provider.getNetwork())
    
    console.log(`deployer.address:`, deployer.address)
    console.log(`deployer.balance:`, await deployer.getBalance())
  
    DeeperMachine = await findOrDeploy.noVerify('DeeperMachine')
  })
  
  it('Should publish a task', async function() {

    let tx=await DeeperMachine.publishTask('xxx','http://43.154.69.51:8080',100,{
      value: ethers.utils.parseUnits('10', 'ether')
    })
    await tx.wait()
    tx = await DeeperMachine.raceSubIndexForTask(1, { gasLimit: 5000000 })
    await tx.wait()
  })
  it('Should race a task', async function() {
    let tx = await DeeperMachine.raceSubIndexForTask(12,{gasLimit:5000000})
    await tx.wait()
  })
  it('Should withdraw earnings', async function() {
    let tx = await DeeperMachine.withdrawEarnings({ gasLimit: 5000000 })
    await tx.wait()
  })
  it('Should set a task', async function() {
    let tx = await DeeperMachine.publishTask('xxx', 'http://43.154.69.51:8080', 100, {
      value: ethers.utils.parseUnits('10', 'ether')
    })
    await tx.wait()
  })
  
  it('Should read a task', async function() {
    let ret=await DeeperMachine.allTasks(3)
    console.log(`ret:`, ret)
  })
  
})

describe('deeperMachine old version', function() {
  function method (addr, abi) {
    let c = new ethers.Contract(addr, [abi], deployer)
    let funcName = c.interface.fragments[0].name
    return c[funcName].bind(c)
  }
  
  let deployer
  let failed = false
  // Skip test if any prior test in this describe failed
  beforeEach(function() {
    if (failed) this.skip()
  })
  afterEach(function() {
    if (!failed) failed = this.currentTest.state === 'failed'
  })
  let deeperMachineAddr = '0xbd4Eff5cFA8012fBc575eBcC10f04FA090a32028'
  before(async function() {
    this.timeout(30000)
    
    ;([deployer] = await ethers.getSigners())
    console.log(`network:`, await deployer.provider.getNetwork())
    
    console.log(`deployer.address:`, deployer.address)
    console.log(`deployer.balance:`, await deployer.getBalance())
  })
  
  it('owner', async function() {
    let ret = await method(deeperMachineAddr, 'function owner() public view returns (address)')()
    
    console.log(`ret:`, ret)
  })
  
  it('create_work', async function() {
    let tx = await method(deeperMachineAddr, 'function create_work() payable external')({ value: ethers.utils.parseUnits('10', 'ether') })
    await tx.wait()
    console.log(`tx:`, tx)
  })
})

