import { Address } from "viem"
import { useReadContract } from "wagmi"
import { avalanche } from "wagmi/chains"

import { avvyResolverAddress } from "@/app/config/avvy"

const useReadAvvyName = ({
    accountAddress,
    _enabled,
}: {
    accountAddress?: Address,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && accountAddress !== undefined

    const avvyResolverAbi = [
        {
            inputs: [
                {
                    internalType: "address",
                    name: "addy",
                    type: "address",
                },
            ],
            name: "reverseResolveEVMToName",
            outputs: [
                {
                    internalType: "string",
                    name: "preimage",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ] as const

    const { data } = useReadContract({
        chainId: avalanche.id,
        address: avvyResolverAddress,
        abi: avvyResolverAbi,
        functionName: "reverseResolveEVMToName",
        args: [accountAddress!],
        query: {
            enabled: enabled,
        },
    })

    const formattedName = data ? (data.length > 32 ? `${data.substring(0, 32)}...` : data) : undefined

    return {
        name: data,
        formattedName: formattedName,
    }

}

export default useReadAvvyName
