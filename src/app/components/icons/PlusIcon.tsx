import { PlusCircle } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const PlusIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? <PlusCircle />}
        </BaseIcon>
    )

})
PlusIcon.displayName = "PlusIcon"

export default PlusIcon
