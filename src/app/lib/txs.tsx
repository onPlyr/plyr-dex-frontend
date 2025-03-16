import { TxActionLabel } from "@/app/config/txs"
import { TxAction, TxLabelType } from "@/app/types/txs"

export const getTxActionLabel = (action: TxAction, labelType?: TxLabelType) => {
    return TxActionLabel[action][labelType ?? TxLabelType.Default]
}
