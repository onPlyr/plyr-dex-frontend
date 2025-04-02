import { useMemo } from "react"
import { zeroAddress } from "viem"
import { useAccount } from "wagmi"

import { NotificationBody, NotificationHeader } from "@/app/components/notifications/SwapHistory"
import { DefaultUserPreferences } from "@/app/config/preferences"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { getCellAbi, getInitiateCellInstructions } from "@/app/lib/cells"
import { getInitiateSwapValue } from "@/app/lib/swaps"
import { NotificationType } from "@/app/types/notifications"
import { PreferenceType } from "@/app/types/preferences"
import { SwapQuote } from "@/app/types/swaps"

const useWriteInitiateSwap = ({
    quote,
    callbacks,
}: {
    quote?: SwapQuote,
    callbacks?: WriteTransactionCallbacks,
}) => {

    const { address: accountAddress } = useAccount()
    const { preferences } = usePreferences()
    const networkMode = useMemo(() => preferences[PreferenceType.NetworkMode] ?? DefaultUserPreferences[PreferenceType.NetworkMode], [preferences])
    const abi = getCellAbi(quote?.srcData.cell, networkMode)
    const instructions = getInitiateCellInstructions({
        quote: quote,
        networkMode: networkMode,
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
