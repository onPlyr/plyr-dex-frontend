import { Hash } from "viem"
import { ChainId } from "@/app/types/chains"

export type TxStatusType = "idle" | "pending" | "error" | "success"
// todo: replace with tanstack QueryStatus
export type TxReceiptStatusType = "pending" | "error" | "success"

export enum TxActionType {
    Approve = "approve",
    Swap = "swap",
    Bridge = "bridge",
    Unwrap = "unwrap",
}

export interface TxHistory {
    chainId: ChainId,
    txHash: Hash,
    txIndex: number,
    block: string,
    timestamp: number,
    description?: string,
    reverted?: boolean,
}
