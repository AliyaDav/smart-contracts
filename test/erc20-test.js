const { expect } = require("chai");
const { BigNumber } = require('ethers');

describe("ERC20", function () {

    let ERC20;
    let erc20;
    let addr1;
    let addr2;

    const NAME = 'Apple';
    const SYMBOL = 'APL';
    const DECIMALS = 18;
    const TOTAL_SUPPLY = 1000;
    // const owner = '0x51d2f9f3379Fe7D9fF120c9d34E2a696e838A330';

    beforeEach(async function () {

        ERC20 = await ethers.getContractFactory("ERC20");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        erc20 = await ERC20.deploy('Apple', 'APL');
        // await ERC20.deployed();

    });

    describe('Deployment', function () {

        it('Should return name', async function () {
            expect((await erc20.name())).to.equal(`${NAME}`);
        });

        it('Should return symbol', async function () {
            expect((await erc20.symbol())).to.equal(`${SYMBOL}`);
        });

        it('Should return decimals', async function () {
            expect((await erc20.decimals())).to.equal(`${DECIMALS}`);
        });

        it('Minter is the owner', async function () {
            expect((await erc20._minter())).to.equal(owner.address);
        });

        it('Should return total supply', async function () {

            const totalSupply = await erc20.totalSupply();
            expect(totalSupply).to.equal(`${TOTAL_SUPPLY}`);
        })

        it('Owner should have total supply', async function () {

            // const owner_balance = await erc20.balanceOf(owner);
            expect((await erc20.balanceOf(owner.address)).toString()).to.equal(BigNumber.from(`${TOTAL_SUPPLY}`));
        });

    })

    describe("Transactions", function () {

        it('Increase allowance of the addreess', async function () {

            const initial_allowance = await erc20.allowance(owner.address, addr1.address);
            // console.log(initial_allowance);

            await erc20.connect(owner).increaseAllowance(addr1.address, 100);

            const new_allowance = await erc20.allowance(owner.address, addr1.address);
            expect(new_allowance).to.equal(initial_allowance + 100);
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
        });

        it('Transfer from address1 to address2 by the owner', async function () {

            const initial_balance_sender = await erc20.balanceOf(owner.address);
            const initial_balance_receipient = await erc20.balanceOf(addr2.address);
            const amount = 50;

            // check Events
            await erc20.connect(owner).increaseAllowance(addr1.address, 100);
            const initial_allowance = await erc20.allowance(owner.address, addr1.address);

            await erc20.connect(addr1).transferFrom(owner.address, addr2.address, amount);

            const new_balance_sender = await erc20.balanceOf(owner.address);
            const new_balance_receipient = await erc20.balanceOf(addr2.address);
            const new_allowance = await erc20.allowance(owner.address, addr1.address);

            expect(new_balance_sender).to.equal(initial_balance_sender.sub(amount));
            expect(new_balance_receipient).to.equal(initial_balance_receipient.add(amount));
            expect(new_allowance).to.equal(initial_allowance.sub(amount));
        });

        it('Decrease allowance of the address', async function () {

            const initial_allowance = await erc20.allowance(owner.address, addr1.address);

            await erc20.connect(owner).increaseAllowance(addr1.address, 100);
            await erc20.connect(owner).decreaseAllowance(addr1.address, 20);

            expect((await erc20.allowance(owner.address, addr1.address))).to.equal(BigNumber.from(initial_allowance + 80).toString());
        });

    });

    describe("Minting and burning", function () {

        it('Should mint a certain amount to the address', async function () {

            const initial_balance = await erc20.balanceOf(addr1.address);
            const intial_total_supply = await erc20.totalSupply();

            await erc20.connect(owner)._mint(addr1.address, 20);

            const new_balance = await erc20.balanceOf(addr1.address);
            const new_total_supply = await erc20.totalSupply();

            expect(new_balance).to.equal(initial_balance.add(20));
            expect(new_total_supply).to.equal(intial_total_supply.add(20));

        });

        it('Should burn a certain amount', async function () {

            const initial_balance = await erc20.balanceOf(owner.address);
            const intial_total_supply = await erc20.totalSupply();

            await erc20.connect(owner)._burn(20);

            const new_balance = await erc20.balanceOf(owner.address);
            const new_total_supply = await erc20.totalSupply();

            expect(new_balance).to.equal(BigNumber.from(initial_balance - 20).toString());
            expect(new_total_supply).to.equal(BigNumber.from(intial_total_supply - 20).toString());

        });

    });

})