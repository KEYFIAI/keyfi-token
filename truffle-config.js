require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider')
const MNEMONIC = process.env.SK_DEPLOY_WALLET_KEY
const MainnetProvider = new HDWalletProvider(MNEMONIC, "https://mainnet.infura.io/v3/" + process.env.SK_DEPLOY_INFURA_KEY)
const RopstenProvider = new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/" + process.env.SK_DEPLOY_INFURA_KEY)


module.exports = {
  networks: {
    coverage: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },

    // Another network with more advanced options...
    // advanced: {
      // port: 8777,             // Custom port
      // network_id: 1342,       // Custom network
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    ropsten: {
      provider: () => RopstenProvider,
      network_id: 3,
      gas: 5000000,
      gasPrice: 50000000000, // 50 gwei
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () => MainnetProvider,
      network_id: 1,
      //from: addresses[0],
      gas: 5000000,
      gasPrice: 200000000000, // 200 gwei
      //skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    }
    // Useful for private networks
    // private: {
      // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
      // network_id: 2111,   // This network is yours, in the cloud.
      // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    /*enableTimeouts: false,
    before_timeout: 50000000*/
    timeout: 9999999999999
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.7.0"    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },

  plugins: ['truffle-plugin-verify'],
}
