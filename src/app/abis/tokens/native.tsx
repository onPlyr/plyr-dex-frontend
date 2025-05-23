export const nativeDepositWithdrawAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "dst",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            },
        ],
        "name": "Deposit",
        "type": "event",
    },
    {
        "constant": false,
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function",
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "src",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256",
            }
        ],
        "name": "Withdrawal",
        "type": "event",
    },
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256",
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
    },
] as const
