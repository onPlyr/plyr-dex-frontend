import { CheckCircle } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const SuccessIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    highlightStyle = "text-green-500",
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            highlightStyle={highlightStyle}
            {...props}
        >
            {children ?? <CheckCircle />}
        </BaseIcon>
    )

})
SuccessIcon.displayName = "SuccessIcon"

export default SuccessIcon
