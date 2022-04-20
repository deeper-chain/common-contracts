const ConfigManager = require('config-manager')
let secrets = {}
// secrets may not be available
try {
  secrets = require('../secrets.json')
} catch (e) {
}

process.env.CONFIG_DEPLOY = 'deeper_dev'
const configPreset = {
  product: process.env.CONFIG_PRODUCT || 'main', // main: product name
  env: process.env.CONFIG_ENV || 'dev', // dev: on development; prod: for production use
  deploy: process.env.CONFIG_DEPLOY || 'deeper_dev' // local: deploy to local; [chainName]: deploy to chain
}

const configManager = new ConfigManager()
configManager.schema('product.env.deploy')

const accounts = {
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
        version: '0.5.3',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
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
      deeper_dev: 'placeholder'
      //      deeper: 'placeholder',
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
      TransferFromCaller: '0x6e76946d784eb7C9a27f4151803168a7d64B1ef3',
      Multicall3: '0x35259b4283cae6C5404CF8D5DeEDD007B85517Da',
      UniswapV2Factory: '0x7122aF5960556FB2F2551d5817851fC94189C065',
      UniswapV2Router02: '0x47f74A0dAdB2ab676C5768CD5EdEf72d9286A552',
      UniswapV2PairByteCodeHash:'0xbb0f2e0c0bf90856d193723773f6568f591f0dd81a4d686d2513845240a1b28d',
      DeeperMachine:'0xb6152ee4Cc7ce632aD84490e22bEfb2a36DE0AB6'
    },
    'main.dev.deeper': {
      WDPR: '0x234baf301C2975F5D2F20DD7875F3543b64b0B9c',
      Multicall3: '0x974B66599665b63B0d40a1674b47fAE1bedF55ca'
    },
    'main.prod.deeper_dev': {
      WDPR: '0x25dd87682d8BD4D0003f8E4DEF660599dfB3A33A',
      Multicall3: '0x35259b4283cae6C5404CF8D5DeEDD007B85517Da'
    },
    'main.prod.deeper': {
      WDPR: '0x234baf301C2975F5D2F20DD7875F3543b64b0B9c',
      Multicall3: '0x974B66599665b63B0d40a1674b47fAE1bedF55ca'
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
