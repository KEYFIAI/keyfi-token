const { time } = require('@openzeppelin/test-helpers');
const assertThrows = require("./utils/assertThrows")

const KeyfiToken = artifacts.require('KeyfiToken.sol');
const TreasuryVester = artifacts.require('TreasuryVester.sol');

const day = 86400
const year = day * 365

contract('TreasuryVester', ([minter, team, recipient]) => {
  let keyfi, vesting
  let begin, cliff, end
  let amount = web3.utils.toWei('958333')

  before(async () => {
    keyfi = await KeyfiToken.new(minter, minter, 0, { from: minter });  
    begin = Number(await time.latest()) + 30
    cliff = begin + (day * 30)
    end = begin + (year * 2)
    console.log("amount = " + amount)
    vesting = await TreasuryVester.new(keyfi.address, team, amount, begin, cliff, end)
    await keyfi.transfer(vesting.address, amount, { from: minter })
  });

  it('should initialize treasury contract correctly', async () => {
    let token = await vesting.keyfi()
    let recipient = await vesting.recipient()
    let vestingAmount = await vesting.vestingAmount()
    let vestingBegin = await vesting.vestingBegin()
    let vestingCliff = await vesting.vestingCliff()
    let vestingEnd = await vesting.vestingEnd()
    let lastUpdate = await vesting.lastUpdate()
    assert.equal(token, keyfi.address)
    assert.equal(recipient, team)
    assert.equal(vestingAmount, amount)
    assert.equal(Number(vestingBegin), Number(lastUpdate))
    assert.equal(Number(vestingCliff), Number(cliff))
    assert.equal(Number(vestingEnd), Number(end))
  })

  it('allows recipient address to change to a new address', async () => {
    await assertThrows(vesting.setRecipient(recipient, { from: minter }))
    await vesting.setRecipient(recipient, { from: team })
    assert.equal(await vesting.recipient(), recipient)
  })

  it('allows claiming vested tokens', async () => {
    await assertThrows(vesting.claim())   // cannot claim before cliff
    assert.equal(await vesting.recipient(), recipient)
    time.increaseTo(cliff)
    let tx = await vesting.claim()

    time.increase(year)
    tx = await vesting.claim()
    console.log("recipient balance after 1 year = " + web3.utils.fromWei(await keyfi.balanceOf(recipient)))
    
    time.increase(year)
    tx = await vesting.claim()
    // recipient was able to claim all the treasury tokens after 2 years
    assert.equal(Number(await keyfi.balanceOf(recipient)), amount)
  })
});