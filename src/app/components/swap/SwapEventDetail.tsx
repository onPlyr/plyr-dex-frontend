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
            <div className="flex flex-col shrink justify-center items-center font-bold">
                <RouteTypeIcon
                    type={event.type}
                    className={iconSizes.sm}
                />
            </div>
            <div className="flex flex-row flex-1 justify-start items-center">
                <div className="font-bold">{getRouteTypeLabel(event.type)}</div>
            </div>
            <div className="flex flex-row flex-1 gap-4 justify-end items-center text-muted-500">
                via {platformName}
                {platform && <PlatformImage platform={platform} size="xs" />}
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
