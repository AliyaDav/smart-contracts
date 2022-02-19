import { ethers } from "hardhat";

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const ETHER_ADDRESS: string = '0x2170ed0880ac9a755fd29b2688956bd959f933f8';

async function main() {

    console.log("Deploying contracts with the account:", OWNER_ADDRESS);

    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy('Apple', 'APL');
    await erc20.deployed();

    const Marketplace = await ethers.getContractFactory("PropertyMarketplace");
    const marketplace = await Marketplace.deploy(erc20.address); //0xB427495253cF0dF44C66431475f6ED3a5BB61FfD
    await marketplace.deployed();

    const Nft = await ethers.getContractFactory("MyNFT");
    const nft = await Nft.deploy(marketplace.address); //0x24C3215036DB918C7120411880809633eBCb306b
    await nft.deployed();

    await marketplace.setNftContract(nft.address); // setting nft contract address to the marketplace

    console.log("marketplace deployed to:", marketplace.address);
    console.log("nft deployed to:", nft.address);
    console.log("erc20 deployed to:", erc20.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
