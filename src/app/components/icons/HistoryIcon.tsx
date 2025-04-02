import { ClockCounterClockwise } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const HistoryIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <ClockCounterClockwise />}
    </BaseIcon>
))
HistoryIcon.displayName = "HistoryIcon"

export default HistoryIcon
