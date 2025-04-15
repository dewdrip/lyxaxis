import { expect } from "chai";
import { ethers } from "hardhat";
import { Lyxaxis } from "../typechain-types";
import { MultiSigRegistry } from "../typechain-types";
import { MultiSig } from "../typechain-types";
import { LSP0ERC725Account } from "../typechain-types";
import { ERC725YDataKeys } from "@lukso/lsp-smart-contracts";
import { OPERATION_TYPES, PERMISSIONS } from "@lukso/lsp-smart-contracts";

describe("Lyxaxis", function () {
  let lyxaxis: Lyxaxis;
  let registry: MultiSigRegistry;
  let owner: any;
  let addr1: any;
  let addr2: any;

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
      const universalProfileAddress = await multisig.universalProfile();
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
      const chainId = 1;
      const owners = [owner.address];
      const signaturesRequired = 1;

      const tx = await lyxaxis.createWallet(name, chainId, owners, signaturesRequired);
      await tx.wait();

      // Get the multisig address
      const ownerMultisigs = await registry.getSignerMultisigs(owner.address);
      const multisigAddress = ownerMultisigs[0];
      const multisig = await ethers.getContractAt("MultiSig", multisigAddress);

      // Get the universal profile
      const universalProfileAddress = await multisig.universalProfile();
      const universalProfile = await ethers.getContractAt("LSP0ERC725Account", universalProfileAddress);

      // Set up LSP20 verification for the UP
      const addressPermissionsKey =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + multisigAddress.substring(2);
      const permissions = PERMISSIONS.CALL + PERMISSIONS.SUPER_CALL;

      // Set permissions in ERC725Y storage
      await multisig.executeTransaction(
        universalProfileAddress,
        0,
        universalProfile.interface.encodeFunctionData("setData", [addressPermissionsKey, permissions]),
        [],
      );

      // Add a new signer
      const newSigner = addr2.address;
      const newSignaturesRequired = 2;

      const addSignerData = multisig.interface.encodeFunctionData("addSigner", [newSigner, newSignaturesRequired]);
      await multisig.executeTransaction(
        universalProfileAddress,
        0,
        universalProfile.interface.encodeFunctionData("execute", [
          OPERATION_TYPES.CALL,
          multisigAddress,
          0,
          addSignerData,
        ]),
        [],
      );

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

      // Get the universal profile
      const universalProfileAddress = await multisig.universalProfile();
      const universalProfile = await ethers.getContractAt("LSP0ERC725Account", universalProfileAddress);

      // Set up LSP20 verification for the UP
      const addressPermissionsKey =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + multisigAddress.substring(2);
      const permissions = PERMISSIONS.CALL + PERMISSIONS.SUPER_CALL;

      // Set permissions in ERC725Y storage
      await multisig.executeTransaction(
        universalProfileAddress,
        0,
        universalProfile.interface.encodeFunctionData("setData", [addressPermissionsKey, permissions]),
        [],
      );

      // Remove a signer
      const signerToRemove = addr2.address;
      const newSignaturesRequired = 1;

      const removeSignerData = multisig.interface.encodeFunctionData("removeSigner", [
        signerToRemove,
        newSignaturesRequired,
      ]);

      await multisig.executeTransaction(
        universalProfileAddress,
        0,
        universalProfile.interface.encodeFunctionData("execute", [
          OPERATION_TYPES.CALL,
          multisigAddress,
          0,
          removeSignerData,
        ]),
        [],
      );

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
});
