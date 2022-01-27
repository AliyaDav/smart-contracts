// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Функция stake(uint amount) - списывает с пользователя на контракт стейкинга ЛП токены в количестве amount, обновляет в контракте баланс пользователя
// Функция claim() - списывает с контракта стейкинга ревард токены доступные в качестве наград
// Функция unstake() - списывает с контракта стейкинга ЛП токены доступные для вывода
// Функции админа для изменения параметров стейкинга (время заморозки, процент)

// LP token address 0xd977a48e53eb31a03f764c6fa920c8e77c79ba08

contract StakingRewards {
    IERC20 public rewardsToken;
    IERC20 public stakingToken;
    
    uint public rewardRate;
    uint public minStakingTime;
    uint public rewardStartTime;
    // uint public rewardPerTokenStored;

    struct Stakeholder {
        uint stake;
        uint lastStakeTime;
        uint rewardsAvailable;
    }

    Stakeholder public stakeholder;

    mapping(address => Stakeholder) public Stakeholders;
    // mapping(address => uint) public rewards;
    uint private _totalSupply;

    constructor(address _stakingToken, address _rewardsToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = 0.2;
        // minStakingTime = 10 min;
    }

    function stake(uint amount) external returns(bool) {

        require(stakingToken.balanceOf(msg.sender) >= amount, "Not have anough funds");

        if (Stakeholders[msg.sender] != 0) {
            Stakeholders[msg.sender].stake.add(amount);
        } else {
             Stakeholders[msg.sender].stake = amount;
        }

        stakingToken.transferFrom(msg.sender, address(this), amount);
        _totalSupply.add(amount);
        Stakeholders[msg.sender].lastStakeTime = block.timestamp;

        emit Stake(msg.sender, amount);
        return true;
    }

    modifier checkStakingTime() {
        require(Stakeholders[msg.sender].lastStakeTime > now() + minStakeTime);
        _;
    }

    modifier updateReward(address stakeholder) {
        require(Stakeholders[stakeholder].lastStakeTime > (now + rewardStartTime), "Too early for rewards");
        Stakeholders[stakeholder].rewardsAvailable = Stakeholders[stakeholder].stake * rewardRate;
        _;
    }

    function claim() external updateReward(msg.sender) returns(bool)  {

        uint amount = Stakeholders[msg.sender].rewardsAvailable;
        rewardToken.transferFrom(address(this), msg.sender, amount);
        Stakeholders[msg.sender].rewardsAvailable.sub(amount);

    }

    function unstake(uint amount) external checkStakingTime returns(bool) {

        require(Stakeholders[msg.sender].stake >= amount, "Amount exceeds stake");
        stakingToken.transferFrom(address(this), msg.sender, amount);

        return true;
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        _totalSupply -= _amount;
        _balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, reward);
    }
}

/* 
### ------------------------- Setters ------------------------------- ###
*/

    function changeRewardRate(uint newRate) external returns(bool) {
        rewardRate = newRate;
        return true;
    }

    function changeMinStakingTime(uint newMinStakingTime) external returns(bool) {
        minStakingTime = newMinStakingTime;
        return true;
    }

/* 
### ------------------------- Events ------------------------------- ###
*/

interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint value
    );
}

1. People add liquidity to the pool and get LP tokens
2. Then they stake LP tokens and get a reward of 20% of the amount of LP tokens that they staked. 
The reward is paid in rewardTokens
3. They 