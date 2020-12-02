const { expectEvent } = require('@openzeppelin/test-helpers');

const assertThrows = require("./utils/assertThrows")

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

  it('should allow users to withdraw remaining tokens after airdrop amount was increased', async () => { 
    let initialAirdropAmount = '1'
    let finalAirdropAmount = '10'
    let remainingAirdropAmount = (Number(finalAirdropAmount) - Number(initialAirdropAmount)).toString()

    // Admin sets an initial airdrop value of 1
    await airdrop.setAmount(initialAirdropAmount, { from: admin })
    
    // Alice claims the airdrop
    let txFirstClaim = await airdrop.claim({ from: alice })
    expectEvent(txFirstClaim, 'AirdropClaimed', {recipient: alice, amount: initialAirdropAmount})
    assert.equal(Number(await keyfi.balanceOf(alice)), initialAirdropAmount)

    // Admin increases airdrop amount
    await airdrop.setAmount(finalAirdropAmount, { from: admin })

    // Alice claims the remaining tokens up to the total
    let txSecondClaim = await airdrop.claim({ from: alice })
    expectEvent(txSecondClaim, 'AirdropClaimed', { recipient: alice, amount: remainingAirdropAmount })
    assert.equal(Number(await keyfi.balanceOf(alice)), finalAirdropAmount)    
  })

  it('should allow owner to withdraw tokens', async () => {
    await assertThrows(airdrop.withdrawTokens(1, { from: carol }))
    let tx = await airdrop.withdrawTokens('2000000000000000000000000', { from: admin })
    assert.equal(Number(await keyfi.balanceOf(admin)), '2000000000000000000000000')
    expectEvent(tx, 'TokensWithdrawn')
  })
})
