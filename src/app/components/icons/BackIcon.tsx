import * as React from "react"

import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { StyleDirection } from "@/app/types/styling"

const BackIcon = React.forwardRef<React.ElementRef<typeof ChevronIcon>, React.ComponentPropsWithoutRef<typeof ChevronIcon>>(({
    ...props
}, ref) => (
    <ChevronIcon
        ref={ref}
        direction={StyleDirection.Left}
        {...props}
    />
))
BackIcon.displayName = "BackIcon"

export default BackIcon
