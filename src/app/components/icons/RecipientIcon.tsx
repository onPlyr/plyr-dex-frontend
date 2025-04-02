import { AddressBook } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const RecipientIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <AddressBook />}
    </BaseIcon>
))
RecipientIcon.displayName = "RecipientIcon"

export default RecipientIcon
