import * as React from "react"
import { twMerge } from "tailwind-merge"

import CloseIcon from "@/app/components/icons/CloseIcon"
import { iconSizes } from "@/app/config/styling"

export interface SelectItemToggleProps extends React.ComponentPropsWithoutRef<"div"> {
    isSelected?: boolean,
    disabled?: boolean,
    showIcon?: boolean,
    replaceClass?: boolean,
}

export const SelectItemToggle = React.forwardRef<HTMLDivElement, SelectItemToggleProps>(({
    children,
    className,
    onClick,
    isSelected,
    disabled = false,
    showIcon,
    replaceClass,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={replaceClass ? className : twMerge("group select-item-toggle", className)}
        onClick={disabled ? undefined : onClick?.bind(this)}
        data-selected={isSelected ? true : false}
        data-disabled={disabled ? true : false}
        {...props}
    >
        {children}
        {showIcon && <CloseIcon className={twMerge("hidden group-data-[selected=true]:inline-flex", iconSizes.xs)} />}
    </div>
))
SelectItemToggle.displayName = "SelectItemToggle"
