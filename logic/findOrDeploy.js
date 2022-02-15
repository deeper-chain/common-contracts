const config = require('../config')
const { ethers } = require('hardhat')
module.exports = async function(name) {
  const ContractFactory = await ethers.getContractFactory(name)
  let contract
  if (config.deployed[name]) {
    contract = ContractFactory.attach(config.deployed[name])
    
    console.log(`Found ${name} at:`, contract.address)
  } else {
    contract = await ContractFactory.deploy()
    
    console.log(`Deployed ${name} at:`, contract.address)
    
  }
  return contract
}
