import { CaretDown, CaretLeft, CaretRight, CaretUp } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
import { StyleDirection } from "@/app/types/styling"

const iconDirections: Record<StyleDirection, React.ReactNode> = {
    [StyleDirection.Left]: <CaretLeft />,
    [StyleDirection.Right]: <CaretRight />,
    [StyleDirection.Up]: <CaretUp />,
    [StyleDirection.Down]: <CaretDown />,
}

const ChevronIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, BaseIconProps>(({
    children,
    direction = StyleDirection.Right,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? iconDirections[direction]}
        </BaseIcon>
    )

})
ChevronIcon.displayName = "ChevronIcon"

export default ChevronIcon
