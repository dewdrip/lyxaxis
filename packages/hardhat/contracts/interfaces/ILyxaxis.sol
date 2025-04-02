// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface ILyxaxis {
    event CreatedMultisig(address multisig);

    function create(
        string calldata _name,
        address[] calldata _owners,
        uint256 _signaturesRequired
    ) external returns (address);
}
