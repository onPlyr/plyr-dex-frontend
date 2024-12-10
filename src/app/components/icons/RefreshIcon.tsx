import { ArrowsClockwise } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

export const RefreshIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <ArrowsClockwise />}
        </BaseIcon>
    )

})
RefreshIcon.displayName = "RefreshIcon"
