const config = require('../config')
const hre = require('hardhat')
const { ethers } = hre
module.exports = async function(name, ...deployArgs) {
  const ContractFactory = await ethers.getContractFactory(name)
  let contract
  if (config.deployed[name]) {
    contract = ContractFactory.attach(config.deployed[name])
    
    console.log(`Found ${name} at:`, contract.address)
  } else {
    contract = await ContractFactory.deploy(...deployArgs)
    
    console.log(`Deployed ${name} at:`, contract.address)
  
    if (config.configPreset.deploy !== 'local') {
      await hre.run('verify:verify', {
        address: contract.address,
        constructorArguments: deployArgs
      })
    }
  }
  return contract
}
