import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
  31337: {
    MultiSigRegistry: {
      address: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lyxaxis",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__MultisigAlreadyExists",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__MultisigNotFound",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__NotAuthorized",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__SignerAlreadyExists",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__SignerNotFound",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_newSigner",
              type: "address",
            },
          ],
          name: "addSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_signer",
              type: "address",
            },
          ],
          name: "getSignerMultisigs",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_multisig",
              type: "address",
            },
          ],
          name: "getMultisigOwners",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_multisig",
              type: "address",
            },
          ],
          name: "isValidMultisig",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_multisig",
              type: "address",
            },
            {
              internalType: "address[]",
              name: "_owners",
              type: "address[]",
            },
          ],
          name: "registerMultisig",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_signer",
              type: "address",
            },
          ],
          name: "removeSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    MultiSig: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: [
        {
          inputs: [
            {
              internalType: "bytes",
              name: "profileMetadata",
              type: "bytes",
            },
            {
              internalType: "address[]",
              name: "_owners",
              type: "address[]",
            },
            {
              internalType: "uint256",
              name: "_signaturesRequired",
              type: "uint256",
            },
            {
              internalType: "contract MultiSigRegistry",
              name: "_registry",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "MultiSig__CannotRemoveLastOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__DuplicateOrUnorderedSignatures",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__InvalidSignaturesCount",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__InvalidSignaturesRequired",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__NotOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__NotUPOrUPOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__NotUniversalProfile",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__OwnerNotUnique",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__ZeroAddress",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__ZeroRequiredSignatures",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "address payable",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "hash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "result",
              type: "bytes",
            },
          ],
          name: "ExecuteTransaction",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "added",
              type: "bool",
            },
          ],
          name: "Owner",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "newRequiredSignatures",
              type: "uint256",
            },
          ],
          name: "UpdatedRequiredSignatures",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newSigner",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "newSignaturesRequired",
              type: "uint256",
            },
          ],
          name: "addSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
            {
              internalType: "bytes[]",
              name: "signatures",
              type: "bytes[]",
            },
          ],
          name: "executeTransaction",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "getTransactionHash",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getUniversalProfile",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "isOwner",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "caller",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "lsp20VerifyCall",
          outputs: [
            {
              internalType: "bytes4",
              name: "returnedStatus",
              type: "bytes4",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "lsp20VerifyCallResult",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
          stateMutability: "pure",
          type: "function",
        },
        {
          inputs: [],
          name: "nonce",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "numOfOwners",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_hash",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_signature",
              type: "bytes",
            },
          ],
          name: "recover",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "pure",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "oldSigner",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "newSignaturesRequired",
              type: "uint256",
            },
          ],
          name: "removeSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "signaturesRequired",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "newSignaturesRequired",
              type: "uint256",
            },
          ],
          name: "updateSignaturesRequired",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
  },
  42: {
    MultiSigRegistry: {
      address: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lyxaxis",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__MultisigAlreadyExists",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__MultisigNotFound",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__NotAuthorized",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__SignerAlreadyExists",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSigRegistry__SignerNotFound",
          type: "error",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_newSigner",
              type: "address",
            },
          ],
          name: "addSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_signer",
              type: "address",
            },
          ],
          name: "getSignerMultisigs",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_multisig",
              type: "address",
            },
          ],
          name: "getMultisigOwners",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_multisig",
              type: "address",
            },
          ],
          name: "isValidMultisig",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_multisig",
              type: "address",
            },
            {
              internalType: "address[]",
              name: "_owners",
              type: "address[]",
            },
          ],
          name: "registerMultisig",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_signer",
              type: "address",
            },
          ],
          name: "removeSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
    MultiSig: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: [
        {
          inputs: [
            {
              internalType: "bytes",
              name: "profileMetadata",
              type: "bytes",
            },
            {
              internalType: "address[]",
              name: "_owners",
              type: "address[]",
            },
            {
              internalType: "uint256",
              name: "_signaturesRequired",
              type: "uint256",
            },
            {
              internalType: "contract MultiSigRegistry",
              name: "_registry",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "MultiSig__CannotRemoveLastOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__ContractNotAllowed",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__DuplicateOrUnorderedSignatures",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__InvalidSignaturesCount",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__InvalidSignaturesRequired",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__NotOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__NotUPOrUPOwner",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__NotUniversalProfile",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__OwnerNotUnique",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__TransferFailed",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__ZeroAddress",
          type: "error",
        },
        {
          inputs: [],
          name: "MultiSig__ZeroRequiredSignatures",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "address payable",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "hash",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "result",
              type: "bytes",
            },
          ],
          name: "ExecuteTransaction",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "added",
              type: "bool",
            },
          ],
          name: "Owner",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint256",
              name: "newRequiredSignatures",
              type: "uint256",
            },
          ],
          name: "UpdatedRequiredSignatures",
          type: "event",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newSigner",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "newSignaturesRequired",
              type: "uint256",
            },
          ],
          name: "addSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address payable",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
            {
              internalType: "bytes[]",
              name: "signatures",
              type: "bytes[]",
            },
          ],
          name: "executeTransaction",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_nonce",
              type: "uint256",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "data",
              type: "bytes",
            },
          ],
          name: "getTransactionHash",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getUniversalProfile",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "isOwner",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "address",
              name: "caller",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "lsp20VerifyCall",
          outputs: [
            {
              internalType: "bytes4",
              name: "returnedStatus",
              type: "bytes4",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          name: "lsp20VerifyCallResult",
          outputs: [
            {
              internalType: "bytes4",
              name: "",
              type: "bytes4",
            },
          ],
          stateMutability: "pure",
          type: "function",
        },
        {
          inputs: [],
          name: "nonce",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "numOfOwners",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes32",
              name: "_hash",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "_signature",
              type: "bytes",
            },
          ],
          name: "recover",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "pure",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "oldSigner",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "newSignaturesRequired",
              type: "uint256",
            },
          ],
          name: "removeSigner",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "signaturesRequired",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "newSignaturesRequired",
              type: "uint256",
            },
          ],
          name: "updateSignaturesRequired",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
