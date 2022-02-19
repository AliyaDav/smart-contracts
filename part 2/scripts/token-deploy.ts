import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;

async function main() {

    console.log("Deploying ERC20 token with the account:", OWNER_ADDRESS);

    const ERC20Base = await ethers.getContractFactory("ERC20Base");
    const erc20 = await ERC20Base.deploy('Sun', 'SUN');

    await erc20.deployed();
    console.log("ERC20 is deployed to:", erc20.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });