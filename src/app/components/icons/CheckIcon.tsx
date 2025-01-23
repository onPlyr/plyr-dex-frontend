import { Check, CheckCircle, CheckSquare } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { StyleShape } from "@/app/types/styling"

const shapeIcons: Record<StyleShape, React.ReactNode> = {
    [StyleShape.Circle]: <CheckCircle />,
    [StyleShape.Square]: <CheckSquare />,
}

const CheckIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    shape,
    ...props
}, ref) => (
    <BaseIcon
        ref={ref}
        {...props}
    >
        {children ?? (shape ? shapeIcons[shape] : <Check />)}
    </BaseIcon>
))
CheckIcon.displayName = "CheckIcon"

export default CheckIcon
