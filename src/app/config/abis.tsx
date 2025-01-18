export const cellAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "routerAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "wrappedNativeToken",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "InvalidAmount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidArgument",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidInstructions",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidSender",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidSlippageBips",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NoRouteFound",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "RollbackFailedInvalidFee",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "SwapAndRollbackFailed",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sourceBridge",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "originSender",
                "type": "address"
            }
        ],
        "name": "CellReceivedNativeTokens",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sourceBridge",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "originSender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "CellReceivedTokens",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Initiated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Recovered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Rollback",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "BIPS_DIVISOR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "blockchainID",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "payableReceiver",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "rollbackTeleporterFee",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "rollbackGasLimit",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "enum Action",
                                "name": "action",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint256",
                                "name": "requiredGasLimit",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "recipientGasLimit",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bytes",
                                "name": "trade",
                                "type": "bytes"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "address",
                                        "name": "bridgeSourceChain",
                                        "type": "address"
                                    },
                                    {
                                        "internalType": "bool",
                                        "name": "sourceBridgeIsNative",
                                        "type": "bool"
                                    },
                                    {
                                        "internalType": "address",
                                        "name": "bridgeDestinationChain",
                                        "type": "address"
                                    },
                                    {
                                        "internalType": "address",
                                        "name": "cellDestinationChain",
                                        "type": "address"
                                    },
                                    {
                                        "internalType": "bytes32",
                                        "name": "destinationBlockchainID",
                                        "type": "bytes32"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "teleporterFee",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "secondaryTeleporterFee",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct BridgePath",
                                "name": "bridgePath",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct Hop[]",
                        "name": "hops",
                        "type": "tuple[]"
                    }
                ],
                "internalType": "struct Instructions",
                "name": "instructions",
                "type": "tuple"
            }
        ],
        "name": "initiate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "originTokenTransferrerAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "originSenderAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "payload",
                "type": "bytes"
            }
        ],
        "name": "receiveTokens",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "originTokenTransferrerAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "originSenderAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "payload",
                "type": "bytes"
            }
        ],
        "name": "receiveTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "recoverERC20",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "recoverNative",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "tokenIn",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenOut",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "route",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "trade",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "gasEstimate",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "router",
        "outputs": [
            {
                "internalType": "contract IYakRouter",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wrappedNativeToken",
        "outputs": [
            {
                "internalType": "contract IWrappedNativeToken",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const

// export const uniV2CellAbi = [
//     {
//         "type": "constructor",
//         "inputs": [
//             {
//                 "name": "owner",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "wrappedNativeToken",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "uniV2Factory",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "fee",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             },
//             {
//                 "name": "estimatedSwapGas",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "stateMutability": "nonpayable"
//     },
//     {
//         "type": "receive",
//         "stateMutability": "payable"
//     },
//     {
//         "type": "function",
//         "name": "BIPS_DIVISOR",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "blockchainID",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "bytes32",
//                 "internalType": "bytes32"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "factory",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "address",
//                 "internalType": "address"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "feeCompliment",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "initiate",
//         "inputs": [
//             {
//                 "name": "token",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             },
//             {
//                 "name": "instructions",
//                 "type": "tuple",
//                 "internalType": "struct Instructions",
//                 "components": [
//                     {
//                         "name": "receiver",
//                         "type": "address",
//                         "internalType": "address"
//                     },
//                     {
//                         "name": "payableReceiver",
//                         "type": "bool",
//                         "internalType": "bool"
//                     },
//                     {
//                         "name": "rollbackTeleporterFee",
//                         "type": "uint256",
//                         "internalType": "uint256"
//                     },
//                     {
//                         "name": "rollbackGasLimit",
//                         "type": "uint256",
//                         "internalType": "uint256"
//                     },
//                     {
//                         "name": "hops",
//                         "type": "tuple[]",
//                         "internalType": "struct Hop[]",
//                         "components": [
//                             {
//                                 "name": "action",
//                                 "type": "uint8",
//                                 "internalType": "enum Action"
//                             },
//                             {
//                                 "name": "requiredGasLimit",
//                                 "type": "uint256",
//                                 "internalType": "uint256"
//                             },
//                             {
//                                 "name": "recipientGasLimit",
//                                 "type": "uint256",
//                                 "internalType": "uint256"
//                             },
//                             {
//                                 "name": "trade",
//                                 "type": "bytes",
//                                 "internalType": "bytes"
//                             },
//                             {
//                                 "name": "bridgePath",
//                                 "type": "tuple",
//                                 "internalType": "struct BridgePath",
//                                 "components": [
//                                     {
//                                         "name": "bridgeSourceChain",
//                                         "type": "address",
//                                         "internalType": "address"
//                                     },
//                                     {
//                                         "name": "sourceBridgeIsNative",
//                                         "type": "bool",
//                                         "internalType": "bool"
//                                     },
//                                     {
//                                         "name": "bridgeDestinationChain",
//                                         "type": "address",
//                                         "internalType": "address"
//                                     },
//                                     {
//                                         "name": "cellDestinationChain",
//                                         "type": "address",
//                                         "internalType": "address"
//                                     },
//                                     {
//                                         "name": "destinationBlockchainID",
//                                         "type": "bytes32",
//                                         "internalType": "bytes32"
//                                     },
//                                     {
//                                         "name": "teleporterFee",
//                                         "type": "uint256",
//                                         "internalType": "uint256"
//                                     },
//                                     {
//                                         "name": "secondaryTeleporterFee",
//                                         "type": "uint256",
//                                         "internalType": "uint256"
//                                     }
//                                 ]
//                             }
//                         ]
//                     }
//                 ]
//             }
//         ],
//         "outputs": [],
//         "stateMutability": "payable"
//     },
//     {
//         "type": "function",
//         "name": "owner",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "address",
//                 "internalType": "address"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "receiveTokens",
//         "inputs": [
//             {
//                 "name": "sourceBlockchainID",
//                 "type": "bytes32",
//                 "internalType": "bytes32"
//             },
//             {
//                 "name": "originTokenTransferrerAddress",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "originSenderAddress",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "payload",
//                 "type": "bytes",
//                 "internalType": "bytes"
//             }
//         ],
//         "outputs": [],
//         "stateMutability": "payable"
//     },
//     {
//         "type": "function",
//         "name": "receiveTokens",
//         "inputs": [
//             {
//                 "name": "sourceBlockchainID",
//                 "type": "bytes32",
//                 "internalType": "bytes32"
//             },
//             {
//                 "name": "originTokenTransferrerAddress",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "originSenderAddress",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "token",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             },
//             {
//                 "name": "payload",
//                 "type": "bytes",
//                 "internalType": "bytes"
//             }
//         ],
//         "outputs": [],
//         "stateMutability": "nonpayable"
//     },
//     {
//         "type": "function",
//         "name": "recoverERC20",
//         "inputs": [
//             {
//                 "name": "token",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "outputs": [],
//         "stateMutability": "nonpayable"
//     },
//     {
//         "type": "function",
//         "name": "recoverNative",
//         "inputs": [
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "outputs": [],
//         "stateMutability": "nonpayable"
//     },
//     {
//         "type": "function",
//         "name": "renounceOwnership",
//         "inputs": [],
//         "outputs": [],
//         "stateMutability": "nonpayable"
//     },
//     {
//         "type": "function",
//         "name": "route",
//         "inputs": [
//             {
//                 "name": "amountIn",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             },
//             {
//                 "name": "tokenIn",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "tokenOut",
//                 "type": "address",
//                 "internalType": "address"
//             },
//             {
//                 "name": "data",
//                 "type": "bytes",
//                 "internalType": "bytes"
//             }
//         ],
//         "outputs": [
//             {
//                 "name": "trade",
//                 "type": "bytes",
//                 "internalType": "bytes"
//             },
//             {
//                 "name": "gasEstimate",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "swapGasEstimate",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "uint256",
//                 "internalType": "uint256"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "function",
//         "name": "transferOwnership",
//         "inputs": [
//             {
//                 "name": "newOwner",
//                 "type": "address",
//                 "internalType": "address"
//             }
//         ],
//         "outputs": [],
//         "stateMutability": "nonpayable"
//     },
//     {
//         "type": "function",
//         "name": "wrappedNativeToken",
//         "inputs": [],
//         "outputs": [
//             {
//                 "name": "",
//                 "type": "address",
//                 "internalType": "contract IWrappedNativeToken"
//             }
//         ],
//         "stateMutability": "view"
//     },
//     {
//         "type": "event",
//         "name": "CellReceivedNativeTokens",
//         "inputs": [
//             {
//                 "name": "sourceBlockchainID",
//                 "type": "bytes32",
//                 "indexed": true,
//                 "internalType": "bytes32"
//             },
//             {
//                 "name": "sourceBridge",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "originSender",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             }
//         ],
//         "anonymous": false
//     },
//     {
//         "type": "event",
//         "name": "CellReceivedTokens",
//         "inputs": [
//             {
//                 "name": "sourceBlockchainID",
//                 "type": "bytes32",
//                 "indexed": true,
//                 "internalType": "bytes32"
//             },
//             {
//                 "name": "sourceBridge",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "originSender",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "token",
//                 "type": "address",
//                 "indexed": false,
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "indexed": false,
//                 "internalType": "uint256"
//             }
//         ],
//         "anonymous": false
//     },
//     {
//         "type": "event",
//         "name": "Initiated",
//         "inputs": [
//             {
//                 "name": "sender",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "token",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "indexed": false,
//                 "internalType": "uint256"
//             }
//         ],
//         "anonymous": false
//     },
//     {
//         "type": "event",
//         "name": "OwnershipTransferred",
//         "inputs": [
//             {
//                 "name": "previousOwner",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "newOwner",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             }
//         ],
//         "anonymous": false
//     },
//     {
//         "type": "event",
//         "name": "Recovered",
//         "inputs": [
//             {
//                 "name": "token",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "indexed": false,
//                 "internalType": "uint256"
//             }
//         ],
//         "anonymous": false
//     },
//     {
//         "type": "event",
//         "name": "Rollback",
//         "inputs": [
//             {
//                 "name": "receiver",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "token",
//                 "type": "address",
//                 "indexed": true,
//                 "internalType": "address"
//             },
//             {
//                 "name": "amount",
//                 "type": "uint256",
//                 "indexed": false,
//                 "internalType": "uint256"
//             }
//         ],
//         "anonymous": false
//     },
//     {
//         "type": "error",
//         "name": "InvalidAmount",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "InvalidArgument",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "InvalidInstructions",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "InvalidParameters",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "InvalidSender",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "NoRouteFound",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "RollbackFailedInvalidFee",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "SlippageExceeded",
//         "inputs": []
//     },
//     {
//         "type": "error",
//         "name": "SwapAndRollbackFailed",
//         "inputs": []
//     }
// ] as const

export const uniV2CellAbi = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "wrappedNativeToken",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "uniV2Factory",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "estimatedSwapGas",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "initialHopTokens",
                "type": "address[]",
                "internalType": "address[]"
            },
            {
                "name": "initialMaxHops",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "BIPS_DIVISOR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MAX_ALLOWED_HOPS",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "blockchainID",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "factory",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "feeCompliment",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "hopTokens",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initiate",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "instructions",
                "type": "tuple",
                "internalType": "struct Instructions",
                "components": [
                    {
                        "name": "receiver",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "payableReceiver",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "rollbackTeleporterFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "rollbackGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "hops",
                        "type": "tuple[]",
                        "internalType": "struct Hop[]",
                        "components": [
                            {
                                "name": "action",
                                "type": "uint8",
                                "internalType": "enum Action"
                            },
                            {
                                "name": "requiredGasLimit",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "recipientGasLimit",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "trade",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "bridgePath",
                                "type": "tuple",
                                "internalType": "struct BridgePath",
                                "components": [
                                    {
                                        "name": "bridgeSourceChain",
                                        "type": "address",
                                        "internalType": "address"
                                    },
                                    {
                                        "name": "sourceBridgeIsNative",
                                        "type": "bool",
                                        "internalType": "bool"
                                    },
                                    {
                                        "name": "bridgeDestinationChain",
                                        "type": "address",
                                        "internalType": "address"
                                    },
                                    {
                                        "name": "cellDestinationChain",
                                        "type": "address",
                                        "internalType": "address"
                                    },
                                    {
                                        "name": "destinationBlockchainID",
                                        "type": "bytes32",
                                        "internalType": "bytes32"
                                    },
                                    {
                                        "name": "teleporterFee",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    },
                                    {
                                        "name": "secondaryTeleporterFee",
                                        "type": "uint256",
                                        "internalType": "uint256"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "maxHops",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "receiveTokens",
        "inputs": [
            {
                "name": "sourceBlockchainID",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "originTokenTransferrerAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "originSenderAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "payload",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "receiveTokens",
        "inputs": [
            {
                "name": "sourceBlockchainID",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "originTokenTransferrerAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "originSenderAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "payload",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "recoverERC20",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "recoverNative",
        "inputs": [
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "route",
        "inputs": [
            {
                "name": "amountIn",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenOut",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "trade",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "gasEstimate",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "setHopTokens",
        "inputs": [
            {
                "name": "newHopTokens",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setMaxHops",
        "inputs": [
            {
                "name": "newMaxHops",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "swapGasEstimate",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "wrappedNativeToken",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IWrappedNativeToken"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "CellReceivedNativeTokens",
        "inputs": [
            {
                "name": "sourceBlockchainID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sourceBridge",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "originSender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "CellReceivedTokens",
        "inputs": [
            {
                "name": "sourceBlockchainID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sourceBridge",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "originSender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HopTokensUpdated",
        "inputs": [
            {
                "name": "newHopTokens",
                "type": "address[]",
                "indexed": false,
                "internalType": "address[]"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Initiated",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MaxHopsUpdated",
        "inputs": [
            {
                "name": "newMaxHops",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Recovered",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Rollback",
        "inputs": [
            {
                "name": "receiver",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "InvalidAmount",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidArgument",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidHopToken",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidInstructions",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidParameters",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSender",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MaxHopsExceeded",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NoRouteFound",
        "inputs": []
    },
    {
        "type": "error",
        "name": "RollbackFailedInvalidFee",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SlippageExceeded",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SwapAndRollbackFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TooManyHops",
        "inputs": []
    }
] as const

export const teleporterMessengerAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "feeTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct TeleporterFeeInfo",
                "name": "updatedFeeInfo",
                "type": "tuple"
            }
        ],
        "name": "AddFeeAmount",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "blockchainID",
                "type": "bytes32"
            }
        ],
        "name": "BlockchainIDInitialized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            }
        ],
        "name": "MessageExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "messageNonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "originSenderAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "destinationBlockchainID",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedRelayerAddresses",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "receivedMessageNonce",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "relayerRewardAddress",
                                "type": "address"
                            }
                        ],
                        "internalType": "struct TeleporterMessageReceipt[]",
                        "name": "receipts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "indexed": false,
                "internalType": "struct TeleporterMessage",
                "name": "message",
                "type": "tuple"
            }
        ],
        "name": "MessageExecutionFailed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "destinationBlockchainID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "relayerRewardAddress",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "feeTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct TeleporterFeeInfo",
                "name": "feeInfo",
                "type": "tuple"
            }
        ],
        "name": "ReceiptReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "deliverer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "rewardRedeemer",
                "type": "address"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "messageNonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "originSenderAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "destinationBlockchainID",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedRelayerAddresses",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "receivedMessageNonce",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "relayerRewardAddress",
                                "type": "address"
                            }
                        ],
                        "internalType": "struct TeleporterMessageReceipt[]",
                        "name": "receipts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "indexed": false,
                "internalType": "struct TeleporterMessage",
                "name": "message",
                "type": "tuple"
            }
        ],
        "name": "ReceiveCrossChainMessage",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "RelayerRewardsRedeemed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "destinationBlockchainID",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "messageNonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "originSenderAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "destinationBlockchainID",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedRelayerAddresses",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "receivedMessageNonce",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "relayerRewardAddress",
                                "type": "address"
                            }
                        ],
                        "internalType": "struct TeleporterMessageReceipt[]",
                        "name": "receipts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "indexed": false,
                "internalType": "struct TeleporterMessage",
                "name": "message",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "feeTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "indexed": false,
                "internalType": "struct TeleporterFeeInfo",
                "name": "feeInfo",
                "type": "tuple"
            }
        ],
        "name": "SendCrossChainMessage",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "feeTokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "additionalFeeAmount",
                "type": "uint256"
            }
        ],
        "name": "addFeeAmount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "relayer",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "feeTokenAddress",
                "type": "address"
            }
        ],
        "name": "checkRelayerRewardAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            }
        ],
        "name": "getFeeInfo",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            }
        ],
        "name": "getMessageHash",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "destinationBlockchainID",
                "type": "bytes32"
            }
        ],
        "name": "getNextMessageID",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getReceiptAtIndex",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "receivedMessageNonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "relayerRewardAddress",
                        "type": "address"
                    }
                ],
                "internalType": "struct TeleporterMessageReceipt",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            }
        ],
        "name": "getReceiptQueueSize",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            }
        ],
        "name": "getRelayerRewardAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "messageID",
                "type": "bytes32"
            }
        ],
        "name": "messageReceived",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint32",
                "name": "messageIndex",
                "type": "uint32"
            },
            {
                "internalType": "address",
                "name": "relayerRewardAddress",
                "type": "address"
            }
        ],
        "name": "receiveCrossChainMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "feeTokenAddress",
                "type": "address"
            }
        ],
        "name": "redeemRelayerRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "messageNonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "originSenderAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "destinationBlockchainID",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedRelayerAddresses",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "receivedMessageNonce",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "relayerRewardAddress",
                                "type": "address"
                            }
                        ],
                        "internalType": "struct TeleporterMessageReceipt[]",
                        "name": "receipts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct TeleporterMessage",
                "name": "message",
                "type": "tuple"
            }
        ],
        "name": "retryMessageExecution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "messageNonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "originSenderAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "destinationBlockchainID",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedRelayerAddresses",
                        "type": "address[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "receivedMessageNonce",
                                "type": "uint256"
                            },
                            {
                                "internalType": "address",
                                "name": "relayerRewardAddress",
                                "type": "address"
                            }
                        ],
                        "internalType": "struct TeleporterMessageReceipt[]",
                        "name": "receipts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct TeleporterMessage",
                "name": "message",
                "type": "tuple"
            }
        ],
        "name": "retrySendCrossChainMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "destinationBlockchainID",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationAddress",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "feeTokenAddress",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct TeleporterFeeInfo",
                        "name": "feeInfo",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requiredGasLimit",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address[]",
                        "name": "allowedRelayerAddresses",
                        "type": "address[]"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct TeleporterMessageInput",
                "name": "messageInput",
                "type": "tuple"
            }
        ],
        "name": "sendCrossChainMessage",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "sourceBlockchainID",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32[]",
                "name": "messageIDs",
                "type": "bytes32[]"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "feeTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct TeleporterFeeInfo",
                "name": "feeInfo",
                "type": "tuple"
            },
            {
                "internalType": "address[]",
                "name": "allowedRelayerAddresses",
                "type": "address[]"
            }
        ],
        "name": "sendSpecifiedReceipts",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const

export const teleporterSendMessageAbiEvent = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "messageID",
            "type": "bytes32"
        },
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "destinationBlockchainID",
            "type": "bytes32"
        },
        {
            "components": [
                {
                    "internalType": "uint256",
                    "name": "messageNonce",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "originSenderAddress",
                    "type": "address"
                },
                {
                    "internalType": "bytes32",
                    "name": "destinationBlockchainID",
                    "type": "bytes32"
                },
                {
                    "internalType": "address",
                    "name": "destinationAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "requiredGasLimit",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "allowedRelayerAddresses",
                    "type": "address[]"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "receivedMessageNonce",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "relayerRewardAddress",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct TeleporterMessageReceipt[]",
                    "name": "receipts",
                    "type": "tuple[]"
                },
                {
                    "internalType": "bytes",
                    "name": "message",
                    "type": "bytes"
                }
            ],
            "indexed": false,
            "internalType": "struct TeleporterMessage",
            "name": "message",
            "type": "tuple"
        },
        {
            "components": [
                {
                    "internalType": "address",
                    "name": "feeTokenAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "indexed": false,
            "internalType": "struct TeleporterFeeInfo",
            "name": "feeInfo",
            "type": "tuple"
        }
    ],
    "name": "SendCrossChainMessage",
    "type": "event"
} as const

export const teleporterReceiveMessageAbiEvent = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "messageID",
            "type": "bytes32"
        },
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "sourceBlockchainID",
            "type": "bytes32"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "deliverer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "address",
            "name": "rewardRedeemer",
            "type": "address"
        },
        {
            "components": [
                {
                    "internalType": "uint256",
                    "name": "messageNonce",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "originSenderAddress",
                    "type": "address"
                },
                {
                    "internalType": "bytes32",
                    "name": "destinationBlockchainID",
                    "type": "bytes32"
                },
                {
                    "internalType": "address",
                    "name": "destinationAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "requiredGasLimit",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "allowedRelayerAddresses",
                    "type": "address[]"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "receivedMessageNonce",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "relayerRewardAddress",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct TeleporterMessageReceipt[]",
                    "name": "receipts",
                    "type": "tuple[]"
                },
                {
                    "internalType": "bytes",
                    "name": "message",
                    "type": "bytes"
                }
            ],
            "indexed": false,
            "internalType": "struct TeleporterMessage",
            "name": "message",
            "type": "tuple"
        }
    ],
    "name": "ReceiveCrossChainMessage",
    "type": "event"
} as const

export const teleporterExecutedMessageAbiEvent = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "messageID",
            "type": "bytes32"
        },
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "sourceBlockchainID",
            "type": "bytes32"
        }
    ],
    "name": "MessageExecuted",
    "type": "event"
} as const

export const teleporterFailedMessageExecutionAbiEvent = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "messageID",
            "type": "bytes32"
        },
        {
            "indexed": true,
            "internalType": "bytes32",
            "name": "sourceBlockchainID",
            "type": "bytes32"
        },
        {
            "components": [
                {
                    "internalType": "uint256",
                    "name": "messageNonce",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "originSenderAddress",
                    "type": "address"
                },
                {
                    "internalType": "bytes32",
                    "name": "destinationBlockchainID",
                    "type": "bytes32"
                },
                {
                    "internalType": "address",
                    "name": "destinationAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "requiredGasLimit",
                    "type": "uint256"
                },
                {
                    "internalType": "address[]",
                    "name": "allowedRelayerAddresses",
                    "type": "address[]"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "receivedMessageNonce",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "relayerRewardAddress",
                            "type": "address"
                        }
                    ],
                    "internalType": "struct TeleporterMessageReceipt[]",
                    "name": "receipts",
                    "type": "tuple[]"
                },
                {
                    "internalType": "bytes",
                    "name": "message",
                    "type": "bytes"
                }
            ],
            "indexed": false,
            "internalType": "struct TeleporterMessage",
            "name": "message",
            "type": "tuple"
        }
    ],
    "name": "MessageExecutionFailed",
    "type": "event"
} as const

export const nativeTokenWithdrawalAbiEvent = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "address",
            "name": "src",
            "type": "address",
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "wad",
            "type": "uint256",
        },
    ],
    "name": "Withdrawal",
    "type": "event",
} as const

export const nativeTokenDepositAbiEvent = {
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "address",
            "name": "dst",
            "type": "address",
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "wad",
            "type": "uint256",
        },
    ],
    "name": "Deposit",
    "type": "event",
} as const

export const depositWithdrawNativeAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "dst",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            },
        ],
        "name": "Deposit",
        "type": "event",
    },
    {
        "constant": false,
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function",
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "src",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256",
            }
        ],
        "name": "Withdrawal",
        "type": "event",
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256",
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
    },
] as const
