import { Address, erc20Abi, formatUnits } from "viem"
import { useReadContract } from "wagmi"

import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

const useReadAllowance = ({
    chain,
    token,
    accountAddress,
    spenderAddress,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    accountAddress?: Address,
    spenderAddress?: Address,
    _enabled?: boolean,
}) => {

    const enabled = !(!_enabled || !chain || !token || token.isNative || !accountAddress || !spenderAddress)

    const { data, status, isLoading, refetch } = useReadContract({
        chainId: chain?.id,
        address: token?.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [accountAddress!, spenderAddress!],
        query: {
            enabled: enabled,
        },
    })

    return {
        data: data,
        formatted: data !== undefined ? formatUnits(data, token?.decimals || 18) : undefined,
        status: status,
        isInProgress: isLoading,
        refetch: refetch,
    }
}

export default useReadAllowance