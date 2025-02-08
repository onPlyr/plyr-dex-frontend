import { Hash } from "viem"

export const NotificationType = {
    Swap: "swap",
    Transaction: "transaction",
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationStatus = {
    Pending: "pending",
    Success: "success",
    Error: "error",
} as const
export type NotificationStatusType = (typeof NotificationStatus)[keyof typeof NotificationStatus]

export interface Notification {
    id: Hash,
    type: NotificationType,
    header: React.ReactNode,
    body: React.ReactNode,
    status: NotificationStatusType,
    txHash?: Hash,
}