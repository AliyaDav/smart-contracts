// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // or better use folder interfaces?
import "@openzeppelin/contracts/access/AccessControl.sol";

/* 
Функция stake(uint amount) - списывает с пользователя на контракт стейкинга ЛП токены в количестве amount, обновляет в контракте баланс пользователя
Функция claim() - списывает с контракта стейкинга ревард токены доступные в качестве наград
Функция unstake() - списывает с контракта стейкинга ЛП токены доступные для вывода
Функции админа для изменения параметров стейкинга (время заморозки, процент) 
*/

// LP token address 0xd977a48e53eb31a03f764c6fa920c8e77c79ba08

contract StakingRewards is AccessControl {
    /* ======================= Setters ======================= */

    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint256 public rewardRate;
    uint256 public minStakingTime;
    uint256 public rewardStartTime;

    struct Stakeholder {
        uint256 stake;
        uint256 lastStakeTime;
        uint256 rewardsAvailable;
    }

    mapping(address => Stakeholder) public Stakeholders;
    uint256 private _totalSupply;

    /* ======================= Constructor ======================= */

    constructor(address _stakingToken, address _rewardsToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = 0.2;
        minStakingTime = 5 minutes;
        rewardStartTime = 2 minutes;
    }

    /* ======================= Modifiers ======================= */

    modifier checkStakingTime() {
        require(
            Stakeholders[msg.sender].lastStakeTime + minStakeTime <
                block.timestamp,
            "Stake is still freezed"
        );
        _;
    }

    modifier updateReward(address stakeholder) {
        //can we remove the argument?
        require(
            Stakeholders[stakeholder].lastStakeTime <
                block.timestamp + rewardStartTime,
            "Rewards are not available yet"
        );
        Stakeholders[stakeholder].rewardsAvailable =
            Stakeholders[stakeholder].stake *
            rewardRate;
        _approveRewards(
            stakeholder,
            Stakeholders[stakeholder].rewardsAvailable
        );
        _;
    }

    /* ======================= Functions ======================= */

    function _approveRewards(address stakeholder, uint256 amount) internal {
        rewardToken.increaseAllowance(stakeholder, amount);
    }

    function _disapproveRewards(address stakeholder, uint256 amount) internal {
        rewardToken.decreaseAllowance(stakeholder, amount);
    }

    function _approveUnstaking(address stakeholder, uint256 amount) internal {
        stakingToken.increaseAllowance(stakeholder, amount);
    }

    function _disapproveUnstaking(address stakeholder, uint256 amount)
        internal
    {
        stakingToken.decreaseAllowance(stakeholder, amount);
    }

    function stake(uint256 amount) external returns (bool) {
        require(
            stakingToken.balanceOf(msg.sender) >= amount,
            "Not have anough funds"
        );

        Stakeholders[msg.sender].stake.add(amount);

        stakingToken.transferFrom(msg.sender, address(this), amount);
        _totalSupply.add(amount);
        Stakeholders[msg.sender].lastStakeTime = block.timestamp;
        _approveUnstaking(msg.sender, amount);

        emit Staked(msg.sender, amount);
        return true;
    }

    // function calculateReward() external returns(uint reward) {

    //     Stakeholders[msg.sender].rewardsAvailable = Stakeholders[msg.sender].stake * rewardRate;
    //     return Stakeholders[msg.sender].rewardsAvailable;
    // }

    function claim() external updateReward(msg.sender) returns (bool) {
        uint256 amount = Stakeholders[msg.sender].rewardsAvailable;
        rewardToken.transferFrom(address(this), msg.sender, amount);
        Stakeholders[msg.sender].rewardsAvailable = 0;
        _disapproveRewards(msg.sender, amount);

        emit RewardsPaid(msg.sender, amount);
        return true;
    }

    function unstake(uint256 amount) external checkStakingTime returns (bool) {
        require(
            Stakeholders[msg.sender].stake >= amount,
            "Claimed amount exceeds the stake"
        );
        stakingToken.transferFrom(address(this), msg.sender, amount);
        _disapproveUnstaking(msg.sender, amount);
        emit Unstaked(msg.sender, amount);

        return true;
    }

    /* ======================= Restricted functions ======================= */

    function changeRewardRate(uint256 newRate)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        rewardRate = newRate;
        return true;
    }

    function changeMinStakingTime(uint256 newMinStakingTime)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        minStakingTime = newMinStakingTime;
        return true;
    }

    function changeRewardStartTime(uint256 newRewardStartTime)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (bool)
    {
        minStakingTime = newRewardStartTime;
        return true;
    }

    // TODO: add minting to this address

    /* ======================= Events ======================= */

    event Staked(address indexed stakeholder, uint256 amount);
    event Unstaked(address indexed stakeholder, uint256 amount);
    event RewardsPaid(address indexed stakeholder, uint256 amount);
}

/* ======================= Interface ======================= */

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

/*
1. People add liquidity to the pool and get LP tokens
2. Then they stake LP tokens and get a reward of 20% of the amount of LP tokens that they staked. 
The reward is paid in rewardTokens
3. They 
*/
