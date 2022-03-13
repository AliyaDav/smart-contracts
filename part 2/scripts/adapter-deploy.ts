import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    console.log("Deploying adapter with the account:", OWNER_ADDRESS);

    const Adapter = await ethers.getContractFactory("Adapter");
    const adapter = await Adapter.deploy('0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
    await adapter.deployed();

    console.log("Adapter deployed to:", adapter.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });