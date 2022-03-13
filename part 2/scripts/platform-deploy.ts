import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    console.log("Deploying platform with the account:", OWNER_ADDRESS);

    const Platform = await ethers.getContractFactory("ACDMPlatform");
    const platform = await Platform.deploy('0x647B6Dd0D93cb6213EAa7b91EE6ABa46968D95A6');

    await platform.deployed();
    console.log("Platform deployed to:", platform.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });