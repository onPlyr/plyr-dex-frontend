"use client"

import { useRouter } from "next/navigation"
import React, { useCallback } from "react"
import { twMerge } from "tailwind-merge"

import RouteSummaryBadges from "@/app/components/routes/RouteSummaryBadges"
import SwapEventDetail from "@/app/components/swap/SwapEventDetail"
import SwapSummaryLabels from "@/app/components/swap/SwapSummaryLabels"
import SwapSummaryTokenDetail from "@/app/components/swap/SwapSummaryTokenDetail"
import { SelectItem } from "@/app/components/ui/SelectItem"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import { isEqualObj } from "@/app/lib/utils"
import { Route } from "@/app/types/swaps"

interface SwapSummaryProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
    route: Route,
    isSelectedRoute?: boolean,
    hideEventSummary?: boolean,
    showFullEvents?: boolean,
    backUrl?: `/${string}`,
}

const SwapSummary = React.forwardRef<React.ElementRef<typeof SelectItem>, SwapSummaryProps>(({
    className,
    route,
    isSelectedRoute,
    hideEventSummary = false,
    showFullEvents = false,
    backUrl,
    ...props
}, ref) => {

    const { selectedRoute, setSelectedRoute } = useQuoteData()
    const isSelected = isSelectedRoute ?? isEqualObj(selectedRoute, route)

    const router = useRouter()
    const handleOnClick = useCallback(() => {
        if (isSelected) {
            router.push("/swap/review")
        }
        else {
            setSelectedRoute(route)
            if (backUrl) {
                router.push(backUrl)
            }
        }
    }, [route, isSelected, setSelectedRoute, backUrl, router])

    return (
        <SelectItem
            ref={ref}
            className={twMerge("container-select flex flex-col flex-1 p-4 gap-4", className)}
            isSelected={isSelected ? true : false}
            onClick={handleOnClick.bind(this)}
            replaceClass={true}
            {...props}
        >
            <div className="flex flex-col sm:flex-row flex-1 gap-4">
                <SwapSummaryTokenDetail
                    token={route.dstToken}
                    chain={route.dstChain}
                    amountFormatted={route.dstAmountFormatted}
                    minAmountFormatted={route.minDstAmountFormatted}
                />
                <RouteSummaryBadges route={route} />
            </div>
            <SwapSummaryLabels
                route={route}
                hideEvents={hideEventSummary}
            />
            {showFullEvents && route.quote.events.map((event, i) => (
                <SwapEventDetail
                    key={i}
                    event={event}
                />
            ))}
        </SelectItem>
    )
})
SwapSummary.displayName = "SwapSummary"

export default SwapSummary
