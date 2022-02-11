import { expect } from "chai";
import { ethers } from "hardhat";
import { MyNFT, ERC20, PropertyMarketplace } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("PropertyMarketplace", function () {

    let Token;
    let Nft;
    let Marketplace;
    let token: ERC20;
    let nft: MyNFT;
    let marketplace: PropertyMarketplace;
    let admin: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;

    const TEST_URI = "TestURI1";
    const TEST_URI2 = "TestURI2";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {

        Token = await ethers.getContractFactory("ERC20");
        token = await Token.deploy('Apple', 'APL')

        Marketplace = await ethers.getContractFactory("PropertyMarketplace");
        marketplace = await Marketplace.deploy(token.address);

        Nft = await ethers.getContractFactory("MyNFT");
        nft = await Nft.deploy(marketplace.address);

        marketplace.setNftContract(nft.address);

        [admin, addr1, addr2, addr3] = await ethers.getSigners();

    });

    describe('Minting', function () {

        it('Should mint a new NFT', async function () {

            const tx = marketplace.connect(addr1).createItem(TEST_URI);
            await expect(tx).to.emit(nft, 'Transfer').withArgs(ZERO_ADDRESS, addr1.address, 1);

        });

        it('Should revert minting a new NFT', async function () {

            const tx = nft.connect(addr1).createToken(addr1.address, TEST_URI);
            await expect(tx).to.be.revertedWith('Only marketplace can mint');

        });

        it('Should return market item info', async function () {

            await marketplace.connect(addr1).createItem(TEST_URI);
            await marketplace.connect(addr1).listItem(1, 100);
            const [itemId, price, lastBid, auctionStartTime] = await marketplace.connect(addr2).getMarketItem(1);
            expect(itemId).to.be.equal(1);
            expect(price).to.be.equal(100);
            expect(lastBid).to.be.equal(0);
            expect(auctionStartTime).to.be.equal(0);

        });

        it('Should set and return auction duration', async function () {

            const tx1 = await marketplace.getAuctionDuration();
            expect(tx1).to.be.equal(3);

            await marketplace.setAuctionDuration(5);
            const tx2 = await marketplace.getAuctionDuration();
            expect(tx2).to.be.equal(5);

        });

    });

    describe('Listing and buying', function () {

        beforeEach(async function () {

            await marketplace.connect(addr1).createItem(TEST_URI);
        });

        it('Should list an item', async function () {

            const tx1 = await marketplace.connect(addr1).listItem(1, 100);
            expect(tx1).to.emit(marketplace, 'Listed').withArgs(addr1.address, 1, 100);

            await marketplace.connect(addr1).listItem(1, 200);
            const [itemId, price, lastBid, auctionStartTime] = await marketplace.getMarketItem(1);
            expect(itemId).to.be.equal(1);
            expect(price).to.be.equal(200);
            expect(lastBid).to.be.equal(0);
            expect(auctionStartTime).to.be.equal(0);

        });

        it('Should revert listing an item', async function () {

            const tx1 = marketplace.connect(addr2).listItem(1, 100);
            await expect(tx1).to.be.revertedWith("Item does not exist or you are not the owner")

        });

        it('Should buy an item', async function () {

            await token.mint(addr2.address, 200);
            await marketplace.connect(addr1).listItem(1, 100);
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
            await token.connect(addr2).approve(marketplace.address, 100);
            const tx1 = marketplace.connect(addr2).buyItem(1);
            expect(tx1).to.emit(marketplace, 'Sold').withArgs(addr1.address, addr2.address, 1, 100);

        });


        it('Should revert buying an item', async function () {

            await token.mint(addr2.address, 200);
            await token.connect(addr2).approve(marketplace.address, 200);
            const tx1 = marketplace.connect(addr2).buyItem(1);
            await expect(tx1).to.be.revertedWith("Buying non-existing item");

            await marketplace.connect(addr1).listItem(1, 100);
            await marketplace.connect(addr1).listItemOnAuction(1, 100);

            const tx2 = marketplace.connect(addr2).buyItem(1);
            await expect(tx2).to.be.revertedWith("The item is on auction");

        });

        it('Should unlist', async function () {

            await marketplace.connect(addr1).listItem(1, 100);
            const tx = marketplace.connect(addr1).cancelListing(1);
            await expect(tx).to.emit(marketplace, 'Unlisted').withArgs(addr1.address, 1);

        });

        it('Should revert unlisting', async function () {

            await marketplace.connect(addr1).listItem(1, 100);
            const tx1 = marketplace.connect(addr1).cancelListing(2);
            await expect(tx1).to.be.revertedWith("Cancelling not listed item");

            const tx2 = marketplace.connect(addr2).cancelListing(1);
            await expect(tx2).to.be.revertedWith("Only owner can cancel listing");

        });
    });

    describe('Auction', function () {

        beforeEach(async function () {

            await marketplace.connect(addr1).createItem(TEST_URI);
            await marketplace.connect(addr1).listItem(1, 100);

        });


        it('Should set a unlisted item on auction', async function () {

            await marketplace.connect(addr2).createItem(TEST_URI);
            const tx = await marketplace.connect(addr2).listItemOnAuction(2, 100);
            expect(tx).to.emit(marketplace, "SetOnAuction").withArgs(addr2.address, 2, 100);

        });

        it('Should set item on auction', async function () {

            const tx = await marketplace.connect(addr1).listItemOnAuction(1, 100);
            expect(tx).to.emit(marketplace, "SetOnAuction").withArgs(addr1.address, 1, 100);
            console.log('item listed');

        });

        it('Should revert setting item on auction', async function () {

            const tx = marketplace.connect(addr2).listItemOnAuction(1, 100);
            await expect(tx).to.be.revertedWith("Only owner can list item on auction");

        });

        it('Should make a bid', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);
            await token.mint(addr2.address, 300);
            await token.connect(addr2).approve(marketplace.address, 300);
            await marketplace.connect(addr2).makeBid(1, 150);
            const [itemId, price, lastBid, _] = await marketplace.connect(addr2).getMarketItem(1);
            expect(itemId).to.be.equal(1);
            expect(price).to.be.equal(100);
            expect(lastBid).to.be.equal(150);

        });

        it('Should revert making a bid', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);
            await token.mint(admin.address, 300);
            await token.connect(admin).approve(marketplace.address, 300);
            await token.mint(addr2.address, 300);
            await token.connect(addr2).approve(marketplace.address, 300);
            await marketplace.connect(admin).makeBid(1, 200);
            const tx1 = marketplace.connect(addr2).makeBid(1, 200);
            await expect(tx1).to.be.revertedWith("Bid is too low");

            const tx2 = marketplace.connect(addr2).makeBid(33, 200);
            await expect(tx2).to.be.revertedWith("Bidding on item out of auction");
        });

        it('Should finish a successfull auction', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true);

            await token.mint(addr2.address, 300);
            await token.connect(addr2).approve(marketplace.address, 300);
            await marketplace.connect(addr2).makeBid(1, 150);

            await token.mint(admin.address, 300);
            await token.connect(admin).approve(marketplace.address, 300);
            await marketplace.connect(admin).makeBid(1, 160);

            await token.mint(addr3.address, 300);
            await token.connect(addr3).approve(marketplace.address, 300);
            await marketplace.connect(addr3).makeBid(1, 170);

            await ethers.provider.send("evm_increaseTime", [345600]);

            const tx = marketplace.finishAuction(1);
            await expect(tx).to.emit(marketplace, 'AuctionFinished').withArgs(addr1.address, addr3.address, 1);

        });

        it('Should finish an unsuccessfull auction', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);

            await token.mint(addr2.address, 300);
            await token.connect(addr2).approve(marketplace.address, 300);
            await marketplace.connect(addr2).makeBid(1, 150);

            await ethers.provider.send("evm_increaseTime", [345600]);

            const tx = marketplace.finishAuction(1);
            await expect(tx).to.emit(marketplace, 'AuctionFinished').withArgs(addr1.address, addr1.address, 1);

        });

        it('Should revert finishing an auction', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);
            const tx = marketplace.finishAuction(1);
            await expect(tx).to.be.revertedWith("Min action duration isn't yet reached");

        });

        it('Should cancel an auction', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);
            await ethers.provider.send("evm_increaseTime", [345600]);

            const tx1 = marketplace.connect(addr1).cancelAuction(1);
            await expect(tx1).to.emit(marketplace, "AuctionCanceled").withArgs(1);

            await marketplace.connect(addr1).listItemOnAuction(1, 100);

            await token.mint(addr2.address, 300);
            await token.connect(addr2).approve(marketplace.address, 300);
            await marketplace.connect(addr2).makeBid(1, 150);

            await token.mint(admin.address, 300);
            await token.connect(admin).approve(marketplace.address, 300);
            await marketplace.connect(admin).makeBid(1, 160);

            await token.mint(addr3.address, 300);
            await token.connect(addr3).approve(marketplace.address, 300);
            await marketplace.connect(addr3).makeBid(1, 170);

            await ethers.provider.send("evm_increaseTime", [345600]);

            const tx2 = marketplace.connect(addr1).cancelAuction(1);
            await expect(tx2).to.emit(marketplace, "AuctionCanceled").withArgs(1);

            const tx3 = await token.balanceOf(addr3.address);
            expect(tx3).to.be.equal(300);

        });

        it('Should revert canceling an auction', async function () {

            await marketplace.connect(addr1).listItemOnAuction(1, 100);
            const tx1 = marketplace.cancelAuction(1);
            await expect(tx1).to.be.revertedWith("Only owner can cancel auction");

            const tx2 = marketplace.connect(addr1).cancelAuction(1);
            await expect(tx2).to.be.revertedWith("Min action duration isn't yet reached");

        });



    });

})