// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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

    // Info of each pool.
    struct StakingToken {
        IERC20 stakingToken;           // Address of LP token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool. LOCKs to distribute per block.
        uint256 lastRewardBlock;  // Last block number that reward distribution occurs.
        uint256 accRewardPerShare;  // Accumulated reward per share, times 1e12. See below.
    }

    IERC20 public rewardToken;
    uint256 public rewardDeposited; // reward deposited by contract owner. Reward tokens should NOT be sent directly to the contract

    uint256 public bonusEndBlock;   // Block number when bonus reward period ends.
    uint256 public rewardPerBlock;    // reward tokens created per block.
    uint256 public constant BONUS_MULTIPLIER = 10;  // Bonus muliplier for early KEYFI makers.

    StakingToken[] public stakingTokens;     // Info of each pool.
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;     // Info of each user that stakes LP tokens.
    uint256 public totalAllocPoint = 0; // Total allocation poitns. Must be the sum of all allocation points in all pools.
    uint256 public startBlock;  // The block number when KEYFI mining starts.

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        IERC20 _rewardToken,
        uint256 _rewardPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
    ) public {
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
    }

    function stakingTokensCount() 
        external 
        view 
        returns (uint256) 
    {
        return stakingTokens.length;
    }

    function add(uint256 _allocPoint, IERC20 _stakingToken) 
        public 
        onlyOwner 
    {
        require(address(_stakingToken) != address(rewardToken), "cannot add reward token as staking token");
        massUpdateTokens();
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        stakingTokens.push(StakingToken({
            stakingToken: _stakingToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accRewardPerShare: 0
        }));
    }

    function set(uint256 _pid, uint256 _allocPoint) 
        public 
        onlyOwner 
    {
        massUpdateTokens();
        totalAllocPoint = totalAllocPoint.sub(stakingTokens[_pid].allocPoint).add(_allocPoint);
        stakingTokens[_pid].allocPoint = _allocPoint;
    }

    function getMultiplier(uint256 _from, uint256 _to) 
        public 
        view 
        returns (uint256) 
    {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(
                _to.sub(bonusEndBlock)
            );
        }
    }

    function pendingReward(uint256 _pid, address _user) 
        external 
        view 
        returns (uint256) 
    {
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accRewardPerShare = pool.accRewardPerShare;
        uint256 tokenSupply = pool.stakingToken.balanceOf(address(this));
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

    function deposit(uint256 _pid, uint256 _amount) 
        public 
    {
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        checkpoint(_pid);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accRewardPerShare).div(1e12).sub(user.rewardDebt);
            if(pending > 0) {
                safeRewardTransfer(msg.sender, pending);
            }
        }
        if(_amount > 0) {
            pool.stakingToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accRewardPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    function withdraw(uint256 _pid, uint256 _amount) 
        public 
    {
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "invalid amount specified");
        checkpoint(_pid);
        uint256 pending = user.amount.mul(pool.accRewardPerShare).div(1e12).sub(user.rewardDebt);
        if(pending > 0) {
            safeRewardTransfer(msg.sender, pending);
        }
        if(_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.stakingToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accRewardPerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    function emergencyWithdraw(uint256 _pid) 
        public 
    {
        StakingToken storage pool = stakingTokens[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.stakingToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    function safeRewardTransfer(address _to, uint256 _amount) 
        internal 
    {
        uint256 rewardBal = rewardToken.balanceOf(address(this));
        if (_amount > rewardBal) {
            rewardToken.transfer(_to, rewardBal);
        } else {
            rewardToken.transfer(_to, _amount);
        }
    }
}