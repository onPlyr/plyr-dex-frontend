import * as React from "react"
import { twMerge } from "tailwind-merge"

import Badge from "@/app/components/ui/Badge"
import { Route } from "@/app/types/swaps"
import { getPercentDifferenceFormatted } from "@/app/lib/numbers"
import { BadgeDollarSign, TrendingDown, Zap } from "lucide-react"

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
                <Badge className={parseFloat(diffMaxDstAmount) < 0 ? "text-white text-sm h-8 bg-red-500 flex flex-row items-center gap-0 leading-none pr-4" : "text-white text-sm h-10 bg-green-500 flex flex-row items-center gap-0 leading-none pr-4"}>
                    {parseFloat(diffMaxDstAmount) < 0 ? <><TrendingDown className="w-5 h-5 mr-1"/> {diffMaxDstAmount}</>  : <><TrendingDown className="w-6 h-6 mr-0.5"/> {diffMaxDstAmount}</>}
                </Badge>
            ) : (
                <Badge className="bg-[#daff00] h-8 pr-4 text-black text-xs flex flex-row items-center gap-0 leading-none">
                    <BadgeDollarSign className="w-5 h-5 mr-1" /> Best Rate
                </Badge>
            )}
            {route.durationEstimate === minDuration && (
                <Badge className="bg-[#daff00] h-8 pr-4 text-black text-xs flex flex-row items-center gap-0 leading-none">
                    <Zap className="w-5 h-5 mr-1" /> Fastest
                </Badge>
            )}
        </div>
    )
})
RouteSummaryBadges.displayName = "RouteSummaryBadges"

export default RouteSummaryBadges
