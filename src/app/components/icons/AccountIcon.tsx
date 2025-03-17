import { Wallet } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

const AccountIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? <Wallet />}
    </BaseIcon>
))
AccountIcon.displayName = "AccountIcon"

export default AccountIcon
