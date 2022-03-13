import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Adapter, TestERC20 } from "../typechain";
import { LiquidityAddedEvent, LiquidityETHAddedEvent, LiquidityRemovedEvent } from "../typechain/Adapter";
import { parseUnits } from "ethers/lib/utils";

describe("Adapter", function () {

    let Adapter;
    let TokenTST;
    let TokenACDM;
    let TokenPOP;
    let tokenTST: TestERC20;
    let tokenACDM: TestERC20;
    let tokenPOP: TestERC20;
    let adapter: Adapter;

    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;
    let addr4: SignerWithAddress;

    beforeEach(async function () {

        TokenTST = await ethers.getContractFactory("TestERC20");
        tokenTST = await TokenTST.deploy('Test', 'TST');
        await tokenTST.deployed();

        TokenACDM = await ethers.getContractFactory("TestERC20");
        tokenACDM = await TokenACDM.deploy('Academ', 'ACDM');
        await tokenACDM.deployed();

        TokenPOP = await ethers.getContractFactory("TestERC20");
        tokenPOP = await TokenPOP.deploy('Popular', 'POP');
        await tokenPOP.deployed();

        Adapter = await ethers.getContractFactory("Adapter");
        adapter = await Adapter.deploy('0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
        await adapter.deployed();

        [addr1, addr2, addr3, addr4] = await ethers.getSigners();

        tokenTST.mint(addr1.address, parseUnits('1000000'));
        tokenACDM.mint(addr1.address, parseUnits('1000000'));
        tokenPOP.mint(addr1.address, parseUnits('1000000'));

    });

    describe('Add liquidity TST/ACDM, ACDM/POP, ETH/POP', function () {

        it('Should add liquidity to pools TST/ACDM, ACDM/POP, ETH/POP', async function () {

            const amountTST = parseUnits('50');
            const amountACDM = parseUnits('100');
            const amountPOP = parseUnits('200');

            await tokenTST.approve(adapter.address, amountTST);
            await tokenACDM.approve(adapter.address, amountACDM.mul(2));
            await tokenPOP.approve(adapter.address, amountPOP.mul(2));

            const balanceTST_before = await tokenTST.balanceOf(addr1.address);
            const balanceACDM_before = await tokenACDM.balanceOf(addr1.address);
            const balancePOP_before = await tokenACDM.balanceOf(addr1.address);

            await adapter.addLiquidity(tokenTST.address, tokenACDM.address, amountTST, amountACDM, amountTST, amountACDM, addr1.address);
            await adapter.addLiquidity(tokenACDM.address, tokenPOP.address, amountACDM, amountPOP, amountACDM, amountPOP, addr1.address);
            await adapter.addLiquidityETH(tokenPOP.address, amountPOP, amountPOP, 10000, addr1.address, { value: 10000 });

            expect(await tokenTST.balanceOf(addr1.address)).to.be.eq(balanceTST_before.sub(amountTST));
            expect(await tokenACDM.balanceOf(addr1.address)).to.be.eq(balanceACDM_before.sub(amountACDM.mul(2)));
            expect(await tokenPOP.balanceOf(addr1.address)).to.be.eq(balancePOP_before.sub(amountPOP.mul(2)));

        });

        it('Should remove liquidity from ETH/POP pool', async function () {

            const amountPOP = parseUnits('200');
            const balancePOP_before = await tokenACDM.balanceOf(addr1.address);

            await tokenPOP.approve(adapter.address, amountPOP);
            await adapter.addLiquidityETH(tokenPOP.address, amountPOP, amountPOP, 10000, addr1.address, { value: 10000 });

            const filter = adapter.filters.LiquidityETHAdded(null);
            let pastEvents = await adapter.queryFilter(filter) as LiquidityETHAddedEvent[];
            const liquidity = pastEvents[0].args.liquidity;

            const RouterV2 = await ethers.getContractAt('IUniswapV2Router02', '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
            const WETH = await RouterV2.WETH();

            const PairAddress = await adapter.getPair(WETH, tokenPOP.address);
            const Pair = await ethers.getContractAt("IUniswapV2Pair", PairAddress);
            await Pair.approve(adapter.address, liquidity);

            await adapter.removeLiquidityETH(tokenPOP.address, liquidity, 1000, 1000, addr1.address);

        });

        it('Should remove liquidity from TST/ACDM pool', async function () {

            const amountTST = parseUnits('50');
            const amountACDM = parseUnits('100');

            await tokenTST.approve(adapter.address, amountTST);
            await tokenACDM.approve(adapter.address, amountACDM);

            const tx1 = adapter.addLiquidity(tokenTST.address, tokenACDM.address, amountTST, amountACDM, 1000000, 100000, addr1.address);
            // const receipt = await tx1.wait();
            // const events = receipt.events;
            await expect(tx1).to.emit(adapter, 'LiquidityAdded');
            const filter = adapter.filters.LiquidityAdded(null);
            let pastEvents = await adapter.queryFilter(filter) as LiquidityAddedEvent[];
            const liquidity = pastEvents[0].args.liquidity;

            const PairAddress = await adapter.getPair(tokenTST.address, tokenACDM.address);
            const Pair = await ethers.getContractAt("IUniswapV2Pair", PairAddress);
            const balanceLP = await Pair.balanceOf(addr1.address);
            await Pair.approve(adapter.address, balanceLP);

            const balanceA_before = await tokenTST.balanceOf(addr1.address);
            const balanceB_before = await tokenACDM.balanceOf(addr1.address);
            console.log('balance before:', balanceA_before, balanceB_before);

            console.log('start removing liquidity');

            await adapter.removeLiquidity(tokenTST.address, tokenACDM.address, liquidity, 1000, 1000, addr1.address);
            const filter2 = adapter.filters.LiquidityRemoved(null);
            let pastEvents2 = await adapter.queryFilter(filter2) as LiquidityRemovedEvent[];
            const amountA = pastEvents2[0].args.amountA;
            const amountB = pastEvents2[0].args.amountA;
            console.log('removed liquidity:', amountA, amountB);
            // console.log('balance of TST:', await adapter.getBalance(tokenTST.address));
            // console.log('balance of ACDM:', await adapter.getBalance(tokenACDM.address));

            console.log('balance after', await tokenTST.balanceOf(addr1.address), await tokenACDM.balanceOf(addr1.address));

            // await adapter.withdraw(tokenTST.address);
            // await adapter.withdraw(tokenACDM.address);

            // expect(await tokenTST.balanceOf(addr1.address)).to.be.eq(balanceA_before.add(amountA));
            // expect(await tokenACDM.balanceOf(addr1.address)).to.be.eq(balanceB_before.add(amountB));

        });

        it('Should return the price of 100 TST tokens', async function () {

            await tokenTST.approve(adapter.address, ethers.BigNumber.from(50000));
            await tokenACDM.approve(adapter.address, ethers.BigNumber.from(50000));
            await adapter.addLiquidity(tokenTST.address, tokenACDM.address, 10000, 20000, 10000, 20000, addr1.address);

            const tx = adapter.getQuote(tokenTST.address, tokenTST.address, 100);
            await expect(tx).to.be.revertedWith("");
            const amount = await adapter.getQuote(tokenTST.address, tokenACDM.address, 100);
            console.log(amount);

        });

        it('Should swap exact TST to ACDM', async function () {

            const amountTST = parseUnits('50');
            const amountACDM = parseUnits('100');

            await tokenTST.approve(adapter.address, amountTST);
            await tokenACDM.approve(adapter.address, amountACDM);

            await adapter.addLiquidity(tokenTST.address, tokenACDM.address, amountTST, amountACDM, 1000000, 100000, addr1.address);

            await tokenTST.approve(adapter.address, parseUnits('5'));
            const tx = adapter.swapExactTokensForTokens(parseUnits('5'), parseUnits('5'), [tokenTST.address, tokenACDM.address], addr1.address);
            await expect(tx).to.emit(adapter, 'TokensSwapped');

        });

        it('Should swap TST to exact ACDM', async function () {

            const amountTST = parseUnits('50');
            const amountACDM = parseUnits('100');

            await tokenTST.approve(adapter.address, amountTST);
            await tokenACDM.approve(adapter.address, amountACDM);

            await adapter.addLiquidity(tokenTST.address, tokenACDM.address, amountTST, amountACDM, 1000000, 100000, addr1.address);

            await tokenTST.approve(adapter.address, parseUnits('5'));

            const tx = adapter.swapTokensForExactTokens(parseUnits('6'), parseUnits('5'), [tokenTST.address, tokenACDM.address], addr1.address);
            await expect(tx).to.emit(adapter, 'TokensSwapped');

        });

        it('Should swap TST/POP', async function () {

            const amountTST = parseUnits('50');
            const amountACDM = parseUnits('100');
            const amountPOP = parseUnits('200');

            await tokenTST.approve(adapter.address, amountTST);
            await tokenACDM.approve(adapter.address, amountACDM.mul(2));
            await tokenPOP.approve(adapter.address, amountPOP.mul(2));

            await adapter.addLiquidity(tokenTST.address, tokenACDM.address, amountTST, amountACDM, amountTST, amountACDM, addr1.address);
            await adapter.addLiquidity(tokenACDM.address, tokenPOP.address, amountACDM, amountPOP, amountACDM, amountPOP, addr1.address);

            await tokenTST.approve(adapter.address, parseUnits('5'));
            const tx = adapter.swapExactTokensForTokens(parseUnits('5'), parseUnits('5'), [tokenTST.address, tokenACDM.address, tokenPOP.address], addr1.address);
            await expect(tx).to.emit(adapter, 'TokensSwapped');

            await adapter.withdraw(tokenTST.address);
            await adapter.withdrawETH();
            console.log(await adapter.getBalance(tokenACDM.address));
            console.log(await adapter.getBalanceETH());

        });

    });

});

