// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { ILyxaxis } from "./interfaces/ILyxaxis.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

error MultiSigRegistry__NotAuthorized();
error MultiSigRegistry__SignerAlreadyExists();
error MultiSigRegistry__SignerNotFound();
error MultiSigRegistry__MultisigAlreadyExists();
error MultiSigRegistry__MultisigNotFound();

contract MultiSigRegistry {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Mapping from signer address to their owned multisig addresses
    mapping(address => EnumerableSet.AddressSet) private s_signerToMultisigs;

    // Mapping from multisig address to its owners
    mapping(address => EnumerableSet.AddressSet) private s_multisigToOwners;

    // Mapping to track if an address is a valid multisig
    mapping(address => bool) private s_validMultisigs;

    // Address of the Lyxaxis contract that can register new multisigs
    address private immutable i_lyxaxis;

    constructor(address _lyxaxis) {
        i_lyxaxis = _lyxaxis;
    }

    modifier onlyMultiSig() {
        if (!s_validMultisigs[msg.sender]) {
            revert MultiSigRegistry__NotAuthorized();
        }
        _;
    }

    function registerMultisig(address _multisig, address[] calldata _owners) external {
        if (msg.sender != i_lyxaxis) {
            revert MultiSigRegistry__NotAuthorized();
        }

        if (s_validMultisigs[_multisig]) {
            revert MultiSigRegistry__MultisigAlreadyExists();
        }

        s_validMultisigs[_multisig] = true;

        // Add owners to multisig's set
        uint256 numOfOwners = _owners.length;
        for (uint256 i = 0; i < numOfOwners; i++) {
            s_multisigToOwners[_multisig].add(_owners[i]);
            s_signerToMultisigs[_owners[i]].add(_multisig);
        }
    }

    function addSigner(address _newSigner) external onlyMultiSig {
        if (!s_validMultisigs[msg.sender]) {
            revert MultiSigRegistry__MultisigNotFound();
        }

        if (!s_multisigToOwners[msg.sender].add(_newSigner)) {
            revert MultiSigRegistry__SignerAlreadyExists();
        }

        s_signerToMultisigs[_newSigner].add(msg.sender);
    }

    function removeSigner(address _signer) external onlyMultiSig {
        if (!s_validMultisigs[msg.sender]) {
            revert MultiSigRegistry__MultisigNotFound();
        }

        if (!s_multisigToOwners[msg.sender].remove(_signer)) {
            revert MultiSigRegistry__SignerNotFound();
        }

        s_signerToMultisigs[_signer].remove(msg.sender);
    }

    function getSignerMultisigs(address _signer) external view returns (address[] memory) {
        return s_signerToMultisigs[_signer].values();
    }

    function getMultisigOwners(address _multisig) external view returns (address[] memory) {
        return s_multisigToOwners[_multisig].values();
    }

    function isValidMultisig(address _multisig) external view returns (bool) {
        return s_validMultisigs[_multisig];
    }
}
