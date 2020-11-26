let KeyfiToken = artifacts.require('KeyfiToken.sol')
let RewardPool = artifacts.require('RewardPool.sol')

let whitelist = '0xa40fC5a9232868B0b681B9C34F3081be32368ad3'

let account = '0xEFcE31c1f23422a21fdE99f65bB091601eE54Fd6'
let minter = '0xEFcE31c1f23422a21fdE99f65bB091601eE54Fd6'
let mintingAllowedAfter = 0

let rewardPerBlock = "700000000000000000" // 0.7 tokens per block


module.exports = async deployer => {
  
	deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter).then( () => {
		return deployer.deploy(RewardPool, KeyfiToken.address, rewardPerBlock, 0, 0, 2, whitelist)
	})
}
