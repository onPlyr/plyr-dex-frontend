import { GasPump } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const GasIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <GasPump />}
        </BaseIcon>
    )

})
GasIcon.displayName = "GasIcon"

export default GasIcon
