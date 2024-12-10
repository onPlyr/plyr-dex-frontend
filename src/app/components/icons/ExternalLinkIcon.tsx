import { ArrowSquareOut } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const ExternalLinkIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <ArrowSquareOut />}
        </BaseIcon>
    )

})
ExternalLinkIcon.displayName = "ExternalLinkIcon"

export default ExternalLinkIcon
