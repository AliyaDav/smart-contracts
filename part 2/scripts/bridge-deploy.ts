import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    console.log("Deploying bridge with the account:", OWNER_ADDRESS);

    const Bridge = await ethers.getContractFactory("Bridge");
    const bridge = await Bridge.deploy();

    await bridge.deployed();
    console.log("Bridge deployed to:", bridge.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });