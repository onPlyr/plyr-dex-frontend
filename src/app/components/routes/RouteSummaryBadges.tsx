import * as React from "react"
import { twMerge } from "tailwind-merge"

import Badge from "@/app/components/ui/Badge"
import { Route } from "@/app/types/swaps"
import { getPercentDifferenceFormatted } from "@/app/lib/numbers"

interface RouteSummaryBadgesProps extends React.ComponentPropsWithoutRef<"div"> {
    route: Route,
    allRoutes: Route[],
    maxDstAmount: bigint,
}

const RouteSummaryBadges = React.forwardRef<HTMLDivElement, RouteSummaryBadgesProps>(({
    className,
    route,
    allRoutes,
    maxDstAmount,
    ...props
}, ref) => {

    const diffMaxDstAmount = route.dstAmount !== maxDstAmount ? getPercentDifferenceFormatted(maxDstAmount, route.dstAmount, route.dstToken.decimals) : undefined
    const minDuration = Math.min(...allRoutes.map((r) => r.durationEstimate))

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-row shrink gap-2", className)}
            {...props}
        >
            {diffMaxDstAmount !== undefined ? (
                <Badge className={parseFloat(diffMaxDstAmount) < 0 ? "bg-error-500" : "bg-success-500"}>
                    {diffMaxDstAmount}
                </Badge>
            ) : (
                <Badge className="bg-[#daff00] text-black">
                    Best return
                </Badge>
            )}
            {route.durationEstimate === minDuration && (
                <Badge className="bg-brand-light-blue-500">
                    Fastest
                </Badge>
            )}
        </div>
    )
})
RouteSummaryBadges.displayName = "RouteSummaryBadges"

export default RouteSummaryBadges
