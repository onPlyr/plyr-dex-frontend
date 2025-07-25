import { BaseError, UserRejectedRequestError, UserRejectedRequestErrorType } from "viem"

export const RetryErrorType = [
    "InvalidInputRpcError",
    "TransactionReceiptNotFoundError",
] as const
export type RetryErrorType = typeof RetryErrorType[number]

export type RetryErrorDetails = {
    [error in RetryErrorType]?: string[]
}
export const RetryErrorDetails: RetryErrorDetails = {
    InvalidInputRpcError: [
        "cannot query unfinalized data",
    ],
} as const

interface RetryError extends BaseError {
    name: RetryErrorType,
}

export const isRetryErrorType = (type: string): type is RetryErrorType => RetryErrorType.includes(type as RetryErrorType)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRetryError = (error: any): error is RetryError => {
    return error instanceof BaseError && isRetryErrorType(error.name) && (RetryErrorDetails[error.name]?.includes(error.details) || !(error.name in RetryErrorDetails))
}

export const ReplaceMsgErrorData = {
    [UserRejectedRequestError.code]: "User rejected the transaction.",
} as const

type ReplaceMsgErrorCode = keyof typeof ReplaceMsgErrorData
interface ReplaceMsgError extends BaseError {
    code: ReplaceMsgErrorCode,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isReplaceMsgError = (error: any): error is ReplaceMsgError => error instanceof BaseError && "code" in error && typeof error.code === "number" && Object.keys(ReplaceMsgErrorData).includes(error.code.toString())

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isUserRejectedRequestError = (error: any): error is UserRejectedRequestErrorType => {
    const err = error?.walk ? error.walk() : error
    return "code" in err && typeof err.code === "number" && err.code === UserRejectedRequestError.code
}