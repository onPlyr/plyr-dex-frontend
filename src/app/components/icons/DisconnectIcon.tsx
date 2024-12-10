import { SignOut } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const DisconnectIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <SignOut />}
        </BaseIcon>
    )

})
DisconnectIcon.displayName = "DisconnectIcon"

export default DisconnectIcon
