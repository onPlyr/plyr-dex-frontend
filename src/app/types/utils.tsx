export type WithRequired<T, Key extends keyof T> = T & {
    [Property in Key]-?: T[Property]
}

export interface ReadContractErrorData {
    error?: Error,
}

export const SortDirection = {
    Ascending: "ascending",
    Descending: "descending",
} as const
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection]
