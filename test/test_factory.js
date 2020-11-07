const { expectRevert, time } = require('@openzeppelin/test-helpers');

const RewardPool = artifacts.require('./RewardPool.sol');
const MockERC20 = artifacts.require('MockERC20');
const KeyfiToken = artifacts.require('KeyfiToken.sol');
const KeyfiTokenFactory = artifacts.require('KeyfiTokenFactory.sol');

contract('KeyfiTokenFactory', ([minter, team, community, bob]) => {
  beforeEach(async () => {
    this.factory = await KeyfiTokenFactory.new(team, community, 0);
  });

  it('should deploy all contracts successfully', async () => {
    // ????
  });

  it('should transfer contract ownership correctly', async () => {
    
  })

  it('should allocate tokens correctly', async () => {

  })  
});