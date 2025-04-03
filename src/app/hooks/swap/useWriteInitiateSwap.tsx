import { zeroAddress } from "viem"
import { useAccount } from "wagmi"

import { NotificationBody, NotificationHeader } from "@/app/components/notifications/SwapHistory"
import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { getCellAbi, getInitiateCellInstructions } from "@/app/lib/cells"
import { getInitiateSwapValue } from "@/app/lib/swaps"
import { NotificationType } from "@/app/types/notifications"
import { SwapQuote } from "@/app/types/swaps"

const useWriteInitiateSwap = ({
    quote,
    callbacks,
}: {
    quote?: SwapQuote,
    callbacks?: WriteTransactionCallbacks,
}) => {

    const { address: accountAddress } = useAccount()
    const abi = getCellAbi(quote?.srcData.cell)
    const instructions = getInitiateCellInstructions({
        quote: quote,
    })

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: quote?.srcData.chain.id,
            account: accountAddress,
            address: quote?.srcData.cell.address,
            abi: abi,
            functionName: "initiate",
            args: [quote?.srcData.token.address || zeroAddress, quote?.srcAmount, instructions!],
            value: getInitiateSwapValue(quote),
        },
        callbacks: callbacks,
        notifications: quote ? {
            [NotificationType.Pending]: {
                header: <NotificationHeader swap={quote} />,
                body: <NotificationBody
                    swap={quote}
                    isInitiate={true}
                />,
            },
            [NotificationType.Submitted]: {
                header: <NotificationHeader swap={quote} />,
                body: <NotificationBody swap={quote} />,
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
