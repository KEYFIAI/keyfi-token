const { expectEvent } = require('@openzeppelin/test-helpers');

const assertThrows = require("./utils/assertThrows")

const KeyfiToken = artifacts.require('KeyfiToken.sol')



contract('KeyfiToken', ([admin, alice, bobTheBurner, dave, minter, someone]) => {
  let keyfi

  before(async () => {
    keyfi = await KeyfiToken.new(admin, admin, 0)
    await keyfi.transfer(alice, '5000000000000000000000000', { from: admin })
  })

  it('should allow owner to change governable parameters', async () => {    
    await keyfi.setMinter(minter, { from: admin })
    assert.equal(await keyfi.minter(), minter)
    
    await keyfi.setMintCap(3, { from: admin })
    assert.equal(await keyfi.mintCap(), 3)
    
    await keyfi.setMinimumMintGap(0, { from: admin })
    assert.equal(await keyfi.minimumMintGap(), 0)
  })

  it('should allow minter to mint new tokens', async () => {
    assert.equal(await keyfi.minter(), minter)
    await assertThrows(keyfi.mint(someone, '500000000000000000000000', { from: minter })) //shouldn't mint above cap
    await assertThrows(keyfi.mint(someone, '300000000000000000000000', { from: someone }))  // only minter can mint
    await keyfi.mint(someone, '300000000000000000000000', { from: minter })
    assert.equal(await keyfi.totalSupply(), '10300000000000000000000000')
  })

  /*** Insert vote delegation tests */

  it('should be able to delegate votes', async () => {
    await keyfi.delegate(dave, { from: alice })
    let balance = await keyfi.balanceOf(alice)
    let votes = await keyfi.getCurrentVotes(dave)
    assert.equal(Number(balance), Number(votes))
  })

  it('should allow token holders to burn', async () => {
    await keyfi.burn('5000000000000000000000000', { from: admin })
    assert.equal(await keyfi.totalSupply(), '5300000000000000000000000')
  })

  it('should allow approved addresses to burnFrom', async () => {
    await keyfi.approve(bobTheBurner, '99999999999999999', { from: alice })
    await keyfi.burnFrom(alice, 1, { from: bobTheBurner })
    assert.equal(await keyfi.totalSupply(), '5299999999999999999999999')
    assert.equal(await keyfi.balanceOf(alice), '4999999999999999999999999')
  })
})

