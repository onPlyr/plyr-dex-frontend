import { Address, Client, erc20Abi, Hash, isAddressEqual, parseEventLogs, TransactionReceipt, zeroAddress } from "viem"
import { getContractEvents } from "viem/actions"
import { serialize } from "wagmi"
import { getBlock, getClient, getTransactionReceipt } from "@wagmi/core"

import { uniV2AdapterAbi } from "@/app/abis/adapters/uniV2Adapter"
import { yakAdapterAbi } from "@/app/abis/adapters/yakAdapter"
import { teleporterMessengerAbi } from "@/app/abis/teleporter/messenger"
import { nativeDepositWithdrawAbi } from "@/app/abis/tokens/native"
import { RetrySwapStatus, SwapStatus } from "@/app/config/swaps"
import { wagmiConfig } from "@/app/config/wagmi"
import { getCellAbi } from "@/app/lib/cells"
import { getEstimatedBlockFromTimestamp } from "@/app/lib/chains"
import { MathBigInt } from "@/app/lib/numbers"
import { getBaseSwapData, getTeleporterMessengerAddress } from "@/app/lib/swaps"
import { getNativeToken, getTokenByAddress } from "@/app/lib/tokens"
import { getParsedError, setTimeoutPromise } from "@/app/lib/utils"
import { Chain } from "@/app/types/chains"
import { BaseSwapData, BridgeType, RouteType, Swap, SwapEvent, SwapHop, SwapQuery, SwapQueryResult, SwapStatusQueryResult } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

const getIsPreviousToken = (tokenAddress: Address, chain: Chain, prevToken: Token) => {
    const token = getTokenByAddress(tokenAddress, chain)
    return token !== undefined && token.id === prevToken.id
}

const getHopEvents = ({
    swapSrcData,
    hopData,
    storedEventData,
    txTimestamp,
}: {
    swapSrcData: BaseSwapData,
    hopData: SwapHop,
    storedEventData?: SwapEvent[],
    txTimestamp: number,
}) => {

    const events: SwapEvent[] = []
    const chain = hopData.srcData.chain
    const txReceipt = hopData.txReceipt

    if (!txReceipt) {
        return events
    }

    let eventIndex = 0
    let prevEvent: SwapEvent | undefined = undefined

    const hopEvents = storedEventData?.filter((event) => event.hopIndex === hopData.index)
    const yakSwapLogs = parseEventLogs({
        abi: yakAdapterAbi,
        logs: txReceipt.logs,
        eventName: "YakAdapterSwap",
    })

    for (const log of yakSwapLogs) {

        const logEvent = hopEvents?.[eventIndex]

        if (!logEvent || !logEvent.srcData.amount || !logEvent.dstData || !logEvent.dstData.amount || logEvent.status !== SwapStatus.Success) {

            const eventSrcData = getBaseSwapData({
                chain: chain,
                tokenAddress: log.args._tokenFrom,
                amount: log.args._amountIn,
            })
            const srcData = eventSrcData ?? prevEvent?.srcData ?? swapSrcData

            const dstData = getBaseSwapData({
                chain: chain,
                tokenAddress: log.args._tokenTo,
                amount: log.args._amountOut,
            })

            const adapterData = chain.adapters ? Object.entries(chain.adapters).find(([address]) => isAddressEqual(address as Address, log.address)) : undefined
            const event: SwapEvent = {
                ...logEvent,
                srcData: srcData,
                dstData: dstData,
                hopIndex: hopData.index,
                type: RouteType.Swap,
                adapter: adapterData?.[1],
                adapterAddress: log.address,
                txHash: txReceipt.transactionHash,
                timestamp: txTimestamp,
                status: eventSrcData && dstData ? SwapStatus.Success : SwapStatus.Error,
            }
            events.push(event)
            prevEvent = event
        }

        eventIndex++
    }

    if (events.length === 0 && hopData.srcData.amount) {

        const uniV2SwapLogs = parseEventLogs({
            abi: uniV2AdapterAbi,
            logs: txReceipt.logs,
            eventName: "Swap",
        })

        const swapTransferLogs = parseEventLogs({
            abi: erc20Abi,
            logs: txReceipt.logs,
            eventName: "Transfer",
        })

        let prevDstToken = hopData.srcData.token
        let prevDstAmount = hopData.srcData.amount
        let prevLogIndex = 0

        for (const log of uniV2SwapLogs) {

            const logEvent = hopEvents?.[eventIndex]

            if (!logEvent || !logEvent.srcData.amount || !logEvent.dstData || !logEvent.dstData.amount || logEvent.status !== SwapStatus.Success) {

                const eventSrcData = getBaseSwapData({
                    chain: chain,
                    token: prevDstToken,
                    amount: prevDstAmount,
                })
                const srcData = eventSrcData ?? prevEvent?.srcData ?? swapSrcData

                const swapTransferLog = swapTransferLogs.find((transfer) => transfer.logIndex > prevLogIndex && !getIsPreviousToken(transfer.address, chain, prevDstToken))
                const dstData = getBaseSwapData({
                    chain: chain,
                    tokenAddress: swapTransferLog?.address,
                    amount: log.args.amount0Out || log.args.amount1Out,
                })

                const adapterData = chain.adapters ? Object.entries(chain.adapters).find(([address]) => isAddressEqual(address as Address, log.args.sender)) : undefined

                const event: SwapEvent = {
                    ...logEvent,
                    srcData: srcData,
                    dstData: dstData,
                    hopIndex: hopData.index,
                    type: RouteType.Swap,
                    adapter: adapterData?.[1],
                    adapterAddress: log.address,
                    txHash: txReceipt.transactionHash,
                    timestamp: txTimestamp,
                    status: eventSrcData && dstData ? SwapStatus.Success : SwapStatus.Error,
                }
                events.push(event)
                prevEvent = event

                if (dstData) {
                    prevDstToken = dstData.token
                    if (dstData.amount) {
                        prevDstAmount = dstData.amount
                    }
                }
                if (swapTransferLog) {
                    prevLogIndex = swapTransferLog.logIndex
                }
            }

            eventIndex++
        }
    }

    if (hopData.dstData && hopData.sentMsgId) {

        const logEvent = hopEvents?.[eventIndex]

        if (!logEvent || !logEvent.srcData.amount || !logEvent.dstData || !logEvent.dstData.amount || logEvent.status !== SwapStatus.Success) {

            const eventSrcData = getBaseSwapData({
                chain: chain,
                token: prevEvent?.dstData?.token,
                tokenId: hopData.dstData.token.id,
                amount: prevEvent?.dstData?.amount ?? hopData.dstData.amount,
            })
            const srcData = eventSrcData ?? prevEvent?.dstData ?? swapSrcData

            const dstData = getBaseSwapData({
                chain: hopData.dstData.chain,
                tokenId: hopData.dstData.token.id,
                amount: hopData.dstData.amount,
            })

            const event: SwapEvent = {
                ...logEvent,
                srcData: srcData,
                dstData: dstData,
                hopIndex: hopData.index,
                type: RouteType.Bridge,
                bridge: BridgeType.ICTT,
                txHash: txReceipt.transactionHash,
                timestamp: txTimestamp,
                status: eventSrcData && dstData ? SwapStatus.Success : SwapStatus.Error,
            }
            events.push(event)
        }
    }

    return events
}

const getHopAndEventData = ({
    swapSrcData,
    hopSrcData,
    hopIndex,
    storedHopData,
    storedEventData,
    txReceipt,
    txTimestamp,
    accountAddress,
}: {
    swapSrcData: BaseSwapData,
    hopSrcData?: BaseSwapData,
    hopIndex: number,
    storedHopData?: SwapHop,
    storedEventData?: SwapEvent[],
    txReceipt: TransactionReceipt,
    txTimestamp: number,
    accountAddress: Address,
}) => {

    const srcData = hopSrcData ?? swapSrcData
    const hopData: SwapHop = {
        ...storedHopData,
        srcData: srcData,
        index: hopIndex,
        txHash: txReceipt.transactionHash,
        txReceipt: txReceipt,
        timestamp: txTimestamp,
        status: storedHopData?.status ?? SwapStatus.Pending,
    }

    if (!hopData.srcData.amount || !hopData.dstData || !hopData.dstData.amount || hopData.status !== SwapStatus.Success) {

        const srcTransferLog = parseEventLogs({
            abi: erc20Abi,
            logs: txReceipt.logs,
            eventName: "Transfer",
            args: {
                from: zeroAddress,
            },
        }).find((log) => isAddressEqual(log.address, srcData.token.address))

        if (srcTransferLog?.args.value) {
            hopData.srcData.amount = srcTransferLog.args.value
        }

        else if (srcData.token.isNative && srcData.token.wrappedAddress) {

            const srcWithdrawalLog = parseEventLogs({
                abi: nativeDepositWithdrawAbi,
                logs: txReceipt.logs,
                eventName: "Withdrawal",
            }).find((log) => isAddressEqual(log.address, srcData.token.wrappedAddress!))

            if (srcWithdrawalLog?.args.wad) {
                hopData.srcData.amount = srcWithdrawalLog.args.wad
            }
        }

        const msgSentLog = parseEventLogs({
            abi: teleporterMessengerAbi,
            logs: txReceipt.logs,
            eventName: "SendCrossChainMessage",
        })[0]

        if (msgSentLog) {

            const { messageID: msgId, destinationBlockchainID: dstBlockchainId, message: { destinationAddress } } = msgSentLog.args
            const dstData = getBaseSwapData({
                blockchainId: dstBlockchainId,
                srcChain: srcData.chain,
                dstBridgeAddress: destinationAddress,
            })

            if (dstData) {

                const transferLog = parseEventLogs({
                    abi: erc20Abi,
                    logs: txReceipt.logs,
                    eventName: "Transfer",
                }).findLast((log) => isAddressEqual(log.address, dstData.token.address))

                if (transferLog?.args.value) {
                    dstData.amount = transferLog.args.value
                }

                else if (dstData.token.isNative && dstData.token.wrappedAddress) {

                    const depositLog = parseEventLogs({
                        abi: nativeDepositWithdrawAbi,
                        logs: txReceipt.logs,
                        eventName: "Deposit",
                    }).findLast((log) => isAddressEqual(log.address, dstData.token.wrappedAddress!))

                    if (depositLog?.args.wad) {
                        dstData.amount = depositLog.args.wad
                    }
                }
            }

            hopData.dstData = dstData
            hopData.sentMsgId = msgId
            hopData.status = hopSrcData && dstData ? SwapStatus.Success : SwapStatus.Error
        }

        else {

            const transferLog = parseEventLogs({
                abi: erc20Abi,
                logs: txReceipt.logs,
                eventName: "Transfer",
                args: {
                    to: accountAddress,
                },
            }).findLast((log) => isAddressEqual(log.args.to, accountAddress))

            let dstData = getBaseSwapData({
                chain: hopData.srcData.chain,
                tokenAddress: transferLog?.address,
                amount: transferLog?.args.value,
            })

            if (!dstData) {

                const nativeDstToken = getNativeToken(hopData.srcData.chain)

                if (nativeDstToken && nativeDstToken.wrappedAddress) {

                    const withdrawalLog = parseEventLogs({
                        abi: nativeDepositWithdrawAbi,
                        logs: txReceipt.logs,
                        eventName: "Withdrawal",
                    }).findLast((log) => isAddressEqual(log.address, nativeDstToken.wrappedAddress!))

                    dstData = getBaseSwapData({
                        chain: hopData.srcData.chain,
                        token: nativeDstToken,
                        amount: withdrawalLog?.args.wad,
                    })
                }
            }

            hopData.dstData = dstData
            hopData.status = hopSrcData && dstData ? SwapStatus.Success : SwapStatus.Error
        }
    }

    const hopEvents = getHopEvents({
        swapSrcData: swapSrcData,
        hopData: hopData,
        storedEventData: storedEventData,
        txTimestamp: txTimestamp,
    })

    return {
        hopData: hopData,
        hopEvents: hopEvents,
    }
}

const getNextSwapQuery = ({
    swapData,
    currentHopData,
    nextHopIndex,
}: {
    swapData: Swap,
    currentHopData: SwapHop,
    nextHopIndex: number,
}) => {

    let query: SwapQuery | undefined = undefined
    let nextHopData = swapData.hops.length >= nextHopIndex + 1 ? swapData.hops[nextHopIndex] : undefined

    if (!currentHopData.dstData || !currentHopData.sentMsgId || !currentHopData.timestamp) {
        return query
    }

    if (!nextHopData || nextHopData.receivedMsgId !== currentHopData.sentMsgId) {

        const srcData = getBaseSwapData({
            chain: currentHopData.dstData.chain,
            tokenId: currentHopData.dstData.token.id,
            amount: currentHopData.dstData.amount,
        })

        if (srcData) {
            nextHopData = {
                ...nextHopData,
                srcData: srcData,
                index: nextHopIndex,
                receivedMsgId: currentHopData.sentMsgId,
                status: SwapStatus.Pending,
            }
        }
    }

    if (nextHopData) {
        query = {
            swapData: swapData,
            hopData: nextHopData,
            hopIndex: nextHopIndex,
            originBlockchainId: currentHopData.srcData.chain.blockchainId,
            originTimestamp: currentHopData.timestamp,
        }
    }

    return query
}

export const getSwapStatus = async ({
    swap,
    setSwap,
}: {
    swap: Swap
    setSwap: (swap?: Swap) => void,
}) => {

    const result: SwapStatusQueryResult = {
        swapData: swap,
        status: "pending",
        isInProgress: false,
    }

    if (swap.status === SwapStatus.Success) {
        result.status = "success"
        return result
    }

    const messengerAddress = getTeleporterMessengerAddress()
    const chain = swap.srcData.chain

    try {

        // todo: this can likely be removed as it's not being returned at this point
        result.isInProgress = true

        const initiated = await getInitiatedSwapQueryResult({
            swap: swap,
            chain: chain,
            txHash: swap.id,
        })

        let nextSwapQuery = initiated.nextSwapQuery
        let retryNum = 0

        result.swapData = initiated.swapData
        result.status = initiated.error ? "error" : nextSwapQuery ? "pending" : "success"
        if (result.swapData) {
            setSwap(result.swapData)
        }

        // todo: error handling
        if (initiated.error) {
            console.log(`   >>>>>>>>>>>>>>>> getSwapStatus initiated error: ${initiated.error}`)
        }

        while (nextSwapQuery && retryNum < RetrySwapStatus.MaxRetries) {

            const queryResult = await getSwapQueryResult({
                query: nextSwapQuery,
                messengerAddress: messengerAddress,
                // isRefetch: ???,
            })

            result.swapData = queryResult.swapData
            result.status = queryResult.error ? "error" : queryResult.nextSwapQuery ? "pending" : "success"

            // todo: error handling
            if (queryResult.error) {
                console.log(`      >>>>>>>>>>>>>>>> getSwapStatus queryResult error: ${queryResult.error}`)
            }

            if (queryResult.isRetry && !queryResult.nextSwapQuery) {
                await setTimeoutPromise(Math.min(RetrySwapStatus.MaxDelay, queryResult.retryDelay || RetrySwapStatus.DefaultDelay))
                retryNum++
            }
            else {
                if (result.swapData) {
                    setSwap(result.swapData)
                }
                nextSwapQuery = queryResult.nextSwapQuery
            }
        }
    }

    catch (err) {
        result.error = getParsedError(err)
        result.status = "error"
    }

    finally {
        result.isInProgress = false
        result.status = result.error ? "error" : result.swapData?.status === SwapStatus.Success ? "success" : "pending"
        if (result.swapData) {
            setSwap(result.swapData)
        }
    }

    return result
}

export const getInitiatedSwapQueryResult = async ({
    swap,
    chain,
    txHash,
}: {
    swap: Swap,
    chain: Chain,
    txHash: Hash,
}) => {

    const result: SwapQueryResult = {
        swapData: swap,
    }

    try {

        const receipt = await getTransactionReceipt(wagmiConfig, {
            chainId: chain.id,
            hash: txHash,
        })
        const recipient = receipt.to

        if (receipt.status === "reverted" || !recipient) {
            throw new Error(receipt.status === "reverted" ? "Transaction Reverted" : "No Recipient")
        }

        const cell = chain.cells.find((cellData) => isAddressEqual(cellData.address, recipient))
        const abi = getCellAbi(cell)

        if (!cell || !abi) {
            throw new Error(!cell ? "No Cell" : "No ABI")
        }

        const initiatedLog = parseEventLogs({
            abi: abi,
            logs: receipt.logs,
            eventName: "Initiated",
        })[0]

        if (!initiatedLog) {
            throw new Error("No Initiated Log")
        }

        // todo: lint warnings, but causes no issues
        // todo: instructions now emitted in logs, use to build full swap structure
        // @ts-ignore
        const { token: srcTokenAddress, amount: srcAmount, sender: accountAddress } = initiatedLog.args

        const hopSrcData = getBaseSwapData({
            chain: chain,
            tokenAddress: srcTokenAddress,
            amount: srcAmount,
        })

        const block = await getBlock(wagmiConfig, {
            chainId: chain.id,
            blockNumber: receipt.blockNumber,
        })
        const blockTimestamp = Number(block.timestamp) * 1000

        const { hopData, hopEvents } = getHopAndEventData({
            swapSrcData: swap.srcData,
            hopSrcData: hopSrcData,
            hopIndex: 0,
            txReceipt: receipt,
            txTimestamp: blockTimestamp,
            accountAddress: swap?.destinationAddress ?? accountAddress,
        })

        const swapData: Swap = {
            ...swap,
            id: receipt.transactionHash,
            hops: [
                hopData,
                ...swap.hops.filter((hop) => hop.index !== hopData.index),
            ],
            events: [
                ...hopEvents,
                ...swap.events.filter((event) => event.hopIndex !== hopData.index),
            ],
            account: accountAddress,
            status: swap.status ?? SwapStatus.Pending,
            timestamp: blockTimestamp,
        }

        const nextSwapQuery = getNextSwapQuery({
            swapData: swapData,
            currentHopData: hopData,
            nextHopIndex: 1,
        })

        if (!nextSwapQuery) {
            swapData.dstData = hopData.dstData
            swapData.type = swapData.events.some((event) => event.type && event.type === RouteType.Swap) ? RouteType.Swap : swapData.events.every((event) => event.type && event.type === RouteType.Bridge) ? RouteType.Bridge : undefined
            swapData.duration = swapData.hops.length === 1 ? 0 : swapData.hops.length > 1 && hopData.timestamp && swapData.hops[0].timestamp ? hopData.timestamp - swapData.hops[0].timestamp : undefined
            swapData.status = swapData.hops.some((hop) => hop.status === SwapStatus.Error) ? SwapStatus.Error : swapData.hops.every((hop) => hop.status === SwapStatus.Success) ? SwapStatus.Success : SwapStatus.Pending
        }

        result.swapData = swapData
        result.hopData = hopData
        result.nextSwapQuery = nextSwapQuery
    }

    catch (err) {
        result.error = getParsedError(err)
    }

    return result
}

export const getSwapQueryResult = async ({
    query,
    messengerAddress,
    isRefetch,
}: {
    query?: SwapQuery,
    messengerAddress?: Address,
    isRefetch?: boolean,
}) => {

    // todo: determine whether it's the final hop, should only be used to confirm received amounts
    // is not actually another hop in terms of how we refer to a hop elsewhere, basically just the receipt

    const result: SwapQueryResult = {
        swapData: query?.swapData,
    }

    try {

        if (!query) {
            throw new Error("No Query")
        }

        const isFetchResult = isRefetch || !query.hopData.dstData || !query.hopData.txHash || query.hopData.status !== SwapStatus.Success
        if (!isFetchResult) {
            result.hopData = query.hopData
            result.hopEvents = query.swapData.events.filter((event) => event.hopIndex === query.hopIndex)
            result.nextSwapQuery = getNextSwapQuery({
                swapData: query.swapData,
                currentHopData: query.hopData,
                nextHopIndex: query.hopIndex + 1,
            })
            return result
        }

        else if (!query.swapData.account || !query.hopData.receivedMsgId || !query.originBlockchainId || !query.originTimestamp || !messengerAddress) {
            throw new Error("Invalid Query")
        }

        const srcChain = query.hopData.srcData.chain
        const msgId = query.hopData.receivedMsgId

        const client: Client = getClient(wagmiConfig, {
            chainId: srcChain.id,
        })

        let txReceipt = isRefetch ? undefined : query.hopData.txReceipt
        let txTimestamp = isRefetch ? undefined : query.hopData.timestamp
        let retryDelay: number | undefined = undefined

        if (!txReceipt || !txTimestamp) {

            const { estimatedBlock, targetTimestampSeconds, avgBlockTimeSeconds, latestBlock } = await getEstimatedBlockFromTimestamp({
                chain: srcChain,
                timestamp: new Date(query.originTimestamp),
            })
            retryDelay = avgBlockTimeSeconds * 1000

            const isEstPrevious = estimatedBlock.timestamp < targetTimestampSeconds
            const chunkSize = BigInt(srcChain.clientData.maxQueryChunkSize)

            let fromBlock = isEstPrevious ? estimatedBlock.number : estimatedBlock.number - chunkSize
            let toBlock = MathBigInt.min([
                isEstPrevious ? estimatedBlock.number + chunkSize : estimatedBlock.number,
                latestBlock.number,
            ])

            while (!txReceipt) {

                for (let batch = 0; batch < srcChain.clientData.maxQueryNumBatches; batch++) {

                    const queries = []
                    if (txReceipt && txTimestamp) {
                        break
                    }

                    for (let i = 0; i < srcChain.clientData.maxQueryBatchSize; i++) {

                        if (fromBlock >= latestBlock.number || toBlock <= BigInt(0)) {
                            break
                        }

                        const receiveMsgQuery = getContractEvents(client, {
                            address: messengerAddress,
                            abi: teleporterMessengerAbi,
                            eventName: "ReceiveCrossChainMessage",
                            args: {
                                messageID: msgId,
                                sourceBlockchainID: query.originBlockchainId,
                            },
                            fromBlock: fromBlock,
                            toBlock: toBlock,
                            strict: true,
                        })
                        queries.push(receiveMsgQuery)

                        fromBlock = MathBigInt.max([
                            isEstPrevious ? fromBlock + chunkSize : fromBlock - chunkSize,
                            BigInt(1),
                        ])
                        toBlock = MathBigInt.min([
                            isEstPrevious ? toBlock + chunkSize : toBlock - chunkSize,
                            latestBlock.number,
                        ])
                    }

                    const results = await Promise.all(queries)
                    const msgReceivedLog = results.find((result) => result.length > 0)?.[0]

                    console.log(`>>> useSwapDetails batch ${serialize(batch)} / msgReceivedLog: ${serialize(msgReceivedLog)} / target timestamp: ${serialize(new Date(Number(targetTimestampSeconds) * 1000))} / est block timestamp: ${serialize(new Date(Number(estimatedBlock.timestamp) * 1000))}`)

                    if (msgReceivedLog) {
                        txReceipt = await getTransactionReceipt(wagmiConfig, {
                            chainId: srcChain.id,
                            hash: msgReceivedLog.transactionHash,
                        })
                        const txBlock = await getBlock(wagmiConfig, {
                            chainId: srcChain.id,
                            blockNumber: msgReceivedLog.blockNumber,
                        })
                        txTimestamp = Number(txBlock.timestamp) * 1000
                        break
                    }
                }
                break
            }
        }

        if (!txReceipt || !txTimestamp) {
            result.isRetry = true
            result.retryDelay = retryDelay
            throw new Error("No Transaction Receipt Found")
        }

        // todo: msg failed handling
        // const msgExecutionFailedLog = parseEventLogs({
        //     abi: teleporterMessengerAbi,
        //     logs: txReceipt.logs,
        //     eventName: "MessageExecutionFailed",
        //     args: {
        //         messageID: prevSentMsgId,
        //         sourceBlockchainID: prevBlockchainId,
        //     },
        // })[0]

        const { hopData, hopEvents } = getHopAndEventData({
            swapSrcData: query.swapData.srcData,
            hopSrcData: query.hopData.srcData,
            hopIndex: query.hopIndex,
            storedHopData: query.hopData,
            txReceipt: txReceipt,
            txTimestamp: txTimestamp,
            accountAddress: query.swapData.destinationAddress ?? query.swapData.account,
        })

        const prevHops = query.swapData.hops.filter((hop) => hop.index < query.hopIndex)
        const nextHops = query.swapData.hops.filter((hop) => hop.index > query.hopIndex)
        const swapHops = [
            ...prevHops,
            hopData,
            ...nextHops,
        ]

        const prevEvents = query.swapData.events.filter((event) => event.hopIndex < query.hopIndex)
        const nextEvents = query.swapData.events.filter((event) => event.hopIndex > query.hopIndex)
        const swapEvents = [
            ...prevEvents,
            ...hopEvents,
            ...nextEvents,
        ]

        const swapData: Swap = {
            ...query.swapData,
            hops: swapHops,
            events: swapEvents,
        }

        const nextSwapQuery = getNextSwapQuery({
            swapData: swapData,
            currentHopData: hopData,
            nextHopIndex: query.hopIndex + 1,
        })

        // todo: check this isn't overwriting previous data if there's any errors or missed query results
        // eg. may be setting final dst token / chain incorrectly if final hop isn't fetched successfully
        if (!nextSwapQuery) {
            swapData.dstData = hopData.dstData
            swapData.type = swapEvents.some((event) => event.type && event.type === RouteType.Swap) ? RouteType.Swap : swapEvents.every((event) => event.type && event.type === RouteType.Bridge) ? RouteType.Bridge : undefined
            swapData.duration = swapHops.length === 1 ? 0 : swapHops.length > 1 && hopData.timestamp && swapHops[0].timestamp ? hopData.timestamp - swapHops[0].timestamp : undefined
            swapData.status = swapHops.some((hop) => hop.status === SwapStatus.Error) ? SwapStatus.Error : swapHops.every((hop) => hop.status === SwapStatus.Success) ? SwapStatus.Success : SwapStatus.Pending
        }

        result.swapData = swapData
        result.hopData = hopData
        result.hopEvents = hopEvents
        result.nextSwapQuery = nextSwapQuery
    }

    catch (err) {
        result.error = getParsedError(err)
    }

    return result
}