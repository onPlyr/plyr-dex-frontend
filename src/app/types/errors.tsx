import { BaseError } from "viem"
 
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