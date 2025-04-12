import { useEffect, useState } from "react"
import { Block, Client, getAbiItem, Hash, Hex, TransactionReceipt } from "viem"
import { getBlock, getLogs, watchBlocks } from "viem/actions"
import { getClient, getTransactionReceipt } from "@wagmi/core"

import { teleporterMessengerAbi } from "@/app/abis/teleporter/messenger"
import { wagmiConfig } from "@/app/config/wagmi"
import { getChain } from "@/app/lib/chains"
import { MathBigInt } from "@/app/lib/numbers"
import { getTeleporterMessengerAddress } from "@/app/lib/teleporter"
import { getParsedError } from "@/app/lib/utils"
import { isSupportedChainId } from "@/app/types/chains"
import { isRollbackQueryHop, isRollbackQuerySwap, SwapHistory, SwapStatus } from "@/app/types/swaps"
import { WithRequired } from "@/app/types/utils"

interface BaseEventQuery {
    chainId: number,
    swapTxHash: Hash,
    msgId: Hex,
    hopIndex?: number,
    isDstTxQuery?: boolean,
    isRollbackTxQuery?: boolean,
    fromBlock?: bigint,
}
type HopEventQuery = WithRequired<BaseEventQuery, "hopIndex">
type DstTxEventQuery = WithRequired<BaseEventQuery, "isDstTxQuery">
type RollbackTxEventQuery = WithRequired<BaseEventQuery, "hopIndex" | "isRollbackTxQuery">

interface BaseEventQueryResult {
    txReceipt: TransactionReceipt,
    block: Block,
    msgId: Hex,
    hopIndex?: number,
    isDstTxQuery?: boolean,
    isRollbackTxQuery?: boolean,
}
type HopEventQueryResult = WithRequired<BaseEventQueryResult, "hopIndex">
type DstTxEventQueryResult = WithRequired<BaseEventQueryResult, "isDstTxQuery">
type RollbackTxEventQueryResult = WithRequired<BaseEventQueryResult, "hopIndex" | "isRollbackTxQuery">

export type EventQuery = HopEventQuery | DstTxEventQuery | RollbackTxEventQuery
export type EventQueryMap = Map<number, EventQuery[]>
export type EventQueryResult = HopEventQueryResult | DstTxEventQueryResult | RollbackTxEventQueryResult
export type EventQueryResultMap = Map<Hash, EventQueryResult>

type UnwatchFunction = () => void
type BlockNumberMap = Map<number, bigint>

const MessengerAddress = getTeleporterMessengerAddress()
const ReceiveCrossChainMessageEvent = getAbiItem({
    abi: teleporterMessengerAbi,
    name: "ReceiveCrossChainMessage",
})

export const isHopEventQueryResult = (data: EventQueryResult): data is HopEventQueryResult => data.hopIndex !== undefined && !data.isDstTxQuery && !data.isRollbackTxQuery
export const isDstTxEventQueryResult = (data: EventQueryResult): data is DstTxEventQueryResult => !!data.isDstTxQuery
export const isRollbackTxEventQueryResult = (data: EventQueryResult): data is RollbackTxEventQueryResult => data.hopIndex !== undefined && !data.isDstTxQuery && !!data.isRollbackTxQuery

export const getSwapEventQuery = (swap: SwapHistory): EventQuery | undefined => {

    if (swap.status !== SwapStatus.Pending && !isRollbackQuerySwap(swap)) {
        return
    }

    const hop = swap.hops.find((hop) => hop.status === SwapStatus.Pending || isRollbackQueryHop(hop))
    const isRollback = hop && isRollbackQueryHop(hop)
    const prevHop = hop && swap.hops.find((data) => data.index === hop.index - 1)
    const msgId = isRollback ? hop.rollbackData.msgId : hop ? (hop.msgReceivedId ?? prevHop?.msgSentId) : swap.hops.at(-1)?.msgSentId

    return msgId && {
        chainId: isRollback ? hop.rollbackData.chain.id : hop ? hop.srcData.chain.id : swap.dstData.chain.id,
        swapTxHash: swap.txHash,
        msgId: msgId,
        hopIndex: hop?.index,
        isDstTxQuery: !hop,
        isRollbackTxQuery: isRollback,
        fromBlock: isRollback ? prevHop?.lastCheckedBlock || prevHop?.initiatedBlock : hop ? hop.lastCheckedBlock || hop.initiatedBlock : swap.dstLastCheckedBlock || swap.dstInitiatedBlock,
    }
}

export const getSwapEventQueryMap = (swapHistories: SwapHistory[]): EventQueryMap => {
    const queries = swapHistories.filter((swap) => swap.status === SwapStatus.Pending || isRollbackQuerySwap(swap)).map((swap) => getSwapEventQuery(swap)).filter((data) => !!data)
    return new Map(Array.from(new Set(queries.map((query) => query.chainId))).map((chainId) => [chainId, queries.filter((query) => query.chainId === chainId)]))
}

export const useWatchSwapEvents = (queryMap: EventQueryMap) => {

    const [results, setResults] = useState<EventQueryResultMap>(new Map([]))

    useEffect(() => {

        const unwatchBlockNumbers: UnwatchFunction[] = []
        const fromBlockData: BlockNumberMap = new Map([])

        queryMap.forEach((queries, chainId) => {

            const chain = getChain(chainId)
            if (!isSupportedChainId(chainId) || !chain) {
                return
            }

            const fromBlockNumbers = queries.map((query) => query.fromBlock).filter((blockNum) => blockNum !== undefined)
            const client: Client = getClient(wagmiConfig, {
                chainId: chainId,
            })

            const unwatch = watchBlocks(client, {
                emitOnBegin: true,
                blockTag: "finalized",
                includeTransactions: false,
                onBlock: async (block) => {

                    const queryResults: EventQueryResultMap = new Map([])

                    try {

                        const logs = await getLogs(client, {
                            address: MessengerAddress,
                            event: ReceiveCrossChainMessageEvent,
                            args: {
                                messageID: queries.map((query) => query.msgId),
                            },
                            fromBlock: fromBlockData.get(chainId) || (fromBlockNumbers.length && MathBigInt.min(fromBlockNumbers)) || MathBigInt.max([BigInt(1), block.number - BigInt(chain.clientData.maxQueryChunkSize)]),
                            // toBlock: block.number,
                            toBlock: "finalized",
                            strict: true,
                        })

                        for (const log of logs) {

                            const logQuery = queries.find((query) => query.msgId === log.args.messageID)
                            if (!logQuery) {
                                continue
                            }

                            const txReceipt = await getTransactionReceipt(wagmiConfig, {
                                chainId: chainId,
                                hash: log.transactionHash,
                            })
                            const txBlock = log.blockNumber === block.number ? block : await getBlock(client, { blockNumber: log.blockNumber })

                            queryResults.set(logQuery.swapTxHash, {
                                txReceipt: txReceipt,
                                block: txBlock,
                                msgId: logQuery.msgId,
                                hopIndex: logQuery.hopIndex,
                                isDstTxQuery: Boolean(logQuery.isDstTxQuery),
                                isRollbackTxQuery: Boolean(logQuery.isRollbackTxQuery),
                            })
                        }

                        fromBlockData.set(chainId, block.number)
                    }

                    catch (error) {
                        console.warn(`useWatchSwapEvents error for ${chain.id} at block ${block.number.toString()}: ${getParsedError(error)}`)
                    }

                    finally {
                        if (queryResults.size) {
                            setResults((prev) => new Map([
                                ...prev,
                                ...queryResults,
                            ]))
                        }
                    }
                },
                onError: (error) => {
                    console.warn(`useWatchSwapEvents error for ${chain.id}: ${getParsedError(error)}`)
                },
            })

            unwatchBlockNumbers.push(unwatch)
        })

        return () => {
            unwatchBlockNumbers.forEach((unwatch) => unwatch())
        }

    }, [queryMap, setResults])

    return {
        results,
        setResults,
    }
}

export default useWatchSwapEvents