const { time, constants } = require('@openzeppelin/test-helpers');
const assertThrows = require("./utils/assertThrows")

const KeyfiToken = artifacts.require('KeyfiToken.sol');
const KeyfiTokenFactory = artifacts.require('KeyfiTokenFactory.sol');
const TokenTimelock = artifacts.require('TokenTimelock.sol')

contract('KeyfiTokenFactory', ([minter, team, community, pool, bob]) => {
  beforeEach(async () => {
    this.factory = await KeyfiTokenFactory.new(team, community, '0', '5000', { from: minter })
  })

  it('should deploy all contracts successfully', async () => {
    let tokenAddress = await this.factory.token()
    assert.notEqual(tokenAddress, constants.ZERO_ADDRESS)
    this.token = await KeyfiToken.at(tokenAddress)
    //assert.equal(await this.token.totalSupply(), '10000000000000000000000000')
  })

  it('should transfer contract ownership correctly', async () => {
    let owner = await this.token.owner()
    assert.equal(owner, community)
  })


  it('should allocate tokens correctly', async () => {
    this.teamTimelockAddress = await this.factory.teamTimelock()
    this.communityTimelockAddress = await this.factory.communityTimelock()

    assert.equal(await this.token.balanceOf(this.teamTimelockAddress), '2500000000000000000000000')
    assert.equal(await this.token.balanceOf(this.communityTimelockAddress), '2500000000000000000000000')
    assert.equal(await this.token.balanceOf(pool), '5000000000000000000000000')
  })  

  it('timelocked tokens should become available after set period', async () => {
    this.teamLock = await TokenTimelock.at(this.teamTimelockAddress)
    this.communityLock = await TokenTimelock.at(this.communityTimelockAddress)
    
    await assertThrows(this.teamLock.release())
    await assertThrows(this.communityLock.release())

    await time.increase(5001);

    await this.teamLock.release()
    await this.communityLock.release()
    assert.equal(await this.token.balanceOf(community), '2500000000000000000000000')
    assert.equal(await this.token.balanceOf(team), '2500000000000000000000000')
    assert.equal(await this.token.balanceOf(this.teamTimelockAddress), '0')
    assert.equal(await this.token.balanceOf(this.communityTimelockAddress), '0')
  })
})