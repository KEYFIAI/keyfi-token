const { expectRevert, time } = require('@openzeppelin/test-helpers');

const MockERC20 = artifacts.require('MockERC20');
const KeyfiToken = artifacts.require('KeyfiToken.sol');
const TreasuryVester = artifacts.require('TreasuryVester.sol');

const day = 86400
const year = day * 365

contract('RewardPool', ([alice, bob, carol, minter, team]) => {
  beforeEach(async () => {
    let amount = '1437000000000000000000000'
    this.keyfi = await KeyfiToken.new(minter, minter, 0, { from: minter });
    this.vesting = await TreasuryVester.new(this.keyfi.address, team, amount, 1, day * 30, year * 2)
    await this.keyfi.transfer(this.vesting.address, amount, { from: minter })
  });

  it('should initialize treasury contract correctly', async () => {
    let token = await this.vesting.keyfi()
    let recipient = await this.vesting.recipient()
    let vestingAmount = await this.vesting.vestingAmount()
    let vestingBegin = await this.vesting.vestingBegin()
    let vestingCliff = await this.vesting.vestingCliff()
    let vestingEnd = await this.vesting.vestingEnd()
    console.log("last update = " + await this.vesting.lastUpdate())
  })
});