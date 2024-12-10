import { TxActionType } from "@/app/types/txs"
import { QueryStatus } from "@tanstack/react-query"

export const txActionMessages: Record<TxActionType, string> = {
    [TxActionType.Approve]: "Approve",
    [TxActionType.Swap]: "Swap",
    [TxActionType.Bridge]: "Bridge",
}

export const txActionInProgressMessages: Record<TxActionType, string> = {
    [TxActionType.Approve]: "Approving",
    [TxActionType.Swap]: "Swapping",
    [TxActionType.Bridge]: "Bridging",
}

export const txActionSuccessMessages: Record<TxActionType, string> = {
    [TxActionType.Approve]: "Approved",
    [TxActionType.Swap]: "Swap Complete",
    [TxActionType.Bridge]: "Bridge Complete",
}

export const statusLabels: Record<QueryStatus, string> = {
    "error": "Error",
    "success": "Complete",
    "pending": "Pending",
}
