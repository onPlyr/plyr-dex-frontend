import * as React from "react"
import { twMerge } from "tailwind-merge"

import RouteTypeIcon from "@/app/components/icons/RouteTypeIcon"
import { PlatformImage } from "@/app/components/images/PlatformImage"
import RouteEventTokenDetail from "@/app/components/routes/RouteEventTokenDetail"
import { SelectItem } from "@/app/components/ui/SelectItem"
import { getPlatform } from "@/app/lib/platforms"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { RouteEvent, RouteType } from "@/app/types/swaps"

interface RouteEventDetailItemProps extends React.ComponentPropsWithoutRef<typeof SelectItem> {
    event: RouteEvent,
}

const RouteEventDetailItem = React.forwardRef<React.ElementRef<typeof SelectItem>, RouteEventDetailItemProps>(({
    className,
    event,
    ...props
}, ref) =>  {
    const platform = getPlatform(event.adapter?.platform)
    const platformName = (event.type === RouteType.Bridge ? event.bridge : platform?.name) || (event.adapterAddress && toShort(event.adapterAddress))
    return (
        <SelectItem
            ref={ref}
            className={twMerge("flex flex-col flex-1 w-full text-sm bg-white/5 hover:bg-white/10", className)}
            {...props}
        >
            <div className="flex flex-row flex-1 w-full gap-4">
                <div className="flex flex-col shrink justify-center items-center font-bold">
                    <RouteTypeIcon type={event.type} />
                </div>
                <div className="flex flex-row flex-1 justify-start items-center">
                    <div className="font-bold">{getRouteTypeLabel(event.type)}</div>
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-end items-center text-muted-300">
                    via {platformName}
                    {platform && <PlatformImage platform={platform} size="xs" />}
                </div>
            </div>
            <div className="flex flex-col flex-1 w-full gap-1">
                <RouteEventTokenDetail
                    label="From"
                    chain={event.srcChain}
                    token={event.srcToken}
                    lighterMuted={true}
                />
                <RouteEventTokenDetail
                    label="To"
                    chain={event.dstChain}
                    token={event.dstToken}
                    lighterMuted={true}
                />
            </div>
        </SelectItem>
    )
})
RouteEventDetailItem.displayName = "RouteEventDetailItem"

export default RouteEventDetailItem
