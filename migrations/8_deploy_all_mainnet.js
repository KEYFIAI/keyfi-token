let KeyfiToken = artifacts.require('KeyfiToken.sol')
let RewardPool = artifacts.require('RewardPool.sol')
let TreasuryVester = artifacts.require('TreasuryVester.sol')

let whitelist = '0xc3faa8e87cd7b3678fa10c0f9638eb4ba7da20c5'
let account = '0xFdb6ac6750690D9c46d038f2536eC995D9d3D6d8'
let minter =  '0x0000000000000000000000000000000000000000'
let mintingAllowedAfter = 1654689600    // 06/08/2022 @ 12:00pm (UTC)
let startBlock = 0
let bonusEndBlock = 11608562   // approx 1 month after start

let multiplier = 3

let rewardPerBlock = web3.utils.toWei('1') //"1000000000000000000" // 1 token per block
let launchDate = 1607428800

let vestingAmount = web3.utils.toWei('958333')
let begin = launchDate 
let cliff = begin
let end = begin + (31536000 * 2)  // 2 years after launch

let treasuryWallet = '0xa38c6719390cF9E5E05463aC4dAe7FaA6139712f'
let teamWallet = '0xb47dBbe6a44e819D82AAA1Ca97BD9B2f8F45A1a4'

module.exports = async deployer => {
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter).then( () => {
    return deployer.deploy(RewardPool, KeyfiToken.address, rewardPerBlock, startBlock, bonusEndBlock, multiplier, whitelist, launchDate).then(() => {
      return deployer.deploy(TreasuryVester, KeyfiToken.address, teamWallet, vestingAmount, begin, cliff, end).then(()=> {
        return deployer.deploy(TreasuryVester, KeyfiToken.address, treasuryWallet, vestingAmount, begin, cliff, end)
      })
    })
	})
}
