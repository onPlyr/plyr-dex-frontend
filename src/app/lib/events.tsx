import { parseEventLogs, TransactionReceipt, zeroAddress } from "viem"

import { cellRoutedAbi, cellRoutedEvent } from "@/app/abis/cells/events/cellRouted"
import { initiatedAbi, initiatedEvent } from "@/app/abis/cells/events/initiated"
import { rollbackAbi, rollbackEvent } from "@/app/abis/cells/events/rollback"
import { callFailedAbi, callFailedEvent } from "@/app/abis/ictt/events/callFailed"
import { tokensWithdrawnAbi, tokensWithdrawnEvent } from "@/app/abis/ictt/events/tokensWithdrawn"
import { Tokens } from "@/app/config/tokens"
import { getTokenAddress } from "@/app/lib/tokens"
import { isEqualAddress } from "@/app/lib/utils"
import { CellHopAction } from "@/app/types/cells"
import { CellRoutedLog, InitiatedLog, TokensWithdrawnLog } from "@/app/types/events"
import { HopHistory, isCrossChainHopType, SwapHistory } from "@/app/types/swaps"

export const getCellRoutedLog = <TStrict extends boolean = true>(receipt?: TransactionReceipt, strict?: TStrict): CellRoutedLog<TStrict> | undefined => {

    if (!receipt || receipt.status !== "success") {
        return
    }

    return parseEventLogs({
        abi: cellRoutedAbi,
        logs: receipt.logs,
        eventName: cellRoutedEvent.name,
        strict: strict,
    }).at(0)
}

/**
* @notice Emitted when Cell contract routes tokens to destination
* @dev Logs all token movements for tracking and verification
* @param tesseractID Unique identifier for the Tesseract operation (indexed)
* @param messageID Unique identifier for the message (indexed)
* @param action Type of action performed
* @param transferrer Address of the token transferrer on source chain (indexed)
* @param destinationBlockchainID Destination blockchain identifier
* @param destinationCell Cell contract address on destination chain
* @param destinationTransferrer Address of the transferrer on destination chain
* @param tokenIn Address of the input token
* @param amountIn Number of input tokens
* @param tokenOut Address of the output token
* @param amountOut Number of output tokens
*/
export const getCellRoutedError = (hop: HopHistory, log?: CellRoutedLog) => {

    let error: string | undefined = undefined
    const dstToken = Tokens.find((token) => token.id === hop.dstData.token.id && token.chainId === hop.srcData.chain.id)

    if (!log) {
        error = "CellRouted event not found"
    }
    else if (hop.srcData.cell && !isEqualAddress(log.address, hop.srcData.cell.address)) {
        error = `Invalid source cell address of ${log.address}, expecting: ${hop.srcData.cell.address}`
    }
    else if (hop.dstData.cell && !isEqualAddress(log.args.destinationCell, zeroAddress) && !isEqualAddress(log.args.destinationCell, hop.dstData.cell.address)) {
        error = `Invalid destination cell address of ${log.args.destinationCell}, expecting: ${hop.dstData.cell.address}`
    }
    else if (hop.msgSentId && hop.msgSentId !== log.args.messageID) {
        error = `Invalid sent message id of ${log.args.messageID}, expecting: ${hop.msgSentId}`
    }
    else if (log.args.action !== CellHopAction[hop.type]) {
        error = `Invalid hop action of ${log.args.action}, expecting: ${CellHopAction[hop.type]} / ${hop.type}`
    }
    else if (isCrossChainHopType(hop.type) && log.args.destinationBlockchainID !== hop.dstData.chain.blockchainId) {
        error = `Invalid destination blockchain id of ${log.args.destinationBlockchainID}, expecting: ${hop.dstData.chain.blockchainId}`
    }
    else if (!isEqualAddress(log.args.tokenIn, getTokenAddress(hop.srcData.token))) {
        error = `Invalid source token address of ${log.args.tokenIn}, expecting: ${getTokenAddress(hop.srcData.token)}`
    }
    else if (dstToken && !isEqualAddress(log.args.tokenOut, getTokenAddress(dstToken))) {
        error = `Invalid destination token address of ${log.args.tokenOut}, expecting: ${getTokenAddress(hop.dstData.token)}`
    }

    return error
}

export const getInitiatedLog = <TStrict extends boolean = true>(receipt?: TransactionReceipt, strict?: TStrict): InitiatedLog<TStrict> | undefined => {

    if (!receipt || receipt.status !== "success") {
        return
    }

    return parseEventLogs({
        abi: initiatedAbi,
        logs: receipt.logs,
        eventName: initiatedEvent.name,
        strict: strict,
    }).at(0)
}

/**
* @notice Emitted when a new cross-chain operation is initiated
* @dev Logs the start of a new operation for tracking
* @param tesseractId Unique identifier for the Tesseract operation (indexed)
* @param sourceId Unique identifier for the source frontend (indexed)
* @param origin Address initiating the operation (indexed)
* @param sender Msg.sender initiating the operation
* @param receiver Final receiver of the tokens
* @param token Address of input token
* @param amount Number of tokens being processed
* @param nativeFeeAmount Amount of native fee
* @param baseFeeAmount Amount of base fee
*/
export const getInitiatedError = (swap: SwapHistory, hop: HopHistory, log?: InitiatedLog) => {

    let error: string | undefined = undefined

    if (hop.index !== 0) {
        error = `Invalid initiate hop with index ${hop.index}`
    }
    else if (!log) {
        error = "Initiated event not found"
    }
    else if (swap.tesseractId && swap.tesseractId !== log.args.tesseractId) {
        error = `Invalid tesseract id of ${log.args.tesseractId}, expecting: ${swap.tesseractId}`
    }
    else if (!isEqualAddress(swap.accountAddress, log.args.origin)) {
        error = `Invalid origin address of ${log.args.origin}, expecting: ${swap.accountAddress}`
    }
    else if (!isEqualAddress(swap.recipientAddress, log.args.receiver)) {
        error = `Invalid recipient address of ${log.args.receiver}, expecting: ${swap.recipientAddress}`
    }
    else if (!isEqualAddress(getTokenAddress(hop.srcData.token), log.args.token)) {
        error = `Invalid source token address of ${log.args.token}, expecting: ${swap.srcData.token.address}`
    }

    return error
}

export const getRollbackLog = (receipt?: TransactionReceipt, strict: boolean = true) => {

    if (!receipt || receipt.status !== "success") {
        return
    }

    return parseEventLogs({
        abi: rollbackAbi,
        logs: receipt.logs,
        eventName: rollbackEvent.name,
        strict: strict,
    }).at(0)
}

export const getCallFailedLog = (receipt?: TransactionReceipt, strict: boolean = true) => {

    if (!receipt || receipt.status !== "success") {
        return
    }

    return parseEventLogs({
        abi: callFailedAbi,
        logs: receipt.logs,
        eventName: callFailedEvent.name,
        strict: strict,
    }).at(0)
}

export const isRollback = (receipt?: TransactionReceipt) => !!getRollbackLog(receipt)
export const isCallFailed = (receipt?: TransactionReceipt) => !!getCallFailedLog(receipt)

export const getTokensWithdrawnLog = <TStrict extends boolean = true>(swap: SwapHistory, receipt?: TransactionReceipt, strict?: TStrict): TokensWithdrawnLog<TStrict> | undefined => {

    if (!receipt || receipt.status !== "success") {
        return
    }

    return parseEventLogs({
        abi: tokensWithdrawnAbi,
        logs: receipt.logs,
        eventName: tokensWithdrawnEvent.name,
        strict: strict,
        args: {
            recipient: swap.recipientAddress,
        },
    }).at(0)
}
