import * as React from "react"
import { twMerge } from "tailwind-merge"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import { iconSizes } from "@/app/config/styling"

interface ErrorDetailProps extends React.ComponentPropsWithoutRef<"div"> {
    header?: React.ReactNode,
    headerClass?: string,
    msg: React.ReactNode,
    msgClass?: string,
    iconClass?: string,
    highlight?: boolean,
}

const ErrorDetail = React.forwardRef<HTMLDivElement, ErrorDetailProps>(({
    className,
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
        <ErrorIcon className={twMerge("text-error-500", iconSizes.lg, iconClass)} />
        <div className="flex flex-col flex-1 gap-1">
            <div className={twMerge("flex flex-row flex-1 items-center font-bold text-error-500", headerClass)}>
                {header ?? "Error"}
            </div>
            <div className={twMerge("flex flex-row flex-1 items-center", msgClass)}>
                {msg}
            </div>
        </div>
    </div>
))
ErrorDetail.displayName = "ErrorDetail"

export default ErrorDetail
