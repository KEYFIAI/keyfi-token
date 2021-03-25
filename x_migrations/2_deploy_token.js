
let KeyfiToken = artifacts.require('KeyfiToken.sol')
let account = '0x2a9aC1Cab57d80e5E3c4574330863d54Ae311C68'
let minter = '0x2a9aC1Cab57d80e5E3c4574330863d54Ae311C68'
let mintingAllowedAfter = 0

module.exports = async deployer => {
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter)
}