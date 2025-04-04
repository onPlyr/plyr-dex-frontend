import { getAbiItem } from "viem"

export const callFailedAbi = [
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
] as const

export const callFailedEvent = getAbiItem({
    abi: callFailedAbi,
    name: "CallFailed",
})
