"use client"

import React from "react"
import { twMerge } from "tailwind-merge"

import { Tooltip } from "@/app/components/ui/Tooltip"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import { getPercentDifferenceFormatted } from "@/app/lib/numbers"
import { Route } from "@/app/types/swaps"

interface RouteSummaryBadgesProps extends React.ComponentPropsWithoutRef<"div"> {
    route: Route,
}

const RouteSummaryBadges = React.forwardRef<HTMLDivElement, RouteSummaryBadgesProps>(({
    className,
    route,
    ...props
}, ref) => {

    const { routes, maxDstAmount } = useQuoteData()
    const diffMaxDstAmount = route.dstAmount !== maxDstAmount ? getPercentDifferenceFormatted(maxDstAmount, route.dstAmount, route.dstToken.decimals) : undefined
    const isNegativeDiff = diffMaxDstAmount !== undefined && parseFloat(diffMaxDstAmount) < 0
    const minDuration = routes ? Math.min(...routes.map((r) => r.durationEstimate)) : undefined

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-row shrink flex-wrap gap-2", className)}
            {...props}
        >
            {diffMaxDstAmount !== undefined ? (
                <Tooltip
                    trigger=<div className={twMerge("badge-label normal-case", isNegativeDiff ? "bg-error-500" : "bg-success-500")}>
                        {diffMaxDstAmount} {route.dstToken.symbol}
                    </div>
                >
                    {isNegativeDiff && `This route is estimated to return ${diffMaxDstAmount} less ${route.dstToken.symbol} then the highest quote found.`}
                </Tooltip>
            ) : (
                <Tooltip
                    trigger=<div className="badge-label bg-brand-purple-500">
                        Best return
                    </div>
                >
                    This route is estimated to return the largest amount of {route.dstToken.symbol} for your {route.srcToken.symbol}.
                </Tooltip>
            )}
            {route.durationEstimate !== undefined && route.durationEstimate === minDuration && (
                <Tooltip
                    trigger=<div className="badge-label bg-brand-light-blue-500">
                        Fastest
                    </div>
                >
                    This route is estimated to be completed in the shortest amount of time.
                </Tooltip>
            )}
        </div>
    )
})
RouteSummaryBadges.displayName = "RouteSummaryBadges"

export default RouteSummaryBadges
