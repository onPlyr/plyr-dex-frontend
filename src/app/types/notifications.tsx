import { Hash } from "viem"

export const NotificationType = {
    SimulateError: "simulateError",
    SimulateFailed: "simulateFailed",
    Pending: "pending",
    Submitted: "submitted",
    Success: "success",
    Reverted: "reverted",
    Error: "error",
    Info: "info",
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationStatus = {
    Pending: "pending",
    Success: "success",
    Error: "error",
    Info: "info",
} as const
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus]

export interface Notification {
    id: string,
    type: NotificationType,
    header: React.ReactNode,
    body: React.ReactNode,
    action?: React.ReactNode,
    status: NotificationStatus,
    txHash?: Hash,
    removeDelayMs?: number,
    isManualDismiss?: boolean,
}

export interface NotificationTypeMsg {
    header?: React.ReactNode,
    body?: React.ReactNode,
    ignore?: boolean,
}

export type NotificationTypeData = {
    [key in NotificationType]?: NotificationTypeMsg
}
