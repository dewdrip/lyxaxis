import { expect } from "chai";
import { ethers } from "hardhat";
import { Lyxaxis } from "../typechain-types";
import { MultiSigRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Lyxaxis", function () {
  let lyxaxis: Lyxaxis;
  let registry: MultiSigRegistry;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Lyxaxis = await ethers.getContractFactory("Lyxaxis");
    lyxaxis = await Lyxaxis.deploy();
    await lyxaxis.waitForDeployment();

    const registryAddress = await lyxaxis.getRegistry();
    registry = await ethers.getContractAt("MultiSigRegistry", registryAddress);
  });

  describe("Deployment", function () {
    it("Should deploy Lyxaxis and MultiSigRegistry", async function () {
      expect(await lyxaxis.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await lyxaxis.getRegistry()).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe("createWallet", function () {
    it("Should create a new multisig wallet", async function () {
      const name = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address, addr1.address];
      const signaturesRequired = 2;

      const tx = await lyxaxis.createWallet(name, chainId, owners, signaturesRequired);
      await tx.wait();

      // Get the multisig address from the registry
      const ownerMultisigs = await registry.getSignerMultisigs(owner);
      const multisigAddress = ownerMultisigs[0];

      // Verify the multisig is registered in the registry
      expect(await registry.isValidMultisig(multisigAddress)).to.be.true;

      // Get the multisig contract
      const multisig = await ethers.getContractAt("MultiSig", multisigAddress);

      // Verify the universal profile was created
      const universalProfileAddress = await multisig.getUniversalProfile();
      expect(universalProfileAddress).to.not.equal(ethers.ZeroAddress);

      // Get the universal profile contract
      const universalProfile = await ethers.getContractAt("LSP0ERC725Account", universalProfileAddress);

      // Verify the universal profile is owned by the multisig
      expect(await universalProfile.owner()).to.equal(multisigAddress);
    });

    it("Should revert if no signatures required", async function () {
      const name = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address];
      const signaturesRequired = 0;

      await expect(lyxaxis.createWallet(name, chainId, owners, signaturesRequired)).to.be.revertedWithCustomError(
        lyxaxis,
        "Lyxaxis__NoRequiredSignatures",
      );
    });

    it("Should revert if no owners provided", async function () {
      const name = "Test Wallet";
      const chainId = 1;
      const owners: string[] = [];
      const signaturesRequired = 1;

      await expect(lyxaxis.createWallet(name, chainId, owners, signaturesRequired)).to.be.revertedWithCustomError(
        lyxaxis,
        "Lyxaxis__NoOwners",
      );
    });
  });

  describe("Signer Management", function () {
    it("Should allow adding a new signer through UP", async function () {
      // Create initial multisig
      const name = "Test Wallet";
      const chainId = 42;
      const owners = [owner.address];
      const signaturesRequired = 1;

      const tx = await lyxaxis.createWallet(name, chainId, owners, signaturesRequired);
      await tx.wait();

      // Get the multisig address
      const ownerMultisigs = await registry.getSignerMultisigs(owner.address);
      const multisigAddress = ownerMultisigs[0];
      const multisig = await ethers.getContractAt("MultiSig", multisigAddress);

      // Add a new signer
      const newSigner = addr2.address;
      const newSignaturesRequired = 2;

      // Execute through UP
      const addSignerData = multisig.interface.encodeFunctionData("addSigner", [newSigner, newSignaturesRequired]);

      const nonce = await multisig.nonce();
      const txHash = await multisig.getTransactionHash(nonce, multisigAddress, 0n, addSignerData);

      const signature = await owner.provider.send("personal_sign", [txHash, owner.address]);

      const addSignerTx = await multisig.executeTransaction(multisigAddress, 0n, addSignerData, [signature]);
      await addSignerTx.wait();

      // Verify new signer was added
      expect(await multisig.isOwner(newSigner)).to.be.true;
      expect(await multisig.signaturesRequired()).to.equal(newSignaturesRequired);
    });

    it("Should allow removing a signer through UP", async function () {
      // Create initial multisig with two owners
      const name = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address, addr2.address];
      const signaturesRequired = 2;

      const tx = await lyxaxis.createWallet(name, chainId, owners, signaturesRequired);
      await tx.wait();

      // Get the multisig address
      const ownerMultisigs = await registry.getSignerMultisigs(owner.address);
      const multisigAddress = ownerMultisigs[0];
      const multisig = await ethers.getContractAt("MultiSig", multisigAddress);

      // Remove a signer
      const signerToRemove = addr2.address;
      const newSignaturesRequired = 1;

      // Execute through UP
      const removeSignerData = multisig.interface.encodeFunctionData("removeSigner", [
        signerToRemove,
        newSignaturesRequired,
      ]);

      const nonce = await multisig.nonce();
      const txHash = await multisig.getTransactionHash(nonce, multisigAddress, 0n, removeSignerData);

      const signature1 = await owner.provider.send("personal_sign", [txHash, owner.address]);
      const signature2 = await addr2.provider.send("personal_sign", [txHash, addr2.address]);

      // Signatures must be in ascending order
      const removeSignerTx = await multisig.executeTransaction(multisigAddress, 0n, removeSignerData, [
        signature2,
        signature1,
      ]);
      await removeSignerTx.wait();

      // Verify signer was removed
      expect(await multisig.isOwner(signerToRemove)).to.be.false;
      expect(await multisig.signaturesRequired()).to.equal(newSignaturesRequired);
    });

    it("Should revert if non-UP tries to add signer", async function () {
      // Create initial multisig
      const name = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address];
      const signaturesRequired = 1;

      const tx = await lyxaxis.createWallet(name, chainId, owners, signaturesRequired);
      await tx.wait();

      // Get the multisig address
      const ownerMultisigs = await registry.getSignerMultisigs(owner.address);
      const multisigAddress = ownerMultisigs[0];
      const multisig = await ethers.getContractAt("MultiSig", multisigAddress);

      // Try to add signer directly (should fail)
      const newSigner = addr2.address;
      const newSignaturesRequired = 2;

      await expect(multisig.addSigner(newSigner, newSignaturesRequired)).to.be.revertedWith("Not Universal Profile");
    });
  });

  describe("Fund Transfer", function () {
    it("Should allow transferring funds through UP", async function () {
      // Create initial multisig
      const name = "Test Wallet";
      const chainId = 1;
      const owners = [owner.address, addr1.address];
      const signaturesRequired = 2;

      const tx = await lyxaxis.createWallet(name, chainId, owners, signaturesRequired);
      await tx.wait();

      // Get the multisig address
      const ownerMultisigs = await registry.getSignerMultisigs(owner.address);
      const multisigAddress = ownerMultisigs[0];
      const multisig = await ethers.getContractAt("MultiSig", multisigAddress);

      // Get the universal profile address
      const universalProfileAddress = await multisig.getUniversalProfile();

      // Fund the universal profile
      const amount = ethers.parseEther("1.0");
      await owner.sendTransaction({
        to: universalProfileAddress,
        value: amount,
      });

      // Verify the UP received the funds
      expect(await ethers.provider.getBalance(universalProfileAddress)).to.equal(amount);

      // Transfer funds to addr2
      const recipient = addr2;
      const transferAmount = ethers.parseEther("0.5");
      const transferData = "0x";

      const nonce = await multisig.nonce();
      const txHash = await multisig.getTransactionHash(nonce, recipient.address, transferAmount, transferData);

      // Sign transaction
      const signature1 = await owner.provider.send("personal_sign", [txHash, owner.address]);
      const signature2 = await addr1.provider.send("personal_sign", [txHash, addr1.address]);

      const oldRecipientBalance = await ethers.provider.getBalance(recipient.address);

      // Signatures must be in ascending order
      const transferTx = await multisig.executeTransaction(recipient.address, transferAmount, transferData, [
        signature2,
        signature1,
      ]);
      await transferTx.wait();

      const newRecipientBalance = await ethers.provider.getBalance(recipient.address);

      expect(newRecipientBalance).to.eq(oldRecipientBalance + transferAmount);
      expect(await ethers.provider.getBalance(universalProfileAddress)).to.equal(amount - transferAmount);
    });
  });
});
