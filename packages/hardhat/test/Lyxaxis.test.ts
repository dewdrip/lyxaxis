import { expect } from "chai";
import { ethers } from "hardhat";
import { Lyxaxis, MultiSig } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Lyxaxis", function () {
  let lyxaxis: Lyxaxis;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const LyxaxisFactory = await ethers.getContractFactory("Lyxaxis");
    lyxaxis = await LyxaxisFactory.deploy();
  });

  describe("createWallet", function () {
    it("Should create a new multisig wallet successfully", async function () {
      const walletName = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address, addr1.address];
      const signaturesRequired = 2;

      const tx = await lyxaxis.createWallet(walletName, chainId, owners, signaturesRequired);
      const receipt = await tx.wait();

      const lyxaxisAddress = await lyxaxis.getAddress();

      // Find the correct event log
      const eventLog = receipt?.logs.find(log => log.address === lyxaxisAddress);

      // Ensure the event exists
      expect(eventLog).to.not.be.undefined;

      // Decode the event
      const event = lyxaxis.interface.parseLog(eventLog!);
      const multisigAddress = event?.args[1];

      // Validate the multisig address
      expect(multisigAddress).to.be.properAddress;

      // Verify the multisig was added to getMultisig array
      expect(await lyxaxis.getMultisig(0)).to.equal(multisigAddress);

      // Get the MultiSig contract instance
      const multisig = (await ethers.getContractAt("MultiSig", multisigAddress)) as MultiSig;

      // Verify the multisig wallet configuration
      expect(await multisig.name()).to.equal(walletName);
      expect(await multisig.chainId()).to.equal(chainId);
      expect(await multisig.signaturesRequired()).to.equal(signaturesRequired);

      // Verify owners are correctly set
      for (const ownerAddress of owners) {
        expect(await multisig.isOwner(ownerAddress)).to.be.true;
      }
      expect(await multisig.isOwner(addr2.address)).to.be.false;
    });

    it("Should revert when no signatures required", async function () {
      const walletName = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address];
      const signaturesRequired = 0;

      await expect(lyxaxis.createWallet(walletName, chainId, owners, signaturesRequired)).to.be.revertedWithCustomError(
        lyxaxis,
        "Lyxaxis__NoRequiredSignatures",
      );
    });

    it("Should revert when no owners provided", async function () {
      const walletName = "Test Wallet";
      const chainId = 1;
      const owners: string[] = [];
      const signaturesRequired = 1;

      await expect(lyxaxis.createWallet(walletName, chainId, owners, signaturesRequired)).to.be.revertedWithCustomError(
        lyxaxis,
        "Lyxaxis__NoOwners",
      );
    });

    it("Should create multiple wallets successfully", async function () {
      const lyxaxisAddress = await lyxaxis.getAddress();

      // Create first wallet
      const tx1 = await lyxaxis.createWallet("Wallet 1", 1, [owner.address], 1);
      const receipt1 = await tx1.wait();
      const event1 = lyxaxis.interface.parseLog(receipt1?.logs.find(log => log.address === lyxaxisAddress)!);
      const wallet1Address = event1?.args[1];

      // Create second wallet
      const tx2 = await lyxaxis.createWallet("Wallet 2", 1, [owner.address, addr1.address], 2);
      const receipt2 = await tx2.wait();
      const event2 = lyxaxis.interface.parseLog(receipt2?.logs.find(log => log.address === lyxaxisAddress)!);
      const wallet2Address = event2?.args[1];

      const createdMultisigs = await lyxaxis.getMultisigs();

      // Verify both wallets are stored
      expect(createdMultisigs[0]).to.equal(wallet1Address);
      expect(createdMultisigs[1]).to.equal(wallet2Address);

      // Verify addresses are different
      expect(wallet1Address).to.not.equal(wallet2Address);

      // Get MultiSig instances
      const wallet1 = (await ethers.getContractAt("MultiSig", wallet1Address)) as MultiSig;
      const wallet2 = (await ethers.getContractAt("MultiSig", wallet2Address)) as MultiSig;

      // Verify wallet configurations
      expect(await wallet1.name()).to.equal("Wallet 1");
      expect(await wallet1.signaturesRequired()).to.equal(1);
      expect(await wallet1.isOwner(owner.address)).to.be.true;

      expect(await wallet2.name()).to.equal("Wallet 2");
      expect(await wallet2.signaturesRequired()).to.equal(2);
      expect(await wallet2.isOwner(owner.address)).to.be.true;
      expect(await wallet2.isOwner(addr1.address)).to.be.true;
    });
  });
});
