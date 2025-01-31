export const yakAdapterAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_tokenFrom",
                "type": "address",
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_tokenTo",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_amountOut",
                "type": "uint256"
            }
        ],
        "name": "YakAdapterSwap",
        "type": "event",
    },
] as const
