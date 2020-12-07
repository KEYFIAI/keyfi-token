const { expectEvent, time, constants } = require('@openzeppelin/test-helpers');
const assertThrows = require("./utils/assertThrows")

const KeyfiToken = artifacts.require('KeyfiToken.sol')
const TreasuryVester = artifacts.require('TreasuryVester.sol');
const RewardPool = artifacts.require('RewardPool.sol');
const Whitelist = artifacts.require('Whitelist.sol')

const day = 86400
const year = day * 365

contract('KeyFi contracts', (accounts) => {
  const [
    admin, 
    teamWallet, 
    treasuryWallet, 
    rewardsWallet, 
    whitelisted1, 
    whitelisted2, 
    whitelistAdmin, 
    allocator] = accounts.slice(0)

  let keyfi, staking, whitelist, teamVesting, treasuryVesting

  const day = 86400
  const year = day * 365

  const launchDate = 1607428800
  
  const mintingAllowedAfter = 1654689600    // 06/08/2022 @ 12:00pm (UTC)
  const rewardPerBlock = web3.utils.toWei('1')  // 1 token per block
  const startBlock = 11412110
  const bonusEndBlock = startBlock + 193680   // approx 1 month after start
  const multiplier = 3
  
  const teamVestingAmount = web3.utils.toWei('958333')
  const treasuryVestingAmount = web3.utils.toWei('958333')
  const vestingBegin = launchDate
  const vestingCliff = vestingBegin
  const vestingEnd = vestingBegin + (year * 2)

  const initialRewardPoolAmount = web3.utils.toWei('2000000')
  const totalRewards = web3.utils.toWei('8000000')


  before(async () => {
    whitelist = await Whitelist.new({from: admin})
    await whitelist.addWhitelistAdmin(whitelistAdmin, { from: admin })
    await whitelist.addWhitelisted(whitelisted1, {from: whitelistAdmin})
    await whitelist.addWhitelisted(whitelisted2, {from: whitelistAdmin})

    keyfi = await KeyfiToken.new(allocator, constants.ZERO_ADDRESS, mintingAllowedAfter)
    staking = await RewardPool.new(
      keyfi.address, 
      rewardPerBlock, 
      startBlock, 
      bonusEndBlock, 
      multiplier,
      whitelist.address
    )
    teamVesting = await TreasuryVester.new(
      keyfi.address, 
      teamWallet, 
      teamVestingAmount, 
      vestingBegin, 
      vestingCliff, 
      vestingEnd
    )
    treasuryVesting = await TreasuryVester.new(
      keyfi.address, 
      treasuryWallet, 
      treasuryVestingAmount, 
      vestingBegin, 
      vestingCliff, 
      vestingEnd
    )
  })

  it('sets KEY staking properly', async () => {
    //await staking.set
  })

  /*it('deploys everything right', async () => {

  })*/

  it('initial token allocation is correct', async () => {
    await keyfi.transfer(staking.address, initialRewardPoolAmount, { from: allocator })
    await keyfi.transfer(rewardsWallet, web3.utils.toWei('6000000'), { from: allocator })
    await keyfi.transfer(teamVesting.address, teamVestingAmount, { from: allocator })
    await keyfi.transfer(treasuryVesting.address, treasuryVestingAmount, { from: allocator })
    await keyfi.transfer(teamWallet, web3.utils.toWei('41667'))
    await keyfi.transfer(treasuryWallet, web3.utils.toWei('41667'))
    assert.equal(await keyfi.balanceOf(staking.address), initialRewardPoolAmount)
  })
})

