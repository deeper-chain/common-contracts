const config = require('../config')
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers } = hre
const eip1820 = require('../logic/eip1820')

async function main () {
  let [deployer] = await ethers.getSigners()
  
  let registryContract = await eip1820.deploy(deployer, ethers.utils.parseUnits('0.2', 'ether'))
  
  console.log('eip1820 deployed to:', registryContract.address)
  
  if (config.configPreset.env === 'prod') {
    console.log('verify on blockchain explorer')
    await hre.run("verify:verify", {
      address: registryContract.address
    })
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
