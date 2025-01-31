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
