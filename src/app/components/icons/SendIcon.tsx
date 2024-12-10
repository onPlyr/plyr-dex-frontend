import { ArrowElbowDownRight } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const SendIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <ArrowElbowDownRight />}
        </BaseIcon>
    )

})
SendIcon.displayName = "SendIcon"

export default SendIcon
