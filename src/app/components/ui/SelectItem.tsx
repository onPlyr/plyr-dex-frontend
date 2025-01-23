import * as React from "react"
import { twMerge } from "tailwind-merge"

export interface SelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
    replaceClass?: boolean,
    isSelected?: boolean,
    disabled?: boolean,
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({
    className,
    replaceClass,
    onClick,
    isSelected,
    disabled = false,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={replaceClass ? className : twMerge(
            "group select-item",
            disabled || onClick === undefined ? "cursor-auto" : undefined,
            className,
        )}
        onClick={disabled !== true ? onClick?.bind(this) : undefined}
        data-selected={isSelected}
        data-disabled={disabled}
        {...props}
    />
))
SelectItem.displayName = "SelectItem"
