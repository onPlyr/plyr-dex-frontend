import { QueryStatus } from "@tanstack/react-query"
import { Address, BaseError, ContractFunctionRevertedError, isAddress, isAddressEqual } from "viem"

import { TxStatusLabel } from "@/app/config/txs"
import { ReadContractErrorData } from "@/app/types/utils"

export const getStatusLabel = (status: QueryStatus) => {
    return TxStatusLabel[status]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getParsedError = (error: any): string => {

    const parsed = error?.walk ? error.walk() : error

    if (typeof parsed === "string") {
        return parsed
    }
    else if (parsed instanceof BaseError) {
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

export const getParsedReadContractError = (...results: ReadContractErrorData[]) => {
    const errors = results.map((data) => data.error).filter((error) => !!error)
    if (errors.length === 0) {
        return ""
    }
    return results.filter((data) => !!data.error).map((data) => getParsedError(data.error)).join(" / ")
}

export const setTimeoutPromise = async (delay: number) => {
    return new Promise(resolve => setTimeout(resolve, delay))
}

export const isValidAddress = (address?: string, strict: boolean = false): address is Address => {
    return address ? isAddress(address, { strict: strict }) : false
}

export const isEqualAddress = (a?: string, b?: string, strict: boolean = false) => {
    return isValidAddress(a, strict) && isValidAddress(b, strict) && isAddressEqual(a, b)
}

/**
 * Gets the base URL for API requests, using the current origin
 */
export function getBaseUrl(): string {
    // In the browser, use the current origin
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // On the server, use the environment variable as fallback
    return process.env.BASE_API_URL || '';
}