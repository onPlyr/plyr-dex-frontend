import * as React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import { iconSizes } from "@/app/config/styling"

export interface SelectItemToggleProps extends React.ComponentPropsWithoutRef<"div"> {
    isSelected?: boolean,
    disabled?: boolean,
}

export const SelectItemToggle = React.forwardRef<HTMLDivElement, SelectItemToggleProps>(({
    children,
    className,
    onClick,
    isSelected,
    disabled = false,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("group select-item-toggle", className)}
        onClick={disabled !== true ? onClick?.bind(this) : undefined}
        data-selected={isSelected}
        data-disabled={disabled}
        {...props}
    >
        {children}
        <CloseIcon className={twMerge("hidden group-data-[selected=true]:inline-flex", iconSizes.xs)} />
    </div>
))
SelectItemToggle.displayName = "SelectItemToggle"
