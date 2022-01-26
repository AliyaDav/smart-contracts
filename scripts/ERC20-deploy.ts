import { ethers } from "hardhat";

async function main() {

    const deployer = '0x51d2f9f3379Fe7D9fF120c9d34E2a696e838A330'
    console.log("Deploying contracts with the account:", deployer);

    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy('Apple', 'APL');

    await erc20.deployed();

    console.log("ERC20 deployed to:", erc20.address);
    // console.log("")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

  // deployed to: 0x222e82Ef3B2Cfc5aE9083Ee90012b40d13fA7CC4
//   version 2.0 deployed to: 0xBE56c7cc235E25C9873e55Df8fc1A2434d74ef2B