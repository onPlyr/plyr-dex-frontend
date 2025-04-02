import { getAbiItem } from "viem"

export const cellRoutedAbi = [
    {
        "type": "event",
        "name": "CellRouted",
        "inputs": [
            {
                "name": "tesseractID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "messageID",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "action",
                "type": "uint8",
                "indexed": false,
                "internalType": "enum Action"
            },
            {
                "name": "transferrer",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "destinationBlockchainID",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            },
            {
                "name": "destinationCell",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "destinationTransferrer",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tokenOut",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amountOut",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
] as const

export const cellRoutedEvent = getAbiItem({
    abi: cellRoutedAbi,
    name: "CellRouted",
})
