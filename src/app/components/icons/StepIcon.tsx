import { LineSegments } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const StepIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <LineSegments />}
        </BaseIcon>
    )

})
StepIcon.displayName = "StepIcon"

export default StepIcon
