import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

const NFT_CONTRACT: string = (process.env.NFT_CONTRACT! as string);
console.log(NFT_CONTRACT);

task("mintnft", "Mint an NFT")
    .addParam("account", "NFT receiver account")
    .addParam("tokenid", "Token ID")
    .addParam("uri", "tokenURI")
    .setAction(async (taskArgs: { account: any; tokenid: any; uri: any; }, hre) => {

        const nft = await hre.ethers.getContractAt("MyPropertyNft", NFT_CONTRACT);
        await nft.mint(taskArgs.account, taskArgs.tokenid, taskArgs.uri);
        console.log('token minted');

    });

task("nftbalance", "Returns balance of nfts for an account")
    .addParam("account", "NFT owner account")
    .setAction(async (taskArgs: { account: any; }, hre) => {

        const nft = await hre.ethers.getContractAt("MyPropertyNft", NFT_CONTRACT);
        const account = taskArgs.account;

        const balance = await nft.balanceOf(account);
        const balance_formatted = hre.ethers.utils.formatUnits(balance, 0);
        console.log(`Account's balance now is: ${balance_formatted}`);

    });

task("nfturi", "Returns token URI")
    .addParam("tokenid", "token ID")
    .setAction(async (taskArgs: { tokenid: any; }, hre) => {

        const nft = await hre.ethers.getContractAt("MyPropertyNft", NFT_CONTRACT);
        const tokenId = taskArgs.tokenid;

        const uri = await nft.tokenURI(tokenId);
        console.log(`Token URI is: ${uri}`);

    });

task("transfernft", "Transfers nft")
    .addParam("from", "NFT sender")
    .addParam("to", "NFT receiver")
    .addParam("tokenid", "token ID")
    .setAction(async (taskArgs: { from: any; to: any; tokenid: any; }, hre) => {

        const nft = await hre.ethers.getContractAt("MyPropertyNft", NFT_CONTRACT);

        await nft.transferFrom(taskArgs.from, taskArgs.to, taskArgs.tokenid);
        console.log(`NFT ${taskArgs.tokenid}, transfered from ${taskArgs.from} to ${taskArgs.to}`);

    });

task("burnnft", "Burns nft")
    .addParam("tokenid", "token ID")
    .setAction(async (taskArgs: { tokenid: any; }, hre) => {

        const nft = await hre.ethers.getContractAt("MyPropertyNft", NFT_CONTRACT);

        await nft.burn(taskArgs.tokenid);
        console.log(`NFT ${taskArgs.tokenid} is burned`);

    });