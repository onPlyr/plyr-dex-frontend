export const TxAction = {
    Approve: "approve",
    Swap: "swap",
    Transfer: "transfer",
    Unwrap: "unwrap",
}
export type TxAction = (typeof TxAction)[keyof typeof TxAction]

export const TxMsgType = {
    Default: "default",
    InProgress: "inProgress",
    Complete: "complete",
}
export type TxMsgType = (typeof TxMsgType)[keyof typeof TxMsgType]

export const TxNotificationType = {
    SimulateError: "simulateError",
    SimulateFailed: "simulateFailed",
    Pending: "pending",
    Submitted: "submitted",
    Success: "success",
    Reverted: "reverted",
    Error: "error",
} as const
export type TxNotificationType = (typeof TxNotificationType)[keyof typeof TxNotificationType]

export interface TxNotificationMsg {
    header?: React.ReactNode,
    body?: React.ReactNode,
    ignore?: boolean,
}

export type TxNotificationMsgData = Record<TxNotificationType, TxNotificationMsg>