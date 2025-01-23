import * as React from "react"
import { twMerge } from "tailwind-merge"

import SlideInOut from "@/app/components/animations/SlideInOut"
import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import RouteEventTokenDetail from "@/app/components/routes/RouteEventTokenDetail"
import { iconSizes } from "@/app/config/styling"
import { getPlatform } from "@/app/lib/platforms"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { AnimationDelays, AnimationTransitions, AnimationVariants } from "@/app/types/animations"
import { RouteEvent, RouteType } from "@/app/types/swaps"

interface SwapEventDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    event: RouteEvent,
    animate?: boolean,
    animations?: AnimationVariants,
    transitions?: AnimationTransitions,
    delays?: AnimationDelays,
}

const SwapEventDetail = React.forwardRef<HTMLDivElement, SwapEventDetailProps>(({
    className,
    event,
    animate,
    animations,
    transitions,
    delays,
    ...props
}, ref) => {

    const platform = getPlatform(event.adapter?.platform)
    const platformName = (event.type === RouteType.Bridge ? event.bridge : platform?.name) || (event.adapterAddress && toShort(event.adapterAddress))

    const content = <div
        ref={ref}
        className={twMerge("container flex flex-col flex-1 p-4 gap-4", className)}
        {...props}
    >
        <div className="flex flex-row flex-1 gap-4">
            <div className="group flex flex-row flex-none justify-start items-center gap-4 font-bold">
                {platform ? (
                    <PlatformImage
                        platform={platform}
                        size="xs"
                    />
                ) : (
                    <RouteTypeIcon
                        type={event.type}
                        className={twMerge(iconSizes.sm, "me-1")}
                    />
                )}
                {`${event.type ? getRouteTypeLabel(event.type) : "Transaction"}${platformName && ` via ${platformName}`}`}
            </div>
        </div>
        <div className="flex flex-col flex-1 gap-1">
            <RouteEventTokenDetail
                label="From"
                chain={event.srcChain}
                token={event.srcToken}
            />
            <RouteEventTokenDetail
                label="To"
                chain={event.dstChain}
                token={event.dstToken}
            />
        </div>
    </div>

    return animate ? (
        <SlideInOut
            from="left"
            to="right"
            animations={animations}
            transition={transitions}
            delays={delays}
        >
            {content}
        </SlideInOut>
    ) : content
})
SwapEventDetail.displayName = "SwapEventDetail"

export default SwapEventDetail
