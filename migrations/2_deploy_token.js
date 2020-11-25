let KeyfiToken = artifacts.require('KeyfiToken.sol')
let account = '0xFdb6ac6750690D9c46d038f2536eC995D9d3D6d8'
let minter =  '0x0000000000000000000000000000000000000000'
let mintingAllowedAfter = 1669161600

module.exports = async deployer => {
  
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter)
}