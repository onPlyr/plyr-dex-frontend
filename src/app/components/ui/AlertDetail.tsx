import * as React from "react"
import { twMerge } from "tailwind-merge"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import SuccessIcon from "@/app/components/icons/SuccessIcon"
import WarningIcon from "@/app/components/icons/WarningIcon"
import { iconSizes } from "@/app/config/styling"

type AlertTypeOption = "success" | "info" | "warning" | "error"
export const AlertType = {
    Success: "success",
    Info: "info",
    Warning: "warning",
    Error: "error",
} as const

interface AlertTypeDataType {
    icon: React.ReactNode,
    className: string,
}
const AlertTypeData: Record<AlertTypeOption, AlertTypeDataType> = {
    success: {
        icon: <SuccessIcon className="w-full h-full" />,
        className: "text-success-500",
    },
    info: {
        icon: <InfoIcon className="w-full h-full" />,
        className: "text-info-500",
    },
    warning: {
        icon: <WarningIcon className="w-full h-full" />,
        className: "text-warning-500",
    },
    error: {
        icon: <ErrorIcon className="w-full h-full" />,
        className: "text-error-500",
    },
}

interface AlertDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    type: AlertTypeOption,
    header?: React.ReactNode,
    headerClass?: string,
    msg?: React.ReactNode,
    msgClass?: string,
    iconClass?: string,
    highlight?: boolean,
}

const AlertDetail = React.forwardRef<HTMLDivElement, AlertDetailProps>(({
    className,
    type,
    header,
    headerClass,
    msg,
    msgClass,
    iconClass,
    highlight = true,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("container-select flex flex-row flex-1 p-4 gap-4 items-center", className)}
        data-selected={highlight ? true : false}
        {...props}
    >
        <div className={twMerge(iconSizes.default, AlertTypeData[type].className, iconClass)}>
            {AlertTypeData[type].icon}
        </div>
        <div className="flex flex-col flex-1 gap-1">
            {header && (
                <div className={twMerge("flex flex-row flex-1 items-center font-bold", AlertTypeData[type].className, headerClass)}>
                    {header}
                </div>
            )}
            {msg && (
                <div className={twMerge("flex flex-row flex-1 items-center", msgClass)}>
                    {msg}
                </div>
            )}
        </div>
    </div>
))
AlertDetail.displayName = "AlertDetail"

export default AlertDetail