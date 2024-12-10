import { Copy } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

export interface CopyIconProps extends BaseIconProps {
    data?: string,
}

export const CopyIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, CopyIconProps>(({
    children,
    data,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            onClick={() => data ? navigator.clipboard.writeText(data) : undefined}
            className={data && "cursor-pointer"}
            {...props}
        >
            {children ?? <Copy />}
        </BaseIcon>
    )

})
CopyIcon.displayName = "CopyIcon"
