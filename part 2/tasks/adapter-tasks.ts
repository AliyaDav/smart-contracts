import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import { BigNumberish } from "ethers";

const Adapter: string = '0xd0B12894AA62519C43609b1499A15566604Ab2f7';

task("add-liquidity", "Adds liquidity to pool of tokens")

    .addParam("tokenA", "TokenA address")
    .addParam("tokenB", "TokenB address")
    .addParam("amountADesired", "The amount of tokenA to add as liquidity if the B/A price is <= amountBDesired/amountADesired (A depreciates).")
    .addParam("amountBDesired", "The amount of tokenB to add as liquidity if the A/B price is <= amountADesired/amountBDesired (B depreciates).")
    .addParam("amountAMin", "Bounds the extent to which the B/A price can go up before the transaction reverts")
    .addParam("amountBMin", "Bounds the extent to which the A/B price can go up before the transaction reverts")
    .addParam("to", "Recipient of the liquidity tokens")
    .setAction(async (taskArgs: {
        tokenA: string,
        tokenB: string,
        amountADesired: BigNumberish,
        amountBDesired: BigNumberish,
        amountAMin: BigNumberish,
        amountBMin: BigNumberish,
        to: string,
    }, hre) => {

        const tokenA = await hre.ethers.getContractAt("ERC20", taskArgs.tokenA);
        await tokenA.approve(Adapter, taskArgs.amountADesired);
        const tokenB = await hre.ethers.getContractAt("ERC20", taskArgs.tokenB);
        await tokenB.approve(Adapter, taskArgs.amountBDesired);

        const adapter = await hre.ethers.getContractAt("Adapter", Adapter);
        await adapter.addLiquidity(taskArgs.tokenA, taskArgs.tokenB, taskArgs.amountADesired, taskArgs.amountBDesired, taskArgs.amountAMin,
            taskArgs.amountBMin, taskArgs.to);
    });

task("swapExactForTokens", "Swaps exact A tokens for B tokens")
    .addParam("amountIn", "TokenA address")
    .addParam("amountOut", "TokenB address")
    .addParam("path", "List of token addresses")
    .addParam("to", "Recipient of tokens")
    .setAction(async (taskArgs: {
        amountIn: BigNumberish,
        amountOut: BigNumberish,
        path: string[],
        to: string,
    }, hre) => {

        const tokenA = await hre.ethers.getContractAt("ERC20", taskArgs.path[0]);
        await tokenA.approve(Adapter, taskArgs.amountIn);

        const adapter = await hre.ethers.getContractAt("Adapter", Adapter);
        await adapter.swapExactTokensForTokens(taskArgs.amountIn, taskArgs.amountOut, taskArgs.path, taskArgs.to);
    });