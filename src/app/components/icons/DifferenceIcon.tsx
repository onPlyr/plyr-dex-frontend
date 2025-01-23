import { PlusMinus } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const DifferenceIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <PlusMinus />}
    </BaseIcon>
))
DifferenceIcon.displayName = "DifferenceIcon"

export default DifferenceIcon
