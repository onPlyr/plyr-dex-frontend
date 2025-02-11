import { createContext, useEffect, useState } from "react"
import { Hash } from "viem"
import { serialize } from "wagmi"

import { SwapStatus } from "@/app/config/swaps"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import useSwapData from "@/app/hooks/swap/useSwapData"
import { amountToLocale } from "@/app/lib/numbers"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { getSwapStatus } from "@/app/lib/swapStatus"
import { getStatusLabel } from "@/app/lib/utils"
import { Notification, NotificationType } from "@/app/types/notifications"
import { Swap } from "@/app/types/swaps"

interface SwapStatusContextType {
    pendingIds: Hash[],
}

export const SwapStatusContext = createContext({} as SwapStatusContextType)

const getSwapNotificationData = (id: string, swap: Swap, error?: string): Notification => {

    const swapType = swap.type ? getRouteTypeLabel(swap.type) : "Transaction"
    const header = `${swapType} ${getStatusLabel(swap.status)}`
    const body = swap.status === SwapStatus.Success ? swap.dstData ? (<>
        {swap.dstData.amount ? `Received ${amountToLocale(swap.dstData.amount, swap.dstData.token.decimals)} ` : ""}{swap.dstData.token.symbol}!
    </>) : (<>
        {swapType} completed successfully!
    </>) : swap.status === SwapStatus.Error ? (<>
        {error || "Unable to fetch transaction data."}
    </>) : (<>
        {swapType} in progress.
    </>)

    return {
        id: id,
        header: header,
        body: body,
        type: NotificationType.Swap,
        status: swap.status,
        txHash: swap.id,
    }
}

const SwapStatusProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { getNotification, setNotification } = useNotifications()
    const { data: swapData, pendingData, getSwap, setSwap } = useSwapData()

    const [seenPendingIds, setSeenPendingIds] = useState<Hash[]>([])

    useEffect(() => {
        setSeenPendingIds(pendingData)
    }, [])

    console.log(`>>>>>>>>>>>> SwapStatusProvider pendingData (${pendingData.length} / ${swapData.length}): ${serialize(pendingData)}`)

    useEffect(() => {

        const unseenPendingIds = pendingData.filter((id) => !seenPendingIds.includes(id))
        setSeenPendingIds([
            ...seenPendingIds,
            ...unseenPendingIds,
        ])

        for (const unseenId of unseenPendingIds) {

            const swap = getSwap(unseenId)

            // todo: handle error if not found
            if (swap) {
                getSwapStatus({
                    swap: swap,
                    setSwap: setSwap,
                }).then((result) => {

                    const { swapData, error } = result
                    const notification = getNotification({
                        txHash: swap.id,
                    })

                    if (swapData) {
                        //setSwap(swapData)
                        if (notification) {
                            setNotification(getSwapNotificationData(notification.id, swapData, error))
                        }
                    }
                })
            }
        }
    }, [pendingData])

    const context: SwapStatusContextType = {
        pendingIds: seenPendingIds,
    }

    return (
        <SwapStatusContext.Provider value={context} >
            {children}
        </SwapStatusContext.Provider>
    )
}

export default SwapStatusProvider