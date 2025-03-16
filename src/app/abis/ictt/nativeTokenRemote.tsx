export const nativeTokenRemoteAbi = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "settings",
                "type": "tuple",
                "internalType": "struct TokenRemoteSettings",
                "components": [
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
                        "name": "tokenHomeBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tokenHomeAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenHomeDecimals",
                        "type": "uint8",
                        "internalType": "uint8"
                    }
                ]
            },
            {
                "name": "nativeAssetSymbol",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "initialReserveImbalance",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "burnedFeesReportingRewardPercentage",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "fallback",
        "stateMutability": "payable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "BURNED_FOR_TRANSFER_ADDRESS",
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
        "name": "BURNED_TX_FEES_ADDRESS",
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
        "name": "HOME_CHAIN_BURN_ADDRESS",
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
        "name": "MULTI_HOP_CALL_GAS_PER_WORD",
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
        "name": "MULTI_HOP_CALL_REQUIRED_GAS",
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
        "name": "MULTI_HOP_SEND_REQUIRED_GAS",
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
        "name": "NATIVE_MINTER",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract INativeMinter"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "NATIVE_TOKEN_REMOTE_STORAGE_LOCATION",
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
        "name": "REGISTER_REMOTE_REQUIRED_GAS",
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
        "name": "TOKEN_REMOTE_STORAGE_LOCATION",
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
        "name": "allowance",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "spender",
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
        "name": "approve",
        "inputs": [
            {
                "name": "spender",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            {
                "name": "account",
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
        "name": "calculateNumWords",
        "inputs": [
            {
                "name": "payloadSize",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "decimals",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "deposit",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
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
        "name": "getInitialReserveImbalance",
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
        "name": "getIsCollateralized",
        "inputs": [],
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
        "name": "getMultiplyOnRemote",
        "inputs": [],
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
        "name": "getTokenHomeAddress",
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
        "name": "getTokenHomeBlockchainID",
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
        "name": "getTokenMultiplier",
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
        "name": "getTotalMinted",
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
        "name": "initialize",
        "inputs": [
            {
                "name": "settings",
                "type": "tuple",
                "internalType": "struct TokenRemoteSettings",
                "components": [
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
                        "name": "tokenHomeBlockchainID",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "tokenHomeAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenHomeDecimals",
                        "type": "uint8",
                        "internalType": "uint8"
                    }
                ]
            },
            {
                "name": "nativeAssetSymbol",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "initialReserveImbalance",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "burnedFeesReportingRewardPercentage",
                "type": "uint256",
                "internalType": "uint256"
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
        "name": "name",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string",
                "internalType": "string"
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
        "name": "registerWithHome",
        "inputs": [
            {
                "name": "feeInfo",
                "type": "tuple",
                "internalType": "struct TeleporterFeeInfo",
                "components": [
                    {
                        "name": "feeTokenAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
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
        "name": "reportBurnedTxFees",
        "inputs": [
            {
                "name": "requiredGasLimit",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
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
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
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
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "totalNativeAssetSupply",
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
        "name": "totalSupply",
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
        "name": "transfer",
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferFrom",
        "inputs": [
            {
                "name": "from",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "to",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
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
        "type": "function",
        "name": "withdraw",
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
        "type": "event",
        "name": "Approval",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "spender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
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
        "name": "Deposit",
        "inputs": [
            {
                "name": "sender",
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
        "name": "ReportBurnedTxFees",
        "inputs": [
            {
                "name": "teleporterMessageID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "feesBurned",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
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
        "type": "event",
        "name": "Transfer",
        "inputs": [
            {
                "name": "from",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "to",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdrawal",
        "inputs": [
            {
                "name": "sender",
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
        "name": "ERC20InsufficientAllowance",
        "inputs": [
            {
                "name": "spender",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "allowance",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "needed",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InsufficientBalance",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "balance",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "needed",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InvalidApprover",
        "inputs": [
            {
                "name": "approver",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InvalidReceiver",
        "inputs": [
            {
                "name": "receiver",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InvalidSender",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC20InvalidSpender",
        "inputs": [
            {
                "name": "spender",
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
