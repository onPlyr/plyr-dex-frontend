import { Circle, CircleDashed, CircleHalf, CircleHalfTilt, CircleNotch } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"

export enum CircleIconVariant {
    Dashed = "dashed",
    Notch = "notch",
    Half = "half",
    HalfTilt = "halfTilt",
}

const circleVariants: Record<CircleIconVariant, React.ReactNode> = {
    [CircleIconVariant.Dashed]: <CircleDashed />,
    [CircleIconVariant.Notch]: <CircleNotch />,
    [CircleIconVariant.Half]: <CircleHalf />,
    [CircleIconVariant.HalfTilt]: <CircleHalfTilt />,
}

export interface CircleIconProps extends BaseIconProps {
    variant?: CircleIconVariant,
}

export const CircleIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, CircleIconProps>(({
    children,
    variant,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? (variant ? circleVariants[variant] : <Circle />)}
        </BaseIcon>
    )

})
CircleIcon.displayName = "CircleIcon"
