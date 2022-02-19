import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { expect } from "chai";

describe("Bridge", function () {

  let Bridge;
  let Token;
  let bridge: Contract;
  let token: Contract;
  let admin: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;

  beforeEach(async function () {

    Token = await ethers.getContractFactory("ERC20Base");
    token = await Token.deploy('Apple', 'APL');

    Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy();

    [admin, addr1, addr2, addr3] = await ethers.getSigners();

    const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('ADMIN_ROLE'));

    await token.grantRole(role, bridge.address);
    await token.mint(addr1.address, 1000);

    await bridge.addToken(token.address);
    await bridge.addChain(4);

  });

  describe('Setters', function () {

    it('Should add and remove a token', async function () {

      const result1 = await bridge.allowedTokens('APL');
      expect(result1).to.be.true;

      await bridge.removeToken('APL');
      const result2 = await bridge.allowedTokens('APL');
      expect(result2).to.be.false;

    });

    it('Should add and remove a chain', async function () {

      await bridge.addChain(3);
      const result1 = await bridge.allowedChains(3);
      expect(result1).to.be.true;

      await bridge.removeChain(3);
      const result2 = await bridge.allowedChains(3);
      expect(result2).to.be.false;

    });

    it('Should revert adding and removing a token', async function () {

      const tx1 = bridge.connect(addr1).addToken(token.address);
      await expect(tx1).to.be.revertedWith("");

      // await bridge.addToken(token.address);
      const tx2 = bridge.connect(addr1).removeToken(token.address);
      await expect(tx2).to.be.revertedWith("");

    });

    it('Should revert adding and removing a chain', async function () {

      const tx1 = bridge.connect(addr1).addChain(3);
      await expect(tx1).to.be.revertedWith("");

      await bridge.addChain(3);
      const tx2 = bridge.connect(addr1).removeChain(3);
      await expect(tx2).to.be.revertedWith("");

    });

  });

  describe('Swap', function () {


    it('Should revert swapping', async function () {

      const tx1 = bridge.connect(addr1).swap(addr2.address, 100, 0, 4, bridge.address);
      await expect(tx1).to.be.revertedWith("This token is not allowed");

      const tx2 = bridge.connect(addr1).swap(addr2.address, 100, 0, 34, 'APL');
      await expect(tx2).to.be.revertedWith("This chain is not allowed");

    });

    it('Should redeem tokens', async function () {

      const tx = bridge.connect(addr1).swap(addr2.address, 100, 0, 4, 'APL');
      await expect(tx).to.emit(bridge, 'SwapInitialized').withArgs(addr1.address, addr2.address, 100, 0, 4, 'APL');
      const balance1 = await token.balanceOf(addr1.address);
      expect(balance1).to.be.equal(900);

      let messageHash = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
        [addr1.address, addr2.address, 100, 0, 4, 'APL']);

      const messageArray = ethers.utils.arrayify(messageHash);
      const rawSignature = await admin.signMessage(messageArray);

      await bridge.connect(addr1).redeem(addr1.address, addr2.address, 100, 0, 4, 'APL', rawSignature);
      const tx1 = bridge.connect(addr1).redeem(addr1.address, addr2.address, 100, 0, 4, 'APL', rawSignature);
      await expect(tx1).to.be.revertedWith("");

      const balance2 = await token.balanceOf(addr2.address);
      expect(balance2).to.be.equal(100);

    });

    it('Should revert redeeming tokens', async function () {

      const tx = await bridge.connect(addr1).swap(addr2.address, 100, 0, 4, 'APL');
      const balance1 = await token.balanceOf(addr1.address);
      expect(balance1).to.be.equal(900);

      expect(tx).to.emit(bridge, 'SwapInitialized').withArgs(addr1.address, addr2.address, 100, 0, 4, 'APL');

      let signer = addr3;

      let messageHash = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'uint256', 'uint256', 'string'],
        [addr1.address, addr2.address, 100, 0, 4, 'APL']);

      const messageArray = ethers.utils.arrayify(messageHash);
      const falseSignature = await signer.signMessage(messageArray);
      const trueSignature = await admin.signMessage(messageArray);

      const tx1 = bridge.connect(addr1).redeem(addr1.address, addr2.address, 100, 0, 4, 'BBB', trueSignature);
      await expect(tx1).to.be.revertedWith("");

      const tx2 = bridge.connect(addr1).redeem(addr1.address, addr2.address, 100, 0, 23, 'APL', trueSignature);
      await expect(tx2).to.be.revertedWith("");

      const tx3 = bridge.connect(addr1).redeem(addr1.address, addr2.address, 100, 0, 4, 'APL', falseSignature);
      await expect(tx3).to.be.revertedWith("");

    });

  });

});
