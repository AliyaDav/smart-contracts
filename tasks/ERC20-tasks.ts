import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import "hardhat-typechain";

task("accounts", "Prints the list of accounts").setAction(async () => {

    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});


task("balance", "Prints an account's balance")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs: { account: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B');
        const balance = await contract.balanceOf(account);

        console.log(balance);
    });

task("transfer", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { account: any; amount: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B');
        const amount = ethers.utils.parseUnits(taskArgs.amount, await contract._decimals());

        let result = await contract.transfer(account, amount);
        console.log(result);
    });

task("mint", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { amount: any; value: any; }) => {

        const account = taskArgs.amount;
        const contract = await ethers.getContractAt("ERC20", '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B');
        const amount = ethers.utils.parseUnits(taskArgs.value, await contract._decimals());

        let result = contract._mint(account, amount);
        console.log(result);

    });

task("transferFrom", "Transfers tokens from a given address to another given account")
    .addParam("recipient", "The recipient's address")
    .addParam("sender", "The sender's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { recipient: any; sender: any, amount: any; }) => {

        const contract = await ethers.getContractAt("ERC20", '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B');
        const amount = ethers.utils.parseUnits(taskArgs.amount, await contract._decimals());
        const recipient = taskArgs.recipient;
        const sender = taskArgs.sender;

        let result = await contract.connect(sender[0]).transferFrom(sender, recipient, amount);
        console.log(result);

    });

task("increaseAllowance", "Increase allowance for an address")
    .addParam("account", "The address of account for which to increase allowance")
    .addParam("amount", "The amount by which to increase allowance")
    .setAction(async (taskArgs: { account: any; amount: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B');
        const amount = ethers.utils.parseUnits(taskArgs.amount, await contract._decimals());
        const signer = await ethers.getSigners();

        await contract.increaseAllowance(account, amount);
        const new_allowance = await contract.allowance(signer[0].address, account);
        console.log("New allowance", new_allowance);

    });

task("allowance", "Show allowance of an address")
    .addParam("account", "The address of account for which to show allowance")
    .setAction(async (taskArgs: { account: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B');
        const signer = await ethers.getSigners();

        let allowance = await contract.allowance(signer[0].address, account);
        console.log(allowance);

    });

// test accounts:
// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8