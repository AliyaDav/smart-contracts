import { expect } from "chai";
import { ethers } from "hardhat";
import { MyPropertyNft } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("MyPropertyNft", function () {

    let MyPropertyNft;
    let nft: MyPropertyNft;
    let minter: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    const TEST_URI = "TestURI1";
    const TEST_URI2 = "TestURI2";
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {

        MyPropertyNft = await ethers.getContractFactory("MyPropertyNft");
        nft = await MyPropertyNft.deploy();

        [minter, addr1, addr2] = await ethers.getSigners();

    });

    describe('Minting', function () {

        it('Should mint a new NFT', async function () {

            const tx = nft.mint(addr1.address, 1, TEST_URI);
            await expect(tx).to.emit(nft, 'Transfer').withArgs(ZERO_ADDRESS, addr1.address, 1);

            const tokenURI = await nft.tokenURI(1);
            expect(tokenURI).to.be.equal(TEST_URI);

        });

        it('Should revert minting a new NFT', async function () {

            const tx1 = nft.connect(addr2).mint(addr1.address, 1, TEST_URI);
            await expect(tx1).to.be.revertedWith("");

            const tx2 = nft.mint(ZERO_ADDRESS, 1, TEST_URI);
            await expect(tx2).to.be.revertedWith("ERC721: mint to the zero address");

            await nft.mint(addr1.address, 1, TEST_URI);
            const tx3 = nft.mint(addr1.address, 1, TEST_URI);
            await expect(tx3).to.be.revertedWith("ERC721: token already minted");

        });

        it('Should return NFT URI', async function () {

            await nft.mint(addr1.address, 1, TEST_URI);
            const tokenURI = await nft.tokenURI(1);
            expect(tokenURI).to.be.equal(TEST_URI);

            const tokenURI2 = nft.tokenURI(5);
            await expect(tokenURI2).to.be.revertedWith('')

        });
    });

    describe('Transfers and approvals', function () {

        it('Owner should be able to transfer NFT', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            const balance0 = await nft.balanceOf(minter.address);
            expect(balance0).to.be.equal(1);

            const tx = nft.transferFrom(minter.address, addr1.address, 1);
            await expect(tx).to.emit(nft, 'Transfer').withArgs(minter.address, addr1.address, 1);

        });

        it('TransferFrom should be called by non-owner', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            await nft.approve(addr1.address, 1);

            const tx = nft.transferFrom(minter.address, addr1.address, 1);
            await expect(tx).to.emit(nft, 'Transfer').withArgs(minter.address, addr1.address, 1);

        });

        it('Should revert transfer to zero address', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            const tx = nft.transferFrom(minter.address, ZERO_ADDRESS, 1);
            await expect(tx).to.be.revertedWith("");

        });

        it('Should revert approvals', async function () {

            await nft.mint(minter.address, 1, TEST_URI);

            const tx1 = nft.connect(addr2).approve(addr1.address, 1);
            await expect(tx1).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");

            const tx2 = nft.approve(minter.address, 1);
            await expect(tx2).to.be.revertedWith("ERC721: approval to current owner");

            const tx3 = nft.approve(addr1.address, 2);
            await expect(tx3).to.be.revertedWith("");

        });

        it('Should revert getApproved', async function () {

            const tx4 = nft.getApproved(2);
            await expect(tx4).to.be.revertedWith("ERC721: approved query for nonexistent token");

        });

        it('Should return approved address', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            await nft.approve(addr1.address, 1);

            const tx4 = nft.getApproved(2);
            await expect(tx4).to.be.revertedWith("ERC721: approved query for nonexistent token");

            const approved = await nft.getApproved(1);
            expect(approved).to.be.equal(addr1.address);

        });

        it('Owner should set approval for all NFTs', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            await nft.mint(minter.address, 2, TEST_URI2);

            const tx = nft.setApprovalForAll(addr1.address, true);
            await expect(tx).to.emit(nft, 'ApprovalForAll').withArgs(minter.address, addr1.address, true);

            const approval = await nft.isApprovedForAll(minter.address, addr1.address);
            expect(approval).to.be.equal(true);
        });

        it('Owner should revert setting approval for all NFTs', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            const tx = nft.setApprovalForAll(minter.address, true);
            await expect(tx).to.be.revertedWith("");

        });

        it('Should revert transfer', async function () {

            await nft.mint(minter.address, 1, TEST_URI);

            const tx = nft.transferFrom(minter.address, addr1.address, 4);
            await expect(tx).to.be.revertedWith("ERC721: operator query for nonexistent token");

        });
    });

    describe('Burning NFT', function () {

        it('Only minter should be able to burn NFT', async function () {

            await nft.mint(minter.address, 1, TEST_URI);
            await nft.transferFrom(minter.address, addr1.address, 1);

            const tx = nft.connect(addr1).burn(1);
            await expect(tx).to.be.revertedWith("");

            await nft.connect(addr1).transferFrom(addr1.address, minter.address, 1);
            const tx2 = nft.burn(1);
            await expect(tx2).to.emit(nft, "Transfer").withArgs(minter.address, ZERO_ADDRESS, 1);

        });

    });

    describe('Various checks', function () {

        it('Should revert balance check', async function () {

            const balance = nft.balanceOf(ZERO_ADDRESS);
            await expect(balance).to.be.revertedWith('');

        });

        it('Contract should receive NFT', async function () {

            await nft.mint(nft.address, 1, TEST_URI);
        });

    });

})