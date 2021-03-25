let RewardPool = artifacts.require('RewardPool.sol')
let rewardPerBlock = "5000000000000000" // 0.005 tokens per block
let tokenAddress = '0x7C63008B7ed8534215Ff942826499BAcDd18D729'
let startBlock = 0
let endBonus = 0
let multiplier = 3
let launchDate = 7395627

module.exports = async deployer => {
  
  return deployer.deploy(RewardPool, tokenAddress, rewardPerBlock, startBlock, endBonus, multiplier, launchDate)
}