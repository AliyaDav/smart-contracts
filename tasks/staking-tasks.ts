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