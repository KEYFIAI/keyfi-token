const { expectEvent } = require('@openzeppelin/test-helpers');

const assertThrows = require("./utils/assertThrows")

const MockERC20 = artifacts.require('MockERC20')
const KeyfiToken = artifacts.require('KeyfiToken.sol')
const Whitelist = artifacts.require('Whitelist.sol')
const Airdrop = artifacts.require('Airdrop.sol')


contract('Airdrop', ([admin, alice, bob, carol, dave, minter, community]) => {
  let whitelist, keyfi, airdrop

  beforeEach(async () => {
    keyfi = await KeyfiToken.new(minter, minter, 0)
    whitelist = await Whitelist.new()
    airdrop = await Airdrop.new(keyfi.address, whitelist.address, '1000000000000000000000000', { from: admin })
    await keyfi.transfer(airdrop.address, '10000000000000000000000000', { from: minter })
    
    await whitelist.addWhitelisted(alice)
    await whitelist.addWhitelisted(bob)
    await whitelist.addWhitelisted(carol)
  })

  it('should initialize whitelist correctly', async () => {    
    assert.isTrue(await whitelist.isWhitelisted(alice))
    assert.isTrue(await whitelist.isWhitelisted(bob))
    assert.isTrue(await whitelist.isWhitelisted(carol))
    assert.isFalse(await whitelist.isWhitelisted(dave))
  })

  it('should calculate remaining airdrops correctly', async () => {
    let remaining = await airdrop.airdropsLeft()
    assert.equal(remaining, 10)
  })

  it('should airdrop correctly', async () => {
    await assertThrows(airdrop.claim({ from: dave }))

    let tx = await airdrop.claim({ from: alice })
    let airdropAmount = Number(await airdrop.airdropAmount())
    let aliceBalance = Number(await keyfi.balanceOf(alice))
    assert.equal(aliceBalance, airdropAmount)
    expectEvent(tx, 'AirdropClaimed')

    await assertThrows(airdrop.claim({ from: alice }))  // shouldn't allow to claim airdrop twice
  })

  it('should allow owner to change airdrop amount', async () => {
    let tx = await airdrop.setAmount('500000000000000000000000', { from: admin } )
    assert.equal(Number(await airdrop.airdropAmount()), '500000000000000000000000')
    expectEvent(tx, 'SetAmount')

    await assertThrows(airdrop.setAmount('999999', { from:bob }))
  })

  it('should allow owner to withdraw tokens', async () => {
    await assertThrows(airdrop.withdrawTokens(1, { from: carol }))
    let tx = await airdrop.withdrawTokens('2000000000000000000000000', { from: admin })
    assert.equal(Number(await keyfi.balanceOf(admin)), '2000000000000000000000000')
    expectEvent(tx, 'TokensWithdrawn')
  })
})
