import * as React from "react"
import { twMerge } from "tailwind-merge"

import ChevronIcon from "@/app/components/icons/ChevronIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import GasIcon from "@/app/components/icons/GasIcon"
import StepIcon from "@/app/components/icons/StepIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import { formatDuration } from "@/app/lib/datetime"
import { getPlatform } from "@/app/lib/platforms"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { getNativeToken } from "@/app/lib/tokens"
import { StyleDirection } from "@/app/types/styling"
import { Route, RouteType } from "@/app/types/swaps"

interface SwapSummaryLabelsProps extends React.ComponentPropsWithoutRef<"div"> {
    route: Route,
    hideEvents?: boolean,
}

const SwapSummaryLabels = React.forwardRef<HTMLDivElement, SwapSummaryLabelsProps>(({
    className,
    route,
    hideEvents = false,
    ...props
}, ref) => {

    const eventTypeData: [RouteType, number][] = []
    for (const type of Object.values(RouteType)) {
        const numEvents = route.quote.events.filter((event) => event.type === type).length
        if (numEvents > 0) {
            eventTypeData.push([type, numEvents])
        }
    }

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-1 gap-2", className)}
            {...props}
        >
            <div className="flex flex-row flex-1 flex-wrap gap-2">
                <Tooltip
                    trigger=<div className="label flex-1">
                        <GasIcon className={iconSizes.sm} />
                        <DecimalAmount
                            amountFormatted={route.totalGasCostFormatted}
                            symbol={getNativeToken(route.srcChain)?.symbol}
                        />
                    </div>
                >
                    <DecimalAmount
                        amountFormatted={route.totalGasCostFormatted}
                        symbol={getNativeToken(route.srcChain)?.symbol}
                        type={NumberFormatType.Precise}
                        className="font-bold"
                    />
                    &nbsp;estimated gas fees.
                </Tooltip>
                <Tooltip
                    trigger=<div className="label flex-1 normal-case">
                        <DurationIcon className={iconSizes.sm} />
                        {formatDuration(route.durationEstimate)}
                    </div>
                >
                    <span className="font-bold">{formatDuration(route.durationEstimate)}</span>&nbsp;estimated time to completion.
                </Tooltip>
                <Tooltip
                    trigger=<div className="label flex-1 normal-case">
                        <StepIcon className={iconSizes.sm} />
                        {route.quote.events.length} {`Step${route.quote.events.length > 1 ? "s" : ""}`}
                    </div>
                >
                    {eventTypeData.map(([type, count], i) => (
                        <div key={type}>
                            {i === eventTypeData.length - 1 && (<>&nbsp;</>)}<span className="font-bold">{count} x {getRouteTypeLabel(type).toLowerCase()}</span>&nbsp;{i < eventTypeData.length - 1 ? "and" : "steps."}
                        </div>
                    ))}
                </Tooltip>
            </div>
            {hideEvents !== true && (
                <div className="label flex-1 flex-1 flex-wrap p-2 gap-2">
                    {route.quote.events.map((event, i) => {
                        const platform = getPlatform(event.adapter?.platform)
                        const platformName = platform?.name ?? event.bridge ?? event.adapter?.name
                        return (
                            <div key={i} className="contents">
                                <Tooltip
                                    trigger=<div className="flex flex-row flex-1 gap-1 justify-center items-center normal-case">
                                        {event.type === RouteType.Swap ? (<>
                                            <TokenImage token={event.srcToken} size="xs" />
                                            <TokenImage token={event.dstToken} size="xs" className="-ms-3" />
                                        </>) : (
                                            <ChainImageInline chain={event.dstChain} size="xs" />
                                        )}
                                    </div>
                                >
                                    <div className="flex flex-row flex-1 items-center gap-2">
                                        {`${getRouteTypeLabel(event.type)} ${event.type === RouteType.Swap ? `from ${event.srcToken.symbol} to ${event.dstToken.symbol}` : `to ${event.dstChain.name}`} ${platformName && `via ${platformName}`}`}
                                        {platform && <PlatformImage platform={platform} size="xs" />}
                                    </div>
                                </Tooltip>
                                {i < route.quote.events.length - 1 && (
                                    <ChevronIcon direction={StyleDirection.Right} className={iconSizes.xs} />
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
})
SwapSummaryLabels.displayName = "SwapSummaryLabels"

export default SwapSummaryLabels
