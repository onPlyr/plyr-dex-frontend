import { Receipt, ReceiptX } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export enum TxIconVariant {
    Default,
    Error,
}

const txVariantIcon: Record<TxIconVariant, React.ReactNode> = {
    [TxIconVariant.Default]: <Receipt />,
    [TxIconVariant.Error]: <ReceiptX />,
}

interface TxIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant?: TxIconVariant,
}

export const TxIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, TxIconProps>(({
    children,
    variant = TxIconVariant.Default,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? txVariantIcon[variant ?? TxIconVariant.Default]}
        </BaseIcon>
    )

})
TxIcon.displayName = "TxIcon"
