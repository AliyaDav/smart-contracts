import "@nomiclabs/hardhat-web3";
import { ethers } from "hardhat";
// import { task } from "hardhat/config";

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
        const contract = await ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const balance = await contract.balanceOf(account);

        console.log(balance);
    });

task("transfer", "Transfers tokens to a given account")
    // .addParam("account", "The recipient's address")
    // .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { account: any; amount: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const amount = ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());
        const signer = ethers.getSigners()

        let result = await contract.transfer(account, amount);
        console.log(result);
    });

task("mint", "Transfers tokens to a given account")
    .addParam("account", "The recipient's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { amount: any; value: any; }) => {

        const account = taskArgs.amount;
        const contract = await ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const amount = ethers.utils.parseUnits(taskArgs.value, await contract.decimals());

        let result = contract._mint(account, amount);
        console.log(result);

    });

task("transferFrom", "Transfers tokens from a given address to another given account")
    .addParam("recipient", "The recipient's address")
    .addParam("sender", "The sender's address")
    .addParam("amount", "The amount to trasfer")
    .setAction(async (taskArgs: { recipient: any; amount: any; }) => {

        const contract = await ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const amount = ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());
        const signer = ethers.getSigners();

        let result = await contract.transferFrom(signer[0], recipient, amount);
        console.log(result);

    });

task("increaseAllowance", "Increase allowance for an address")
    .addParam("account", "The address of account for which to increase allowance")
    .addParam("amount", "The amount by which to increase allowance")
    .setAction(async (taskArgs: { account: any; amount: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const amount = ethers.utils.parseUnits(taskArgs.amount, await contract.decimals());
        const signer = await ethers.getSigners();
        const initial_allowance = await contract.allowance(signer[0].address, account);

        let result = await contract.increaseAllowance(account, amount);
        console.log(result);

    });

task("allowance", "Show allowance of an address")
    .addParam("account", "The address of account for which to show allowance")
    .setAction(async (taskArgs: { account: any; }) => {

        const account = taskArgs.account;
        const contract = await ethers.getContractAt("ERC20", '0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4');
        const signer = await ethers.getSigners();

        let allowance = await contract.allowance(signer[0].address, account);
        console.log(allowance);

    });


function task(arg0: string, arg1: string) {
    throw new Error("Function not implemented.");
}
// test accounts:
// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8