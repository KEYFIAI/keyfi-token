let KeyfiTokenFactory = artifacts.require('KeyfiTokenFactory.sol')

module.exports = async (deployer, network, accounts) => {
  
  return deployer.deploy(KeyfiTokenFactory, accounts[0], accounts[1], accounts[2])
}