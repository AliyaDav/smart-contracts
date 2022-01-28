import { expect } from "chai";
import { ethers } from "hardhat";
import { StakingRewards } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("StakingRewards", function () {

    let StakingRewards;
    let staking: StakingRewards;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    const STAKING_TOKEN_ADDRESS = '0xd977a48e53eb31a03f764c6fa920c8e77c79ba08';
    const REWARD_TOKEN_ADDRESS = '0x39d429694913e907a2d715ace6eb4b6e1b017110';
    // const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const delay = async (ms: number) => new Promise(res => setTimeout(res, ms));

    beforeEach(async function () {

        StakingRewards = await ethers.getContractFactory("StakingRewards");
        [owner, addr1, addr2] = await ethers.getSigners();
        staking = await StakingRewards.deploy(STAKING_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS);

    });

    describe('Staking', function () {

        it('Should stake LP tokens', async function () {

            const initial_stake = await staking.getStakeholderStake(addr1.address);
            expect(initial_stake).to.be.equal(0);

            const tx1 = staking.stake(5);
            await expect(tx1).to.emit(staking, "Staked").withArgs(addr1.address, 5);

            const new_stake = await staking.getStakeholderStake(addr1.address);
            expect(new_stake).to.be.equal(5);

        });

        it('Should revert unstaking LP tokens', async function () {

            const initial_stake = await staking.getStakeholderStake(addr1.address);
            expect(initial_stake).to.be.equal(0);

            await staking.stake(5);
            await staking.getStakeholderStake(addr1.address);

            const tx = staking.unstake(5);
            await expect(tx).to.be.revertedWith("Stake is still freezed");

        });

        // it('Should claim rewards', async function () {

        //     await delay(5000);

        // });

    });

    // describe('Staking parameters', function () {

    //     it('Should change minimum staking time', async function () {

    //     });

    //     it("SShould change reward start time", async function () {

    //     });

    // });

})