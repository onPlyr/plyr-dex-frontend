import { Info } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const InfoIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    highlightStyle = "text-info-500",
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            highlightStyle={highlightStyle}
            {...props}
        >
            {children ?? <Info />}
        </BaseIcon>
    )

})
InfoIcon.displayName = "InfoIcon"

export default InfoIcon
