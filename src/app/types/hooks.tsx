// todo: tbc, likely remove both of these

export type HookStatus = "error" | "pending" | "success"

export type AmountResultType = {
    data?: bigint,
    formatted?: string,
    status?: HookStatus,
    refetch?: () => void,
}
