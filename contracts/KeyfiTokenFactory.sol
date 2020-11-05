// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./KeyfiToken.sol";
//import "./MultisigTimelock.sol";
import "./RewardPool.sol";
import "@openzeppelin/contracts/token/ERC20/TokenTimelock.sol";


contract KeyfiTokenFactory {
    using SafeERC20 for KeyfiToken;

    uint256 constant INITIAL_SUPPLY = 10000000;
    uint256 constant REWARD_RATE = 700000000000000000;  // 0.7 per block
    uint256 constant BONUS_BLOCKS = 390000;             // approx. 2 months

    KeyfiToken public token;    
    RewardPool public pool;
    TokenTimelock public teamTimelock;
    TokenTimelock public communityTimelock;

    constructor(
        address owner, 
        address rewardPool, 
        address team, 
        address community,
        uint256 startBlock
    ) 
        public 
    {
        token = new KeyfiToken();
        pool = new RewardPool(token, REWARD_RATE, startBlock, startBlock + BONUS_BLOCKS);

        token.mint(address(this), INITIAL_SUPPLY);
        
        teamTimelock = new TokenTimelock(token, team, now + 365 days);
        communityTimelock = new TokenTimelock(token, community, now + 365 days);

        // initial token allocation
        token.safeTransfer(rewardPool, 5000000);
        token.safeTransfer(teamTimelock, 2500000);
        token.safeTransfer(communityTimelock, 2500000);

        token.transferOwnership(community);
        pool.transferOwnership(community);
    }
}