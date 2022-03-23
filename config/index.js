const ConfigManager = require('config-manager')
let secrets = {}
// secrets may not be available
try {
  secrets = require('../secrets.json')
} catch (e) {
}
process.env.CONFIG_ENV = 'prod'
process.env.CONFIG_DEPLOY = 'deeper'
const configPreset = {
  product: process.env.CONFIG_PRODUCT || 'main', // main: product name
  env: process.env.CONFIG_ENV || 'dev', // dev: on development; prod: for production use
  deploy: process.env.CONFIG_DEPLOY || 'deeper_dev' // local: deploy to local; [chainName]: deploy to chain
}

const configManager = new ConfigManager()
configManager.schema('product.env.deploy')

const accounts={
  mnemonic:'repeat vicious remind year country inform elevator sniff resource limb radio option',
  initialIndex:1
}
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const hardhat = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.5.3',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    deeper_dev: {
      url: `https://mainnet-dev.deeper.network/rpc`,
      accounts
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      accounts
    },
    moonbase_dev: {
      url: `https://rpc.api.moonbase.moonbeam.network`,
      accounts
    },
    ...secrets?.deployer && {
      deeper: {
        url: `https://mainnet-deeper-chain.deeper.network/rpc`,
        accounts: secrets?.deployer.HDWallet
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD'
  },
  etherscan: {
    apiKey: {
//      deeper_dev: 'placeholder',
      deeper: 'placeholder',
    }
  }
}

configManager.set({
  hardhat,
  deployed: {
    '*': {},
    'main.dev.deeper_dev': {
      WDPR: '0x070BAfcd6605eDC70bD2CA00288e52f94CE0F106',
      AcceptDPRAsWDPR: '0x0cc9df8F5a950C7b689Dc412F04A3411d222cD5b',
      TransferFromCaller: '0x6e76946d784eb7C9a27f4151803168a7d64B1ef3'
    },
    'main.dev.deeper': {
      WDPR: '0x234baf301C2975F5D2F20DD7875F3543b64b0B9c'
    },
    'main.prod.deeper_dev': {
      WDPR: '0x25dd87682d8BD4D0003f8E4DEF660599dfB3A33A'
    },
    'main.prod.deeper': {
      WDPR: '0x234baf301C2975F5D2F20DD7875F3543b64b0B9c'
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
