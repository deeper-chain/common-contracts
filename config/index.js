const ConfigManager = require('config-manager')
let secrets = {}
// secrets may not be available
try {
  secrets = require('../secrets.json')
} catch (e) {
}

const configPreset = {
  product: process.env.CONFIG_PRODUCT || 'main', // main: product name
  env: process.env.CONFIG_ENV || 'dev', // dev: on development; prod: for production use
  deploy: process.env.CONFIG_DEPLOY || 'deeper_dev' // local: deploy to local; [chainName]: deploy to chain
}

const configManager = new ConfigManager()
configManager.schema('product.env.deploy')
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const hardhat = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    deeper_dev: {
      url: `https://mainnet-dev.deeper.network/rpc`,
      accounts: ['bd8497e845b4dd6e7dec9e1f57590a513a247a534217e4fb0e931b95b77a1751']
    },
    moonbase_dev: {
      url: `https://rpc.api.moonbase.moonbeam.network`,
      accounts: ['bd8497e845b4dd6e7dec9e1f57590a513a247a534217e4fb0e931b95b77a1751']
    },
    ...secrets?.deployer && {
      deeper: {
        url: `https://mainnet-deeper-chain.deeper.network/rpc`,
        accounts: [secrets?.deployer?.privateKey]
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD'
  },
  etherscan: {
    apiKey: {
      deeper_dev: 'placeholder'
    }
  }
}

configManager.set({
  hardhat,
  deployed: {
    '*': {},
    'main.dev.deeper_dev': {
      WDPR: '0x070BAfcd6605eDC70bD2CA00288e52f94CE0F106',
      AcceptDPRAsWDPR: '0x0cc9df8F5a950C7b689Dc412F04A3411d222cD5b'
    },
    'main.dev.deeper': {
      WDPR: '0x3cfE156371057a968788F54D65B70502A691Be76'
    },
    'main.prod.deeper_dev': {
      WDPR: ''
    },
    'main.prod.deeper': {
      WDPR: '0x3cfE156371057a968788F54D65B70502A691Be76'
    }
  }
  
})

// make sure to require('hardhat') after require('config') for network selection
if (configPreset.deploy !== 'local') {
  process.env.HARDHAT_NETWORK = configPreset.deploy
}
process.env.HARDHAT_SHOW_STACK_TRACES = 'true'
// process.env.HARDHAT_VERBOSE = 'true'

module.exports = {
  ...configManager.get(configPreset),
  configPreset,
  configManager
}
