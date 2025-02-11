import { Address, erc20Abi } from "viem"

import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import { NotificationType } from "@/app/types/notifications"
import { TxNotificationType } from "@/app/types/txs"
import { amountToLocale } from "@/app/lib/numbers"

const useWriteApprove = ({
    chain,
    token,
    spenderAddress,
    amount,
    callbacks,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    spenderAddress?: Address,
    amount?: bigint,
    callbacks?: WriteTransactionCallbacks,
    _enabled?: boolean,
}) => {

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
        notifications: {
            type: NotificationType.Transaction,
            msgs: enabled ? {
                [TxNotificationType.Pending]: {
                    header: `Confirm Approval`,
                    body: `For ${amountToLocale(amount, token.decimals)} ${token.symbol}.`,
                },
                [TxNotificationType.Submitted]: {
                    header: `Confirming Approval`,
                    body: `For ${amountToLocale(amount, token.decimals)} ${token.symbol}.`,
                },
                [TxNotificationType.Success]: {
                    header: "Approval Complete",
                    body: `Successfully approved ${amountToLocale(amount, token.decimals)} ${token.symbol}!`,
                },
            } : undefined,
        },
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
