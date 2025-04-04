import { getAbiItem } from "viem"

export const rollbackAbi = [
    {
        "type": "event",
        "name": "Rollback",
        "inputs": [
            {
                "name": "receiver",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token",
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

export const rollbackEvent = getAbiItem({
    abi: rollbackAbi,
    name: "Rollback",
})
