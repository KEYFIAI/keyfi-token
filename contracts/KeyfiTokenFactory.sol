// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./KeyfiToken.sol";
import "./RewardPool.sol";
import "@openzeppelin/contracts/token/ERC20/TokenTimelock.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract KeyfiTokenFactory {
    using SafeERC20 for KeyfiToken;

    KeyfiToken public token;    
    RewardPool public pool;
    address public community;

    TokenTimelock public teamTimelock1;
    TokenTimelock public teamTimelock2;
    TokenTimelock public teamTimelock3;
    TokenTimelock public teamTimelock4;

    event RewardPoolDeployed(address pool, address owner);
    
    /**
     * @dev Auxiliary contract that deploys and initializes token and reward contracts.
     * Implements a given initial distribution schemen and automatically transfers ownership 
     * of token and reward contracts to a governance address
     */
    constructor(
        address team, 
        address _community,
        address airdrop
    ) 
        public
    {
        token = new KeyfiToken();
        community = _community;

        token.mint(address(this), 10000000e18);

        uint256 month = 30 days;
        teamTimelock1 = new TokenTimelock(token, team, now + month * 3);
        teamTimelock2 = new TokenTimelock(token, team, now + month * 6);
        teamTimelock3 = new TokenTimelock(token, team, now + month * 9);
        teamTimelock4 = new TokenTimelock(token, team, now + month * 12);

        // initial token allocation
        token.safeTransfer(team, 400000e18);
        token.safeTransfer(address(teamTimelock1), 400000e18);
        token.safeTransfer(address(teamTimelock2), 400000e18);
        token.safeTransfer(address(teamTimelock3), 400000e18);
        token.safeTransfer(address(teamTimelock4), 400000e18);
        token.safeTransfer(airdrop, 250000e18);
        
        token.transferOwnership(community);
    }

    function deployRewardPool() public returns (address) {
        require(address(pool) == address(0), "Pool was already deployed");
        
        pool = new RewardPool(token, 700000000000000000, 0, 0, 2);
        token.safeTransfer(address(pool), 6250000e18);
        pool.transferOwnership(community);

        emit RewardPoolDeployed(address(pool), pool.owner());
    }
}