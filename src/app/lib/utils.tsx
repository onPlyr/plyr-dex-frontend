import { QueryStatus } from "@tanstack/react-query"
import { BaseError, ContractFunctionRevertedError } from "viem"

import { TxStatusLabel } from "@/app/config/txs"

export const isEqualObj = (objA?: object, objB?: object) => {
    if (objA === undefined && objB === undefined) {
        return undefined
    }
    else if (objA === undefined || objB === undefined) {
        return false
    }
    return (Object.keys(objA) as (keyof typeof objA)[]).every((key) => objA[key] === objB[key])
}

export const getStatusLabel = (status: QueryStatus) => {
    return TxStatusLabel[status]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getParsedError = (error: any): string => {
    const parsed = error?.walk ? error.walk() : error
    if (parsed instanceof BaseError) {
        if (parsed.details) {
            return parsed.details
        }
        else if (parsed.shortMessage) {
            if (parsed instanceof ContractFunctionRevertedError && parsed.data && parsed.data.errorName !== "Error") {
                return `${parsed.shortMessage.replace(/reverted\.$/, "reverted with the following reason:")}\n${parsed.data.errorName}(${parsed.data.args?.toString() ?? ""})`
            }
            return parsed.shortMessage
        }
        return parsed.message ?? parsed.name ?? "An unknown error occurred"
    }
    return parsed?.message ?? "An unknown error occurred"
}

export const setTimeoutPromise = async (delay: number) => {
    return new Promise(resolve => setTimeout(resolve, delay))
}

export const getMutatedObject = <T,>(
    obj: object,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutateFunction: (value: any) => T,
    sortCompareFunction?: (a: [string, T], b: [string, T]) => number,
) => {
    return Object.fromEntries((sortCompareFunction ? Object.entries(obj).sort((a, b) => sortCompareFunction(a, b)) : Object.entries(obj)).map(([key, value]) => [key, mutateFunction(value)]))
}
