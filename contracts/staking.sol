// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
// import "@uniswap/v2-core/contracts/UniswapV2Pair.sol" as LP;
import "./ERC20.sol";

/* 
Функция stake(uint amount) - списывает с пользователя на контракт стейкинга ЛП токены в количестве amount, обновляет в контракте баланс пользователя
Функция claim() - списывает с контракта стейкинга ревард токены доступные в качестве наград
Функция unstake() - списывает с контракта стейкинга ЛП токены доступные для вывода
Функции админа для изменения параметров стейкинга (время заморозки, процент) 
*/

// LP token address 0xd977a48e53eb31a03f764c6fa920c8e77c79ba08

contract StakingRewards is AccessControl {
    /* ======================= Setters ======================= */

    ERC20 public rewardsToken;
    IUniswapV2ERC20 public stakingToken;

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
        stakingToken = IUniswapV2ERC20(_stakingToken);
        rewardsToken = ERC20(_rewardsToken);
        rewardRate = 1; // float
        minStakingTime = 5 minutes;
        rewardStartTime = 2 minutes;
    }

    /* ======================= Modifiers ======================= */

    modifier checkStakingTime() {
        require(
            Stakeholders[msg.sender].lastStakeTime + minStakingTime <
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
        rewardsToken.increaseAllowance(stakeholder, amount);
    }

    function _disapproveRewards(address stakeholder, uint256 amount) internal {
        rewardsToken.decreaseAllowance(stakeholder, amount);
    }

    function stake(uint256 amount) external returns (bool) {
        require(
            stakingToken.balanceOf(msg.sender) >= amount,
            "Not have anough funds"
        );

        Stakeholders[msg.sender].stake += amount;

        stakingToken.transferFrom(msg.sender, address(this), amount);
        _totalSupply += amount;
        Stakeholders[msg.sender].lastStakeTime = block.timestamp;

        emit Staked(msg.sender, amount);
        return true;
    }

    // function calculateReward() external returns(uint reward) {

    //     Stakeholders[msg.sender].rewardsAvailable = Stakeholders[msg.sender].stake * rewardRate;
    //     return Stakeholders[msg.sender].rewardsAvailable;
    // }

    function claim() external updateReward(msg.sender) returns (bool) {
        uint256 amount = Stakeholders[msg.sender].rewardsAvailable;
        rewardsToken.transferFrom(address(this), msg.sender, amount);
        Stakeholders[msg.sender].rewardsAvailable = 0;
        _disapproveRewards(msg.sender, amount);

        emit RewardsPaid(msg.sender, amount);
        return true;
    }

    function _transferStake(address stakeholder, uint256 amount) internal {
        stakingToken.transferFrom(address(this), stakeholder, amount);
    }

    function unstake(uint256 amount) external checkStakingTime returns (bool) {
        require(
            Stakeholders[msg.sender].stake >= amount,
            "Claimed amount exceeds the stake"
        );
        _transferStake(msg.sender, amount);
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

/*
1. People add liquidity to the pool and get LP tokens
2. Then they stake LP tokens and get a reward of 20% of the amount of LP tokens that they staked. 
The reward is paid in rewardTokens
3. They 
*/

interface IUniswapV2ERC20 {
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Transfer(address indexed from, address indexed to, uint256 value);

    function name() external pure returns (string memory);

    function symbol() external pure returns (string memory);

    function decimals() external pure returns (uint8);

    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function PERMIT_TYPEHASH() external pure returns (bytes32);

    function nonces(address owner) external view returns (uint256);

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
