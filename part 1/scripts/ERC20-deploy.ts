import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    const deployer = OWNER_ADDRESS;
    console.log("Deploying contracts with the account:", deployer);

    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy('Apple', 'APL');

    await erc20.deployed();

    console.log("ERC20 deployed to:", erc20.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

  // deployed to: 0x79cCe6B2e90bbB60Fc6D312016c814F482DF1179