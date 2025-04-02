import { parseEventLogs, TransactionReceipt, zeroAddress } from "viem"

import { cellRoutedAbi, cellRoutedEvent } from "@/app/abis/cells/events/cellRouted"
import { getTokenAddress } from "@/app/lib/tokens"
import { isEqualAddress } from "@/app/lib/utils"
import { CellHopAction } from "@/app/types/cells"
import { CellRoutedLog } from "@/app/types/events"
import { NetworkMode } from "@/app/types/preferences"
import { HopHistory, isCrossChainHopType } from "@/app/types/swaps"
import { GetSupportedTokenByIdFunction } from "@/app/types/tokens"

export const getCellRoutedLog = <TStrict extends boolean = true>(receipt?: TransactionReceipt, networkMode?: NetworkMode, strict?: TStrict): CellRoutedLog<TStrict> | undefined => {

    if (!receipt || receipt.status !== "success" || networkMode !== NetworkMode.Mainnet) {
        return
    }

    return parseEventLogs({
        abi: cellRoutedAbi,
        logs: receipt.logs,
        eventName: cellRoutedEvent.name,
        strict: strict,
    }).at(0)
}

export const getCellRoutedError = ({
    hop,
    log,
    getSupportedTokenById,
}: {
    hop: HopHistory,
    log?: CellRoutedLog,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
}) => {

    let error: string | undefined = undefined
    const dstToken = getSupportedTokenById({
        id: hop.dstData.token.id,
        chainId: hop.srcData.chain.id,
    })

    if (!log) {
        error = "No CellRouted Log Found"
    }
    else if (hop.srcData.cell && !isEqualAddress(log.address, hop.srcData.cell.address)) {
        error = `Invalid Source Cell Address: Expecting: ${hop.srcData.cell.address} / Received: ${log.address}`
    }
    else if (hop.dstData.cell && !isEqualAddress(log.args.destinationCell, zeroAddress) && !isEqualAddress(log.args.destinationCell, hop.dstData.cell.address)) {
        error = `Invalid Destination Cell Address: Expecting: ${hop.dstData.cell.address} / Received: ${log.args.destinationCell}`
    }
    else if (hop.msgSentId && hop.msgSentId !== log.args.messageID) {
        error = `Invalid Sent Message ID: Expecting: ${hop.msgSentId} / Received: ${log.args.messageID}`
    }
    else if (log.args.action !== CellHopAction[hop.type]) {
        error = `Invalid Hop Action: Expecting: ${hop.type} (${CellHopAction[hop.type]}) / Received: ${log.args.action}`
    }
    else if (isCrossChainHopType(hop.type) && log.args.destinationBlockchainID !== hop.dstData.chain.blockchainId) {
        error = `Invalid Destination Blockchain ID: Expecting: ${hop.dstData.chain.blockchainId} / Received: ${log.args.destinationBlockchainID}`
    }
    else if (!isEqualAddress(log.args.tokenIn, getTokenAddress(hop.srcData.token))) {
        error = `Invalid Source Token Address: Expecting: ${getTokenAddress(hop.srcData.token)} / Received: ${log.args.tokenIn}`
    }
    else if (dstToken && !isEqualAddress(log.args.tokenOut, getTokenAddress(dstToken))) {
        error = `Invalid Destination Token Address: Expecting: ${getTokenAddress(hop.dstData.token)} / Received: ${log.args.tokenOut}`
    }

    return error
}
