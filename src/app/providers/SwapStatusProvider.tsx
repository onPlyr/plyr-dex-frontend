import { createContext, useEffect, useState } from "react"
import { Hash } from "viem"
import { serialize } from "wagmi"

import { NumberFormatType } from "@/app/config/numbers"
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

const getSwapNotificationData = (id: Hash, swap: Swap, error?: string) => {

    const swapType = swap.type ? getRouteTypeLabel(swap.type) : "Transaction"
    const header = `${swapType} ${getStatusLabel(swap.status)}`
    const body = swap.status === SwapStatus.Success ? swap.dstData ? (<>
        {swap.dstData.amount ? `${amountToLocale(swap.dstData.amount, swap.dstData.token.decimals, NumberFormatType.Precise)} ` : ""}{swap.dstData.token.symbol} received on {swap.dstData.chain.name}!
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
    } as Notification
}

const SwapStatusProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { getNotification, setNotification } = useNotifications()
    const { data: swapData, pendingData, getSwap, updateSwap } = useSwapData()

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
                }).then((result) => {

                    const notification = getNotification(swap.id, swap.id)
                    const { swapData, error } = result

                    if (swapData) {
                        updateSwap(swapData)
                        if (notification) {
                            setNotification(getSwapNotificationData(notification.id, swapData, error))
                        }

                        // const swap = swapData
                        // console.log(`>>> getPendingSwapData swap: ${swap.srcData.amount ? formatUnits(swap.srcData.amount, swap.srcData.token.decimals) : "n/a"} ${swap.srcData.token.symbol} (${swap.srcData.chain.name}) -> ${swap.dstData?.amount ? formatUnits(swap.dstData.amount, swap.dstData.token.decimals) : "n/a"} ${swap.dstData?.token.symbol} (${swap.dstData?.chain.name}) / type: ${serialize(swap.type)} / duration: ${swap.duration ? formatDuration(swap.duration) : "n/a"} / status: ${swap.status} / queryStatus: ${result.status} / error: ${result.error}`)
                        // swap.hops.forEach((hop, i) => {
                        //     console.log(`   >>> getPendingSwapData hop ${i}: ${hop.srcData.amount ? formatUnits(hop.srcData.amount, hop.srcData.token.decimals) : "n/a"} ${hop.srcData.token.symbol} (${hop.srcData.chain.name}) -> ${hop.dstData?.amount ? formatUnits(hop.dstData.amount, hop.dstData.token.decimals) : "n/a"} ${hop.dstData?.token.symbol} (${hop.dstData?.chain.name}) / status: ${hop.status} / tx hash: ${hop.txHash ?? "n/a"}`)
                        // })
                        // swap.events.forEach((event, i) => {
                        //     console.log(`      >>> getPendingSwapData event ${i}: ${event.srcData.amount ? formatUnits(event.srcData.amount, event.srcData.token.decimals) : "n/a"} ${event.srcData.token.symbol} (${event.srcData.chain.name}) -> ${event.dstData?.amount ? formatUnits(event.dstData.amount, event.dstData.token.decimals) : "n/a"} ${event.dstData?.token.symbol} (${event.dstData?.chain.name}) / status: ${event.status} / tx hash: ${event.txHash ?? "n/a"}`)
                        // })
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