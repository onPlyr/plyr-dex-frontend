export const TxAction = {
    Approve: "approve",
    Swap: "swap",
    Transfer: "transfer",
    Unwrap: "unwrap",
}
export type TxAction = (typeof TxAction)[keyof typeof TxAction]

export const TxLabelType = {
    Default: "default",
    InProgress: "inProgress",
    Complete: "complete",
}
export type TxLabelType = (typeof TxLabelType)[keyof typeof TxLabelType]