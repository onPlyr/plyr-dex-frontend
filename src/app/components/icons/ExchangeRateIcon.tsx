import { Calculator } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const ExchangeRateIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <Calculator />}
    </BaseIcon>
))
ExchangeRateIcon.displayName = "ExchangeRateIcon"

export default ExchangeRateIcon
