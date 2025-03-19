import React from "react"

import ArrowIcon from "@/app/components/icons/ArrowIcon"
import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { StyleToggleDirection } from "@/app/types/styling"

const ExchangeRateIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <ArrowIcon toggleDirection={StyleToggleDirection.LeftRight} />}
    </BaseIcon>
))
ExchangeRateIcon.displayName = "ExchangeRateIcon"

export default ExchangeRateIcon
