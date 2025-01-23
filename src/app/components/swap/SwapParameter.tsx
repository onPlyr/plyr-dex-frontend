import * as React from "react"
import { twMerge } from "tailwind-merge"

interface SwapParameterProps extends React.ComponentPropsWithoutRef<"div"> {
    icon?: React.ReactNode,
    iconClass?: string,
    label?: React.ReactNode,
    labelClass?: string,
    value: React.ReactNode,
    valueClass?: string,
}

const SwapParameter = React.forwardRef<HTMLDivElement, SwapParameterProps>(({
    className,
    icon,
    iconClass,
    label,
    labelClass,
    value,
    valueClass,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 flex-wrap gap-x-4 gap-y-1", className)}
        {...props}
    >
        <div className={twMerge("flex flex-row flex-none w-6 max-w-6 min-w-6 justify-center items-center", iconClass)}>
            {icon && icon}
        </div>
        <div className={twMerge("flex flex-row flex-none justify-start items-center text-muted-400", labelClass)}>
            {label && label}
        </div>
        <div className={twMerge("flex flex-row flex-1 justify-end items-center font-bold text-end", valueClass)}>
            {value}
        </div>
    </div>
))
SwapParameter.displayName = "SwapParameter"

export default SwapParameter
