import { zeroAddress } from "viem"
import { useAccount } from "wagmi"

import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { getCellAbi, getInitiateCellInstructions } from "@/app/lib/cells"
import { amountToLocale } from "@/app/lib/numbers"
import { getTxActionLabel } from "@/app/lib/txs"
import { NotificationType } from "@/app/types/notifications"
import { SwapQuote, SwapType } from "@/app/types/swaps"
import { TxAction, TxLabelType } from "@/app/types/txs"

const useWriteInitiateSwap = ({
    quote,
    callbacks,
}: {
    quote?: SwapQuote,
    callbacks?: WriteTransactionCallbacks,
}) => {

    const { address: accountAddress } = useAccount()
    const abi = getCellAbi(quote?.srcData.cell)
    const instructions = getInitiateCellInstructions(quote)
    const { srcData, dstData } = quote ?? {}
    const action = quote?.type === SwapType.Transfer ? TxAction.Transfer : TxAction.Swap

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: srcData?.chain.id,
            account: accountAddress,
            address: srcData?.cell.address,
            abi: abi,
            functionName: "initiate",
            args: [srcData?.token.address || zeroAddress, quote?.srcAmount, instructions!],
            value: srcData?.token.isNative ? quote?.srcAmount : undefined,
        },
        callbacks: callbacks,
        notifications: quote && srcData && dstData ? {
            [NotificationType.Pending]: {
                header: `Confirm ${getTxActionLabel(action, TxLabelType.Default)}`,
                body: `From ${quote.type === SwapType.Transfer ? srcData.chain.name : amountToLocale(quote.srcAmount, srcData.token.decimals)} ${srcData.token.symbol} to ${quote.type === SwapType.Transfer ? dstData.chain.name : amountToLocale(quote.minDstAmount, dstData.token.decimals)} ${dstData.token.symbol}.`,
            },
            [NotificationType.Submitted]: {
                header: `${getTxActionLabel(action, TxLabelType.InProgress)} ${amountToLocale(quote.srcAmount, srcData.token.decimals)} ${srcData.token.symbol}`,
                body: `To ${quote.type === SwapType.Transfer ? dstData.chain.name : amountToLocale(quote.minDstAmount, dstData.token.decimals)} ${dstData.token.symbol}.`,
            },
            [NotificationType.Success]: {
                ignore: true,
            },
        } : undefined,
        notificationId: quote?.id,
    })

    return {
        write: writeTransaction,
        txHash: txHash,
        txReceipt: txReceipt,
        status: status,
        isInProgress: isInProgress,
    }
}

export default useWriteInitiateSwap