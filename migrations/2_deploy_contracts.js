let RewardPool = artifacts.require('RewardPool.sol')
let rewardPerBlock = "24000000000000000000" // 1.5 tokens per block
let ropstenToken = '0xe8348b237dee32a8e087932cde1786983d91a6e6'

module.exports = async deployer => {
	return deployer.deploy(RewardPool, ropstenToken, rewardPerBlock, 0, 0)
}