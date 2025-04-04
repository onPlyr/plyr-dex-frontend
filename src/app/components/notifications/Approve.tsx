import React from "react"
import { twMerge } from "tailwind-merge"

import { TokenImage } from "@/app/components/images/TokenImage"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { NotificationType } from "@/app/types/notifications"
import { Token } from "@/app/types/tokens"

export type ApproveNotificationType = typeof NotificationType.Pending | typeof NotificationType.Submitted | typeof NotificationType.Success
interface NotificationProps extends React.ComponentPropsWithoutRef<"div"> {
    token: Token,
    amount: bigint,
    type: ApproveNotificationType,
}

export const NotificationHeader = React.forwardRef<HTMLDivElement, Omit<NotificationProps, "amount">>(({
    className,
    token,
    type,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 gap-2 justify-start items-center", className)}
        {...props}
    >
        {type === NotificationType.Success ? "Approved" : type === NotificationType.Submitted ? "Approving" : "Approve"} {token.symbol}
    </div>
))
NotificationHeader.displayName = "NotificationHeader"

export const NotificationBody = React.forwardRef<HTMLDivElement, NotificationProps>(({
    className,
    token,
    amount,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge("flex flex-row flex-1 gap-2 justify-start items-center", className)}
        {...props}
    >
        Amount
        <DecimalAmount
            amount={amount}
            symbol={token.symbol}
            token={token}
            className="flex flex-row flex-1 justify-end items-center font-mono font-bold text-base text-end"
            replaceClass={true}
        />
        <TokenImage
            token={token}
            size="xs"
        />
    </div>
))
NotificationBody.displayName = "NotificationBody"
