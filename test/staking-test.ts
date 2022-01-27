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

    const STAKING_TOKEN_ADDRESS = process.env.STAKING_TOKEN_ADDRESS;
    const REWARD_TOKEN_ADDRESS = process.env.REWARD_TOKEN_ADDRESS;
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {

        StakingRewards = await ethers.getContractFactory("StakingRewards");
        [owner, addr1, addr2] = await ethers.getSigners();
        staking = await StakingRewards.deploy(STAKING_TOKEN_ADDRESS, REWARD_TOKEN_ADDRESS);

    });

    describe('Staking', function () {

        it('Should stake LP tokens', async function () {

            const initial_stake = await staking.Stakeholders[addr1.address].stake;
            expect(initial_stake).to.be.equal(0);

            const tx1 = staking.connect(addr1).stake(5);
            await expect(tx1).to.emit(staking, "Staked").withArgs(addr1.address, 5);

            const new_stake = await staking.Stakeholders[addr1.address].stake;
            expect(new_stake).to.be.equal(5;
            expect(staking.Stakeholders[addr1.address].lastStakeTime).to.be.equal(block.timestamp);

        });

        it('Should unstake LP tokens', async function () {

        });

        it('Should claim rewards', async function () {

        });
    });

    describe('Staking parameters', function () {

        it('Should change minimum staking time', async function () {

        });

        it("SShould change reward start time", async function () {

        });

    });

})