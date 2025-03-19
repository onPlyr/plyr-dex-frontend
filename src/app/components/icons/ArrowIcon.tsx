import { ArrowDown, ArrowLeft, ArrowRight, ArrowsDownUp, ArrowsLeftRight, ArrowUp } from "@phosphor-icons/react"
import React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { StyleDirection, StyleToggleDirection } from "@/app/types/styling"

const iconDirections: Record<StyleDirection, React.ReactNode> = {
    [StyleDirection.Left]: <ArrowLeft />,
    [StyleDirection.Right]: <ArrowRight />,
    [StyleDirection.Up]: <ArrowUp />,
    [StyleDirection.Down]: <ArrowDown />,
}

const iconToggleDirections: Record<StyleToggleDirection, React.ReactNode> = {
    [StyleToggleDirection.UpDown]: <ArrowsDownUp />,
    [StyleToggleDirection.LeftRight]: <ArrowsLeftRight />,
}

const ArrowIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    direction = StyleDirection.Right,
    toggleDirection,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? (toggleDirection ? iconToggleDirections[toggleDirection] : iconDirections[direction])}
        </BaseIcon>
    )

})
ArrowIcon.displayName = "ArrowIcon"

export default ArrowIcon
