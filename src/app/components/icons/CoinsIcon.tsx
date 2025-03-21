import { Coins } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const CoinsIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <Coins />}
    </BaseIcon>
))
CoinsIcon.displayName = "CoinsIcon"

export default CoinsIcon
