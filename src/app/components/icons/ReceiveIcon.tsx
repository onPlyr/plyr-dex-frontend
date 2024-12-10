import { ArrowElbowDownLeft } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const ReceiveIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <ArrowElbowDownLeft />}
        </BaseIcon>
    )

})
ReceiveIcon.displayName = "ReceiveIcon"

export default ReceiveIcon
