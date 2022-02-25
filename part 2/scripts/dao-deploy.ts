import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    console.log("Deploying bridge with the account:", OWNER_ADDRESS);

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.deploy('0x5ccc29ba253a1affa9d03f93558fa52277555615');

    await dao.deployed();
    console.log("DAO deployed to:", dao.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });