import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { RouteType } from "@/app/types/swaps"
import BridgeIcon from "@/app/components/icons/BridgeIcon"
import SwapIcon from "@/app/components/icons/SwapIcon"
import TesseractIcon from "@/app/components/icons/TesseractIcon"

interface RouteTypeIconProps extends BaseIconProps {
    type?: RouteType,
}

const RouteTypeIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, RouteTypeIconProps>(({
    type,
    ...props
}, ref) => (
    type === RouteType.Bridge ? (
        <BridgeIcon ref={ref} {...props} />
    ) : type === RouteType.Swap ? (
        <SwapIcon ref={ref} {...props} />
        // <TesseractIcon ref={ref} {...props} />
    ) : <TesseractIcon ref={ref} {...props} />
))
RouteTypeIcon.displayName = "RouteTypeIcon"

export default RouteTypeIcon
