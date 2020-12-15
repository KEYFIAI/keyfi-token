const fs = require('fs')

const KEYtokenAddress = '0x4CC19356f2D37338b9802aa8E8fc58B0373296E7'
const KEYtokenABI = JSON.parse(fs.readFileSync('../build/contracts/IERC20.json')).abi
const KEYtoken = new web3.eth.Contract(KEYtokenABI, KEYtokenAddress)

const LPtokenAddress = '0xb99c23A9A444eBeb0cE4a67F27DAB8D4826B1108'
const LPtokenABI = JSON.parse(fs.readFileSync('../build/contracts/IERC20.json')).abi
const LPtoken = new web3.eth.Contract(LPtokenABI, LPtokenAddress)

const stakingAddress = '0x087B5469CFf15Ad8Cdb433500a527BD45b65cDe7'
const stakingABI = JSON.parse(fs.readFileSync('../build/contracts/RewardPool.json')).abi
const staking = new web3.eth.Contract(stakingABI, stakingAddress)

// staking parameters
const KEYweight = 0.2
const LPweight = 0.8
const multiplier = 3
const bonusEndBlock = 11608562

function getMultiplier(from, to) {
  if (to <= bonusEndBlock) {
    return (to - from) * multiplier
  } else if (from >= bonusEndBlock) {
    return to - from;
  } else {
    return (bonusEndBlock - from) * multiplier + (to - bonusEndBlock)
  }
}

module.exports = async function(callback) {
  console.log('starting calculation')

  // Network & contract status
  let bpd = 6484    // average block per day estimation
  let totalKEYstake = await KEYtoken.methods.balanceOf(stakingAddress).call()
  let totalLPstake = await LPtoken.methods.balanceOf(stakingAddress).call()
  let currentBlock = await web3.eth.getBlockNumber()

  /*console.log("current block = " + currentBlock)
  console.log("Total KEY balance: " + totalKEYstake)
  console.log("Total LP balance: " + totalLPstake)*/

  /**
   * Reward estimation for arbitrary period and stake amounts
   */
  // User inputs (estimates rewards for arbitrary period and stake amounts)
  let days = 30                                 // <-------------- USER INPUT
  let userKEYstake = web3.utils.toWei('1000000') // <-------------- USER INPUT
  let userLPstake = web3.utils.toWei('0.0')     // <-------------- USER INPUT
  
  let period = days * bpd // Estimated blocks in given (days) period
  let periodEnd = currentBlock + period

  // reward calculation for unstaked tokens
  let rewardKEY = (userKEYstake / (totalKEYstake + userKEYstake)) * KEYweight * getMultiplier(currentBlock, periodEnd)
  let rewardLP = (userLPstake / (totalLPstake + userLPstake)) * LPweight * getMultiplier(currentBlock, periodEnd)
  output = rewardKEY + rewardLP
  console.log('estimated reward for given period = ' + output + ' KEYFI')
  /**/
  /**
   * Reward rate calculation for current user stake balance
   */
  let userAddress = '0xc4b57BB0d322F06f20669f3aE09028464942d8FB'

  let userKEYbalance = await staking.methods.getBalance(KEYtokenAddress).call({ from: userAddress })
  let userLPbalance = await staking.methods.getBalance(LPtokenAddress).call({ from: userAddress })
  console.log("my KEY balance = " + userKEYbalance)
  console.log("my LP balance = " + userLPbalance)
  let rewardKEYblock = (userKEYbalance / totalKEYstake) * KEYweight * getMultiplier(currentBlock, currentBlock + 1)
  let rewardLPblock = (userLPbalance / totalLPstake) * LPweight * getMultiplier(currentBlock, currentBlock + 1)

  userRate = rewardKEYblock + rewardLPblock
  console.log('current reward rate (KEYFI per block) for user = ' + userRate)
  console.log('estimated reward for ' + days + ' days according to user stake = ' + userRate * getMultiplier(currentBlock, periodEnd))
  /**/

  console.log('DONE')
  callback()
}

