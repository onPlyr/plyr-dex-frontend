import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { ChartIcon, ChartIconVariant } from "@/app/components/icons/ChartIcon"

const SlippageIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <ChartIcon variant={ChartIconVariant.TrendDown} />}
        </BaseIcon>
    )

})
SlippageIcon.displayName = "SlippageIcon"

export default SlippageIcon
