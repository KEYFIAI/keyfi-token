let RewardPool = artifacts.require('RewardPool.sol')
let rewardPerBlock = "700000000000000000" // 0.7 tokens per block
let tokenAddress = '0xe3C64a8c516B393e8805Bcc8713189DC3B00e153'
let whitelist = '0xa40fC5a9232868B0b681B9C34F3081be32368ad3'

module.exports = async deployer => {
  
  return deployer.deploy(RewardPool, tokenAddress, rewardPerBlock, 0, 0, 2, whitelist)
}