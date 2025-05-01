import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiSigRegistry } from "../typechain-types";
import { Lyxaxis } from "../typechain-types";
import { encodeProfileMetadata } from "./utils/encodeProfileMetadata";

describe("MultiSigRegistry", function () {
  let registry: MultiSigRegistry;
  let lyxaxis: Lyxaxis;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let multisig: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy Lyxaxis which will deploy the registry
    const Lyxaxis = await ethers.getContractFactory("Lyxaxis");
    lyxaxis = await Lyxaxis.deploy();
    await lyxaxis.waitForDeployment();

    const registryAddress = await lyxaxis.getRegistry();
    registry = await ethers.getContractAt("MultiSigRegistry", registryAddress);

    // Create a test multisig
    const profileMetadata = {
      name: "Test Wallet",
      description: "Test Description",
      links: [],
      tags: [],
      profileImage: [],
      backgroundImage: [],
    };

    const encodedProfileMetadata = await encodeProfileMetadata(profileMetadata);
    const owners = [owner.address, addr1.address];
    const signaturesRequired = 2;

    const tx = await lyxaxis.createWallet(encodedProfileMetadata, owners, signaturesRequired);
    await tx.wait();

    // Get the multisig address from the registry
    const ownerMultisigs = await registry.getSignerMultisigs(owner);
    const multisigAddress = ownerMultisigs[0];

    multisig = await ethers.getContractAt("MultiSig", multisigAddress);
  });

  describe("registerMultisig", function () {
    it("Should only allow Lyxaxis to register multisigs", async function () {
      const profileMetadata = {
        name: "Test Wallet",
        description: "Test Description",
        links: [],
        tags: [],
        profileImage: [],
        backgroundImage: [],
      };

      const encodedProfileMetadata = await encodeProfileMetadata(profileMetadata);
      const newMultisig = await ethers.deployContract("MultiSig", [
        encodedProfileMetadata,
        [owner.address],
        1,
        registry,
      ]);

      await expect(
        registry.registerMultisig(await newMultisig.getAddress(), [owner.address]),
      ).to.be.revertedWithCustomError(registry, "MultiSigRegistry__NotAuthorized");
    });
  });

  describe("addSigner", function () {
    it("Should only allow valid multisigs to add signers", async function () {
      await expect(registry.connect(addr1).addSigner(addr2.address)).to.be.revertedWithCustomError(
        registry,
        "MultiSigRegistry__NotAuthorized",
      );
    });
  });

  describe("removeSigner", function () {
    it("Should only allow valid multisigs to remove signers", async function () {
      await expect(registry.connect(addr1).removeSigner(owner.address)).to.be.revertedWithCustomError(
        registry,
        "MultiSigRegistry__NotAuthorized",
      );
    });
  });

  describe("Getters", function () {
    it("Should return correct signer multisigs", async function () {
      const multisigs = await registry.getSignerMultisigs(owner.address);
      expect(multisigs).to.include(await multisig.getAddress());
    });

    it("Should correctly identify valid multisigs", async function () {
      expect(await registry.isValidMultisig(await multisig.getAddress())).to.be.true;
      expect(await registry.isValidMultisig(addr1.address)).to.be.false;
    });
  });
});
