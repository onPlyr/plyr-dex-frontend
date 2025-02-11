import { Address, erc20Abi } from "viem"

import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import { NotificationType } from "@/app/types/notifications"
import { amountToLocale } from "@/app/lib/numbers"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { Route } from "@/app/types/swaps"

const useWriteApprove = ({
    chain,
    token,
    spenderAddress,
    amount,
    route,
    callbacks,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    spenderAddress?: Address,
    amount?: bigint,
    route?: Route,
    callbacks?: WriteTransactionCallbacks,
    _enabled?: boolean,
}) => {

    const routeType = route ? getRouteTypeLabel(route.type) : undefined
    const enabled = !(!_enabled || !chain || !token || token.isNative || !spenderAddress || !amount || amount === BigInt(0))

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: chain?.id,
            address: token?.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [spenderAddress, amount],
            query: {
                enabled: enabled,
            },
        },
        callbacks: callbacks,
        notifications: enabled ? {
            [NotificationType.Pending]: {
                header: `Confirm ${routeType ? `${routeType} ` : ""}Approval`,
                body: `Approve ${amountToLocale(amount, token.decimals)} ${token.symbol}.`,
            },
            [NotificationType.Submitted]: {
                header: `Confirming ${routeType ? `${routeType} ` : ""}Approval`,
                body: `Approving ${amountToLocale(amount, token.decimals)} ${token.symbol}.`,
            },
            [NotificationType.Success]: {
                header: `${routeType ? `${routeType} ` : ""}Approval Complete`,
                body: `Successfully approved ${amountToLocale(amount, token.decimals)} ${token.symbol}!`,
            },
        } : undefined,
        _enabled: enabled,
    })

    return {
        write: writeTransaction,
        txHash: txHash,
        txReceipt: txReceipt,
        status: status,
        isInProgress: isInProgress,
    }
}

export default useWriteApprove
