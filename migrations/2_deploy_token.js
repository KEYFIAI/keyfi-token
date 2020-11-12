let KeyfiToken = artifacts.require('KeyfiToken.sol')

module.exports = async deployer => {
  
	return deployer.deploy(KeyfiToken)
}