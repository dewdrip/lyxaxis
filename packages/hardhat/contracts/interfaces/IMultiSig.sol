// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title IMultiSig
 * @notice Interface for the MultiSig contract that handles multi-signature transactions and Universal Profile management
 */
interface IMultiSig {
    /**
     * @notice Emitted when a transaction is executed
     * @param owner The address of the owner who initiated the transaction
     * @param to The destination address of the transaction
     * @param value The amount of LYX sent in the transaction
     * @param data The transaction data
     * @param nonce The transaction nonce
     * @param hash The transaction hash
     * @param result The result of the transaction execution
     */
    event ExecuteTransaction(
        address indexed owner,
        address payable to,
        uint256 value,
        bytes data,
        uint256 nonce,
        bytes32 hash,
        bytes result
    );

    /**
     * @notice Emitted when an owner is added or removed
     * @param owner The address of the owner
     * @param added True if owner was added, false if removed
     */
    event Owner(address indexed owner, bool added);

    /**
     * @notice Emitted when the required number of signatures is updated
     * @param newRequiredSignatures The new number of required signatures
     */
    event UpdatedRequiredSignatures(uint256 newRequiredSignatures);

    /**
     * @notice Adds a new signer to the multisig
     * @param newSigner The address of the new signer to add
     * @param newSignaturesRequired The new number of required signatures
     */
    function addSigner(address newSigner, uint256 newSignaturesRequired) external;

    /**
     * @notice Removes an existing signer from the multisig
     * @param oldSigner The address of the signer to remove
     * @param newSignaturesRequired The new number of required signatures
     */
    function removeSigner(address oldSigner, uint256 newSignaturesRequired) external;

    /**
     * @notice Updates the number of required signatures
     * @param newSignaturesRequired The new number of required signatures
     */
    function updateSignaturesRequired(uint256 newSignaturesRequired) external;

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
    ) external view returns (bytes32);

    /**
     * @notice Executes a transaction with multiple signatures
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
    ) external returns (bytes memory);

    /**
     * @notice Recovers the signer address from a signature
     * @param _hash The hash that was signed
     * @param _signature The signature to recover
     * @return The recovered signer address
     */
    function recover(bytes32 _hash, bytes memory _signature) external pure returns (address);

    /**
     * @notice Gets the address of the Universal Profile
     * @return The address of the Universal Profile
     */
    function getUniversalProfile() external view returns (address);

    /**
     * @notice Gets the number of required signatures
     * @return The number of required signatures
     */
    function signaturesRequired() external view returns (uint256);

    /**
     * @notice Gets the current nonce
     * @return The current nonce
     */
    function nonce() external view returns (uint256);

    /**
     * @notice Gets the number of owners
     * @return The number of owners
     */
    function numOfOwners() external view returns (uint256);

    /**
     * @notice Checks if an address is an owner
     * @param owner The address to check
     * @return True if the address is an owner, false otherwise
     */
    function isOwner(address owner) external view returns (bool);
}
