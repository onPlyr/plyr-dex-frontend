export const dexalotCellAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "mainnetRFQAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "estimatedSwapGas",
                "type": "uint256"
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
        "name": "RollbackFailedInvalidFee",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "SlippageExceeded",
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "string",
                "name": "reason",
                "type": "string"
            }
        ],
        "name": "ValidationFailed",
        "type": "event"
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
        "name": "mainnetRFQ",
        "outputs": [
            {
                "internalType": "contract IDexalotMainnetRFQ",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
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
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "",
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
        "name": "swapGasEstimate",
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
