let KeyfiToken = artifacts.require('KeyfiToken.sol')
let RewardPool = artifacts.require('RewardPool.sol')
let TreasuryVester = artifacts.require('TreasuryVester.sol')

let whitelist = '0xa40fC5a9232868B0b681B9C34F3081be32368ad3'
let account = '0xFdb6ac6750690D9c46d038f2536eC995D9d3D6d8'
let minter = '0xFdb6ac6750690D9c46d038f2536eC995D9d3D6d8'
let mintingAllowedAfter = 1607427900

let rewardPerBlock = web3.utils.toWei('1') //"1000000000000000000" // 1 token per block
//let launchDate = 1607322000
let launchDate = 1607427000

let amount = web3.utils.toWei('958333')
let begin = 9999999999//launchDate 
let cliff = begin
let end = begin + (31536000 * 2)
//let end = 1607428800//begin + 1800

let teamWallet = '0x856bcd7F92436F749Af98DE309785A42F747B79a'
let treasuryWallet = '0xe83E4e869dD693349B0c8F2755EbD46169CA5b75'


module.exports = async deployer => {
	return deployer.deploy(KeyfiToken, account, minter, mintingAllowedAfter).then( () => {
    return deployer.deploy(RewardPool, KeyfiToken.address, rewardPerBlock, 0, 0, 3, launchDate).then(() => {
      return deployer.deploy(TreasuryVester, KeyfiToken.address, teamWallet, amount, begin, cliff, end).then(()=> {
        return deployer.deploy(TreasuryVester, KeyfiToken.address, treasuryWallet, amount, begin, cliff, end)
      })
    })
	})
}
