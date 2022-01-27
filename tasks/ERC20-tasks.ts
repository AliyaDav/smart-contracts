import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";

const CONTRACT_ADDRESS = '0x39d429694913e907a2d715ace6EB4B6E1B017110'

task("accounts", "Prints the list of accounts").setAction(async (taskArgs, hre) => {

    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("balance", "Prints an account's balance")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs: { account: any; }, hre) => {

        const account = taskArgs.account;
        const contract = await hre.ethers.getContractAt("ERC20", CONTRACT_ADDRESS);
        const balance = await contract.balanceOf(account);

        console.log(balance);
    });

task("transfer", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { account: any; amount: any; }, hre) => {

        const account = taskArgs.account;
        const contract = await hre.ethers.getContractAt("ERC20", CONTRACT_ADDRESS);
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());

        let result = await contract.transfer(account, amount);
        console.log(result);
    });

task("mint", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { account: any; amount: any; }, hre) => {

        const account = taskArgs.account;
        const contract = await hre.ethers.getContractAt("ERC20", CONTRACT_ADDRESS);
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());
        const signer = await hre.ethers.getSigners();
        console.log("amount is", amount);

        let result = await contract.connect(signer[0]).mint(account, amount);
        console.log(result);

    });

task("transferFrom", "Transfers tokens from a given address to another given account")
    .addParam("recipient", "The recipient's address")
    .addParam("sender", "The sender's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { recipient: any; sender: any, amount: any; }, hre) => {

        const contract = await hre.ethers.getContractAt("ERC20", CONTRACT_ADDRESS);
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());
        const recipient = taskArgs.recipient;
        const sender = taskArgs.sender;

        let result = await contract.connect(sender[0]).transferFrom(sender, recipient, amount);
        console.log(result);

    });

task("increaseAllowance", "Increase allowance for an address")
    .addParam("account", "The address of account for which to increase allowance")
    .addParam("amount", "The amount by which to increase allowance")
    .setAction(async (taskArgs: { account: any; amount: any; }, hre) => {

        const account = taskArgs.account;
        const contract = await hre.ethers.getContractAt("ERC20", CONTRACT_ADDRESS);
        const amount = hre.ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());
        const signer = await hre.ethers.getSigners();

        await contract.increaseAllowance(account, amount);
        const new_allowance = await contract.allowance(signer[0].address, account);
        console.log("New allowance", new_allowance);

    });

task("allowance", "Show allowance of an address")
    .addParam("account", "The address of account for which to show allowance")
    .setAction(async (taskArgs: { account: any; }, hre) => {

        const account = taskArgs.account;
        const contract = await hre.ethers.getContractAt("ERC20", CONTRACT_ADDRESS);
        const signer = await hre.ethers.getSigners();

        let allowance = await contract.allowance(signer[0].address, account);
        console.log(allowance);

    });