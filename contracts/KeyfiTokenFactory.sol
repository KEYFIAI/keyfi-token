// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./KeyfiToken.sol";
//import "./MultisigTimelock.sol";
import "./RewardPool.sol";
import "@openzeppelin/contracts/token/ERC20/TokenTimelock.sol";


contract KeyfiTokenFactory {
    using SafeERC20 for KeyfiToken;

    uint256 constant INITIAL_SUPPLY = 10000000e18;   // 10,000,000 initial supply
    uint256 constant REWARD_RATE = 700000000000000000;      // 0.7 per block
    uint256 constant BONUS_BLOCKS = 390000;                 // approx. 2 months
    uint8 constant BONUS_MULTIPLIER = 2;

    KeyfiToken public token;    
    RewardPool public pool;
    TokenTimelock public teamTimelock;
    TokenTimelock public communityTimelock;

    event KeyfiTokenFactoryDeployed(address tokenAddress, address rewardPoolAddress);

    /**
     * @dev Auxiliary contract that deploys and initializes token and reward contracts.
     * Implements a given initial distribution schemen and automatically transfers ownership 
     * of token and reward contracts to a governance address
     * @param team — An wallet address corresponding to the KeyFi team
     * @param community — An address corresponding to the community. e.g. a DAO contract
     * @param startBlock — RewardPookl starting block
     * @param timelockPeriod — Timelock period for tokens vested over time
     */
    constructor(
        address team, 
        address community,
        uint256 startBlock,
        uint256 timelockPeriod
    ) 
        public
    {
        token = new KeyfiToken();
        pool = new RewardPool(token, REWARD_RATE, startBlock, startBlock + BONUS_BLOCKS, BONUS_MULTIPLIER);

        token.mint(address(this), INITIAL_SUPPLY);
        
        teamTimelock = new TokenTimelock(token, team, now + timelockPeriod);
        communityTimelock = new TokenTimelock(token, community, now + timelockPeriod);

        // initial token allocation
        token.safeTransfer(address(pool), 5000000);
        token.safeTransfer(address(teamTimelock), 2500000);
        token.safeTransfer(address(communityTimelock), 2500000);

        token.transferOwnership(community);
        pool.transferOwnership(community);

        emit KeyfiTokenFactoryDeployed(address(token), address(pool));
    }
}