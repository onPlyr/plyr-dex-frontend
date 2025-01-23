import { useCallback, useEffect, useState } from "react"
import { QueryStatus } from "@tanstack/query-core"
import { Address, Block, Client, erc20Abi, formatUnits, Hash, isAddressEqual, parseEventLogs, TransactionReceipt, zeroAddress } from "viem"
import { getContractEvents } from "viem/actions"
import { serialize, useBlock, useWaitForTransactionReceipt } from "wagmi"
import { getBlock, getClient, getTransactionReceipt } from "@wagmi/core"

import { depositWithdrawNativeAbi, teleporterMessengerAbi } from "@/app/config/abis"
import { SwapStatus } from "@/app/config/swaps"
import { wagmiConfig } from "@/app/config/wagmi"
import useSwapData from "@/app/hooks/swap/useSwapData"
import { getEstimatedBlockFromTimestamp } from "@/app/lib/chains"
import { formatDuration } from "@/app/lib/datetime"
import { MathBigInt } from "@/app/lib/numbers"
import { getBaseSwapData, getTeleporterMessengerAddress } from "@/app/lib/swaps"
import { getNativeToken, getTokenByAddress } from "@/app/lib/tokens"
import { Chain } from "@/app/types/chains"
import { BaseSwapData, BridgeType, RouteType, Swap, SwapEvent, SwapHop, SwapQuery, SwapQueryResult } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

const initiatedAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address",
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256",
            }
        ],
        "name": "Initiated",
        "type": "event",
    },
] as const

const yakAdapterSwapAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_tokenFrom",
                "type": "address",
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_tokenTo",
                "type": "address",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_amountIn",
                "type": "uint256",
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_amountOut",
                "type": "uint256"
            }
        ],
        "name": "YakAdapterSwap",
        "type": "event",
    },
] as const

const uniV2SwapAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount0In",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount1In",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount0Out",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount1Out",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "to",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "name": "Swap",
        "type": "event",
    },
] as const

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
        abi: yakAdapterSwapAbi,
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
            abi: uniV2SwapAbi,
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
                abi: depositWithdrawNativeAbi,
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
                        abi: depositWithdrawNativeAbi,
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
                        abi: depositWithdrawNativeAbi,
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

const getSwapQueryResultError = (result: SwapQueryResult, error: React.ReactNode) => {
    return {
        ...result,
        error: error,
    } as SwapQueryResult
}

const useSwapDetails = ({
    chain,
    txHash,
    _enabled,
}: {
    chain?: Chain,
    txHash?: Hash,
    _enabled?: boolean,
}) => {

    // todo: consider retries / interval between fetches or attempting again
    // todo: can either remove action from hop types or use it to determine if there should be a next hop, currently unset and unused

    const { getSwap, updateSwap, addSwap } = useSwapData()
    const initialSwap = getSwap(chain, txHash)
    const messengerAddress = getTeleporterMessengerAddress()
    const enabled = _enabled !== false && chain !== undefined && txHash !== undefined

    const [swap, setSwap] = useState(initialSwap)
    const [isRefetch, setIsRefetch] = useState(false)
    const [queryStatus, setQueryStatus] = useState<QueryStatus>()
    const [nextSwapQuery, setNextSwapQuery] = useState<SwapQuery>()

    useEffect(() => {
        setSwap(getSwap(chain, txHash))
        setQueryStatus(enabled ? "pending" : undefined)
        setNextSwapQuery(undefined)
    }, [enabled, chain, txHash])

    const initiateHop = swap?.hops[0]
    const isFetchInitiate = !swap || swap.status !== SwapStatus.Success || !initiateHop || !initiateHop.dstData || !initiateHop.txHash || initiateHop.txHash !== txHash || initiateHop.status !== SwapStatus.Success
    const { data: initiateTxReceipt, refetch: refetchInitiateTxReceipt } = useWaitForTransactionReceipt({
        chainId: chain?.id,
        hash: txHash,
        confirmations: 1,
        query: {
            enabled: enabled && (isRefetch || isFetchInitiate),
        },
    })

    const { data: initiateTxBlock, refetch: refetchInitiateTxBlock } = useBlock({
        chainId: chain?.id,
        blockNumber: initiateTxReceipt?.blockNumber,
        query: {
            enabled: enabled && (isRefetch || isFetchInitiate) && initiateTxReceipt !== undefined,
        }
    })

    console.log(`>>> useSwap chain: ${chain?.name ?? "n/a"} / tx hash: ${txHash ?? "n/a"} / enabled: ${serialize(enabled)} / swap id: ${swap?.id ?? "n/a"} / fetch initiate: ${serialize(isFetchInitiate)} / isRefetch: ${serialize(isRefetch)}`)

    const getNextHopQuery = useCallback((swapData: Swap, currentHopData: SwapHop, nextHopIndex: number) => {

        let query: SwapQuery | undefined = undefined
        let nextHopData = enabled && swapData.hops.length >= nextHopIndex + 1 ? swapData.hops[nextHopIndex] : undefined

        if (!enabled || !currentHopData.dstData || !currentHopData.sentMsgId || !currentHopData.timestamp) {
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

    }, [enabled])

    const getInitialSwapData = useCallback((chain?: Chain, txReceipt?: TransactionReceipt, txBlock?: Block) => {

        const result: SwapQueryResult = {}
        if (!enabled) {
            return result
        }
        else if (!chain || !txReceipt || !txBlock) {
            return getSwapQueryResultError(result, `No ${!chain ? "chain" : !txReceipt ? "tx receipt" : "block"} found`)
        }

        const initiatedLog = parseEventLogs({
            abi: initiatedAbi,
            logs: txReceipt.logs,
            eventName: "Initiated",
        })[0]

        if (!initiatedLog) {
            // todo: error handling if not found
            return getSwapQueryResultError(result, "No initiate logs found")
        }

        const { token: srcTokenAddress, amount: srcAmount, sender: accountAddress } = initiatedLog.args

        const hopSrcData = getBaseSwapData({
            chain: chain,
            tokenAddress: srcTokenAddress,
            amount: srcAmount,
        })
        const srcData = swap?.srcData ?? hopSrcData
        if (!srcData) {
            // todo: error handling
            return getSwapQueryResultError(result, "Invalid swap and hop src data")
        }

        const { hopData, hopEvents } = getHopAndEventData({
            swapSrcData: srcData,
            hopSrcData: hopSrcData,
            hopIndex: 0,
            txReceipt: txReceipt,
            txTimestamp: Number(txBlock.timestamp) * 1000,
            accountAddress: accountAddress,
        })

        const swapData: Swap = {
            ...swap,
            id: txReceipt.transactionHash,
            srcData: srcData,
            dstData: swap?.dstData,
            hops: [
                hopData,
                ...(swap?.hops ?? []).filter((hop) => hop.index !== hopData.index),
            ],
            events: [
                ...hopEvents,
                ...(swap?.events ?? []).filter((event) => event.hopIndex !== hopData.index),
            ],
            account: accountAddress,
            status: swap?.status ?? SwapStatus.Pending,
            timestamp: Number(txBlock.timestamp) * 1000,
        }

        result.swapData = swapData
        result.hopData = hopData
        result.nextHopQuery = getNextHopQuery(swapData, hopData, 1)

        return result

    }, [enabled, swap])

    const getHopQueryResult = useCallback(async (hopQuery?: SwapQuery) => {

        // todo: determine whether it's the final hop, should only be used to confirm received amounts
        // is not actually another hop in terms of how we refer to a hop elsewhere, basically just the receipt

        const result: SwapQueryResult = {}
        if (!enabled || !hopQuery) {
            return result
        }

        // todo: test and double check the below returns all the required data
        const isFetchResult = isRefetch || !hopQuery.hopData.dstData || !hopQuery.hopData.txHash || hopQuery.hopData.status !== SwapStatus.Success
        if (!isFetchResult) {
            result.swapData = hopQuery.swapData
            result.hopData = hopQuery.hopData
            result.hopEvents = hopQuery.swapData.events.filter((event) => event.hopIndex === hopQuery.hopIndex)
            result.nextHopQuery = getNextHopQuery(hopQuery.swapData, hopQuery.hopData, hopQuery.hopIndex + 1)
            console.log(`>>> useSwap getHopQueryResult SKIPPING FETCH - DATA ALREADY FOUND`)
            return result
        }

        else if (!hopQuery.swapData.account || !hopQuery.hopData.receivedMsgId || !hopQuery.originBlockchainId || !hopQuery.originTimestamp) {
            // todo: error handling
            result.swapData = hopQuery.swapData
            return getSwapQueryResultError(result, "Invalid query data")
        }

        const srcChain = hopQuery.hopData.srcData.chain
        const msgId = hopQuery.hopData.receivedMsgId

        const client: Client = getClient(wagmiConfig, {
            chainId: srcChain.id,
        })

        let txReceipt = isRefetch ? undefined : hopQuery.hopData.txReceipt
        let txTimestamp = isRefetch ? undefined : hopQuery.hopData.timestamp

        if (!txReceipt || !txTimestamp) {

            const { estimatedBlock, targetTimestampSeconds, latestBlock } = await getEstimatedBlockFromTimestamp({
                chain: srcChain,
                timestamp: new Date(hopQuery.originTimestamp),
            })

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

                        const query = getContractEvents(client, {
                            address: messengerAddress,
                            abi: teleporterMessengerAbi,
                            eventName: "ReceiveCrossChainMessage",
                            args: {
                                messageID: msgId,
                                sourceBlockchainID: hopQuery.originBlockchainId,
                            },
                            fromBlock: fromBlock,
                            toBlock: toBlock,
                            strict: true,
                        })
                        queries.push(query)

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

                    console.log(`>>> useSwapHistory batch ${serialize(batch)} / msgReceivedLog: ${serialize(msgReceivedLog)} / target timestamp: ${serialize(new Date(Number(targetTimestampSeconds) * 1000))} / est block timestamp: ${serialize(new Date(Number(estimatedBlock.timestamp) * 1000))}`)

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
            // todo: error handling
            result.swapData = hopQuery.swapData
            return getSwapQueryResultError(result, !txReceipt ? "No tx receipt found" : "No block found")
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
            swapSrcData: hopQuery.swapData.srcData,
            hopSrcData: hopQuery.hopData.srcData,
            hopIndex: hopQuery.hopIndex,
            storedHopData: hopQuery.hopData,
            txReceipt: txReceipt,
            txTimestamp: txTimestamp,
            accountAddress: hopQuery.swapData.account,
        })

        const prevHops = hopQuery.swapData.hops.filter((hop) => hop.index < hopQuery.hopIndex)
        const nextHops = hopQuery.swapData.hops.filter((hop) => hop.index > hopQuery.hopIndex)
        const swapHops = [
            ...prevHops,
            hopData,
            ...nextHops,
        ]

        const prevEvents = hopQuery.swapData.events.filter((event) => event.hopIndex < hopQuery.hopIndex)
        const nextEvents = hopQuery.swapData.events.filter((event) => event.hopIndex > hopQuery.hopIndex)
        const swapEvents = [
            ...prevEvents,
            ...hopEvents,
            ...nextEvents,
        ]

        const swapData: Swap = {
            ...hopQuery.swapData,
            hops: swapHops,
            events: swapEvents,
        }

        const nextHopQuery = getNextHopQuery(swapData, hopData, hopQuery.hopIndex + 1)
        if (!nextHopQuery) {
            swapData.dstData = hopData.dstData
            swapData.type = swapEvents.some((event) => event.type && event.type === RouteType.Swap) ? RouteType.Swap : swapEvents.every((event) => event.type && event.type === RouteType.Bridge) ? RouteType.Bridge : undefined
            swapData.duration = swapHops.length === 1 ? 0 : swapHops.length > 1 && hopData.timestamp && swapHops[0].timestamp ? hopData.timestamp - swapHops[0].timestamp : undefined
            swapData.status = swapHops.some((hop) => hop.status === SwapStatus.Error) ? SwapStatus.Error : swapHops.every((hop) => hop.status === SwapStatus.Success) ? SwapStatus.Success : SwapStatus.Pending
        }

        result.swapData = swapData
        result.hopData = hopData
        result.hopEvents = hopEvents
        result.nextHopQuery = nextHopQuery

        console.log(`>>>>>>>>>>>>>>>>>> useSwap getHopQueryResult hops: ${swapData.hops.length} / hopIndex: ${hopQuery.hopIndex} / next query: ${nextHopQuery ? "YES" : "FINAL HOP (RECEIPT)"}`)

        return result

    }, [enabled, isRefetch, messengerAddress])

    useEffect(() => {

        if (enabled && initiateTxReceipt && initiateTxBlock) {

            const { swapData, nextHopQuery, error } = getInitialSwapData(chain, initiateTxReceipt, initiateTxBlock)

            if (error) {
                console.log(`>>>>>>>>>>>>>>>>>> useSwap INITIAL ERROR: ${error}`)
            }

            setSwap(swapData)
            setNextSwapQuery(nextHopQuery)
            setQueryStatus(error ? "error" : nextHopQuery ? "pending" : "success")
            if (isRefetch && !nextHopQuery) {
                setIsRefetch(false)
            }
        }

    }, [enabled, chain, txHash, initiateTxReceipt, initiateTxBlock])

    useEffect(() => {

        if (enabled && nextSwapQuery) {
            getHopQueryResult(nextSwapQuery).then((result) => {

                const { swapData, nextHopQuery, error } = result

                if (error) {
                    console.log(`>>>>>>>>>>>>>>>>>> useSwap ERROR: ${error}`)
                }

                setSwap(swapData)
                setNextSwapQuery(nextHopQuery)
                setQueryStatus(error ? "error" : nextHopQuery ? "pending" : "success")
            })
        }
        else if (isRefetch) {
            setIsRefetch(false)
            setQueryStatus(enabled ? "success" : undefined)
        }

    }, [enabled, chain, txHash, nextSwapQuery])

    useEffect(() => {
        console.log(`>>> useSwapHistory >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)

        if (swap) {
            const isNewSwap = !getSwap(swap.srcData.chain, swap.id)
            if (isNewSwap) {
                addSwap(swap)
            }
            else {
                updateSwap(swap)
            }
        }

        if (swap) {
            console.log(`>>> useSwapHistory swap: ${swap.srcData.amount ? formatUnits(swap.srcData.amount, swap.srcData.token.decimals) : "n/a"} ${swap.srcData.token.symbol} (${swap.srcData.chain.name}) -> ${swap.dstData?.amount ? formatUnits(swap.dstData.amount, swap.dstData.token.decimals) : "n/a"} ${swap.dstData?.token.symbol} (${swap.dstData?.chain.name}) / type: ${serialize(swap.type)} / duration: ${swap.duration ? formatDuration(swap.duration) : "n/a"} / status: ${swap.status} / queryStatus: ${queryStatus}`)
            swap.hops.forEach((hop, i) => {
                console.log(`   >>> useSwapHistory hop ${i}: ${hop.srcData.amount ? formatUnits(hop.srcData.amount, hop.srcData.token.decimals) : "n/a"} ${hop.srcData.token.symbol} (${hop.srcData.chain.name}) -> ${hop.dstData?.amount ? formatUnits(hop.dstData.amount, hop.dstData.token.decimals) : "n/a"} ${hop.dstData?.token.symbol} (${hop.dstData?.chain.name}) / status: ${hop.status} / tx hash: ${hop.txHash ?? "n/a"}`)
            })
            getSwap(swap.srcData.chain, swap.id)?.hops.forEach((hop, i) => {
                console.log(`   >>> useSwapHistory REFETCHED hop ${i}: ${hop.status}`)
            })
            swap.events.forEach((event, i) => {
                console.log(`      >>> useSwapHistory event ${i}: ${event.srcData.amount ? formatUnits(event.srcData.amount, event.srcData.token.decimals) : "n/a"} ${event.srcData.token.symbol} (${event.srcData.chain.name}) -> ${event.dstData?.amount ? formatUnits(event.dstData.amount, event.dstData.token.decimals) : "n/a"} ${event.dstData?.token.symbol} (${event.dstData?.chain.name}) / status: ${event.status} / tx hash: ${event.txHash ?? "n/a"}`)
            })
        }
        else {
            console.log(`>>> useSwapHistory NO SWAP`)
        }
        console.log(`>>> useSwapHistory >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)
    }, [swap])

    const refetch = useCallback(() => {
        refetchInitiateTxReceipt()
        refetchInitiateTxBlock()
        setIsRefetch(true)
    }, [refetchInitiateTxReceipt, refetchInitiateTxBlock])

    return {
        data: swap,
        refetch: refetch,
    }
}

export default useSwapDetails
