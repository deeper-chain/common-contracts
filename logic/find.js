const config = require('../config')
const { ethers } = require('hardhat')
module.exports = async function(name) {
  const ContractFactory = await ethers.getContractFactory(name)
  let contract
  if (config.deployed[name]) {
    contract = ContractFactory.attach(config.deployed[name])
    
    console.log(`Found ${name} at:`, contract.address)
  } else {
    console.error(`Cannot find ${name} at:`, contract.address)
    console.error(`Check \`deployed.${name}\` field of config`)
  
    throw new Error(`Cannot find ${name} at: ${contract.address}`)
  }
  return contract
}
