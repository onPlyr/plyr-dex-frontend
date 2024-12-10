import { Address, erc20Abi, formatUnits } from "viem"
import { useReadContract } from "wagmi"

import { Chain } from "@/app/types/chains"
import { AmountResultType } from "@/app/types/hooks"
import { Token } from "@/app/types/tokens"

// todo: replace return type, add useeffect to update return value on data change
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

    const enabled = _enabled !== false && chain !== undefined && token !== undefined && token.isNative !== true && accountAddress !== undefined && spenderAddress !== undefined

    const { data, status, refetch } = useReadContract({
        chainId: chain?.id,
        address: token?.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [accountAddress!, spenderAddress!],
        query: {
            enabled: enabled,
        },
    })

    const result: AmountResultType = {
        data: data,
        formatted: data !== undefined ? formatUnits(data, token?.decimals || 18) : undefined,
        status: status,
        refetch: refetch,
    }

    return result

}

export default useReadAllowance
