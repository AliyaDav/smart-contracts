import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();


const OWNER_ADDRESS: string = process.env.OWNER_ADDRESS! as string;
const ERC20_RINKEBY_ADDRESS: string = process.env.ERC20_RINKEBY_ADDRESS! as string;
const MARKETPLACE_ADDRESS: string = process.env.MARKETPLACE_ADDRESS! as string;
const MARKETPLACE_NFT_ADDRESS: string = process.env.MARKETPLACE_NFT_ADDRESS! as string;


task("create-item", "Create nft")
    .addParam("uri", "Token URI")
    .setAction(async (taskArgs: { uri: any; }, hre) => {

        const marketplace = await hre.ethers.getContractAt("PropertyMarketplace", MARKETPLACE_ADDRESS);
        const uri = taskArgs.uri;
        await marketplace.createItem(uri);
        const nft = await hre.ethers.getContractAt("MyNFT", MARKETPLACE_NFT_ADDRESS);
        const itemId = await nft.balanceOf(OWNER_ADDRESS);
        console.log('Item created with id', itemId);

    });
