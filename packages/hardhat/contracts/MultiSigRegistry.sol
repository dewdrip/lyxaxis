// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { ILyxaxis } from "./interfaces/ILyxaxis.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

error MultiSigRegistry__NotAuthorized();
error MultiSigRegistry__SignerAlreadyExists();
error MultiSigRegistry__SignerNotFound();
error MultiSigRegistry__MultisigAlreadyExists();
error MultiSigRegistry__MultisigNotFound();

/**
 * @title MultiSigRegistry
 * @notice Contract for managing multisig wallets and their owners
 * @dev Uses EnumerableSet for efficient management of multisig owners and signers
 */
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

    /**
     * @notice Sets the Lyxaxis contract address
     * @param _lyxaxis The address of the Lyxaxis contract
     */
    constructor(address _lyxaxis) {
        i_lyxaxis = _lyxaxis;
    }

    /**
     * @notice Modifier to restrict access to registered multisig wallets only
     */
    modifier onlyMultiSig() {
        if (!s_validMultisigs[msg.sender]) {
            revert MultiSigRegistry__NotAuthorized();
        }
        _;
    }

    /**
     * @notice Registers a new multisig wallet with its owners
     * @dev Can only be called by the Lyxaxis contract
     * @param _multisig The address of the multisig wallet
     * @param _owners Array of owner addresses
     */
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

    /**
     * @notice Adds a new signer to a multisig wallet
     * @dev Can only be called by registered multisig wallets
     * @param _newSigner The address of the new signer to add
     */
    function addSigner(address _newSigner) external onlyMultiSig {
        if (!s_validMultisigs[msg.sender]) {
            revert MultiSigRegistry__MultisigNotFound();
        }

        if (!s_multisigToOwners[msg.sender].add(_newSigner)) {
            revert MultiSigRegistry__SignerAlreadyExists();
        }

        s_signerToMultisigs[_newSigner].add(msg.sender);
    }

    /**
     * @notice Removes a signer from a multisig wallet
     * @dev Can only be called by registered multisig wallets
     * @param _signer The address of the signer to remove
     */
    function removeSigner(address _signer) external onlyMultiSig {
        if (!s_validMultisigs[msg.sender]) {
            revert MultiSigRegistry__MultisigNotFound();
        }

        if (!s_multisigToOwners[msg.sender].remove(_signer)) {
            revert MultiSigRegistry__SignerNotFound();
        }

        s_signerToMultisigs[_signer].remove(msg.sender);
    }

    /**
     * @notice Gets all multisig wallets owned by a signer
     * @param _signer The address of the signer
     * @return Array of multisig wallet addresses
     */
    function getSignerMultisigs(address _signer) external view returns (address[] memory) {
        return s_signerToMultisigs[_signer].values();
    }

    /**
     * @notice Gets all owners of a multisig wallet
     * @param _multisig The address of the multisig wallet
     * @return Array of owner addresses
     */
    function getMultisigOwners(address _multisig) external view returns (address[] memory) {
        return s_multisigToOwners[_multisig].values();
    }

    /**
     * @notice Checks if an address is a valid multisig wallet
     * @param _multisig The address to check
     * @return True if the address is a valid multisig wallet, false otherwise
     */
    function isValidMultisig(address _multisig) external view returns (bool) {
        return s_validMultisigs[_multisig];
    }
}
