import { ApproximateEquals } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const ApproxEqualIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <ApproximateEquals />}
        </BaseIcon>
    )

})
ApproxEqualIcon.displayName = "ApproxEqualIcon"

export default ApproxEqualIcon
