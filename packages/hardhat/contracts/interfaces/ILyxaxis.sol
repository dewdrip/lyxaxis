// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

interface ILyxaxis {
    event CreatedMultisig(address multisig);

    function createWallet(
        bytes calldata profileMetadata,
        uint256 _chainId,
        address[] calldata _owners,
        uint256 _signaturesRequired
    ) external returns (address);
}
