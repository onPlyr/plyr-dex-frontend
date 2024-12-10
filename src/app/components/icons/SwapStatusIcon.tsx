import * as React from "react"
import { QueryStatus } from "@tanstack/react-query"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import SuccessIcon from "@/app/components/icons/SuccessIcon"

interface SwapStatusIconProps extends BaseIconProps {
    status: QueryStatus,
}

const SwapStatusIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, SwapStatusIconProps>(({
    status,
    ...props
}, ref) => (
    status === "success" ? (
        <SuccessIcon
            ref={ref}
            highlight={true}
            {...props}
        />
    ) : status === "error" ? (
        <ErrorIcon
            ref={ref}
            highlight={true}
            {...props}
        />
    ) : (
        <LoadingIcon
            ref={ref}
            {...props}
        />
    )
))
SwapStatusIcon.displayName = "SwapStatusIcon"

export default SwapStatusIcon
