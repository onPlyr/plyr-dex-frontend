import { Warning } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const ErrorIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    highlightStyle = "text-rose-500",
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            highlightStyle={highlightStyle}
            {...props}
        >
            {children ?? <Warning />}
        </BaseIcon>
    )

})
ErrorIcon.displayName = "ErrorIcon"

export default ErrorIcon
