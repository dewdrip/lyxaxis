// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title IMultiSigRegistry
 * @notice Interface for the MultiSigRegistry contract that manages multisig wallets and their owners
 */
interface IMultiSigRegistry {
    /**
     * @notice Registers a new multisig wallet with its owners
     * @param _multisig The address of the multisig wallet
     * @param _owners Array of owner addresses
     */
    function registerMultisig(address _multisig, address[] calldata _owners) external;

    /**
     * @notice Adds a new signer to a multisig wallet
     * @param _newSigner The address of the new signer to add
     */
    function addSigner(address _newSigner) external;

    /**
     * @notice Removes a signer from a multisig wallet
     * @param _signer The address of the signer to remove
     */
    function removeSigner(address _signer) external;

    /**
     * @notice Gets all multisig wallets owned by a signer
     * @param _signer The address of the signer
     * @return Array of multisig wallet addresses
     */
    function getSignerMultisigs(address _signer) external view returns (address[] memory);

    /**
     * @notice Gets all owners of a multisig wallet
     * @param _multisig The address of the multisig wallet
     * @return Array of owner addresses
     */
    function getMultisigOwners(address _multisig) external view returns (address[] memory);

    /**
     * @notice Checks if an address is a valid multisig wallet
     * @param _multisig The address to check
     * @return True if the address is a valid multisig wallet, false otherwise
     */
    function isValidMultisig(address _multisig) external view returns (bool);
}
