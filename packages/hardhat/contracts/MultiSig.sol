// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./MultiSigRegistry.sol";
import { LSP0ERC725Account } from "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import { ILSP20CallVerifier } from "@lukso/lsp-smart-contracts/contracts/LSP20CallVerification/ILSP20CallVerifier.sol";
import { IMultiSig } from "./interfaces/IMultiSig.sol";
error MultiSig__ZeroAddress();
error MultiSig__OwnerNotUnique();
error MultiSig__NotUniversalProfile();
error MultiSig__ZeroRequiredSignatures();
error MultiSig__NotOwner();
error MultiSig__DuplicateOrUnorderedSignatures();
error MultiSig__NotUPOrUPOwner();
error MultiSig__TransferFailed();
error MultiSig__InvalidSignaturesCount();
error MultiSig__CannotRemoveLastOwner();
error MultiSig__InvalidSignaturesRequired();

/**
 * @title MultiSig
 * @notice A multi-signature wallet contract that allows multiple owners to manage a Universal Profile
 * @dev Implements LSP20 for call verification and uses ECDSA for signature verification
 */
contract MultiSig is IMultiSig, ILSP20CallVerifier {
    bytes32 constant LSP3_PROFILE_KEY = 0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5;

    MultiSigRegistry private immutable i_registry;
    LSP0ERC725Account private immutable i_universalProfile;

    uint256 public signaturesRequired;
    uint256 public nonce;
    uint256 public numOfOwners;

    mapping(address => bool) public isOwner;

    /**
     * @notice Records owners and initializes the Universal Profile
     * @param profileMetadata The metadata for the Universal Profile
     * @param _owners Array of initial owner addresses
     * @param _signaturesRequired Number of signatures required for transactions
     * @param _registry Address of the MultiSigRegistry contract
     */
    constructor(
        bytes memory profileMetadata,
        address[] memory _owners,
        uint256 _signaturesRequired,
        MultiSigRegistry _registry
    ) {
        signaturesRequired = _signaturesRequired;
        uint256 ownersLength = _owners.length;
        for (uint256 i = 0; i < ownersLength; i++) {
            address owner = _owners[i];

            require(owner != address(0), MultiSig__ZeroAddress());
            require(!isOwner[owner], MultiSig__OwnerNotUnique());

            isOwner[owner] = true;

            emit Owner(owner, true);
        }
        numOfOwners = ownersLength;
        i_registry = _registry;

        i_universalProfile = new LSP0ERC725Account(address(this));

        // Set the profile metadata
        i_universalProfile.setData(LSP3_PROFILE_KEY, profileMetadata);
    }

    /**
     * @notice Modifier to restrict access to Universal Profile only
     */
    modifier onlyUP() {
        require(msg.sender == address(i_universalProfile), MultiSig__NotUniversalProfile());
        _;
    }

    /**
     * @notice Adds a new signer to the multisig
     * @dev Can only be called by the Universal Profile
     * @param newSigner The address of the new signer to add
     * @param newSignaturesRequired The new number of required signatures
     */
    function addSigner(address newSigner, uint256 newSignaturesRequired) public onlyUP {
        require(newSigner != address(0), MultiSig__ZeroAddress());
        require(!isOwner[newSigner], MultiSig__OwnerNotUnique());
        require(newSignaturesRequired > 0, MultiSig__ZeroRequiredSignatures());
        require(newSignaturesRequired <= numOfOwners + 1, MultiSig__InvalidSignaturesRequired());

        isOwner[newSigner] = true;
        signaturesRequired = newSignaturesRequired;
        numOfOwners++;

        emit Owner(newSigner, true);

        // Update registry
        i_registry.addSigner(newSigner);
    }

    /**
     * @notice Removes an existing signer from the multisig
     * @dev Can only be called by the Universal Profile
     * @param oldSigner The address of the signer to remove
     * @param newSignaturesRequired The new number of required signatures
     */
    function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlyUP {
        require(isOwner[oldSigner], MultiSig__NotOwner());
        require(numOfOwners > 1, MultiSig__CannotRemoveLastOwner());
        require(newSignaturesRequired > 0, MultiSig__ZeroRequiredSignatures());
        require(newSignaturesRequired <= numOfOwners - 1, MultiSig__InvalidSignaturesRequired());

        isOwner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        numOfOwners--;

        emit Owner(oldSigner, false);

        // Update registry
        i_registry.removeSigner(oldSigner);
    }

    /**
     * @notice Updates the number of required signatures
     * @dev Can only be called by the Universal Profile
     * @param newSignaturesRequired The new number of required signatures
     */
    function updateSignaturesRequired(uint256 newSignaturesRequired) public onlyUP {
        require(newSignaturesRequired > 0, MultiSig__ZeroRequiredSignatures());
        require(newSignaturesRequired <= numOfOwners, MultiSig__InvalidSignaturesRequired());

        signaturesRequired = newSignaturesRequired;

        emit UpdatedRequiredSignatures(newSignaturesRequired);
    }

    /**
     * @notice Gets the hash of a transaction
     * @param _nonce The transaction nonce
     * @param to The destination address
     * @param value The amount of LYX to send
     * @param data The transaction data
     * @return The transaction hash
     */
    function getTransactionHash(
        uint256 _nonce,
        address to,
        uint256 value,
        bytes memory data
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), _nonce, to, value, data));
    }

    /**
     * @notice Executes a transaction with multiple signatures
     * @dev Requires sufficient valid signatures from owners to be in ascending order
     * @param to The destination address
     * @param value The amount of LYX to send
     * @param data The transaction data
     * @param signatures Array of signatures
     * @return The result of the transaction execution
     */
    function executeTransaction(
        address payable to,
        uint256 value,
        bytes memory data,
        bytes[] memory signatures
    ) public returns (bytes memory) {
        bytes32 _hash = getTransactionHash(nonce, to, value, data);

        nonce++;

        uint256 validSignatures;
        address duplicateGuard;

        uint256 signaturesLength = signatures.length;
        for (uint256 i = 0; i < signaturesLength; i++) {
            address recovered = recover(_hash, signatures[i]);

            require(recovered > duplicateGuard, MultiSig__DuplicateOrUnorderedSignatures());

            duplicateGuard = recovered;

            if (isOwner[recovered]) {
                validSignatures++;
            }
        }

        require(validSignatures >= signaturesRequired, MultiSig__InvalidSignaturesCount());

        // Execute transaction through UP's execute function to maintain UP context
        bytes memory result = i_universalProfile.execute(0, to, value, data);

        emit ExecuteTransaction(msg.sender, to, value, data, nonce - 1, _hash, result);
        return result;
    }

    /**
     * @notice Recovers the signer address from a signature
     * @param _hash The hash that was signed
     * @param _signature The signature to recover
     * @return The recovered signer address
     */
    function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return ECDSA.recover(ECDSA.toEthSignedMessageHash(_hash), _signature);
    }

    /**
     * @notice Gets the address of the Universal Profile
     * @return The address of the Universal Profile
     */
    function getUniversalProfile() external view returns (address) {
        return address(i_universalProfile);
    }

    function lsp20VerifyCall(
        address /* requestor */,
        address /* target */,
        address caller,
        uint256 /* value */,
        bytes memory /* callData */
    ) external view returns (bytes4 returnedStatus) {
        require(caller == address(this) || caller == address(i_universalProfile), MultiSig__NotUPOrUPOwner());
        return 0xde928f01;
    }

    function lsp20VerifyCallResult(
        bytes32 /* callHash */,
        bytes memory /* callResult */
    ) external pure returns (bytes4) {
        return 0xd3fc45d3;
    }

    /**
     * @notice Fallback function to receive LYX
     * @dev Forwards received LYX to the Universal Profile
     */
    receive() external payable {
        (bool success, ) = payable(i_universalProfile).call{ value: msg.value }("");
        require(success, MultiSig__TransferFailed());
    }
}
