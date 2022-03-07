import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { expect } from "chai";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { parse } from "path";

describe("Platform", function () {

    let ACDMPlatform;
    let Token;
    let Test;
    let test: Contract;
    let platform: Contract;
    let token: Contract;
    let admin: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;
    let addr4: SignerWithAddress;
    let addr5: SignerWithAddress;
    let addr6: SignerWithAddress;
    let addr7: SignerWithAddress;

    before(async function () {

        Token = await ethers.getContractFactory("ERC20Base");
        token = await Token.deploy('Apple', 'APL');
        await token.deployed();

        ACDMPlatform = await ethers.getContractFactory("ACDMPlatform");
        platform = await ACDMPlatform.deploy(token.address);
        await platform.deployed();

        [admin, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();

        const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ADMIN_ROLE'));

        await token.grantRole(role, platform.address);
        const amountForSale = ethers.BigNumber.from('100000');
        await token.mint(platform.address, amountForSale);

        const tx1 = platform.connect(addr1).register(admin.address);
        await platform.connect(addr3).register(addr1.address);
        await platform.connect(addr4).register(admin.address);
        await platform.connect(addr6).register(addr7.address);
        await expect(tx1).to.emit(platform, "UserRegistered").withArgs(addr1.address, admin.address);

    });

    describe('Sale and trade', function () {

        it('Should revert register', async function () {

            const tx1 = platform.connect(addr2).register(addr2.address);
            await expect(tx1).to.be.revertedWith("Access: self-referral not allowed");

            const tx2 = platform.connect(addr1).register(admin.address);
            await expect(tx2).to.be.revertedWith("Access: user already registered");

        });

        it('Should revert finishing sale round', async function () {

            await ethers.provider.send("evm_increaseTime", [300000]);
            const tx = platform.startTradePeriod();
            await expect(tx).to.be.revertedWith("Balance: tokens unsold");

        });

        it('Should buy tokens on sale and pay commisions', async function () {

            const ethAmount = parseUnits("100000.0", "gwei");

            const balance0Before = await admin.getBalance();
            const balance1Before = await addr1.getBalance();

            await platform.connect(addr6).buyTokens(ethers.BigNumber.from('10'), { value: ethAmount });
            await platform.connect(addr3).buyTokens(ethers.BigNumber.from('10'), { value: ethAmount });
            expect(await token.balanceOf(addr3.address)).to.be.equal(ethers.BigNumber.from('10'));

            const balance1After = await addr1.getBalance();
            expect(balance1After).to.be.eq(balance1Before.add(parseUnits("5000.0", "gwei")));

            const balance0After = await admin.getBalance();
            expect(balance0After).to.be.eq(balance0Before.add(parseUnits("3000.0", "gwei")));

        });

        it('Should revert buying tokens', async function () {

            const tx1 = platform.connect(addr1).buyTokens(10);
            await expect(tx1).to.be.revertedWith("Balance: amount sent is invalid");

            const ethAmount = parseUnits("1500000000.0", "gwei");

            const tx2 = platform.connect(addr3).buyTokens(ethers.BigNumber.from('150000'), { value: ethAmount });
            await expect(tx2).to.be.revertedWith("Balance: insufficient token supply");

            const tx3 = platform.connect(addr2).buyTokens(ethers.BigNumber.from('10'), { value: parseUnits("100000.0", "gwei") });
            await expect(tx3).to.be.revertedWith("Access: user not registered");

        });
    });

    describe('Trade round', function () {

        it('Should revert placing an order because of wrong round', async function () {

            const tx1 = platform.connect(addr1).addOrder(ethers.BigNumber.from('100'), parseUnits("5000.0", "gwei"));
            await expect(tx1).to.be.revertedWith("Round: invalid");

        });

        it('Should start a trade round', async function () {

            await ethers.provider.send("evm_increaseTime", [300000]);

            const tx1 = platform.startTradePeriod();
            await expect(tx1).to.emit(platform, 'TradeRoundStarted').withArgs(1);

        });

        it('Should revert placing an order', async function () {

            const tx1 = platform.connect(addr2).addOrder(ethers.BigNumber.from('100'), parseUnits("5000.0", "gwei"));
            await expect(tx1).to.be.revertedWith("Access: user not registered");

            const tx2 = platform.connect(addr3).addOrder(ethers.BigNumber.from('100'), parseUnits("5000.0", "gwei"));
            await expect(tx2).to.be.revertedWith("Balance: insufficient balance of tokens");

        });

        it('Should place an order', async function () {

            await token.mint(addr3.address, ethers.BigNumber.from('1000'));
            await token.connect(addr3).approve(platform.address, ethers.BigNumber.from('1000'));

            const tx1 = platform.connect(addr3).addOrder(ethers.BigNumber.from('100'), parseUnits("5000.0", "gwei"));
            await expect(tx1).to.emit(platform, 'OrderPlaced').withArgs(1, addr3.address, 0);

        });

        it('Should return the order info', async function () {

            let tokenAmount;
            let tokenPrice;
            let creator;

            [tokenAmount, tokenPrice, creator] = await platform.getOrderInfo(0);
            // console.log('token price is', tokenPrice);
            expect(tokenAmount).to.be.eq(ethers.BigNumber.from('100'));
            expect(tokenPrice).to.be.eq(parseUnits('5000', 'gwei'));
            expect(creator).to.be.eq(addr3.address);

        });

        it('Should revert buying tokens on trade', async function () {

            const tx1 = platform.connect(addr1).redeemOrder(ethers.BigNumber.from('120'), 0);
            await expect(tx1).to.be.revertedWith("Balance: amount requested is invalid");

            const tx2 = platform.connect(addr1).redeemOrder(ethers.BigNumber.from('20'), 0);
            await expect(tx2).to.be.revertedWith("Balance: invalid eth value sent");

        });

        it('Should buy tokens on trade and pay commisions', async function () {

            const balance0Before = await addr1.getBalance();

            const tx2 = platform.redeemOrder(ethers.BigNumber.from('20'), 0, { value: parseUnits("100000.0", "gwei") });
            await expect(tx2).to.emit(platform, 'TokenTraded').withArgs(1, 0, ethers.BigNumber.from('20'));

            const balance0After = await addr1.getBalance();
            expect(balance0After).to.be.eq(balance0Before.add(parseUnits("2500.0", "gwei")));

            await platform.redeemOrder(ethers.BigNumber.from('80'), 0, { value: parseUnits("400000.0", "gwei") });

        });

        it('Should revert paying commision', async function () {

            await token.mint(addr5.address, ethers.BigNumber.from('1000'));
            await token.connect(addr5).approve(platform.address, ethers.BigNumber.from('1000'));

            Test = await ethers.getContractFactory("Test");
            test = await Test.deploy(platform.address);
            await test.deployed();

            await platform.connect(addr5).register(test.address);
            await platform.connect(addr5).addOrder(ethers.BigNumber.from('1000'), parseUnits("10.0", "gwei"));

            let tokenAmount;
            let tokenPrice;
            let creator;
            [tokenAmount, tokenPrice, creator] = await platform.getOrderInfo(1);

            const tx = platform.connect(addr4).redeemOrder(ethers.BigNumber.from('2'), 1, { value: parseUnits('20', 'gwei') });
            await expect(tx).to.be.revertedWith("Transfer: failed to send commission to first referral");

        })

        it('Should remove order', async function () {

            const tx0 = platform.connect(addr2).removeOrder(0);
            await expect(tx0).to.be.revertedWith("Access: restriced to order creator");

            const tx1 = platform.connect(addr3).removeOrder(0);
            await expect(tx1).to.emit(platform, 'OrderRemoved').withArgs(1, 0);
        });

        it('Should withdraw funds', async function () {

            await platform.connect(addr3).withdraw();
            const balanceAfter = await platform.connect(addr3).getBalance();
            expect(balanceAfter).to.be.eq(0);

        });

        it('Should revert withdrawal of funds', async function () {

            const callData1 = platform.interface.encodeFunctionData("getBalance");
            const tx1 = test.testFunction(callData1);

            const callData = platform.interface.encodeFunctionData("withdraw");
            const tx = await test.testFunction(callData);

        });

        it('Finish trade round and start sale round', async function () {

            const tx1 = platform.startSaleRound();
            await expect(tx1).to.be.revertedWith("Round: finishing not allowed");

            await ethers.provider.send("evm_increaseTime", [300000]);

            const amountTraded = await platform.amountTradedGWEI();
            const price = await platform.tokenPriceGWEI();
            const newAmount = amountTraded / price;
            const newPrice = price.mul(103).div(100).add(parseUnits('4000', 'gwei'));

            const tx = platform.startSaleRound();
            await expect(tx).to.emit(platform, 'SaleRoundStarted').withArgs(2, ethers.BigNumber.from(newAmount), ethers.BigNumber.from(newPrice));
        });

        it('Should revert starting a trade round', async function () {

            const tx1 = platform.startTradePeriod();
            await expect(tx1).to.be.revertedWith("Round: finishing not allowed");

            await ethers.provider.send("evm_increaseTime", [300000]);

            const tx2 = platform.startTradePeriod();
            await expect(tx2).to.be.revertedWith("Balance: tokens unsold");

        });

        it('Should sent ether to the contract', async function () {

            const tx = admin.sendTransaction({ to: platform.address, value: parseEther("0.001") });
            await expect(tx).to.emit(platform, 'DepositReceived').withArgs(admin.address, parseEther("0.001"));

        });
    });

    describe('Second sale round', function () {

        it('Should fail to pay commission during sale', async function () {

            console.log(await platform.round());
            await platform.connect(addr2).register(addr5.address);
            const price = await platform.tokenPriceGWEI();
            const ethAmount = ethers.BigNumber.from('1').mul(price);
            const tx = platform.connect(addr2).buyTokens(ethers.BigNumber.from('1'), { value: ethAmount });

            await expect(tx).to.be.revertedWith("Transfer: failed commission to second referral");

            const tx2 = platform.connect(addr5).buyTokens(ethers.BigNumber.from('1'), { value: ethAmount });
            await expect(tx2).to.be.revertedWith("Transfer: failed commission to first referral");

        });

    });

});
