// import chai from "chai";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20 } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import "@nomiclabs/hardhat-ethers";

// const { expect } = chai;

describe("ERC20", function () {

    let ERC20;
    let erc20: ERC20;
    let owner: SignerWithAddress;
    // { address: any; };
    let addr1: SignerWithAddress;
    // { address: any; };
    let addr2: SignerWithAddress;
    // { address: any; };

    const NAME = 'Apple';
    const SYMBOL = 'APL';
    const DECIMALS = 18;
    const TOTAL_SUPPLY = 1000;
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    // const owner = '0x51d2f9f3379Fe7D9fF120c9d34E2a696e838A330';

    beforeEach(async function () {

        ERC20 = await ethers.getContractFactory("ERC20");
        [owner, addr1, addr2] = await ethers.getSigners();
        erc20 = await ERC20.deploy('Apple', 'APL');
        // await ERC20.deployed();

    });

    describe('Deployment', function () {

        it('Should return name', async function () {
            expect((await erc20._name())).to.equal(`${NAME}`);
        });

        it('Should return symbol', async function () {
            expect((await erc20._symbol())).to.equal(`${SYMBOL}`);
        });

        it('Should return decimals', async function () {
            expect((await erc20._decimals())).to.equal(`${DECIMALS}`);
        });

        it('Minter is the owner', async function () {
            expect((await erc20._minter())).to.equal(owner.address);
        });

        it('Should return total supply', async function () {

            const totalSupply = await erc20._totalSupply();
            expect(totalSupply).to.equal(`${TOTAL_SUPPLY}`);
        })

        it('Owner should have total supply', async function () {

            expect((await erc20.balanceOf(owner.address))).to.equal(`${TOTAL_SUPPLY}`);
        });

    })

    describe("Transactions", function () {

        it('Increase allowance of the addreess', async function () {

            const initial_allowance = await erc20.allowance(owner.address, addr1.address);

            const tx1 = erc20.connect(owner).increaseAllowance(addr1.address, 100);
            await expect(tx1).to.emit(erc20, "Approval").withArgs(owner.address, addr1.address, 100);

            const new_allowance = await erc20.allowance(owner.address, addr1.address);
            expect(new_allowance).to.equal(initial_allowance.add(100));

            const tx2 = erc20.connect(owner).increaseAllowance(ZERO_ADDRESS, 100);
            await expect(tx2).to.be.revertedWith("ERC20: approve to the zero address");

            // const tx3 = erc20.connect(ZERO_ADDRESS).increaseAllowance(owner.address, 100);
            // await expect(tx3).to.be.revertedWith("ERC20: approve from the zero address");

        });

        it('Transfer to address', async function () {

            const initial_balance_owner = await erc20.balanceOf(owner.address);
            const initial_balance_receipient = await erc20.balanceOf(addr1.address);

            const tx = erc20.connect(owner).transfer(addr1.address, 100);
            await expect(tx).to.emit(erc20, "Transfer").withArgs(owner.address, addr1.address, 100);

            const new_balance_owner = await erc20.balanceOf(owner.address);
            const new_balance_receipient = await erc20.balanceOf(addr1.address);

            expect(new_balance_owner).to.equal(initial_balance_owner.sub(100));
            expect(new_balance_receipient).to.equal(initial_balance_receipient.add(100));

            const tx2 = erc20.connect(owner).transfer(ZERO_ADDRESS, 100);
            await expect(tx2).to.be.revertedWith("Cannot send to zero address");

            const tx3 = erc20.connect(addr1).transfer(owner.address, 200);
            await expect(tx3).to.be.revertedWith("Sender does not have enough funds");
        });

        it('Transfer from address1 to address2 by the owner', async function () {

            const initial_balance_sender = await erc20.balanceOf(owner.address);
            const initial_balance_receipient = await erc20.balanceOf(addr2.address);
            const amount = 50;
            const extra_amount = 10000;
            const initial_allowance = await erc20.allowance(owner.address, addr1.address);

            let tx0 = erc20.connect(addr1).transferFrom(owner.address, addr2.address, amount);
            await expect(tx0).to.be.revertedWith("Receipient allowance is below the value needed");

            let tx1 = await erc20.connect(owner).increaseAllowance(addr1.address, 100);
            await expect(tx1).to.emit(erc20, "Approval").withArgs(owner.address, addr1.address, 100);

            let tx2 = erc20.connect(addr1).transferFrom(owner.address, addr2.address, extra_amount);
            await expect(tx2).to.be.revertedWith("Sender balance is too low");

            let tx3 = erc20.connect(addr1).transferFrom(owner.address, addr2.address, amount);
            await expect(tx3).to.emit(erc20, "Transfer").withArgs(owner.address, addr2.address, amount);

            const new_balance_sender = await erc20.balanceOf(owner.address);
            const new_balance_receipient = await erc20.balanceOf(addr2.address);
            const new_allowance = await erc20.allowance(owner.address, addr1.address);

            expect(new_balance_sender).to.equal(initial_balance_sender.sub(amount));
            expect(new_balance_receipient).to.equal(initial_balance_receipient.add(amount));
            expect(new_allowance).to.equal(initial_allowance.add(100).sub(amount));

        });

        it('Decrease allowance of the address', async function () {

            const initial_allowance = await erc20.allowance(owner.address, addr1.address);

            await erc20.connect(owner).increaseAllowance(addr1.address, 100);
            await erc20.connect(owner).decreaseAllowance(addr1.address, 20);

            expect((await erc20.allowance(owner.address, addr1.address))).to.equal(initial_allowance.add(80));
        });

    });

    describe("Minting and burning", function () {

        it('Should mint a certain amount to the address', async function () {

            const initial_balance = await erc20.balanceOf(addr1.address);
            const intial_total_supply = await erc20._totalSupply();

            let tx = erc20.connect(owner)._mint(ZERO_ADDRESS, 20);
            await expect(tx).to.be.revertedWith("ERC20: mint to the zero address");

            await erc20.connect(owner)._mint(addr1.address, 20);

            const new_balance = await erc20.balanceOf(addr1.address);
            const new_total_supply = await erc20._totalSupply();

            expect(new_balance).to.equal(initial_balance.add(20));
            expect(new_total_supply).to.equal(intial_total_supply.add(20));

        });

        it('Should burn a certain amount', async function () {

            const initial_balance = await erc20.balanceOf(owner.address);
            const intial_total_supply = await erc20._totalSupply();

            const tx = erc20.connect(owner)._burn(20);
            await expect(tx).to.emit(erc20, "Burned").withArgs(owner.address, 20);

            const new_balance = await erc20.balanceOf(owner.address);
            const new_total_supply = await erc20._totalSupply();

            expect(new_balance).to.equal(initial_balance.sub(20));
            expect(new_total_supply).to.equal(intial_total_supply.sub(20));

            const tx1 = erc20.connect(owner)._burn(20000);
            await expect(tx1).to.be.revertedWith("The balance is less than burning amount");

            // const tx2 = erc20.connect(addr2)._burn(20);
            // await expect(tx2).to.be.revertedWith("Does not have a burner role");

        });

    });

})