let Whitelist = artifacts.require('Whitelist.sol')

module.exports = async deployer => {
  return deployer.deploy(Whitelist)
}