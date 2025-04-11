import { getAbiItem } from "viem"

/**
* @notice Emitted when a swap operation fails
* @dev Logs the details of a failed swap operation
* @param tokenIn Address of the input token
* @param amountIn Number of input tokens
* @param expectedTokenOut Expected address of the output token
* @param expectedAmountOut Expected number of output tokens
*/
export const cellSwapFailedAbi = [
    {
        "type": "event",
        "name": "CellSwapFailed",
        "inputs": [
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
                "name": "expectedTokenOut",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "expectedAmountOut",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
] as const

export const cellSwapFailedEvent = getAbiItem({
    abi: cellSwapFailedAbi,
    name: "CellSwapFailed",
})
