import * as React from "react"

import RouteDetailBadges from "@/app/components/routes/RouteDetailBadges"
import RouteEventDetailItem from "@/app/components/routes/RouteEventDetailItem"
import RouteSummaryBadges from "@/app/components/routes/RouteSummaryBadges"
import RouteSummaryTokenItem from "@/app/components/routes/RouteSummaryTokenItem"
import { SummaryDetailItem } from "@/app/components/ui/SummaryDetailItem"
import { isEqualObj } from "@/app/lib/utils"
import { Route } from "@/app/types/swaps"

interface RouteDetailItemProps extends React.ComponentPropsWithoutRef<typeof SummaryDetailItem> {
    route: Route,
    allRoutes: Route[],
    selectedRoute?: Route,
    setSelectedRoute?: (route?: Route) => void,
    maxDstAmount: bigint,
    setIsOpen?: (value: boolean) => void,
}

const RouteDetailItem = React.forwardRef<React.ElementRef<typeof SummaryDetailItem>, RouteDetailItemProps>(({
    className,
    route,
    allRoutes,
    selectedRoute,
    setSelectedRoute,
    maxDstAmount,
    setIsOpen,
    ...props
}, ref) => {
    const isSelected = isEqualObj(selectedRoute, route)
    return (
       
            <div className="flex flex-col flex-1 w-full px-6 gap-6">
                <div className="flex flex-col sm:flex-row flex-1 gap-4">
                    <div className="flex flex-row flex-1">
                        <RouteSummaryTokenItem
                            token={route.dstToken}
                            chain={route.dstChain}
                            amountFormatted={route.dstAmountFormatted}
                            minAmountFormatted={route.minDstAmountFormatted}
                        />
                    </div>
                    <RouteSummaryBadges
                        route={route}
                        allRoutes={allRoutes}
                        maxDstAmount={maxDstAmount}
                    />
                </div>
                <RouteDetailBadges route={route} />
                <div className="flex flex-col flex-1 gap-4">
                    <div className="flex flex-row flex-1 font-bold text-sm text-muted-400">
                        Steps
                    </div>
                    <div className="flex flex-col flex-1 gap-2">
                        {route.quote.events.map((event, i) => (
                            <RouteEventDetailItem
                                key={i}
                                event={event}
                            />
                        ))}
                    </div>
                </div>
            </div>
       
    )
})
RouteDetailItem.displayName = "RouteDetailItem"

export default RouteDetailItem
