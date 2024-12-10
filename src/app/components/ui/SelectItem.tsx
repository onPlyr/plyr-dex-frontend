import * as React from "react"
import { twMerge } from "tailwind-merge"

export interface SelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
    replaceClass?: boolean,
    isSelected?: boolean,
    disabled?: boolean,
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({
    children,
    className,
    replaceClass,
    onClick,
    isSelected,
    disabled = false,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge(replaceClass !== true ? "group select-item" : undefined, disabled || onClick === undefined ? "cursor-auto" : undefined, className)}
        onClick={disabled !== true ? onClick?.bind(this) : undefined}
        data-selected={isSelected}
        data-disabled={disabled}
        {...props}
    >
        {children}
    </div>
))
SelectItem.displayName = "SelectItem"
