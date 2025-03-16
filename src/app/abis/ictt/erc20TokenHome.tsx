export const erc20TokenHomeAbi = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "teleporterRegistryAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "teleporterManager",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "minTeleporterVersion",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenDecimals",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ERC20_TOKEN_HOME_STORAGE_LOCATION",
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
        "name": "TELEPORTER_REGISTRY_APP_STORAGE_LOCATION",
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
        "name": "TOKEN_HOME_STORAGE_LOCATION",
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
        "name": "addCollateral",
        "inputs": [
            {
                "name": "remoteBlockchainID",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "remoteTokenTransferrerAddress",
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
        "name": "getBlockchainID",
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
        "name": "getMinTeleporterVersion",
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
        "name": "getRemoteTokenTransferrerSettings",
        "inputs": [
            {
                "name": "remoteBlockchainID",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "remoteTokenTransferrerAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct RemoteTokenTransferrerSettings",
                "components": [
                    {
                        "name": "registered",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "collateralNeeded",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "tokenMultiplier",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "multiplyOnRemote",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getTokenAddress",
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
        "name": "getTransferredBalance",
        "inputs": [
            {
                "name": "remoteBlockchainID",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "remoteTokenTransferrerAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
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
        "name": "initialize",
        "inputs": [
            {
                "name": "teleporterRegistryAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "teleporterManager",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "minTeleporterVersion",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenDecimals",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "isTeleporterAddressPaused",
        "inputs": [
            {
                "name": "teleporterAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
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
        "name": "pauseTeleporterAddress",
        "inputs": [
            {
                "name": "teleporterAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "receiveTeleporterMessage",
        "inputs": [
            {
                "name": "sourceBlockchainID",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "originSenderAddress",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "message",
                "type": "bytes",
                "internalType": "bytes"
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
        "name": "send",
        "inputs": [
            {
                "name": "input",
                "type": "tuple",
                "internalType": "struct SendTokensInput",
                "components": [
                    {
                        "name": "destinationBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "destinationTokenTransferrerAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipient",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFeeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "secondaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "requiredGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "multiHopFallback",
                        "type": "address",
                        "internalType": "address"
                    }
                ]
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
        "name": "sendAndCall",
        "inputs": [
            {
                "name": "input",
                "type": "tuple",
                "internalType": "struct SendAndCallInput",
                "components": [
                    {
                        "name": "destinationBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "destinationTokenTransferrerAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipientContract",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipientPayload",
                        "type": "bytes",
                        "internalType": "bytes"
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
                        "name": "multiHopFallback",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "fallbackRecipient",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFeeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "secondaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
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
        "name": "unpauseTeleporterAddress",
        "inputs": [
            {
                "name": "teleporterAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updateMinTeleporterVersion",
        "inputs": [
            {
                "name": "version",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "CallFailed",
        "inputs": [
            {
                "name": "recipientContract",
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
        "name": "CallSucceeded",
        "inputs": [
            {
                "name": "recipientContract",
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
        "name": "CollateralAdded",
        "inputs": [
            {
                "name": "remoteBlockchainID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "remoteTokenTransferrerAddress",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "remaining",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Initialized",
        "inputs": [
            {
                "name": "version",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MinTeleporterVersionUpdated",
        "inputs": [
            {
                "name": "oldMinTeleporterVersion",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "newMinTeleporterVersion",
                "type": "uint256",
                "indexed": true,
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
        "name": "RemoteRegistered",
        "inputs": [
            {
                "name": "remoteBlockchainID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "remoteTokenTransferrerAddress",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "initialCollateralNeeded",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenDecimals",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TeleporterAddressPaused",
        "inputs": [
            {
                "name": "teleporterAddress",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TeleporterAddressUnpaused",
        "inputs": [
            {
                "name": "teleporterAddress",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "TokensAndCallRouted",
        "inputs": [
            {
                "name": "teleporterMessageID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "input",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct SendAndCallInput",
                "components": [
                    {
                        "name": "destinationBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "destinationTokenTransferrerAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipientContract",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipientPayload",
                        "type": "bytes",
                        "internalType": "bytes"
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
                        "name": "multiHopFallback",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "fallbackRecipient",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFeeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "secondaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
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
        "name": "TokensAndCallSent",
        "inputs": [
            {
                "name": "teleporterMessageID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "input",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct SendAndCallInput",
                "components": [
                    {
                        "name": "destinationBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "destinationTokenTransferrerAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipientContract",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipientPayload",
                        "type": "bytes",
                        "internalType": "bytes"
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
                        "name": "multiHopFallback",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "fallbackRecipient",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFeeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "secondaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
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
        "name": "TokensRouted",
        "inputs": [
            {
                "name": "teleporterMessageID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "input",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct SendTokensInput",
                "components": [
                    {
                        "name": "destinationBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "destinationTokenTransferrerAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipient",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFeeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "secondaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "requiredGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "multiHopFallback",
                        "type": "address",
                        "internalType": "address"
                    }
                ]
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
        "name": "TokensSent",
        "inputs": [
            {
                "name": "teleporterMessageID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "input",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct SendTokensInput",
                "components": [
                    {
                        "name": "destinationBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "destinationTokenTransferrerAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "recipient",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFeeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "primaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "secondaryFee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "requiredGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "multiHopFallback",
                        "type": "address",
                        "internalType": "address"
                    }
                ]
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
        "name": "TokensWithdrawn",
        "inputs": [
            {
                "name": "recipient",
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
        "name": "AddressEmptyCode",
        "inputs": [
            {
                "name": "target",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "AddressInsufficientBalance",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "FailedInnerCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidInitialization",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotInitializing",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    }
] as const
