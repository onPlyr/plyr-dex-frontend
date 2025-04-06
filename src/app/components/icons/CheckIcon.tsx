import { Check, CheckCircle, CheckSquare, CheckSquareOffset, ListChecks } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export const CheckIconVariant = {
    Default: "default",
    Circle: "plus",
    Square: "minus",
    SquareOffset: "square-offset",
    List: "list",
} as const
export type CheckIconVariant = (typeof CheckIconVariant)[keyof typeof CheckIconVariant]

const checkIcons: Record<CheckIconVariant, React.ReactNode> = {
    [CheckIconVariant.Default]: <Check />,
    [CheckIconVariant.Circle]: <CheckCircle />,
    [CheckIconVariant.Square]: <CheckSquare />,
    [CheckIconVariant.SquareOffset]: <CheckSquareOffset />,
    [CheckIconVariant.List]: <ListChecks />,
}

interface CheckIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant?: CheckIconVariant,
}

const CheckIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, CheckIconProps>(({
    children,
    variant,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? checkIcons[variant ?? CheckIconVariant.Default]}
    </BaseIcon>
))
CheckIcon.displayName = "CheckIcon"

export default CheckIcon
