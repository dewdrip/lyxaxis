// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface ILyxaxis {
    event CreatedMultisig(address deployer, address multisig);

    function createWallet(
        string calldata _name,
        uint256 _chainId,
        address[] calldata _owners,
        uint256 _signaturesRequired
    ) external returns (address);
}
