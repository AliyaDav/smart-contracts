import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    console.log("Deploying contracts with the account:", OWNER_ADDRESS);

    const NFT = await ethers.getContractFactory("MyPropertyNft");
    const nft = await NFT.deploy();
    await nft.deployed();
    console.log("NFT contract is deployed to:", nft.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
