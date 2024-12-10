import * as React from "react"
import { twMerge } from "tailwind-merge"
import { Address, Hash } from "viem"

import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import RouteEventTokenDetail from "@/app/components/routes/RouteEventTokenDetail"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { iconSizes } from "@/app/config/styling"
import useWatchSwapStatus from "@/app/hooks/swap/useWatchSwapStatus"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { timestampAgo } from "@/app/lib/datetime"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel, getSwapHistoryQuoteData } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"

interface SwapStatusSelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
    accountAddress?: Address,
    txid: Hash,
}

const SwapStatusSelectItem = React.forwardRef<React.ElementRef<typeof SelectItem>, SwapStatusSelectItemProps>(({
    className,
    accountAddress,
    txid,
    ...props
}, ref) => {

    const swapHistory = useWatchSwapStatus({
        accountAddress: accountAddress,
        txid: txid,
    })

    const swapData = swapHistory ? getSwapHistoryQuoteData(swapHistory) : undefined
    const swapType = swapHistory ? getRouteTypeLabel(swapHistory.type) : undefined

    const initiateTxUrl = getBlockExplorerLink({
        chain: swapData?.srcChain,
        tx: swapHistory?.id,
    })
    const txidElement = swapHistory ? <div>
        <span className="flex sm:hidden">{toShort(swapHistory.id, 4)}</span>
        <span className="hidden sm:flex">{toShort(swapHistory.id, 6)}</span>
    </div> : undefined

    return swapHistory && swapData && (
        <SelectItem
            ref={ref}
            className={twMerge("flex flex-col flex-1 w-full text-sm", className)}
            {...props}
        >
            <div className="flex flex-col flex-1 gap-4">
                <div className="flex flex-row flex-1 w-full gap-4">
                    <div className="flex flex-col shrink justify-center items-center">
                        <RouteTypeIcon type={swapHistory.type} />
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="font-bold text-base">{swapType}</div>
                        <div className="flex flex-row flex-1 gap-2 items-center text-muted-500">
                            {getStatusLabel(swapHistory.status)}
                            <SwapStatusIcon status={swapHistory.status} className={iconSizes.sm} />
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 text-end">
                        <div className="flex flex-row flex-1 justify-end items-start font-bold">
                            {timestampAgo(swapHistory.timestamp)}
                        </div>
                        <div className="flex flex-row flex-1 justify-end items-start text-muted-500">
                            {initiateTxUrl ? (
                                <ExternalLink
                                    href={initiateTxUrl}
                                    iconSize="xs"
                                >
                                    {txidElement}
                                </ExternalLink>
                            ) : txidElement}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-1 w-full gap-1">
                    <RouteEventTokenDetail
                        label="From"
                        chain={swapData.srcChain}
                        token={swapData.srcToken}
                        amount={swapData.srcAmount}
                    />
                    <RouteEventTokenDetail
                        label="To"
                        chain={swapData.dstChain}
                        token={swapData.dstToken}
                        amount={swapData.dstAmount}
                    />
                </div>
            </div>
        </SelectItem>
    )
})
SwapStatusSelectItem.displayName = "SwapStatusSelectItem"

export default SwapStatusSelectItem
