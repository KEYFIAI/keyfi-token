let RewardPool = artifacts.require('RewardPool.sol')
let rewardPerBlock = "636500000000000000" // 0.6365 tokens per block
let tokenAddress = '0x7C63008B7ed8534215Ff942826499BAcDd18D729'
let whitelist = '0xa40fC5a9232868B0b681B9C34F3081be32368ad3'

module.exports = async deployer => {
  
  return deployer.deploy(RewardPool, tokenAddress, rewardPerBlock, 0, 0, 2, whitelist)
}