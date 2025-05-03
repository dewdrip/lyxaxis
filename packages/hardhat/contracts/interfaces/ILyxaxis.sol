// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title ILyxaxis
 * @notice Interface for the Lyxaxis contract that handles multisig wallet creation
 */
interface ILyxaxis {
    /**
     * @notice Emitted when a new multisig wallet is created
     * @param multisig The address of the newly created multisig wallet
     */
    event CreatedMultisig(address multisig);

    /**
     * @notice Creates a new multisig wallet with specified owners and signature requirements
     * @param profileMetadata The metadata for the Universal Profile
     * @param _owners Array of initial owner addresses
     * @param _signaturesRequired Number of signatures required for transactions
     * @return The address of the newly created multisig wallet
     */
    function createWallet(
        bytes calldata profileMetadata,
        address[] calldata _owners,
        uint256 _signaturesRequired
    ) external returns (address);

    /**
     * @notice Gets the address of the MultiSigRegistry contract
     * @return The address of the MultiSigRegistry contract
     */
    function getRegistry() external view returns (address);
}
