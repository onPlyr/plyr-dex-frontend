import { TxActionMsg } from "@/app/config/txs"
import { TxActionType, TxMsgType } from "@/app/types/txs"
export const getTxActionMsg = (action: TxActionType, isInProgress?: boolean) => {
    return TxActionMsg[action][isInProgress ? TxMsgType.InProgress : TxMsgType.Default]
}