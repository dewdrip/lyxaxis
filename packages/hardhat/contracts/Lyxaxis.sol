// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import { MultiSig } from "./MultiSig.sol";
import { MultiSigRegistry } from "./MultiSigRegistry.sol";
import { ILyxaxis } from "./interfaces/ILyxaxis.sol";

error Lyxaxis__NoRequiredSignatures();
error Lyxaxis__NoOwners();

contract Lyxaxis is ILyxaxis {
    MultiSigRegistry private immutable i_registry;

    constructor() {
        i_registry = new MultiSigRegistry(address(this));
    }

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

    function getRegistry() external view returns (address) {
        return address(i_registry);
    }
}
