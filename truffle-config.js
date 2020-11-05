require('dotenv').config()

const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs');

const infuraKey = process.env["INFURA_KEY"]
const mainnetURL = "https://mainnet.infura.io/v3/" + infuraKey
const ropstenURL = "https://ropsten.infura.io/v3/" + infuraKey

const walletPath = "./local/wallet.json"  // Should be JSON file where "mnemonic" is found
const { mnemonic } = JSON.parse(fs.readFileSync(walletPath))

const MainnetProvider = new HDWalletProvider(mnemonic, mainnetURL, 0, 5)
const RopstenProvider = new HDWalletProvider(mnemonic, ropstenURL, 0, 5)

module.exports = {
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
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
      gasPrice: 5000000000, // 5 gwei
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () => MainnetProvider,
      network_id: 1,
      //from: addresses[0],
      gas: 5000000,
      gasPrice: 8000000000, // 8 gwei
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
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.6.2"    // Fetch exact version from solc-bin (default: truffle's version)
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

  plugins: ["solidity-coverage"],
  mocha: {
    enableTimeouts: false
  }
}
