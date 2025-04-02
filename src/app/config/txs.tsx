import { TxAction, TxLabelType } from "@/app/types/txs"
import { QueryStatus } from "@tanstack/react-query"

export const TxStatusLabel: Record<QueryStatus, string> = {
    "error": "Error",
    "success": "Completed",
    "pending": "Pending",
} as const

export const TxActionLabel: Record<TxAction, Record<TxLabelType, string>> = {
    [TxAction.Approve]: {
        [TxLabelType.Default]: "Approve",
        [TxLabelType.InProgress]: "Approving",
        [TxLabelType.Complete]: "Approved",
    },
    [TxAction.Swap]: {
        [TxLabelType.Default]: "Swap",
        [TxLabelType.InProgress]: "Swapping",
        [TxLabelType.Complete]: "Swap Complete",
    },
    [TxAction.Transfer]: {
        [TxLabelType.Default]: "Transfer",
        [TxLabelType.InProgress]: "Transferring",
        [TxLabelType.Complete]: "Transfer Complete",
    },
    [TxAction.Unwrap]: {
        [TxLabelType.Default]: "Unwrap",
        [TxLabelType.InProgress]: "Unwrapping",
        [TxLabelType.Complete]: "Unwrapped",
    },
} as const
