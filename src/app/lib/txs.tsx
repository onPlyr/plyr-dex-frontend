import { TxActionMsg } from "@/app/config/txs"
import { TxAction, TxMsgType } from "@/app/types/txs"
export const getTxActionMsg = (action: TxAction, isInProgress?: boolean) => {
    return TxActionMsg[action][isInProgress ? TxMsgType.InProgress : TxMsgType.Default]
}