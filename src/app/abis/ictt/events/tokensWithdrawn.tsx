import { getAbiItem } from "viem"

export const tokensWithdrawnAbi = [
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
] as const

export const tokensWithdrawnEvent = getAbiItem({
    abi: tokensWithdrawnAbi,
    name: "TokensWithdrawn",
})
