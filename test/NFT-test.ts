import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20, StakingRewards } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseUnits } from "ethers/lib/utils";


describe("MyNFT", function () {

    let MyNFT;
    let nft: MyNFT;
    let minter: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    const TEST_URI = '';

    beforeEach(async function () {

        MyNFT = await ethers.getContractFactory("MyNFT");
        nft = await MyNFT.deploy('BellaVilla', 'BL');

        [minter, addr1, addr2] = await ethers.getSigners();

        await nft.mint(addr1.address, "");

    });

    describe('Getters', function () {

        it('Should return name and balance', async function () {

            expect(await nft.name).to.be.equal('BellaVilla');
            expect(await nft.symbol).to.be.equal('BellaVilla');
        }

        it('Should mint to an address'), async function () {

            const tx = nft.mint(addr1.address, TEST_URI);
            const tokenId = nft.tokenId();
            await expect(tx).to.emit(nft, 'Transfer').withArgs(minter.address, addr1.address,)

        }
            const initial_stake = await staking.getStakeholderStake(addr1.address);
        expect(initial_stake).to.be.equal(0);

        await stakingToken.connect(addr1).approve(staking.address, 20);
        const tx1 = staking.connect(addr1).stake(10);
        await expect(tx1).to.emit(staking, "Staked").withArgs(addr1.address, 10);

        const new_stake = await staking.getStakeholderStake(addr1.address);
        expect(new_stake).to.be.equal(10);

    });

    it('Should revert staking LP tokens', async function () {

        await stakingToken.connect(addr1).approve(staking.address, 10000);
        const tx = staking.connect(addr1).stake(10000);
        await expect(tx).to.be.revertedWith("Not have anough funds");

    });