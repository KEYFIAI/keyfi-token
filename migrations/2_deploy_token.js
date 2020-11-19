let KeyfiToken = artifacts.require('KeyfiToken.sol')
let account = '0x9F90B22a2541D9Bf62B4f53A112EF297DB98Def7'
let minter = '0x9F90B22a2541D9Bf62B4f53A112EF297DB98Def7'
let mintingAllowedAfter = 0

module.exports = async deployer => {
  
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter)
}