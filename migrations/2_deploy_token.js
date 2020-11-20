let KeyfiToken = artifacts.require('KeyfiToken.sol')
let account = '0xFdb6ac6750690D9c46d038f2536eC995D9d3D6d8'
let minter = '0x856bcd7F92436F749Af98DE309785A42F747B79a'
let mintingAllowedAfter = 0

module.exports = async deployer => {
  
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter)
}