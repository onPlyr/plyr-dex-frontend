import { getAbiItem } from "viem"

/**
* @notice Emitted when Cell contract routes tokens to destination
* @dev Logs all token movements for tracking and verification
* @param tesseractID Unique identifier for the Tesseract operation (indexed)
* @param messageID Unique identifier for the message (indexed)
* @param action Type of action performed
* @param transferrer Address of the token transferrer on source chain (indexed)
* @param destinationBlockchainID Destination blockchain identifier
* @param destinationCell Cell contract address on destination chain
* @param destinationTransferrer Address of the transferrer on destination chain
* @param tokenIn Address of the input token
* @param amountIn Number of input tokens
* @param tokenOut Address of the output token
* @param amountOut Number of output tokens
*/
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
