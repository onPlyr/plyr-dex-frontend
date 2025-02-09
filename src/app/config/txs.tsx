import { TxAction, TxMsgType, TxNotificationMsgData, TxNotificationType } from "@/app/types/txs"
import { QueryStatus } from "@tanstack/react-query"

export const TxStatusLabel: Record<QueryStatus, string> = {
    "error": "Error",
    "success": "Complete",
    "pending": "Pending",
} as const

export const TxActionMsg: Record<TxAction, Record<TxMsgType, string>> = {
    [TxAction.Approve]: {
        [TxMsgType.Default]: "Approve",
        [TxMsgType.InProgress]: "Approving",
        [TxMsgType.Complete]: "Approved",
    },
    [TxAction.Swap]: {
        [TxMsgType.Default]: "Swap",
        [TxMsgType.InProgress]: "Swapping",
        [TxMsgType.Complete]: "Swap Complete",
    },
    [TxAction.Transfer]: {
        [TxMsgType.Default]: "Transfer",
        [TxMsgType.InProgress]: "Transferring",
        [TxMsgType.Complete]: "Transfer Complete",
    },
    [TxAction.Unwrap]: {
        [TxMsgType.Default]: "Unwrap",
        [TxMsgType.InProgress]: "Unwrapping",
        [TxMsgType.Complete]: "Unwrapped",
    },
} as const

export const DefaultTxNotificationMsgData: TxNotificationMsgData = {
    [TxNotificationType.SimulateError]: {
        header: "Simulation Error",
        body: "An unknown error occurred when simulating the transaction and no data was returned.",
    },
    [TxNotificationType.SimulateFailed]: {
        header: "Simulation Failed",
        body: "The transaction simulation failed.",
    },
    [TxNotificationType.Pending]: {
        header: "Awaiting Confirmation",
        body: "Please confirm the transaction in your wallet.",
    },
    [TxNotificationType.Submitted]: {
        header: "Awaiting Confirmation",
        body: "Waiting for confirmation of your transaction.",
    },
    [TxNotificationType.Success]: {
        header: "Success!",
        body: "Your transaction has been successfully completed!",
    },
    [TxNotificationType.Reverted]: {
        header: "Transaction Reverted",
        body: "Your transaction was reverted and was not completed successfully.",
    },
    [TxNotificationType.Error]: {
        header: "Error",
        body: "An unknown error occurred when executing your transaction and it may not have completed successfully.",
    },
} as const