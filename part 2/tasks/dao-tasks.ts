import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
import { Bytes, ethers } from "ethers";
import { Address } from "cluster";

dotenv.config();

const marketplaceAddress: string = '0xB427495253cF0dF44C66431475f6ED3a5BB61FfD';
const DAO_ADDRESS: string = '';
const callData: string = '';

task("vote", "Vote for a proposal")
    .addParam("id", "Proposal id")
    .setAction(async (taskArgs: { id: number; }, hre) => {

        let id = taskArgs.id;
        const dao = await hre.ethers.getContractAt("DAO", DAO_ADDRESS);
        let result = await dao.vote(id);
        console.log(result);

    });

task("add-proposal", "Adds a new proposal")
    .addParam("data", "Function calldata")
    .addParam("recepient", "Address of the contract under consideration")
    .addParam("desc", "A short description of proposed changes")
    .setAction(async (taskArgs: { data: Bytes; recepient: Address; desc: string }, hre) => {

        let calldata = taskArgs.data;
        let recepient = taskArgs.recepient;
        let desc = taskArgs.desc;

        const dao = await hre.ethers.getContractAt("DAO", DAO_ADDRESS);
        let result1 = await dao.addProposal(calldata, recepient, desc);
        console.log(result1);
    });

task("finish-proposal", "Closes voting and finishes proposal")
    .addParam("id", "Proposal id to finish")
    .setAction(async (taskArgs: { id: number; }, hre) => {

        let id = taskArgs.id;

        const dao = await hre.ethers.getContractAt("DAO", DAO_ADDRESS);
        let result1 = await dao.finishProposal(id);
        console.log(result1);
    });

task("deposit", "Deposits tokens to vote")
    .addParam("amount", "Deposit amount")
    .setAction(async (taskArgs: { amount: number; }, hre) => {

        let amount = taskArgs.amount;

        const dao = await hre.ethers.getContractAt("DAO", DAO_ADDRESS);
        let result = await dao.deposit(amount);
        console.log(result);
    });

task("withdraw", "Deposits tokens to vote")
    .setAction(async (hre) => {

        const dao = await hre.ethers.getContractAt("DAO", DAO_ADDRESS);
        let result = await dao.withdraw();
        console.log(result);
    });


task("get-proposal-data", "Deposits tokens to vote")
    .addParam("id", "Proposal id")
    .setAction(async (taskArgs: { id: number; }, hre) => {

        let id = taskArgs.id;

        const dao = await hre.ethers.getContractAt("DAO", DAO_ADDRESS);
        let result = await dao.getProposalData(id);
        console.log(result);
    });