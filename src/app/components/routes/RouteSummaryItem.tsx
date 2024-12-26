import * as React from "react"

import ArrowIcon from "@/app/components/icons/ArrowIcon"
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import RouteDetailBadges from "@/app/components/routes/RouteDetailBadges"
import RouteSummaryBadges from "@/app/components/routes/RouteSummaryBadges"
import RouteSummaryTokenItem from "@/app/components/routes/RouteSummaryTokenItem"
import Badge from "@/app/components/ui/Badge"
import { SummaryDetailItem } from "@/app/components/ui/SummaryDetailItem"
import { iconSizes } from "@/app/config/styling"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { isEqualObj } from "@/app/lib/utils"
import { StyleDirection } from "@/app/types/styling"
import { Route } from "@/app/types/swaps"

interface RouteSummaryItemProps extends React.ComponentPropsWithoutRef<typeof SummaryDetailItem> {
    route: Route,
    allRoutes: Route[],
    maxDstAmount: bigint,
    selectedRoute?: Route,
    setSelectedRoute?: (route?: Route) => void,
    isSelectedRoute?: boolean,
}

const RouteSummaryItem = React.forwardRef<React.ElementRef<typeof SummaryDetailItem>, RouteSummaryItemProps>(({
    className,
    route,
    allRoutes,
    maxDstAmount,
    selectedRoute,
    setSelectedRoute,
    isSelectedRoute,
    ...props
}, ref) => {
    const isSelected = isSelectedRoute ?? isEqualObj(selectedRoute, route)
    return (
        <SummaryDetailItem
            ref={ref}
            className={className}
            isSelected={isSelected}
            onClick={isSelected !== true ? setSelectedRoute?.bind(this, route) : undefined}
            {...props}
        >
            <div className="flex flex-col flex-1 gap-4 w-full">
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
                <div className="flex flex-col flex-1 gap-2">
                    <RouteDetailBadges route={route} />
                    {route.quote.events.length >= 1 && (
                        <Badge className="flex flex-row flex-1 flex-wrap gap-2 justify-evenly items-center bg-white/5 hover:bg-white/10">
                            {route.quote.events.map((event, i) => (
                                <div key={i} className="contents">
                                    <div className="flex flex-col flex-1 gap-1 justify-center items-center">
                                        <RouteTypeIcon type={event.type} className={iconSizes.sm} />
                                        <div>{getRouteTypeLabel(event.type)}</div>
                                    </div>
                                    {i < route.quote.events.length - 1 && (
                                        <ArrowIcon direction={StyleDirection.Right} className={iconSizes.sm} />
                                    )}
                                </div>
                            ))}
                        </Badge>
                    )}
                </div>
            </div>
        </SummaryDetailItem>
    )
})
RouteSummaryItem.displayName = "RouteSummaryItem"

export default RouteSummaryItem
