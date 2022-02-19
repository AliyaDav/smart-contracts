import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const STAKING_TOKEN_ADDRESS: string = process.env.STAKING_TOKEN_ADDRESS!;
const REWARD_TOKEN_ADDRESS: string = process.env.REWARD_TOKEN_ADDRESS!;

async function main() {

    console.log("Deploying contracts with the account:", OWNER_ADDRESS);

    const Staking = await ethers.getContractFactory("StakingRewards");
    const staking = await Staking.deploy(STAKING_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS);

    await staking.deployed();
    console.log("staking deployed to:", staking.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
