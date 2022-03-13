import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { expect } from "chai";

describe("DAO", function () {

  let DAO;
  let Token;
  let dao: Contract;
  let token: Contract;
  let admin: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;

  beforeEach(async function () {

    Token = await ethers.getContractFactory("ERC20Base");
    token = await Token.deploy('Apple', 'APL');

    DAO = await ethers.getContractFactory("DAO");
    dao = await DAO.deploy(token.address);

    [admin, addr1, addr2, addr3] = await ethers.getSigners();

    await token.mint(addr1.address, 10000);
    await token.mint(addr3.address, 10000);

  });

  describe('Add Proposal', function () {

    it('Should add a proposal', async function () {

      const callData = '0x06fdde03';
      const desc = 'Should return name of the token';

      await dao.addProposal(callData, token.address, desc);

      let descr, votes, startTime;
      [descr, votes, startTime] = await dao.getProposalData(0);
      expect(descr).to.be.eq(desc);

    });

    it('Should revert adding proposal', async function () {

      const callData = '0x06fdde03';
      const desc = 'Should return name of the token';

      const tx = dao.connect(addr1).addProposal(callData, token.address, desc);
      await expect(tx).to.be.revertedWith("");

    });

  });

  describe('Deposit and vote', function () {

    it('Should deposit tokens', async function () {

      await token.connect(addr1).approve(dao.address, 100);
      await dao.connect(addr1).deposit(100);
      const tx = await dao.getVoterDeposit(addr1.address);
      expect(tx).to.be.eq(100);

    });

    it('Should vote', async function () {

      const callData = '0x06fdde03';
      const desc = 'Should return name of the token';
      await dao.addProposal(callData, token.address, desc);

      const tx = dao.connect(addr1).vote(0, true);
      await expect(tx).to.be.revertedWith("Please make a deposit first");

      await token.connect(addr1).approve(dao.address, 100);
      await dao.connect(addr1).deposit(100);

      const tx1 = dao.connect(addr1).vote(1, true);
      await expect(tx1).to.be.revertedWith("Proposal id is invalid or voting has closed");

      await dao.connect(addr1).vote(0, true);
      const tx2 = await dao.getVoterUsedTokens(addr1.address);
      expect(tx2).to.be.eq(100);

    });

  });

  describe('Finish and withdraw', function () {

    it('Should finish the unaccepted proposal', async function () {

      const callData = token.interface.encodeFunctionData("transferFrom",
        [addr1.address, addr2.address, 100]);
      const desc = 'Should transfer from addr1 to addr2 100 tokens';
      await dao.addProposal(callData, token.address, desc);

      const tx = dao.finishProposal(0);
      await expect(tx).to.be.revertedWith("Voting period is not over yet");

      await ethers.provider.send("evm_increaseTime", [300000]);

      await token.connect(addr1).approve(dao.address, 1500);
      await dao.connect(addr1).deposit(500);
      await dao.connect(addr1).vote(0, false);
      await dao.finishProposal(0);
      const balanceAfter1 = await token.balanceOf(addr2.address);
      expect(balanceAfter1).to.be.eq(0);

      await dao.addProposal(callData, token.address, desc);
      await token.connect(addr1).approve(dao.address, 1000);
      await dao.connect(addr1).deposit(1000);

      await token.connect(addr3).approve(dao.address, 1500);
      await dao.connect(addr3).deposit(1500);

      await dao.connect(addr1).vote(1, true);
      await dao.connect(addr3).vote(1, false);
      await ethers.provider.send("evm_increaseTime", [300000]);
      const tx4 = dao.finishProposal(1);
      await expect(tx4).to.emit(dao, "VotingFinished").withArgs(1, false, 1000, 1500, token.address, desc);

    });

    it('Should finish the accepted proposal and withdraw', async function () {

      const callData = token.interface.encodeFunctionData("transferFrom",
        [addr1.address, addr2.address, 100]);
      const desc = 'Should transfer from addr1 to addr2 100 tokens';

      await dao.addProposal(callData, token.address, desc);
      await token.connect(addr1).approve(dao.address, 1500);
      await dao.connect(addr1).deposit(1500);
      await dao.connect(addr1).vote(0, true);
      await ethers.provider.send("evm_increaseTime", [300000]);

      const tx2 = dao.connect(addr1).withdraw();
      await expect(tx2).to.be.revertedWith("");

      const tx1 = dao.finishProposal(0);
      await expect(tx1).to.be.reverted;

      await token.connect(addr1).approve(dao.address, 1500);
      const tx4 = dao.finishProposal(0);
      await expect(tx4).to.emit(dao, "VotingFinished").withArgs(0, true, 1500, 0, token.address, desc);

      const balanceAfter = await token.balanceOf(addr2.address);
      expect(balanceAfter).to.be.eq(100);

      await dao.connect(addr1).withdraw();
      const tx3 = await dao.getVoterDeposit(addr1.address);
      expect(tx3).to.be.eq(0);

    });

    it('Should change voting duration', async function () {

      const callData = dao.interface.encodeFunctionData("changeVotingDuration", ["1"]);
      const desc = 'Change voting duration to one day';
      await dao.addProposal(callData, dao.address, desc);

      await token.connect(addr1).approve(dao.address, 1500);
      await dao.connect(addr1).deposit(1500);
      await dao.connect(addr1).vote(0, true);

      await ethers.provider.send("evm_increaseTime", [3000000]);

      let oldPeriod = await dao.votingDuration();
      const tx1 = dao.finishProposal(0);
      await expect(tx1).to.emit(dao, "VotingPeriodChanged").withArgs(oldPeriod, 1);
      const tx2 = await dao.votingDuration();
      expect(tx2).to.be.eq(1);

    });

    it('Should change minimum quarum', async function () {

      const callData = dao.interface.encodeFunctionData("changeMinQuarum", ["100"]);
      const desc = 'Change minimum quarum to 100';
      await dao.addProposal(callData, dao.address, desc);

      await token.connect(addr1).approve(dao.address, 1500);
      await dao.connect(addr1).deposit(1500);
      await dao.connect(addr1).vote(0, true);

      await ethers.provider.send("evm_increaseTime", [3000000]);

      let oldQuorum = await dao.minQuorum();
      const tx1 = dao.finishProposal(0);
      await expect(tx1).to.emit(dao, "MinQuorumChanged").withArgs(oldQuorum, 100);
      const tx2 = await dao.minQuorum();
      expect(tx2).to.be.eq(100);

    });

    it('Should get proposal data', async function () {

      const callData = dao.interface.encodeFunctionData("getProposalData", ['0']);
      const desc = 'Change minimum quarum to 100';
      await dao.addProposal(callData, token.address, desc);

      let description: string;
      let votesFor: number;
      let votesAgainst: number;
      let startTime: any;

      [description, votesFor, votesAgainst, startTime] = await dao.getProposalData(0);
      expect(description).to.be.equal('Change minimum quarum to 100');
      // console.log(await dao.proposals(0));

    });

    it('Test restricted access', async function () {

      const tx = dao.changeVotingDuration(4);
      await expect(tx).to.be.revertedWith("");

      const tx1 = dao.changeMinQuarum(500);
      await expect(tx1).to.be.revertedWith("");

    });

  });

});
