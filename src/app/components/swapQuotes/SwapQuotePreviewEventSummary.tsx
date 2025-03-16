import React from "react"
import { twMerge } from "tailwind-merge"

import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes } from "@/app/config/styling"
import { getPlatform } from "@/app/lib/platforms"
import { StyleDirection } from "@/app/types/styling"
import { isSwapType, SwapQuote, SwapTypeLabel } from "@/app/types/swaps"

interface SwapQuotePreviewEventSummaryProps extends React.ComponentPropsWithoutRef<"div"> {
    quote: SwapQuote,
}

const SwapQuotePreviewEventSummary = React.forwardRef<HTMLDivElement, SwapQuotePreviewEventSummaryProps>(({
    className,
    quote,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={twMerge("label flex-1 flex-1 flex-wrap p-2 gap-2", className)}
            {...props}
        >
            {quote.events.map((event, i) => {

                const platform = getPlatform(event.adapter?.platform)
                const platformName = platform?.name ?? event.bridge ?? event.adapter?.name

                return (
                    <div key={i} className="contents">
                        <Tooltip
                            trigger=<div className="flex flex-row flex-1 gap-1 justify-center items-center normal-case">
                                {isSwapType(event.type) ? (<>
                                    <TokenImage
                                        token={event.srcData.token}
                                        size="xs"
                                    />
                                    <TokenImage
                                        token={event.dstData.token}
                                        size="xs"
                                        className="-ms-3" />
                                </>) : (
                                    <ChainImageInline
                                        chain={event.dstData.chain}
                                        size="xs"
                                    />
                                )}
                            </div>
                        >
                            <div className="flex flex-row flex-1 items-center gap-2">
                                {SwapTypeLabel[event.type]} {isSwapType(event.type) ? `from ${event.srcData.token.symbol} to ${event.dstData.token.symbol}` : `to ${event.dstData.chain.name}`} {platformName && `via ${platformName}`}
                                {platform && (
                                    <PlatformImage
                                        platform={platform}
                                        size="xs"
                                    />
                                )}
                            </div>
                        </Tooltip>
                        {i < quote.events.length - 1 && (
                            <ChevronIcon
                                direction={StyleDirection.Right}
                                className={iconSizes.xs}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
})
SwapQuotePreviewEventSummary.displayName = "SwapQuotePreviewEventSummary"

export default SwapQuotePreviewEventSummary
