import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";

const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS;
const LP_TOKEN_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS;

task("stake", "Stakes tokens")
    .addParam("account", "Stakeholder account")
    .addParam("amount", "Staking amount")
    .setAction(async (taskArgs: { amount: any; account: any; }, hre) => {

        const staking = await hre.ethers.getContractAt("StakingRewards", STAKING_CONTRACT_ADDRESS);
        const lptoken = await hre.ethers.getContractAt("IERC20", LP_TOKEN_ADDRESS);
        const account = await hre.ethers.getSigners();
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, 18);

        await lptoken.connect(account[1]).approve(staking.address, amount);
        console.log('approve completed');
        let result = await staking.connect(account[1]).stake(amount);
        console.log(result);

    });

task("unstake", "Unstakes tokens")
    .addParam("account", "Stakeholder account")
    .addParam("amount", "Unstaking amount")
    .setAction(async (taskArgs: { amount: any; account: any; }, hre) => {

        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, 18);
        const account = taskArgs.account;
        const staking = await hre.ethers.getContractAt("StakingRewards", STAKING_CONTRACT_ADDRESS);

        let result = await staking.connect(account[0]).unstake(amount);
        console.log(result);

    });

task("claim", "Claims rewards")
    .addParam("account", "Stakeholder account")
    .setAction(async (taskArgs: { account: any; }, hre) => {

        const account = taskArgs.account;
        const staking = await hre.ethers.getContractAt("StakingRewards", STAKING_CONTRACT_ADDRESS);

        let result = await staking.connect(account[0]).claim();
        console.log(result);

    });

task("transfer-lp-token", "Transfers LP tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { account: any; amount: any; }, hre) => {

        const account = taskArgs.account;
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, 18);
        const lptoken = await hre.ethers.getContractAt("IERC20", LP_TOKEN_ADDRESS);
        await lptoken.transfer(account, amount);

    });

task("check-staking-balance", "Returns the amount of staken tokens")
    .addParam("account", "Stakeholder's address")
    .setAction(async (taskArgs: { account: any; }, hre) => {

        const account = taskArgs.account;
        const staking = await hre.ethers.getContractAt("StakingRewards", STAKING_CONTRACT_ADDRESS);
        const balance = await staking.getStakeholderStake(account);
        const balance_formatted = hre.ethers.utils.formatUnits(balance, 18);
        console.log(balance_formatted);

    });
