import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20, StakingRewards } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseUnits } from "ethers/lib/utils";


describe("StakingRewards", function () {

    let StakingRewards;
    let ERC20;
    let staking: StakingRewards;
    let rewardToken: ERC20;
    let stakingToken: ERC20;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {

        ERC20 = await ethers.getContractFactory("ERC20");
        rewardToken = await ERC20.deploy('Apple', 'APL');
        stakingToken = await ERC20.deploy('stakingToken', 'LP');

        StakingRewards = await ethers.getContractFactory("StakingRewards");
        staking = await StakingRewards.deploy(stakingToken.address, rewardToken.address);
        [owner, addr1, addr2] = await ethers.getSigners();

        await stakingToken.mint(addr1.address, 100);
        await rewardToken.mint(staking.address, 1000);

    });

    describe('Staking', function () {

        it('Should stake LP tokens', async function () {

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

        it('Should unstake LP tokens', async function () {

            await stakingToken.connect(addr1).approve(staking.address, 20);
            await staking.connect(addr1).stake(10);

            await ethers.provider.send("evm_increaseTime", [1500]);

            const tx = staking.connect(addr1).unstake(5);
            await expect(tx).to.emit(staking, "Unstaked").withArgs(addr1.address, 5);

            const new_stake = await staking.getStakeholderStake(addr1.address);
            expect(new_stake).to.be.equal(5);

        });

        it('Should revert unstaking LP tokens', async function () {

            await stakingToken.connect(addr1).approve(staking.address, 20);
            await staking.connect(addr1).stake(10);

            const tx = staking.connect(addr1).unstake(5);
            await expect(tx).to.be.revertedWith("Stake is still freezed");

            await ethers.provider.send("evm_increaseTime", [1500]);
            const tx1 = staking.connect(addr1).unstake(15);
            await expect(tx1).to.be.revertedWith("Claimed amount exceeds the stake");

        });

    });

    describe('Claiming rewards', function () {

        it('Should claim rewards', async function () {

            await stakingToken.connect(addr1).approve(staking.address, 20);
            await staking.connect(addr1).stake(10);

            await ethers.provider.send("evm_increaseTime", [1500]);
            await staking.connect(addr1).claim();

            const rewardAvailable = await staking.getStakeholderRewards(addr1.address);
            expect(rewardAvailable).to.be.equal(0);

        });

        it('Should revert claiming rewards', async function () {

            await stakingToken.connect(addr1).approve(staking.address, 20);
            await staking.connect(addr1).stake(10);

            const tx = staking.connect(addr1).claim();
            await expect(tx).to.be.revertedWith("Rewards are not available yet");

        });

    });

    describe('Staking parameters', function () {

        it('Should change minimum staking time', async function () {

            staking.changeMinStakingTime(5);
            const newMinStakingTime = await staking.minStakingTime();
            expect(newMinStakingTime).to.be.equal(5);

        });

        it("Should change reward start time", async function () {

            staking.changeRewardStartTime(5);
            const newRewardTime = await staking.rewardStartTime();
            expect(newRewardTime).to.be.equal(5);

        });

        it("Should change reward rate", async function () {

            await staking.changeRewardRate(10);
            const newRewardRate = await staking.rewardRate();
            expect(newRewardRate).to.be.equal(10);

        });

    });

})