import { WarningCircle } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const WarningIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    highlightStyle = "text-warning-500",
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            highlightStyle={highlightStyle}
            {...props}
        >
            {children ?? <WarningCircle />}
        </BaseIcon>
    )

})
WarningIcon.displayName = "WarningIcon"

export default WarningIcon
