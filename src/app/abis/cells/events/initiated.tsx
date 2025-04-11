import { getAbiItem } from "viem"

/**
* @notice Emitted when a new cross-chain operation is initiated
* @dev Logs the start of a new operation for tracking
* @param tesseractId Unique identifier for the Tesseract operation (indexed)
* @param sourceId Unique identifier for the source frontend (indexed)
* @param origin Address initiating the operation (indexed)
* @param sender Msg.sender initiating the operation
* @param receiver Final receiver of the tokens
* @param token Address of input token
* @param amount Number of tokens being processed
* @param nativeFeeAmount Amount of native fee
* @param baseFeeAmount Amount of base fee
*/
export const initiatedAbi = [
    {
        "type": "event",
        "name": "Initiated",
        "inputs": [
            {
                "name": "tesseractId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sourceId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "origin",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "receiver",
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
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "nativeFeeAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "baseFeeAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
] as const

export const initiatedEvent = getAbiItem({
    abi: initiatedAbi,
    name: "Initiated",
})
