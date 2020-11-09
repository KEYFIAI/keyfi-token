// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "./KeyfiToken.sol";
//import '@openzeppelin/contracts/token/ERC20/ERC20.sol';


/**  
 * Implementation of Reward logic for KEYFI token, based on SushiSwap's staking contract
 */
contract RewardPool is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        //
        // We do some fancy math here. Basically, any point in time, the amount of reward
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * pool.accRewardPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accRewardPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    // Info of each staking token
    struct StakingToken {
        IERC20 stakingToken;            // Contract address of token to be staked
        uint256 allocPoint;             // How many allocation points assigned to this token
        uint256 lastRewardBlock;        // Last block number that reward distribution occurred
        uint256 accRewardPerShare;      // Accumulated reward per share, times 1e12.
    }

    struct TokenIndex {
        uint256 index;
        bool added;
    }

    IERC20 public rewardToken;

    uint256 public bonusEndBlock;                   // Block number when bonus reward period ends
    uint256 public rewardPerBlock;                  // reward tokens distributed per block
    uint256 public bonusMultiplier = 2;  // Bonus muliplier for early users

    StakingToken[] public stakingTokens;                                    // Info of each pool
    mapping(address => TokenIndex) public stakingTokenIndexes;
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;     // Info of each user that stakes tokens
    /* ----> */ uint256 public totalAllocPoint = 0;                                     // Total allocation points. Must be the sum of all allocation points in all pools
    uint256 public startBlock;                                              // The block number when rewards start

    event TokenAdded(address indexed token, uint256 allocPoints);
    event TokenRemoved(address indexed token);
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        IERC20 _rewardToken,
        uint256 _rewardPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock,
        uint8 _bonusMultiplier
    ) public {
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
        bonusMultiplier = _bonusMultiplier;
    }

    function stakingTokensCount() 
        external 
        view 
        returns (uint256) 
    {
        return stakingTokens.length;
    }

    function addStakingToken(uint256 _allocPoint, IERC20 _stakingToken) 
        public 
        onlyOwner 
    {
        /* ---> */ require(address(_stakingToken) != address(rewardToken), "cannot add reward token as staking token");
        require(!stakingTokenIndexes[address(_stakingToken)].added, "staking token already exists in array");

        massUpdateTokens();
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        stakingTokens.push(StakingToken({
            stakingToken: _stakingToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accRewardPerShare: 0
        }));

        stakingTokenIndexes[address(_stakingToken)] = TokenIndex({
            index: stakingTokens.length - 1,
            added: true
        });

        emit TokenAdded(address(_stakingToken), _allocPoint);
    }

    function removeStakingToken(IERC20 _stakingToken) 
        public 
        onlyOwner 
    {
        require(stakingTokenIndexes[address(_stakingToken)].added, "invalid token");
        
        massUpdateTokens();
        uint256 index = stakingTokenIndexes[address(_stakingToken)].index;
        delete(stakingTokenIndexes[address(_stakingToken)]);
        stakingTokens[index] = stakingTokens[stakingTokens.length - 1];
        stakingTokens.pop();

        emit TokenRemoved(address(_stakingToken));
    }

    function set(IERC20 _token, uint256 _allocPoint) 
        public 
        onlyOwner 
    {
        require(stakingTokenIndexes[address(_token)].added, "invalid token");

        massUpdateTokens();
        uint256 index = stakingTokenIndexes[address(_token)].index;
        totalAllocPoint = totalAllocPoint.sub(stakingTokens[index].allocPoint).add(_allocPoint);
        stakingTokens[index].allocPoint = _allocPoint;
    }

    function getMultiplier(uint256 _from, uint256 _to) 
        public 
        view 
        returns (uint256) 
    {
        _from = _from >= startBlock? _from : startBlock;
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(bonusMultiplier);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return bonusEndBlock.sub(_from).mul(bonusMultiplier).add(
                _to.sub(bonusEndBlock)
            );
        }
    }

    function pendingReward(IERC20 _token, address _user) 
        external 
        view 
        returns (uint256) 
    {
        require(stakingTokenIndexes[address(_token)].added, "invalid token");
        
        uint256 _pid = stakingTokenIndexes[address(_token)].index;
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accRewardPerShare = pool.accRewardPerShare;
        uint256 tokenSupply = pool.stakingToken.balanceOf(address(this));   // <----- counting actual deposits. Anyone can send tokens and dilute everyone's share
        
        if (block.number > pool.lastRewardBlock && tokenSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 reward = multiplier.mul(rewardPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accRewardPerShare = accRewardPerShare.add(reward.mul(1e12).div(tokenSupply));
        }

        return user.amount.mul(accRewardPerShare).div(1e12).sub(user.rewardDebt);
    }

    function massUpdateTokens() 
        public 
    {
        uint256 length = stakingTokens.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            checkpoint(pid);
        }
    }

    function checkpoint(uint256 _pid) 
        public 
    {
        require(_pid < stakingTokens.length, "token index out of bounds");

        StakingToken storage pool = stakingTokens[_pid];
        
        if (block.number <= pool.lastRewardBlock) {
            return;
        }

        uint256 stakedSupply = pool.stakingToken.balanceOf(address(this));

        if (stakedSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 reward = multiplier.mul(rewardPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
        
        //rewardToken.mint(address(this), reward);

        pool.accRewardPerShare = pool.accRewardPerShare.add(reward.mul(1e12).div(stakedSupply));
        pool.lastRewardBlock = block.number;
    }

    function deposit(IERC20 _token, uint256 _amount) 
        public 
    {
        require(stakingTokenIndexes[address(_token)].added, "invalid token");
        
        uint256 _pid = stakingTokenIndexes[address(_token)].index;
        checkpoint(_pid);
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 pending = user.amount.mul(pool.accRewardPerShare).div(1e12).sub(user.rewardDebt);
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accRewardPerShare).div(1e12);
        
        safeRewardTransfer(msg.sender, pending);
        if (_amount > 0) {
            pool.stakingToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        }

        emit Deposit(msg.sender, _pid, _amount);
    }

    function withdraw(IERC20 _token, uint256 _amount) 
        public 
    {
        require(stakingTokenIndexes[address(_token)].added, "invalid token");
        
        uint256 _pid = stakingTokenIndexes[address(_token)].index;
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "invalid amount specified");

        checkpoint(_pid);
        uint256 pending = user.amount.mul(pool.accRewardPerShare).div(1e12).sub(user.rewardDebt);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accRewardPerShare).div(1e12);

        safeRewardTransfer(msg.sender, pending);
        if(_amount > 0) {
            pool.stakingToken.safeTransfer(address(msg.sender), _amount);
        }

        emit Withdraw(msg.sender, _pid, _amount);
    }

    function emergencyWithdraw(IERC20 _token) 
        public 
    {
        require(stakingTokenIndexes[address(_token)].added, "invalid token");
        
        uint256 _pid = stakingTokenIndexes[address(_token)].index;
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 _amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;

        pool.stakingToken.safeTransfer(address(msg.sender), _amount);
        
        emit EmergencyWithdraw(msg.sender, _pid, _amount);
    }

    function safeRewardTransfer(address _to, uint256 _amount) 
        internal 
    {
        uint256 rewardBal = rewardToken.balanceOf(address(this));
        if (_amount > 0) {
            if (_amount > rewardBal) {
                rewardToken.transfer(_to, rewardBal);
            } else {
                rewardToken.transfer(_to, _amount);
            }
        }
    }

    function rewardBlocksLeft() 
        public
        view
        returns (uint256)
    {
        uint256 balance = rewardToken.balanceOf(address(this));
        return balance.div(rewardPerBlock);
    }

    function adminWithdrawReward(uint256 amount)
        public
        onlyOwner
    {
        rewardToken.safeTransfer(msg.sender, amount);
    }
}