const { time } = require('@openzeppelin/test-helpers');
const assertThrows = require("./utils/assertThrows")

const RewardPool = artifacts.require('./RewardPool.sol');
const MockERC20 = artifacts.require('MockERC20');
const KeyfiToken = artifacts.require('KeyfiToken.sol');
const Whitelist = artifacts.require('Whitelist.sol');

const day = 86400
const year = day * 365

contract('RewardPool', ([alice, bob, carol, minter, community]) => {
  beforeEach(async () => {
    this.keyfi = await KeyfiToken.new(minter, minter, 0, { from: community });
    //this.whitelist = await Whitelist.new();
    //await this.whitelist.addWhitelisted(bob);
    //await this.whitelist.addWhitelisted(alice);
    //await this.whitelist.addWhitelisted(carol);
  });

  it('should set correct state variables', async () => {
    this.staking = await RewardPool.new(this.keyfi.address, '1000', '0', '1000', 10, 0, { from: alice });
    const keyfi = await this.staking.rewardToken();
    const owner = await this.keyfi.owner();
    const tokenMinter = await this.keyfi.minter();
    assert.equal(keyfi.valueOf(), this.keyfi.address);
    assert.equal(owner.valueOf(), community);
    assert.equal(tokenMinter.valueOf(), minter);
  });

  context('With ERC/LP token added to the field', () => {
    beforeEach(async () => {
      this.lp = await MockERC20.new('LPToken', 'LP', '10000000000', { from: minter });
      await this.lp.transfer(alice, '100000', { from: minter });
      await this.lp.transfer(bob, '100000', { from: minter });
      await this.lp.transfer(carol, '100000', { from: minter });
      this.lp2 = await MockERC20.new('LPToken2', 'LP2', '10000000000', { from: minter });
      await this.lp2.transfer(alice, '100000', { from: minter });
      await this.lp2.transfer(bob, '100000', { from: minter });
      await this.lp2.transfer(carol, '100000', { from: minter });
    });

    it('should allow emergency withdraw', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      this.staking = await RewardPool.new(this.keyfi.address, '100', '100', '1000', 10, 0, { from: alice });
      await this.staking.addStakingToken('100', this.lp.address, '0');
      await this.lp.approve(this.staking.address, '1000', { from: bob });
      this.staking.deposit(this.lp.address, '100', { from: bob });
      assert.equal((await this.lp.balanceOf(bob)).valueOf(), '99900');
      await this.staking.emergencyWithdraw(this.lp.address, { from: bob });
      assert.equal((await this.lp.balanceOf(bob)).valueOf(), '100000');
    });

    it('should give out rewards only after farming time', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      let now = await time.latest()
      let launch = Number(now) + (day * 3)

      this.staking = await RewardPool.new(this.keyfi.address, '100', '100', '1000', 10, launch, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.staking.addStakingToken('100', this.lp.address, '0');
      await this.lp.approve(this.staking.address, '1000', { from: bob });
      
      await assertThrows(this.staking.deposit(this.lp.address, '100', { from: bob }));  // deposits not enabled yet
      await time.increaseTo(launch)
      await this.staking.deposit(this.lp.address, '100', { from: bob })
      await time.advanceBlockTo('89');
      await this.staking.deposit(this.lp.address, '0', { from: bob }); // block 90
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '0');
      await time.advanceBlockTo('94');
      await this.staking.deposit(this.lp.address, '0', { from: bob }); // block 95
      
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '0');
      await time.advanceBlockTo('99');
      await this.staking.deposit(this.lp.address, '0', { from: bob }); // block 100
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '0');
      await time.advanceBlockTo('100');
      await this.staking.deposit(this.lp.address, '0', { from: bob }); // block 101
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '1000');
      await time.advanceBlockTo('104');
      await this.staking.deposit(this.lp.address, '0', { from: bob }); // block 105
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '5000');
    });

    it('should allow launch time after start block without errors', async () => {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      let now = await time.latest()
      let launch = Number(now) + (day * 3)

      this.staking = await RewardPool.new(this.keyfi.address, '100', '0', '1000', 10, launch, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.staking.addStakingToken('100', this.lp.address, '0');
      await this.lp.approve(this.staking.address, '1000', { from: bob });
      
      await assertThrows(this.staking.deposit(this.lp.address, '100', { from: bob }));  // deposits not enabled yet
      await time.increaseTo(launch)
      await this.staking.deposit(this.lp.address, '100', { from: bob })
      await this.staking.deposit(this.lp.address, '0', { from: bob });
  
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '1000');
      await time.advanceBlock();
      await time.advanceBlock();
      await time.advanceBlock();
      await this.staking.deposit(this.lp.address, '0', { from: bob }); // block 105
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '5000');
    });

    it('should not distribute rewards if no one deposit', async () => {
      // 100 per block farming rate starting at block 200 with bonus until block 1000
      this.staking = await RewardPool.new(this.keyfi.address, '100', '200', '1000', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.staking.addStakingToken('100', this.lp.address, '0');
      await this.lp.approve(this.staking.address, '1000', { from: bob });
      await time.advanceBlockTo('199');
      await time.advanceBlockTo('204');
      await time.advanceBlockTo('209');
      await this.staking.deposit(this.lp.address, '10', { from: bob }); // block 210

      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '0');
      assert.equal((await this.lp.balanceOf(bob)).valueOf(), '99990');
      await time.advanceBlockTo('219');
      await this.staking.withdraw(this.lp.address, '10', { from: bob }); // block 220
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '10000');
      assert.equal((await this.lp.balanceOf(bob)).valueOf(), '100000');
    });

    it('should distribute rewards properly for each staker', async () => {
      // 100 per block farming rate starting at block 300 with bonus until block 1000
      this.staking = await RewardPool.new(this.keyfi.address, '100', '300', '1000', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.staking.addStakingToken('100', this.lp.address, '0');
      //await this.staking.addStakingToken('50', this.keyfi.address);
      await this.lp.approve(this.staking.address, '1000', { from: alice });
      await this.lp.approve(this.staking.address, '1000', { from: bob });
      await this.lp.approve(this.staking.address, '1000', { from: carol });
      // Alice deposits 10 LPs at block 310
      await time.advanceBlockTo('309');
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      // Bob deposits 20 LPs at block 314
      await time.advanceBlockTo('313');
      await this.staking.deposit(this.lp.address, '20', { from: bob });
      // Carol deposits 30 LPs at block 318
      await time.advanceBlockTo('317');
      await this.staking.deposit(this.lp.address, '30', { from: carol });
      // Alice deposits 10 more LPs at block 320. At this point:
      //   Alice should have: 4*1000 + 4*1/3*1000 + 2*1/6*1000 = 5666
      //   Staking contract should have the remaining: 10000 - 5666 = 4334
      await time.advanceBlockTo('319')
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      
      assert.equal((await this.keyfi.balanceOf(alice)).valueOf(), '5666');
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '0');
      assert.equal((await this.keyfi.balanceOf(carol)).valueOf(), '0');
      
      // Bob withdraws 5 LPs at block 330. At this point:
      //   Bob should have: 4*2/3*1000 + 2*2/6*1000 + 10*2/7*1000 = 6190
      await time.advanceBlockTo('329')
      await this.staking.withdraw(this.lp.address, '5', { from: bob });
      assert.equal((await this.keyfi.balanceOf(alice)).valueOf(), '5666');
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '6190');
      assert.equal((await this.keyfi.balanceOf(carol)).valueOf(), '0');
      
      // Alice withdraws 20 LPs at block 340.
      // Bob withdraws 15 LPs at block 350.
      // Carol withdraws 30 LPs at block 360.
      await time.advanceBlockTo('339')
      await this.staking.withdraw(this.lp.address, '20', { from: alice });
      await time.advanceBlockTo('349')
      await this.staking.withdraw(this.lp.address, '15', { from: bob });
      await time.advanceBlockTo('359')
      await this.staking.withdraw(this.lp.address, '30', { from: carol });
    
      // Alice should have: 5666 + 10*2/7*1000 + 10*2/6.5*1000 = 11600
      assert.equal((await this.keyfi.balanceOf(alice)).valueOf(), '11600');
      // Bob should have: 6190 + 10*1.5/6.5 * 1000 + 10*1.5/4.5*1000 = 11831
      assert.equal((await this.keyfi.balanceOf(bob)).valueOf(), '11831');
      // Carol should have: 2*3/6*1000 + 10*3/7*1000 + 10*3/6.5*1000 + 10*3/4.5*1000 + 10*1000 = 26568
      assert.equal((await this.keyfi.balanceOf(carol)).valueOf(), '26568');
      // All of them should have 100000 LPs back.
      assert.equal((await this.lp.balanceOf(alice)).valueOf(), '100000');
      assert.equal((await this.lp.balanceOf(bob)).valueOf(), '100000');
      assert.equal((await this.lp.balanceOf(carol)).valueOf(), '100000');
    });

    it('should give proper reward allocation to each pool', async () => {
      // 100 per block farming rate starting at block 400 with bonus until block 1000
      this.staking = await RewardPool.new(this.keyfi.address, '100', '400', '1000', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.lp.approve(this.staking.address, '1000', { from: alice });
      await this.lp2.approve(this.staking.address, '1000', { from: bob });
      // Add first LP to the pool with allocation 1
      await this.staking.addStakingToken('10', this.lp.address, '0');
      // Alice deposits 10 LPs at block 410
      await time.advanceBlockTo('409');
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      // Add LP2 to the pool with allocation 2 at block 420
      await time.advanceBlockTo('419');
      await this.staking.addStakingToken('20', this.lp2.address, '0');
      // Alice should have 10*1000 pending reward
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '10000');
      // Bob deposits 10 LP2s at block 425
      await time.advanceBlockTo('424');
      await this.staking.deposit(this.lp2.address, '5', { from: bob });
      // Alice should have 10000 + 5*1/3*1000 = 11666 pending reward
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '11666');
      await time.advanceBlockTo('430');
      // At block 430. Bob should get 5*2/3*1000 = 3333. Alice should get ~1666 more.
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '13333');
      assert.equal((await this.staking.pendingReward(this.lp2.address, bob)).valueOf(), '3333');
    });


    it('should deduct deposit fees correctly', async () => {
      // 100 per block farming rate starting at block 500 with bonus until block 1000
      this.staking = await RewardPool.new(this.keyfi.address, '100', '400', '1000', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      //await this.lp.approve(this.staking.address, '10000', { from: alice });
      await this.lp2.approve(this.staking.address, '10000', { from: bob });

      // Add token with 300 fee BPs = 0.03%
      await this.staking.addStakingToken('20', this.lp2.address, '300');
      await this.staking.deposit(this.lp2.address, '5000', { from: bob });
      
      // Bob should have 5000 - 5000 * 0.03 = 4850
      assert.equal(await this.staking.getBalance(this.lp2.address, { from: bob }), '4850')
    });

    it('should give proper reward allocation for KEYFI staking', async () => {
      // 100 per block farming rate starting at block 500 with bonus until block 1000
      this.staking = await RewardPool.new(this.keyfi.address, '100', '500', '1000', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.keyfi.transfer(bob, "5000000", { from: minter })
      await this.lp.approve(this.staking.address, '1000', { from: alice });
      await this.keyfi.approve(this.staking.address, '5000000', { from: bob });

      // Add first LP to the pool with allocation 1
      await this.staking.addStakingToken('10', this.lp.address, '0');
      // Alice deposits 10 LPs at block 510
      await time.advanceBlockTo('509');
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      // Add LP2 to the pool with allocation 2 at block 520
      await time.advanceBlockTo('519');
      await this.staking.addStakingToken('20', this.keyfi.address, '0');
      // Alice should have 10*1000 pending reward
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '10000');
      // Bob deposits 10 LP2s at block 425
      await time.advanceBlockTo('524');
      await this.staking.deposit(this.keyfi.address, '5000000', { from: bob });
      // Alice should have 10000 + 5*1/3*1000 = 11666 pending reward
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '11666');
      await time.advanceBlockTo('530');
      // At block 530. Bob should get 5*2/3*1000 = 3333. Alice should get ~1666 more.
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '13333');
      assert.equal((await this.staking.pendingReward(this.keyfi.address, bob)).valueOf(), '3333');
    });

    it('should stop giving bonus rewards after the bonus period ends', async () => {
      // 100 per block farming rate starting at block 500 with bonus until block 600
      this.staking = await RewardPool.new(this.keyfi.address, '100', '500', '600', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.lp.approve(this.staking.address, '1000', { from: alice });
      await this.staking.addStakingToken('1', this.lp.address, '0');
      // Alice deposits 10 LPs at block 590
      await time.advanceBlockTo('589');
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      // At block 605, she should have 1000*10 + 100*5 = 10500 pending.
      await time.advanceBlockTo('605');
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '10500');
      // At block 606, Alice withdraws all pending rewards and should get 10600.
      await this.staking.deposit(this.lp.address, '0', { from: alice });
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '0');
      assert.equal((await this.keyfi.balanceOf(alice)).valueOf(), '10600');
    });

    it('should allow setting allocpoint = 0 for disabling a staking token', async () => {
      this.staking = await RewardPool.new(this.keyfi.address, '100', '500', '600', 10, 0,  { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.lp.approve(this.staking.address, '1000', { from: alice });
      await this.staking.addStakingToken('1', this.lp.address, '0');
      
      await time.advanceBlockTo('700');
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      
      await time.advanceBlockTo('703');
      await this.staking.setAllocPoint(this.lp.address, '0', '0')
      let pending1 = await this.staking.pendingReward(this.lp.address, alice)
      await time.advanceBlockTo('715');
      let pending2 = await this.staking.pendingReward(this.lp.address, alice)
      assert.equal(Number(pending1), Number(pending2))

      let balance1 = await this.keyfi.balanceOf(alice)
      await this.staking.deposit(this.lp.address, 0, { from: alice });
      let balance2 = await this.keyfi.balanceOf(alice)
      assert.isAbove(Number(balance2), Number(balance1))
      
      await time.advanceBlockTo('750')
      await this.staking.deposit(this.lp.address, 0, { from: alice });
      let balance3 = await this.keyfi.balanceOf(alice)
      assert.equal(Number(balance2), Number(balance3))
    })

    it('should allow owner to change rewardPerBlock', async () => {
      this.staking = await RewardPool.new(this.keyfi.address, '100', '400', '5000', 10, 0, { from: alice });
      await this.keyfi.transfer(this.staking.address, "10000000", { from: minter })
      await this.lp.approve(this.staking.address, '1000', { from: alice });
      await this.lp2.approve(this.staking.address, '1000', { from: bob });
      // Add first LP to the pool with allocation 1
      await this.staking.addStakingToken('10', this.lp.address, '0');
      
      await time.advanceBlockTo('809');
      await this.staking.deposit(this.lp.address, '10', { from: alice });
      // Add LP2 to the pool with allocation 2 at block 820
      await time.advanceBlockTo('819');
      await this.staking.addStakingToken('20', this.lp2.address, '0');
      // Alice should have 10*1000 pending reward
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '10000');

      // Owner changes reward rate
      await this.staking.setRewardPerBlock(50, { from: alice })
      assert.equal(await this.staking.rewardPerBlock(), 50)
      
      await time.advanceBlockTo('824');
      await this.staking.deposit(this.lp2.address, '5', { from: bob });
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '10999');
      await time.advanceBlockTo('830');
      assert.equal((await this.staking.pendingReward(this.lp.address, alice)).valueOf(), '11833');
      assert.equal((await this.staking.pendingReward(this.lp2.address, bob)).valueOf(), '1666');

      await assertThrows(this.staking.setRewardPerBlock(100000, { from: bob }))     // only owner can change
    })
  });
});