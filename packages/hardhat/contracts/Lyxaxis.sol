// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { MultiSig } from "./MultiSig.sol";
import { MultiSigRegistry } from "./MultiSigRegistry.sol";
import { ILyxaxis } from "./interfaces/ILyxaxis.sol";

error Lyxaxis__NoRequiredSignatures();
error Lyxaxis__NoOwners();

/**
 * @title Lyxaxis
 * @notice Factory contract for creating and managing multisig wallets
 * @dev Handles the creation of new multisig wallets and their registration in the MultiSigRegistry
 */
contract Lyxaxis is ILyxaxis {
    MultiSigRegistry private immutable i_registry;

    /**
     * @notice Creates a new MultiSigRegistry instance
     */
    constructor() {
        i_registry = new MultiSigRegistry(address(this));
    }

    /**
     * @notice Creates a new multisig wallet
     * @param profileMetadata The metadata for the Universal Profile
     * @param _owners Array of initial owner addresses
     * @param _signaturesRequired Number of signatures required for transactions
     * @return The address of the newly created multisig wallet
     */
    function createWallet(
        bytes calldata profileMetadata,
        address[] calldata _owners,
        uint256 _signaturesRequired
    ) external returns (address) {
        require(_signaturesRequired != 0, Lyxaxis__NoRequiredSignatures());
        require(_owners.length > 0, Lyxaxis__NoOwners());

        MultiSig multisig = new MultiSig(profileMetadata, _owners, _signaturesRequired, i_registry);
        address multisigAddress = address(multisig);

        // Register the new multisig with its owners in the registry
        i_registry.registerMultisig(multisigAddress, _owners);

        emit CreatedMultisig(multisigAddress);

        return multisigAddress;
    }

    /**
     * @notice Gets the address of the MultiSigRegistry
     * @return The address of the MultiSigRegistry
     */
    function getRegistry() external view returns (address) {
        return address(i_registry);
    }
}
