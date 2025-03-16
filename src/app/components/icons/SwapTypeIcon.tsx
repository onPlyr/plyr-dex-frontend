import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import BridgeIcon from "@/app/components/icons/BridgeIcon"
import SwapIcon from "@/app/components/icons/SwapIcon"
import TesseractIcon from "@/app/components/icons/TesseractIcon"
import { isTransferType, SwapType } from "@/app/types/swaps"

interface SwapTypeIconProps extends BaseIconProps {
    type?: SwapType,
}

const SwapTypeIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, SwapTypeIconProps>(({
    type,
    ...props
}, ref) => (
    type && isTransferType(type) ? (
        <BridgeIcon
            ref={ref}
            {...props}
        />
    ) : type ? (
        <SwapIcon
            ref={ref}
            {...props}
        />
    ) : (
        <TesseractIcon
            ref={ref}
            {...props}
        />
    )
))
SwapTypeIcon.displayName = "SwapTypeIcon"

export default SwapTypeIcon
