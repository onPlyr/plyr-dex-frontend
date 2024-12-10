import * as React from "react"
import { twMerge } from "tailwind-merge"
import { Address, Hash } from "viem"

import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { NumberFormatType } from "@/app/config/numbers"
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
                    <div className="flex flex-col flex-1">
                        <div className="flex flex-row flex-1 justify-end items-start font-bold">
                            {timestampAgo(swapHistory.timestamp)}
                        </div>
                        <div className="flex flex-row flex-1 justify-end items-start text-muted-500">
                            {initiateTxUrl ? (
                                <ExternalLink
                                    href={initiateTxUrl}
                                    iconSize="xs"
                                >
                                    {toShort(swapHistory.id, 6)}
                                </ExternalLink>
                            ) : toShort(swapHistory.id, 6)}
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
                                chain={swapData.srcChain}
                                size="xs"
                            />
                            {swapData.srcChain.name}
                        </div>
                        <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                            <DecimalAmount
                                amount={swapData.srcAmount}
                                symbol={swapData.srcToken.symbol}
                                token={swapData.srcToken}
                                type={NumberFormatType.Precise}
                            />
                            <TokenImage
                                token={swapData.srcToken}
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
                                chain={swapData.dstChain}
                                size="xs"
                            />
                            {swapData.dstChain.name}
                        </div>
                        <div className="flex flex-row shrink gap-4 justify-end items-center font-bold text-end">
                            <DecimalAmount
                                amount={swapData.dstAmount}
                                symbol={swapData.dstToken.symbol}
                                token={swapData.dstToken}
                                type={NumberFormatType.Precise}
                            />
                            <TokenImage
                                token={swapData.dstToken}
                                size="xs"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </SelectItem>
    )
})
SwapStatusSelectItem.displayName = "SwapStatusSelectItem"

export default SwapStatusSelectItem
