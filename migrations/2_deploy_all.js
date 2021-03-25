let KeyfiToken = artifacts.require('KeyfiToken.sol')
let RewardPool = artifacts.require('RewardPool.sol')

let account = '0xEFcE31c1f23422a21fdE99f65bB091601eE54Fd6'
let minter =  '0x0000000000000000000000000000000000000000'

// BSC Config
let mintingAllowedAfter = 22960000    // 18 months?
let startBlock = 0
let bonusEndBlock = 7787627   // approx 2 weeks after start

let multiplier = 3

let rewardPerBlock = "100000000000000000" // 0.01 tokens per block
let launchDate = 7395627

// ETH v2 Config

// let mintingAllowedAfter = 22960000    // 18 months?
// let startBlock = 0
// let bonusEndBlock = 7787627   // approx 2 weeks after start

// let multiplier = 3

// let rewardPerBlock = "50000000000000000" // 0.05 tokens per block
// let launchDate = 7395627

module.exports = async deployer => {
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter).then( () => {
    	return deployer.deploy(RewardPool, KeyfiToken.address, rewardPerBlock, startBlock, bonusEndBlock, multiplier, launchDate)
	})
}
