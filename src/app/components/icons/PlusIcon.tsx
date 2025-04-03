import { Plus, PlusCircle, PlusSquare } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export const PlusIconVariant = {
    Default: "default",
    Square: "square",
    Circle: "circle",
} as const
export type PlusIconVariant = (typeof PlusIconVariant)[keyof typeof PlusIconVariant]

const plusIcons: Record<PlusIconVariant, React.ReactNode> = {
    [PlusIconVariant.Default]: <Plus />,
    [PlusIconVariant.Square]: <PlusSquare />,
    [PlusIconVariant.Circle]: <PlusCircle />,
}

interface PlusIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant?: PlusIconVariant,
}

const PlusIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, PlusIconProps>(({
    children,
    variant,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? plusIcons[variant ?? PlusIconVariant.Default]}
    </BaseIcon>
))
PlusIcon.displayName = "PlusIcon"

export default PlusIcon