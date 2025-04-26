// SPDX-License-Identifier: MIT

// Off-chain signature gathering multisig that streams funds
// added a very simple streaming mechanism where `onlyUP` can open a withdraw-based stream

pragma solidity 0.8.29;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./MultiSigRegistry.sol";
import { LSP0ERC725Account } from "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import { ILSP20CallVerifier } from "@lukso/lsp-smart-contracts/contracts/LSP20CallVerification/ILSP20CallVerifier.sol";

contract MultiSig is ILSP20CallVerifier {
    event Deposit(address indexed sender, uint amount, uint balance);
    event ExecuteTransaction(
        address indexed owner,
        address payable to,
        uint256 value,
        bytes data,
        uint256 nonce,
        bytes32 hash,
        bytes result
    );
    event Owner(address indexed owner, bool added);
    mapping(address => bool) public isOwner;
    uint public signaturesRequired;
    uint public nonce;
    uint public chainId;
    MultiSigRegistry private immutable i_registry;
    LSP0ERC725Account private immutable i_universalProfile;

    constructor(
        bytes memory profileMetadata,
        uint256 _chainId,
        address[] memory _owners,
        uint _signaturesRequired,
        MultiSigRegistry _registry
    ) {
        signaturesRequired = _signaturesRequired;
        uint256 numOfOwners = _owners.length;
        for (uint i = 0; i < numOfOwners; i++) {
            address owner = _owners[i];
            require(owner != address(0), "constructor: zero address");
            require(!isOwner[owner], "constructor: owner not unique");
            isOwner[owner] = true;
            emit Owner(owner, isOwner[owner]);
        }
        chainId = _chainId;
        i_registry = _registry;

        i_universalProfile = new LSP0ERC725Account(address(this));

        // Set the profile metadata
        bytes32 LSP3ProfileKey = 0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5;
        i_universalProfile.setData(LSP3ProfileKey, profileMetadata);
    }

    modifier onlyUP() {
        require(msg.sender == address(i_universalProfile), "Not Universal Profile");
        _;
    }

    function addSigner(address newSigner, uint256 newSignaturesRequired) public onlyUP {
        require(newSigner != address(0), "addSigner: zero address");
        require(!isOwner[newSigner], "addSigner: owner not unique");
        require(newSignaturesRequired > 0, "addSigner: must be non-zero sigs required");
        isOwner[newSigner] = true;
        signaturesRequired = newSignaturesRequired;
        emit Owner(newSigner, isOwner[newSigner]);

        // Update registry
        i_registry.addSigner(newSigner);
    }

    function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlyUP {
        require(isOwner[oldSigner], "removeSigner: not owner");
        require(newSignaturesRequired > 0, "removeSigner: must be non-zero sigs required");
        isOwner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        emit Owner(oldSigner, isOwner[oldSigner]);

        // Update registry
        i_registry.removeSigner(oldSigner);
    }

    function updateSignaturesRequired(uint256 newSignaturesRequired) public onlyUP {
        require(newSignaturesRequired > 0, "updateSignaturesRequired: must be non-zero sigs required");
        signaturesRequired = newSignaturesRequired;
    }

    function getTransactionHash(
        uint256 _nonce,
        address to,
        uint256 value,
        bytes memory data
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), chainId, _nonce, to, value, data));
    }

    function executeTransaction(
        address payable to,
        uint256 value,
        bytes memory data,
        bytes[] memory signatures
    ) public returns (bytes memory) {
        require(isOwner[msg.sender], "executeTransaction: only owners can execute");
        bytes32 _hash = getTransactionHash(nonce, to, value, data);
        nonce++;
        uint256 validSignatures;
        address duplicateGuard;
        for (uint i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash, signatures[i]);
            require(recovered > duplicateGuard, "executeTransaction: duplicate or unordered signatures");
            duplicateGuard = recovered;

            if (isOwner[recovered]) {
                validSignatures++;
            }
        }

        require(validSignatures >= signaturesRequired, "executeTransaction: not enough valid signatures");

        // Execute transaction through UP's execute function to maintain UP context
        bytes memory result = i_universalProfile.execute(0, to, value, data);

        emit ExecuteTransaction(msg.sender, to, value, data, nonce - 1, _hash, result);
        return result;
    }

    function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return ECDSA.recover(ECDSA.toEthSignedMessageHash(_hash), _signature);
    }

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
        require(caller == address(this), "Caller not UP owner");
        return 0xde928f01;
    }

    function lsp20VerifyCallResult(
        bytes32 /* callHash */,
        bytes memory /* callResult */
    ) external pure returns (bytes4) {
        return 0xd3fc45d3;
    }

    receive() external payable {
        (bool success, ) = payable(i_universalProfile).call{ value: msg.value }("");
        require(success, "Transfer failed");
    }
}
