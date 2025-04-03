import { Stack, StackMinus, StackPlus, StackSimple } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export const StackIconVariant = {
    Default: "default",
    Simple: "simple",
    Plus: "plus",
    Minus: "minus",
} as const
export type StackIconVariant = (typeof StackIconVariant)[keyof typeof StackIconVariant]

const stackIcons: Record<StackIconVariant, React.ReactNode> = {
    [StackIconVariant.Default]: <Stack />,
    [StackIconVariant.Simple]: <StackSimple />,
    [StackIconVariant.Plus]: <StackPlus />,
    [StackIconVariant.Minus]: <StackMinus />,
}

interface StackIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant?: StackIconVariant,
}

export const StackIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, StackIconProps>(({
    children,
    variant = StackIconVariant.Default,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? stackIcons[variant ?? StackIconVariant.Default]}
    </BaseIcon>
))
StackIcon.displayName = "StackIcon"