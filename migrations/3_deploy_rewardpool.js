let RewardPool = artifacts.require('RewardPool.sol')
let rewardPerBlock = "700000000000000000" // 0.7 tokens per block
let tokenAddress = '0x5D1983AD408e65b9D0Ed182bA2FE7A4D1b13da2b'

module.exports = async deployer => {
  
  return deployer.deploy(RewardPool, tokenAddress, rewardPerBlock, 0, 0, 2)
}