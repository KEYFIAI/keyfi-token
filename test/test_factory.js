const { time, constants } = require('@openzeppelin/test-helpers');
const assertThrows = require("./utils/assertThrows")

const KeyfiToken = artifacts.require('KeyfiToken.sol');
const RewardPool = artifacts.require('RewardPool.sol');
const KeyfiTokenFactory = artifacts.require('KeyfiTokenFactory.sol');
const TokenTimelock = artifacts.require('TokenTimelock.sol')

contract('KeyfiTokenFactory', ([minter, team, community, pool, airdrop, bob]) => {
  before(async () => {
    //this.factory = await KeyfiTokenFactory.new(team, community, airdrop, { from: minter })
    /*let tokenAddress = await this.factory.token()
    assert.notEqual(tokenAddress, constants.ZERO_ADDRESS)
    this.token = await KeyfiToken.at(tokenAddress)
    assert.equal(await this.token.totalSupply(), '10000000000000000000000000')  
    
    //time.advanceBlock()

    await this.factory.deployRewardPool()
    let poolAddress = await this.factory.pool()
    this.pool = await RewardPool.at(poolAddress)
    assert.notEqual(poolAddress, constants.ZERO_ADDRESS)
    assert.equal(await this.token.balanceOf(poolAddress), '6250000000000000000000000')  */
  })

  /*it('should transfer contract ownership correctly', async () => {
    let owner1 = await this.token.owner()
    let owner2 = await this.pool.owner()
    //console.log(owner2)
    assert.equal(owner1, community)
    assert.equal(owner2, community)
  })


  it('should allocate tokens correctly', async () => {
    this.teamTimelockAddress1 = await this.factory.teamTimelock1()
    this.teamTimelockAddress2 = await this.factory.teamTimelock2()
    this.teamTimelockAddress3 = await this.factory.teamTimelock3()
    this.teamTimelockAddress4 = await this.factory.teamTimelock4()

    assert.equal(await this.token.balanceOf(this.teamTimelockAddress1), '400000000000000000000000')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress2), '400000000000000000000000')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress3), '400000000000000000000000')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress4), '400000000000000000000000')
    assert.equal(await this.token.balanceOf(team), '400000000000000000000000')
    assert.equal(await this.token.balanceOf(this.pool.address), '6250000000000000000000000')
  })  

  it('timelocked tokens should become available after set period', async () => {
    this.teamLock1 = await TokenTimelock.at(this.teamTimelockAddress1)
    this.teamLock2 = await TokenTimelock.at(this.teamTimelockAddress2)
    this.teamLock3 = await TokenTimelock.at(this.teamTimelockAddress3)
    this.teamLock4 = await TokenTimelock.at(this.teamTimelockAddress4)
    
    await assertThrows(this.teamLock1.release())
    await time.increase(7776000);
    await this.teamLock1.release()

    await assertThrows(this.teamLock2.release())
    await time.increase(7776000);
    await this.teamLock2.release()

    await assertThrows(this.teamLock3.release())
    await time.increase(7776000);
    await this.teamLock3.release()

    await assertThrows(this.teamLock4.release())
    await time.increase(7776000);
    await this.teamLock4.release()

    assert.equal(await this.token.balanceOf(team), '2000000000000000000000000')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress1), '0')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress2), '0')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress3), '0')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress4), '0')
  })/**/
})