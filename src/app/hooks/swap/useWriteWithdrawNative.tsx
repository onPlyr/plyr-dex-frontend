import { Address } from "viem"

import { nativeDepositWithdrawAbi } from "@/app/abis/tokens/native"
import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { amountToLocale } from "@/app/lib/numbers"
import { Chain } from "@/app/types/chains"
import { isNativeToken, Token } from "@/app/types/tokens"
import { NotificationType } from "@/app/types/notifications"

const useWriteWithdrawNative = ({
    connectedChain,
    accountAddress,
    token,
    amount,
    callbacks,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    token?: Token,
    amount?: bigint,
    callbacks?: WriteTransactionCallbacks,
    _enabled?: boolean,
}) => {

    const enabled = !(_enabled === false || !connectedChain || !accountAddress || !token || isNativeToken(token) || !token.wrappedAddress || !amount || amount === BigInt(0) || connectedChain.id !== token.chainId)

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: connectedChain?.id,
            account: accountAddress,
            address: token?.wrappedAddress,
            abi: nativeDepositWithdrawAbi,
            functionName: "withdraw",
            args: [amount || BigInt(0)],
            query: {
                enabled: enabled,
            },
        },
        callbacks: callbacks,
        notifications: enabled ? {
            [NotificationType.Pending]: {
                header: `Unwrap ${token.wrappedToken ?? `to ${token.symbol}`}`,
                body: `For ${amountToLocale(amount, token.decimals)} ${token.symbol}.`,
            },
            [NotificationType.Submitted]: {
                header: `Unwrapping to ${token.symbol}`,
                body: `For ${amountToLocale(amount, token.decimals)} ${token.symbol}.`,
            },
            [NotificationType.Success]: {
                header: "Unwrap Complete",
                body: `Successfully unwrapped ${amountToLocale(amount, token.decimals)} ${token.symbol}!`,
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

export default useWriteWithdrawNative
