import * as React from "react"
import { twMerge } from "tailwind-merge"

import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { iconSizes } from "@/app/config/styling"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel, getSwapHistoryEventData, getSwapHistoryQuoteData } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"
import { EventHistory, RouteType, SwapHistory } from "@/app/types/swaps"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { getPlatform } from "@/app/lib/platforms"

interface SwapEventStatusDetailItemProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
    swapHistory: SwapHistory,
    event: EventHistory,
}

const SwapEventStatusDetailItem = React.forwardRef<React.ElementRef<typeof SelectItem>, SwapEventStatusDetailItemProps>(({
    className,
    swapHistory,
    event,
    ...props
}, ref) => {

    const hop = swapHistory.hops[event.hop]
    const hopData = getSwapHistoryQuoteData(hop)
    const hopTxUrl = getBlockExplorerLink({
        chain: hopData?.srcChain,
        tx: hop.tx?.hash,
    })
    const eventData = getSwapHistoryEventData(event)
    const platform = getPlatform(event.adapter?.platform)
    const platformName = (event.type === RouteType.Bridge ? event.bridge : platform?.name) || (event.adapterAddress && toShort(event.adapterAddress))

    return eventData && (
        <SelectItem
            ref={ref}
            className={twMerge("flex flex-col flex-1 w-full text-sm", className)}
            {...props}
        >
            <div className="flex flex-row flex-1 w-full gap-4">
                <div className="flex flex-col shrink justify-center items-center">
                    <RouteTypeIcon type={event.type} />
                </div>
                <div className="flex flex-col flex-1">
                    <div className="font-bold">{getRouteTypeLabel(event.type)}</div>
                    <div className="flex flex-row flex-1 gap-2 items-center text-muted-500">
                        {getStatusLabel(event.status)}
                        <SwapStatusIcon status={event.status} className={iconSizes.sm} />
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-1">
                    <div className="flex flex-row flex-1 gap-4 justify-end items-center">
                        via {platformName}
                        {platform && <PlatformImage platform={platform} size="xs" />}
                    </div>
                    <div className="flex flex-row flex-1 justify-end items-center">
                        {hop.tx ? (<>
                            <div className="text-muted-500">
                                {hopTxUrl ? (
                                    <ExternalLink
                                        href={hopTxUrl}
                                        iconSize="xs"
                                    >
                                        {toShort(hop.tx.hash, 6)}
                                    </ExternalLink>
                                ) : toShort(hop.tx.hash, 6)}
                            </div>
                        </>) : <SwapStatusIcon status={hop.status} />}
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-1 w-full gap-1">
                <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                    <div className="flex flex-row flex-initial w-12 text-muted-500">
                        From
                    </div>
                    <div className="flex flex-row flex-1 gap-4 items-center text-muted-500">
                        <ChainImageInline
                            chain={eventData.srcChain}
                            size="xs"
                        />
                        {eventData.srcChain.name}
                    </div>
                    <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                        {eventData.srcToken.symbol}
                        <TokenImage
                            token={eventData.srcToken}
                            size="xs"
                        />
                    </div>
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                    <div className="flex flex-row flex-initial w-12 text-muted-500">
                        To
                    </div>
                    <div className="flex flex-row flex-1 gap-4 items-center text-muted-500">
                        <ChainImageInline
                            chain={eventData.dstChain}
                            size="xs"
                        />
                        {eventData.dstChain.name}
                    </div>
                    <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                        {eventData.dstToken.symbol}
                        <TokenImage
                            token={eventData.dstToken}
                            size="xs"
                        />
                    </div>
                </div>
            </div>
        </SelectItem>
    )
})
SwapEventStatusDetailItem.displayName = "SwapEventStatusDetailItem"

export default SwapEventStatusDetailItem
