import { Address, erc20Abi } from "viem"

import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { amountToLocale } from "@/app/lib/numbers"
import { Chain } from "@/app/types/chains"
import { NotificationType } from "@/app/types/notifications"
import { SwapQuote } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

const useWriteApprove = ({
    chain,
    token,
    spenderAddress,
    amount,
    quote,
    callbacks,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    spenderAddress?: Address,
    amount?: bigint,
    quote?: SwapQuote,
    callbacks?: WriteTransactionCallbacks,
    _enabled?: boolean,
}) => {

    const enabled = !(!_enabled || !chain || !token || token.isNative || !spenderAddress || !amount || amount === BigInt(0))
    const routeTypeFormatted = quote ? ` for ${quote.type.toLowerCase()}` : ""
    const formattedAmount = enabled ? `${amountToLocale(amount, token.decimals)} ${token.symbol}` : ""

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
                header: `Approve ${formattedAmount}`,
                body: `Confirm ${formattedAmount} approval${routeTypeFormatted}.`,
            },
            [NotificationType.Submitted]: {
                header: `Confirming Approval`,
                body: `Approving ${formattedAmount}${routeTypeFormatted}.`,
            },
            [NotificationType.Success]: {
                header: `Approval Confirmed!`,
                body: `Successfully approved ${formattedAmount}${routeTypeFormatted}.`,
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
