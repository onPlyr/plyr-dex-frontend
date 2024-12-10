import { Gear } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

export const SettingsIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <Gear />}
        </BaseIcon>
    )

})
SettingsIcon.displayName = "SettingsIcon"
