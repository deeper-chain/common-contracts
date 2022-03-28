const config = require('../config')
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers } = hre
const findOrDeploy = require('../logic/findOrDeploy')
const logRemindWriteDownConfig = require('../logic/logRemindWriteDownConfig')

async function main () {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run('compile')
  const [deployer] = await ethers.getSigners()
  
  // We get the contract to deploy
  const WDPR = await findOrDeploy('WDPR')
  
  const UniswapV2Factory = await findOrDeploy('UniswapV2Factory', deployer.address)
  
  const UniswapV2Router02 = await findOrDeploy('UniswapV2Router02', UniswapV2Factory.address, WDPR.address)
  
  logRemindWriteDownConfig({
    UniswapV2Factory: UniswapV2Factory.address,
    UniswapV2Router02: UniswapV2Router02.address
  })
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
