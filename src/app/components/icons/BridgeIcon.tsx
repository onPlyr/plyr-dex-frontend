import { Bridge } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const BridgeIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <Bridge />}
        </BaseIcon>
    )

})
BridgeIcon.displayName = "BridgeIcon"

export default BridgeIcon
