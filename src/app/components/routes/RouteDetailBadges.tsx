import * as React from "react"
import { twMerge } from "tailwind-merge"

import CoinsIcon from "@/app/components/icons/CoinsIcon"
import DurationIcon from "@/app/components/icons/DurationIcon"
import GasIcon from "@/app/components/icons/GasIcon"
import StepIcon from "@/app/components/icons/StepIcon"
import Badge from "@/app/components/ui/Badge"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { NumberFormatType } from "@/app/config/numbers"
import { formatDuration } from "@/app/lib/datetime"
import { iconSizes } from "@/app/config/styling"
import { getNativeToken } from "@/app/lib/tokens"
import { Route } from "@/app/types/swaps"

interface RouteDetailBadgesProps extends React.ComponentPropsWithoutRef<"div"> {
    route: Route,
}

const RouteDetailBadges = React.forwardRef<HTMLDivElement, RouteDetailBadgesProps>(({
    className,
    route,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 flex-wrap gap-2 justify-center", className)}
        {...props}
    >
        <Badge className="flex-1 bg-white/5 hover:bg-white/10 normal-case">
            <CoinsIcon className={iconSizes.sm} />
            <DecimalAmount
                amountFormatted={route.minDstAmountFormatted}
                symbol={route.dstToken.symbol}
                type={NumberFormatType.Precise}
            />
        </Badge>
        <Badge className="flex-1 bg-white/5 hover:bg-white/10">
            <GasIcon className={iconSizes.sm} />
            <DecimalAmount
                amountFormatted={route.totalGasCostFormatted}
                symbol={getNativeToken(route.srcChain)?.symbol}
            />
        </Badge>
        <Badge className="flex-1 bg-white/5 hover:bg-white/10 normal-case">
            <DurationIcon className={iconSizes.sm} />
            {formatDuration(route.durationEstimate)}
        </Badge>
        <Badge className="flex-1 bg-white/5 hover:bg-white/10">
            <StepIcon className={iconSizes.sm} />
            {route.quote.events.length} {`Step${route.quote.events.length > 1 ? "s" : ""}`}
        </Badge>
    </div>
))
RouteDetailBadges.displayName = "RouteDetailBadges"

export default RouteDetailBadges
