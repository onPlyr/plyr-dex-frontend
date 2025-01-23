import { TxActionType } from "@/app/types/txs"
import { QueryStatus } from "@tanstack/react-query"

export const txActionMessages: Record<TxActionType, string> = {
    [TxActionType.Approve]: "Approve",
    [TxActionType.Swap]: "Swap",
    [TxActionType.Bridge]: "Transfer",
    [TxActionType.Unwrap]: "Unwrap",
}

export const txActionInProgressMessages: Record<TxActionType, string> = {
    [TxActionType.Approve]: "Approving",
    [TxActionType.Swap]: "Swapping",
    [TxActionType.Bridge]: "Transferring",
    [TxActionType.Unwrap]: "Unwrapping",
}

export const txActionSuccessMessages: Record<TxActionType, string> = {
    [TxActionType.Approve]: "Approved",
    [TxActionType.Swap]: "Swap Complete",
    [TxActionType.Bridge]: "Transfer Complete",
    [TxActionType.Unwrap]: "Unwrapped",
}

export const statusLabels: Record<QueryStatus, string> = {
    "error": "Error",
    "success": "Complete",
    "pending": "Pending",
}
