import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { Address } from "cluster";

dotenv.config();

const bridgeEthAddress: string = '0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B';
const bridgeBscAddress: string = '0x78B5c4a7EF96b479485e035ef8D5ef73C48BafC9';

task("token-grant-role", "Grant admin role for erc20 token")
    .addParam("role", "Role to grant")
    .addParam("account", "Account to be granted a role")
    .addParam("token", "Address of token contract")
    .setAction(async (taskArgs: { role: any; account: any; token: any; }, hre) => {

        let token = taskArgs.token;
        let role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(taskArgs.role));
        let account = taskArgs.account;
        const erc20 = await hre.ethers.getContractAt("ERC20Base", token);
        let result = await erc20.grantRole(role, account);
        console.log(result);
    });

task("add-token", "Adds token to bridge contract")
    .addParam("token", "Token address")
    .addParam("address", "Address of bridge")
    .setAction(async (taskArgs: { token: any; address: any; }, hre) => {

        let token = taskArgs.token;
        let address = taskArgs.address;


        const bridge1 = await hre.ethers.getContractAt("Bridge", address);
        let result1 = await bridge1.addToken(token);
        console.log(result1);
    });

task("add-chain", "Adds token to bridge contract")
    .addParam("chainid", "ChainId to add")
    .addParam("address", "Address of bridge")
    .setAction(async (taskArgs: { chainid: any; address: any; }, hre) => {

        let chainid = taskArgs.chainid;
        let address = taskArgs.address;


        const bridge1 = await hre.ethers.getContractAt("Bridge", address);
        let result1 = await bridge1.addChain(chainid);
        console.log(result1);
    });


// 0xaFb7CDe620f31Aa72205a74466d35d6bD9264281

// function getFromAddress(chainid: number) {

//     if (chainid == 97) {
//         return bridgeEthAddress;
//     } else if (chainid == 4) {
//         return bridgeBscAddress;
//     }
// }

// function getToAddress(chainid: number) {

//     if (chainid == 97) {
//         return bridgeEthAddress;
//     } else if (chainid == 4) {
//         return bridgeBscAddress;
//     }
// }

task("swap", "Initializes swap from one chain to another")
    .addParam("to", "Recepient")
    .addParam("amount", "Amount to swap")
    .addParam("nonce", "Unique nonce of a transaction")
    .addParam("chainid", "Chain ID to transfer tokens to")
    .addParam("symbol", "Token symbol to transfer")
    .addParam("address", "Bridge contract address")
    .setAction(async (taskArgs: { to: any; amount: any; chainid: any; nonce: any, symbol: any; address: any; }, hre) => {

        let to = taskArgs.to;
        let amount = taskArgs.amount;
        let chainid = taskArgs.chainid;
        let nonce = taskArgs.nonce;
        let symbol = taskArgs.symbol;
        let address = taskArgs.address;

        // const bridgeAddress: string = getBridgeAddress(chainid)!;

        const bridge = await hre.ethers.getContractAt("Bridge", address);
        const result = await bridge.swap(to, amount, nonce, chainid, symbol);
        console.log(result);

    });

task("redeem", "Redeems swapped tokens from one chain to another")
    .addParam("from", "Sender")
    .addParam("to", "Recepient")
    .addParam("amount", "Amount to swap")
    .addParam("nonce", "Unique nonce of a transaction")
    .addParam("chainid", "Chain ID to transfer tokens to")
    .addParam("symbol", "Token symbol to transfer")
    .addParam("sign", "Validator signature")
    .addParam("address", "Bridge contract address")
    .setAction(async (taskArgs: { from: any; to: any; amount: any; chainid: any; nonce: any, symbol: any; sign: any; address: any; }, hre) => {

        let from = taskArgs.from;
        let to = taskArgs.to;
        let amount = taskArgs.amount;
        let chainid = taskArgs.chainid;
        let nonce = taskArgs.nonce;
        let symbol = taskArgs.symbol;
        let sign = taskArgs.sign;
        let address = taskArgs.address;

        const bridge = await hre.ethers.getContractAt("Bridge", address);
        const result = await bridge.redeem(from, to, amount, nonce, chainid, symbol, sign);
        console.log(result);

    });

task("remove-token", "Removes token from bridge contract")
    .addParam("symbol", "Symbol of the token to be removed")
    .addParam("address1", "Address of bridge on chain 1")
    .addParam("address2", "Address of bridge on chain 2")
    .setAction(async (taskArgs: { symbol: any; address1: any; address2: any; }, hre) => {

        let symbol = taskArgs.symbol;
        let address1 = taskArgs.address1;
        let address2 = taskArgs.address2;

        const bridge1 = await hre.ethers.getContractAt("Bridge", address1);
        let result1 = await bridge1.removeToken(symbol);
        console.log(result1);

        const bridge2 = await hre.ethers.getContractAt("Bridge", address2);
        let result2 = await bridge2.removeToken(symbol);
        console.log(result2);

    });