import { expect } from "chai";
import { ethers } from "hardhat";
import { Lyxaxis } from "../typechain-types";
import { MultiSigRegistry } from "../typechain-types";

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
});
