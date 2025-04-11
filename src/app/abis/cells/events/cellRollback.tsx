import { getAbiItem } from "viem"

/**
* @notice Emitted when tokens are returned due to operation failure
* @dev Logs rollback operations for tracking failed transactions
* @param tesseractID Unique identifier for the Tesseract operation (indexed)
* @param messageID Unique identifier for the message (indexed)
* @param transferrer Address of the token transferrer on source chain (indexed)
* @param receiver Address of the receiver on source chain
* @param destinationBlockchainID Destination blockchain identifier
* @param destinationTransferrer Address of the transferrer on destination chain
* @param token Address of the input/output token
* @param amountIn Number of input tokens
* @param amountOut Number of output tokens (amountIn - rollbackTeleporterFee)
*/
export const cellRollbackAbi = [
    {
        "type": "event",
        "name": "CellRollback",
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
                "name": "transferrer",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "receiver",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "destinationBlockchainID",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            },
            {
                "name": "destinationTransferrer",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "token",
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
                "name": "amountOut",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
] as const

export const cellRollbackEvent = getAbiItem({
    abi: cellRollbackAbi,
    name: "CellRollback",
})
