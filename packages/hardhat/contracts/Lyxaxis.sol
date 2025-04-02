// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import { MultiSig } from "./MultiSig.sol";

import { ILyxaxis } from "./interfaces/ILyxaxis.sol";

error Lyxaxis__NoRequiredSignatures();
error Lyxaxis__NoOwners();

contract Lyxaxis is ILyxaxis {
    address[] public s_multisigs;

    function createWallet(
        string calldata _name,
        uint256 _chainId,
        address[] calldata _owners,
        uint256 _signaturesRequired
    ) external returns (address) {
        require(_signaturesRequired, Lyxaxis__NoRequiredSignatures());
        require(_owners.length > 0, Lyxaxis__NoOwners());

        MultiSig multisig = new MultiSig(_name, _chainId, _owners, _signaturesRequired);

        s_multisigs.push(multisig);

        emit CreatedMultisig(multisig);

        return multisig;
    }
}
