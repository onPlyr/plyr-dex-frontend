import * as React from "react"
import { twMerge } from "tailwind-merge"

import { iconSizes } from "@/app/config/styling"

interface AccountHistoryParameterItemProps extends React.ComponentPropsWithoutRef<"div"> {
    label: React.ReactNode,
    value?: React.ReactNode,
    loadingValue?: React.ReactNode,
    secondaryLabel?: React.ReactNode,
    secondaryValue?: React.ReactNode,
    secondaryLoadingValue?: React.ReactNode,
    icon?: React.ReactNode,
}

const AccountHistoryParameterItem = React.forwardRef<HTMLDivElement, AccountHistoryParameterItemProps>(({
    className,
    label,
    value,
    loadingValue,
    secondaryLabel,
    secondaryValue,
    secondaryLoadingValue,
    icon,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row shrink w-full text-sm gap-4", className)}
        {...props}
    >
        <div className="flex flex-row shrink justify-center items-center">
            {icon ?? <div className={iconSizes.sm} />}
        </div>
        <div className="flex flex-col flex-1">
            <div className="flex flex-row flex-1">
                <div className="flex flex-row flex-1 justify-start items-center">
                    {label}
                </div>
                <div className={twMerge("flex flex-row flex-1 justify-end items-center", value !== undefined ? "font-bold" : "font-normal text-muted-500")}>
                    {value !== undefined ? value : loadingValue}
                </div>
            </div>
            {(secondaryLabel || secondaryValue || secondaryLoadingValue) && (
                <div className="flex flex-row flex-1 text-muted-500">
                    <div className="flex flex-row flex-1 justify-start items-center">
                        {secondaryLabel}
                    </div>
                    <div className="flex flex-row flex-1 justify-end items-center">
                        {secondaryValue !== undefined ? secondaryValue : secondaryLoadingValue}
                    </div>
                </div>
            )}
        </div>
    </div>
))
AccountHistoryParameterItem.displayName = "AccountHistoryParameterItem"

export default AccountHistoryParameterItem
