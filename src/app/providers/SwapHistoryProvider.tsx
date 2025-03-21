"use client"

import { createContext, useCallback, useEffect, useState } from "react"
import { Address, Block, Client, erc20Abi, getAbiItem, Hash, isAddressEqual, parseEventLogs, TransactionReceipt, zeroAddress } from "viem"
import { getLogs } from "viem/actions"
import { getBlock, getClient, getTransactionReceipt, serialize } from "@wagmi/core"

import { uniV2AdapterAbi } from "@/app/abis/adapters/uniV2Adapter"
import { yakAdapterAbi } from "@/app/abis/adapters/yakAdapter"
import { dexalotRfqAbi } from "@/app/abis/dexalot/dexalotRfq"
import { teleporterMessengerAbi } from "@/app/abis/teleporter/messenger"
import { nativeDepositWithdrawAbi } from "@/app/abis/tokens/native"
import { NotificationBody, NotificationHeader } from "@/app/components/notifications/SwapHistory"
import { wagmiConfig } from "@/app/config/wagmi"
import useBlockData from "@/app/hooks/blocks/useBlockData"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import useTokens from "@/app/hooks/tokens/useTokens"
import useLocalStorage from "@/app/hooks/utils/useLocalStorage"
import { getBridgePaths } from "@/app/lib/bridges"
import { getCellAbi } from "@/app/lib/cells"
import { getChain, getChainByBlockchainId } from "@/app/lib/chains"
import { MathBigInt } from "@/app/lib/numbers"
import { getSwapAdapter, getSwapHopStatus, getSwapStatus } from "@/app/lib/swaps"
import { getTeleporterMessengerAddress } from "@/app/lib/teleporter"
import { getTokenByBridgeAddress } from "@/app/lib/tokens"
import { getMutatedObject, getParsedError } from "@/app/lib/utils"
import { BridgeProvider, BridgeTypeAbi } from "@/app/types/bridges"
import { CellType } from "@/app/types/cells"
import { EventBaseJson, HopHistory, isCrossChainHopType, isTransferType, SwapBaseJson, SwapHistory, SwapJson, SwapStatus } from "@/app/types/swaps"
import { Notification, NotificationStatus, NotificationType } from "@/app/types/notifications"
import { StorageKey } from "@/app/types/storage"

type GetSwapHistoryFunction = (txHash?: Hash) => SwapHistory | undefined
type GetSwapHistoriesFunction = (accountAddress?: Address) => SwapHistory[]
type SetSwapHistoryFunction = (swap?: SwapHistory, error?: string) => void

interface SwapHistoryContextType {
    data: SwapHistoryData,
    swapHistories: SwapHistory[],
    getSwapHistory: GetSwapHistoryFunction,
    getSwapHistories: GetSwapHistoriesFunction,
    setSwapHistory: SetSwapHistoryFunction,
    setInitiateSwapData: (swap: SwapHistory, txReceipt?: TransactionReceipt) => void,
    setSwapHopQueryData: (swap: SwapHistory, hopIndex: number, blockNumber: bigint) => void,
    refetchSwapHistory: (swap: SwapHistory) => void,
}
type SwapHistoryData = Record<Hash, SwapHistory>
type SwapHistoryJson = Record<Hash, SwapJson>

export const SwapHistoryContext = createContext({} as SwapHistoryContextType)

const SwapHistoryProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const messengerAddress = getTeleporterMessengerAddress()
    const receivedMsgEvent = getAbiItem({
        abi: teleporterMessengerAbi,
        name: "ReceiveCrossChainMessage",
    })

    const { data: notificationData, setNotification } = useNotifications()
    const { latestBlocks, getLatestBlock } = useBlockData()
    const { getToken, getNativeToken, refetch: refetchTokens } = useTokens()

    const getSwapHistoryToJson = useCallback((swap: SwapHistory): SwapJson => {
        return {
            ...swap,
            srcData: {
                chain: swap.srcData.chain.id,
                tokenAddress: swap.srcData.token.address,
                tokenId: swap.srcData.token.id,
                cell: swap.srcData.cell?.address,
                estAmount: swap.srcData.estAmount.toString(),
                minAmount: swap.srcData.minAmount.toString(),
                amount: swap.srcData.amount?.toString(),
            },
            dstData: {
                chain: swap.dstData.chain.id,
                tokenAddress: swap.dstData.token.address,
                tokenId: swap.dstData.token.id,
                cell: swap.dstData.cell?.address,
                estAmount: swap.dstData.estAmount.toString(),
                minAmount: swap.dstData.minAmount.toString(),
                amount: swap.dstData.amount?.toString(),
            },
            hops: swap.hops.map((hop) => ({
                srcData: {
                    chain: hop.srcData.chain.id,
                    tokenAddress: hop.srcData.token.address,
                    tokenId: hop.srcData.token.id,
                    cell: hop.srcData.cell?.address,
                    estAmount: hop.srcData.estAmount.toString(),
                    minAmount: hop.srcData.minAmount.toString(),
                    amount: hop.srcData.amount?.toString(),
                },
                dstData: {
                    chain: hop.dstData.chain.id,
                    tokenAddress: hop.dstData.token.address,
                    tokenId: hop.dstData.token.id,
                    cell: hop.dstData.cell?.address,
                    estAmount: hop.dstData.estAmount.toString(),
                    minAmount: hop.dstData.minAmount.toString(),
                    amount: hop.dstData.amount?.toString(),
                },
                type: hop.type,
                index: hop.index,
                msgReceivedId: hop.msgReceivedId,
                msgSentId: hop.msgSentId,
                txHash: hop.txHash,
                initiatedBlock: hop.initiatedBlock?.toString(),
                lastCheckedBlock: hop.lastCheckedBlock?.toString(),
                isQueryInProgress: hop.isQueryInProgress,
                timestamp: hop.timestamp,
                status: hop.status,
            })),
            events: swap.events.map((event) => ({
                ...event,
                srcData: {
                    chain: event.srcData.chain.id,
                    tokenAddress: event.srcData.token.address,
                    tokenId: event.srcData.token.id,
                    cell: event.srcData.cell?.address,
                    estAmount: event.srcData.estAmount?.toString(),
                    minAmount: event.srcData.minAmount?.toString(),
                    amount: event.srcData.amount?.toString(),
                },
                dstData: {
                    chain: event.dstData.chain.id,
                    tokenAddress: event.dstData.token.address,
                    tokenId: event.dstData.token.id,
                    cell: event.dstData.cell?.address,
                    estAmount: event.dstData.estAmount?.toString(),
                    minAmount: event.dstData.minAmount?.toString(),
                    amount: event.dstData.amount?.toString(),
                },
            })),
            srcAmount: swap.srcAmount.toString(),
            dstAmount: swap.dstAmount?.toString(),
            minDstAmount: swap.minDstAmount.toString(),
            estDstAmount: swap.estDstAmount.toString(),
            gasFee: swap.gasFee?.toString(),
            estGasFee: swap.estGasFee.toString(),
            estGasUnits: swap.estGasUnits.toString(),
            dstInitiatedBlock: swap.dstInitiatedBlock?.toString(),
            dstLastCheckedBlock: swap.dstLastCheckedBlock?.toString(),
        }
    }, [])

    const getBaseDataFromJson = useCallback((data: SwapBaseJson) => {
        const chain = getChain(data.chain)!
        return {
            chain: chain,
            token: getToken({
                id: data.tokenId,
                address: data.tokenAddress,
                chainId: data.chain,
            }),
            cell: chain.cells.find((cell) => data.cell && isAddressEqual(cell.address, data.cell)),
        }
    }, [getToken])

    const getBaseEventDataFromJson = useCallback((data: EventBaseJson) => {
        const chain = getChain(data.chain)!
        return {
            chain: chain,
            token: getToken({
                id: data.tokenId,
                address: data.tokenAddress,
                chainId: data.chain,
            }),
            cell: chain.cells.find((cell) => data.cell && isAddressEqual(cell.address, data.cell)),
        }
    }, [getToken])

    const getSwapHistoryFromJson = useCallback((swap: SwapJson): SwapHistory => {
        return {
            ...swap,
            srcData: {
                ...getBaseDataFromJson(swap.srcData),
                estAmount: BigInt(swap.srcData.estAmount),
                minAmount: BigInt(swap.srcData.minAmount),
                amount: swap.srcData.amount ? BigInt(swap.srcData.amount) : undefined,
            },
            dstData: {
                ...getBaseDataFromJson(swap.dstData),
                estAmount: BigInt(swap.dstData.estAmount),
                minAmount: BigInt(swap.dstData.minAmount),
                amount: swap.dstData.amount ? BigInt(swap.dstData.amount) : undefined,
            },
            type: swap.type,
            hops: swap.hops.map((hop) => ({
                ...hop,
                srcData: {
                    ...getBaseDataFromJson(hop.srcData),
                    estAmount: BigInt(hop.srcData.estAmount),
                    minAmount: BigInt(hop.srcData.minAmount),
                    amount: hop.srcData.amount ? BigInt(hop.srcData.amount) : undefined,
                },
                dstData: {
                    ...getBaseDataFromJson(hop.dstData),
                    estAmount: BigInt(hop.dstData.estAmount),
                    minAmount: BigInt(hop.dstData.minAmount),
                    amount: hop.dstData.amount ? BigInt(hop.dstData.amount) : undefined,
                },
                initiatedBlock: hop.initiatedBlock ? BigInt(hop.initiatedBlock) : undefined,
                lastCheckedBlock: hop.lastCheckedBlock ? BigInt(hop.lastCheckedBlock) : undefined,
            })),
            events: swap.events.map((event) => ({
                ...event,
                srcData: {
                    ...getBaseEventDataFromJson(event.srcData),
                    estAmount: event.srcData.estAmount ? BigInt(event.srcData.estAmount) : undefined,
                    minAmount: event.srcData.minAmount ? BigInt(event.srcData.minAmount) : undefined,
                    amount: event.srcData.amount ? BigInt(event.srcData.amount) : undefined,
                },
                dstData: {
                    ...getBaseEventDataFromJson(event.dstData),
                    estAmount: event.dstData.estAmount ? BigInt(event.dstData.estAmount) : undefined,
                    minAmount: event.dstData.minAmount ? BigInt(event.dstData.minAmount) : undefined,
                    amount: event.dstData.amount ? BigInt(event.dstData.amount) : undefined,
                },
            })),
            srcAmount: BigInt(swap.srcAmount),
            dstAmount: swap.dstAmount ? BigInt(swap.dstAmount) : undefined,
            minDstAmount: BigInt(swap.minDstAmount),
            estDstAmount: BigInt(swap.estDstAmount),
            gasFee: swap.gasFee ? BigInt(swap.gasFee) : undefined,
            estGasFee: BigInt(swap.estGasFee),
            estGasUnits: BigInt(swap.estGasUnits),
            dstInitiatedBlock: swap.dstInitiatedBlock ? BigInt(swap.dstInitiatedBlock) : undefined,
            dstLastCheckedBlock: swap.dstLastCheckedBlock ? BigInt(swap.dstLastCheckedBlock) : undefined,
            isConfirmed: true,
        }
    }, [getBaseDataFromJson, getBaseEventDataFromJson])

    const sortSwapData = (a: [string, SwapHistory | SwapJson], b: [string, SwapHistory | SwapJson]) => a[1].timestamp && b[1].timestamp ? b[1].timestamp - a[1].timestamp : 0

    const swapDataSerializer = useCallback((value: SwapHistoryData) => {
        return JSON.stringify(getMutatedObject(value, getSwapHistoryToJson, sortSwapData))
    }, [getSwapHistoryToJson])

    const swapDataDeserializer = useCallback((value: string): SwapHistoryData => {
        return getMutatedObject(JSON.parse(value) as SwapHistoryJson, getSwapHistoryFromJson, sortSwapData)
    }, [getSwapHistoryFromJson])

    const [swapHistoryData, setSwapHistoryData] = useLocalStorage({
        key: StorageKey.SwapHistory,
        initialValue: {} as SwapHistoryData,
        options: {
            serializer: swapDataSerializer,
            deserializer: swapDataDeserializer,
        },
    })

    const [swapHistories, setSwapHistories] = useState<SwapHistory[]>([])
    const [pendingSwapTxHashes, setPendingSwapTxHashes] = useState<Hash[]>([])
    const [pendingSwapNotifications, setPendingSwapNotifications] = useState<Notification[]>([])

    const getSwapHistory: GetSwapHistoryFunction = useCallback((txHash) => {
        return txHash && swapHistoryData[txHash]
    }, [swapHistoryData])

    const getSwapHistories: GetSwapHistoriesFunction = useCallback((accountAddress) => {
        return accountAddress ? swapHistories.filter((swap) => isAddressEqual(swap.accountAddress, accountAddress)) : swapHistories
    }, [swapHistories])

    useEffect(() => {
        setSwapHistories(Object.values(swapHistoryData))
        setPendingSwapTxHashes(Object.values(swapHistoryData).filter((swap) => swap.status === SwapStatus.Pending).map((swap) => swap.txHash))
    }, [swapHistoryData])

    useEffect(() => {
        refetchTokens()
    }, [pendingSwapTxHashes])

    useEffect(() => {
        setPendingSwapNotifications(Object.values(notificationData).filter((notification) => notification.txHash && notification.status === NotificationStatus.Pending))
    }, [notificationData])

    useEffect(() => {
        pendingSwapNotifications.forEach((notification) => {
            const swap = getSwapHistory(notification.txHash)
            if (swap) {
                setNotification({
                    id: notification?.id ?? swap.id,
                    type: swap.status === SwapStatus.Success ? NotificationType.Success : swap.status === SwapStatus.Error ? NotificationType.Error : NotificationType.Pending,
                    header: <NotificationHeader swap={swap} />,
                    body: <NotificationBody swap={swap} />,
                    status: swap.status,
                    txHash: swap.txHash,
                })
            }
        })
    }, [swapHistories])

    const setSwapHistory: SetSwapHistoryFunction = useCallback((swap, error) => {

        if (!swap) {
            return
        }

        const swapHopStatus = getSwapHopStatus(swap)
        const [firstHop, finalHop] = [swap.hops.at(0), swap.hops.at(-1)]
        if (swapHopStatus === SwapStatus.Success && finalHop && !isCrossChainHopType(finalHop.type)) {
            swap.dstAmount = finalHop.dstData.amount || swap.events.at(-1)?.dstData.amount
            swap.dstTxHash = finalHop.txHash
            swap.dstTimestamp = finalHop.timestamp
        }

        swap.status = error ? SwapStatus.Error : getSwapStatus(swap, swapHopStatus)
        if (swap.status === SwapStatus.Success && firstHop?.timestamp && swap.dstTimestamp) {
            swap.duration = swap.dstTimestamp - firstHop.timestamp
        }

        setSwapHistoryData((prev) => ({
            ...prev,
            [swap.txHash]: swap,
        }))

    }, [setSwapHistoryData])

    const setHopHistoryLogData = useCallback((swap: SwapHistory, hop: HopHistory, receipt: TransactionReceipt) => {

        let error: string | undefined = undefined

        try {

            const cellAbi = getCellAbi(hop.srcData.cell)
            const prevHop = hop.index > 0 ? swap.hops.find((data) => data.index === hop.index - 1) : undefined

            if (prevHop) {

                const bridgeType = getBridgePaths({
                    token: hop.srcData.token,
                    srcChain: prevHop.srcData.chain,
                    dstChain: hop.srcData.chain,
                }).at(0)?.dstData.type
                const bridgeAbi = bridgeType && BridgeTypeAbi[bridgeType]

                const callFailedLogs = bridgeAbi && parseEventLogs({
                    abi: bridgeAbi,
                    logs: receipt.logs,
                    eventName: "CallFailed",
                })
                if (callFailedLogs && callFailedLogs.length > 0) {
                    throw new Error("Swap Execution Failed")
                }

                const rollbackLogs = cellAbi && parseEventLogs({
                    abi: cellAbi,
                    logs: receipt.logs,
                    eventName: "Rollback",
                })
                if (rollbackLogs && rollbackLogs.length > 0) {
                    throw new Error("Hop Rollback")
                }
            }

            if (!hop.srcData.amount || hop.srcData.amount === BigInt(0)) {

                if (hop.srcData.cell && cellAbi) {
                    hop.srcData.amount = parseEventLogs({
                        abi: cellAbi,
                        logs: receipt.logs,
                        eventName: "CellReceivedTokens",
                    })[0]?.args.amount
                }

                if (!hop.srcData.amount) {
                    hop.srcData.amount = parseEventLogs({
                        abi: erc20Abi,
                        logs: receipt.logs,
                        eventName: "Transfer",
                        args: {
                            from: zeroAddress,
                        },
                    }).find((log) => isAddressEqual(log.address, hop.srcData.token.address))?.args.value
                }

                if (!hop.srcData.amount && hop.srcData.token.isNative) {
                    hop.srcData.amount = parseEventLogs({
                        abi: nativeDepositWithdrawAbi,
                        logs: receipt.logs,
                        eventName: "Withdrawal",
                    }).find((log) => hop.srcData.token.wrappedAddress && isAddressEqual(log.address, hop.srcData.token.wrappedAddress))?.args.wad
                }
            }

            if (!hop.dstData.amount || hop.dstData.amount === BigInt(0) || !hop.msgSentId) {

                const msgSentLog = receipt && parseEventLogs({
                    abi: teleporterMessengerAbi,
                    logs: receipt.logs,
                    eventName: "SendCrossChainMessage",
                })[0]

                if (msgSentLog) {

                    const { messageID: msgId, destinationBlockchainID: dstBlockchainId, message: { destinationAddress } } = msgSentLog.args
                    const chain = getChainByBlockchainId(dstBlockchainId)
                    const token = chain && getTokenByBridgeAddress(destinationAddress, hop.srcData.chain, chain)

                    if (!chain || chain.id !== hop.dstData.chain.id || !token || token.id !== hop.dstData.token.id) {
                        throw new Error("Invalid Destination Logs")
                    }

                    hop.msgSentId = msgId
                    hop.dstData.amount = parseEventLogs({
                        abi: erc20Abi,
                        logs: receipt.logs,
                        eventName: "Transfer",
                    }).findLast((log) => isAddressEqual(log.address, token.address))?.args.value

                    if (!hop.dstData.amount && token.isNative) {
                        hop.dstData.amount = parseEventLogs({
                            abi: nativeDepositWithdrawAbi,
                            logs: receipt.logs,
                            eventName: "Deposit",
                        }).findLast((log) => token.wrappedAddress && isAddressEqual(log.address, token.wrappedAddress))?.args.wad
                    }
                }

                else {

                    const transferLog = parseEventLogs({
                        abi: erc20Abi,
                        logs: receipt.logs,
                        eventName: "Transfer",
                        args: {
                            // to: swap.accountAddress,
                            to: swap.recipientAddress,
                        },
                    }).at(-1)

                    const transferToken = transferLog && getToken({
                        address: transferLog.address,
                        chainId: hop.srcData.chain.id,
                    })
                    const nativeToken = transferToken?.isNative && getNativeToken(hop.srcData.chain.id)
                    const token = transferToken ?? nativeToken

                    if (!token) {
                        throw new Error(`Invalid Destination Token (${transferLog?.address})`)
                    }

                    hop.dstData.amount = transferLog?.args.value
                    if (!hop.dstData.amount) {
                        hop.dstData.amount = parseEventLogs({
                            abi: nativeDepositWithdrawAbi,
                            logs: receipt.logs,
                            eventName: "Withdrawal",
                        }).findLast((log) => token.wrappedAddress && isAddressEqual(log.address, token.wrappedAddress))?.args.wad
                    }
                }
            }
        }

        catch (err) {
            error = getParsedError(err)
            hop.status = SwapStatus.Error
            hop.error = error
            swap.status = SwapStatus.Error
        }

        return error

    }, [getToken, getNativeToken])

    const setHopEventData = useCallback((swap: SwapHistory, hop: HopHistory, receipt: TransactionReceipt) => {

        const events = swap.events.filter((event) => event.hopIndex === hop.index)
        const cellType = hop.srcData.cell?.type

        if (hop.status === SwapStatus.Error) {
            events.forEach((event) => event.status = SwapStatus.Error)
            return
        }

        const yakSwapLogs = cellType === CellType.YakSwap ? parseEventLogs({
            abi: yakAdapterAbi,
            logs: receipt.logs,
            eventName: "YakAdapterSwap",
        }) : undefined

        const uniV2SwapLogs = cellType === CellType.UniV2 ? parseEventLogs({
            abi: uniV2AdapterAbi,
            logs: receipt.logs,
            eventName: "Swap",
        }) : undefined

        const dexalotSwapLogs = cellType === CellType.Dexalot ? parseEventLogs({
            abi: dexalotRfqAbi,
            logs: receipt.logs,
            eventName: "SwapExecuted",
        }) : undefined

        for (const event of events) {

            const yakLog = cellType === CellType.YakSwap && yakSwapLogs?.at(event.index)
            const uniV2Log = cellType === CellType.UniV2 && uniV2SwapLogs?.at(event.index)
            const dexalotLog = cellType === CellType.Dexalot && dexalotSwapLogs?.at(event.index)
            const prevDstAmount = events.at(event.index - 1)?.dstData.amount

            if (yakLog) {
                event.srcData.amount = yakLog.args._amountIn
                event.dstData.amount = yakLog.args._amountOut
                event.adapter = getSwapAdapter(hop.srcData.chain, yakLog.address)
                event.adapterAddress = yakLog.address
            }

            else if (uniV2Log) {
                event.dstData.amount = uniV2Log.args.amount0Out || uniV2Log.args.amount1Out
                event.adapter = getSwapAdapter(hop.srcData.chain, uniV2Log.address)
                event.adapterAddress = uniV2Log.address
            }

            else if (dexalotLog) {
                event.srcData.amount = dexalotLog.args.srcAmount
                event.dstData.amount = dexalotLog.args.destAmount
                event.adapter = getSwapAdapter(hop.srcData.chain, hop.srcData.cell?.address)
                event.adapterAddress = event.adapter?.address || hop.srcData.cell?.address || dexalotLog.address
            }

            if (!event.srcData.amount) {
                event.srcData.amount = prevDstAmount
            }

            if (isTransferType(event.type)) {
                event.bridge = BridgeProvider.ICTT
                if (!event.dstData.amount) {
                    event.dstData.amount = hop.dstData.amount
                }
            }

            event.status = SwapStatus.Success
        }

    }, [])

    const setSwapHopQueryData = useCallback(async (swap: SwapHistory, hopIndex: number, blockNumber: bigint) => {

        let hop: HopHistory | undefined = undefined
        let error: string | undefined = undefined

        try {

            hop = swap.hops.find((data) => data.index === hopIndex)
            if (!hop) {
                throw new Error("Invalid Hop Index")
            }

            const prevHop = swap.hops.find((data) => data.index === hopIndex - 1)
            const msgId = prevHop?.msgSentId || hop?.msgReceivedId

            const isQuery = hop && prevHop && msgId && hop.status === SwapStatus.Pending && !hop.isQueryInProgress && (!hop.lastCheckedBlock || blockNumber - hop.lastCheckedBlock >= 1)
            if (!isQuery) {
                return
            }

            hop.msgReceivedId = msgId
            hop.isQueryInProgress = true
            setSwapHistory(swap)

            let txHash: Hash | undefined = undefined
            let receipt: TransactionReceipt | undefined = undefined
            let block: Block | undefined = undefined

            const client: Client = getClient(wagmiConfig, {
                chainId: hop.srcData.chain.id,
            })
            const fromBlock = hop.lastCheckedBlock ?? hop.initiatedBlock ?? MathBigInt.max([BigInt(1), blockNumber - BigInt(hop.srcData.chain.clientData.maxQueryChunkSize)])
            const msgReceivedLogs = await getLogs(client, {
                address: messengerAddress,
                event: receivedMsgEvent,
                args: {
                    messageID: msgId,
                    sourceBlockchainID: prevHop.srcData.chain.blockchainId,
                },
                fromBlock: fromBlock,
                toBlock: blockNumber,
                strict: true,
            })
            if (msgReceivedLogs.length >= 1) {
                txHash = msgReceivedLogs[0].transactionHash
                receipt = await getTransactionReceipt(wagmiConfig, {
                    chainId: hop.srcData.chain.id,
                    hash: txHash,
                })
                block = receipt.blockNumber === blockNumber ? getLatestBlock(hop.srcData.chain.id) : await getBlock(wagmiConfig, {
                    chainId: hop.srcData.chain.id,
                    blockNumber: receipt.blockNumber,
                })
            }

            console.log(`   >>> setSwapHopQueryData swap: ${swap.id} / hop: ${hopIndex} / from: ${fromBlock.toString()} / to: ${blockNumber.toString()} / logs: ${serialize(msgReceivedLogs)}`)

            hop.txHash = txHash
            hop.timestamp = block && Number(block.timestamp) * 1000
            hop.lastCheckedBlock = blockNumber
            hop.status = txHash && receipt && block ? SwapStatus.Success : SwapStatus.Pending
            hop.isQueryInProgress = false

            if (receipt) {
                error = setHopHistoryLogData(swap, hop, receipt)
                setHopEventData(swap, hop, receipt)
            }
        }

        catch (err) {
            error = getParsedError(err)
            swap.status = SwapStatus.Error
            swap.error = error
            if (hop) {
                hop.status = SwapStatus.Error
                if (!hop.error) {
                    hop.error = error
                }
            }
        }

        finally {
            setSwapHistory(swap, error)
        }

        return error

    }, [messengerAddress, receivedMsgEvent, getLatestBlock, setHopHistoryLogData, setHopEventData, setSwapHistory])

    const setInitiateSwapData = useCallback(async (swap: SwapHistory, txReceipt?: TransactionReceipt) => {

        let hop: HopHistory | undefined = undefined
        let error: string | undefined = undefined

        try {

            const { chain } = swap.srcData
            const receipt = txReceipt ?? await getTransactionReceipt(wagmiConfig, {
                chainId: chain.id,
                hash: swap.txHash,
            })
            const recipient = receipt.to

            if (receipt.status === "reverted" || !recipient) {
                throw new Error(receipt.status === "reverted" ? "Transaction Reverted" : "No Recipient")
            }

            const cell = chain.cells.find((data) => isAddressEqual(data.address, recipient))
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

            const { token: srcTokenAddress, amount: srcAmount } = initiatedLog.args
            const srcToken = getToken({
                address: srcTokenAddress,
                chainId: chain.id,
            })
            if (!srcToken || srcToken.id !== swap.srcData.token.id) {
                throw new Error(srcToken ? `Swap Source Token (${swap.srcData.token.id}) Doesn't Match Logs (${srcToken.id})` : `Unsupported Token (${srcTokenAddress})`)
            }

            hop = swap.hops.find((data) => data.index === 0)
            if (!hop) {
                throw new Error("No Initiate Hop")
            }

            const block = await getBlock(wagmiConfig, {
                chainId: chain.id,
                blockNumber: receipt.blockNumber,
            })
            const blockTimestamp = Number(block.timestamp) * 1000

            hop.srcData.amount = srcAmount
            hop.txHash = receipt.transactionHash
            hop.timestamp = blockTimestamp
            hop.status = SwapStatus.Success

            swap.gasFee = receipt.gasUsed * receipt.effectiveGasPrice

            error = setHopHistoryLogData(swap, hop, receipt)
            setHopEventData(swap, hop, receipt)
        }

        catch (err) {
            error = getParsedError(err)
            swap.status = SwapStatus.Error
            swap.error = error
            if (hop) {
                hop.status = SwapStatus.Error
                if (!hop.error) {
                    hop.error = error
                }
            }
        }

        finally {
            setSwapHistory(swap, error)
        }

        return error

    }, [getToken, setSwapHistory, setHopHistoryLogData, setHopEventData])

    const setSwapDstTxData = useCallback(async (swap: SwapHistory, blockNumber: bigint) => {

        let error: string | undefined = undefined

        try {

            const finalHop = swap.hops.at(-1)
            const isCrossChainHop = finalHop && isCrossChainHopType(finalHop.type)
            const msgId = finalHop?.msgSentId

            if (!finalHop || finalHop.status !== SwapStatus.Success || (isCrossChainHop && !msgId) || (!isCrossChainHop && (swap.dstData.chain.id !== finalHop.dstData.chain.id || swap.dstData.token.id !== finalHop.dstData.token.id))) {
                throw new Error("Invalid Final Hop")
            }

            // todo: check logic here
            if (!isCrossChainHop) {
                swap.dstAmount = finalHop.dstData.amount
                swap.dstTxHash = finalHop.txHash
                swap.dstTimestamp = finalHop.timestamp
                return
            }

            const isQuery = msgId && swap.status === SwapStatus.Pending && !swap.isDstQueryInProgress && (!swap.dstLastCheckedBlock || blockNumber - swap.dstLastCheckedBlock >= 1)
            if (!isQuery) {
                return
            }

            swap.isDstQueryInProgress = true
            setSwapHistory(swap)

            let txHash: Hash | undefined = undefined
            let receipt: TransactionReceipt | undefined = undefined
            let block: Block | undefined = undefined

            const client: Client = getClient(wagmiConfig, {
                chainId: swap.dstData.chain.id,
            })
            const fromBlock = swap.dstLastCheckedBlock ?? swap.dstInitiatedBlock ?? MathBigInt.max([BigInt(1), blockNumber - BigInt(swap.dstData.chain.clientData.maxQueryChunkSize)])
            const msgReceivedLogs = await getLogs(client, {
                address: messengerAddress,
                event: receivedMsgEvent,
                args: {
                    messageID: msgId,
                    sourceBlockchainID: finalHop.srcData.chain.blockchainId,
                },
                fromBlock: fromBlock,
                toBlock: blockNumber,
                strict: true,
            })
            if (msgReceivedLogs.length >= 1) {
                txHash = msgReceivedLogs[0].transactionHash
                receipt = await getTransactionReceipt(wagmiConfig, {
                    chainId: swap.dstData.chain.id,
                    hash: txHash,
                })
                block = receipt.blockNumber === blockNumber ? getLatestBlock(swap.dstData.chain.id) : await getBlock(wagmiConfig, {
                    chainId: swap.dstData.chain.id,
                    blockNumber: receipt.blockNumber,
                })
            }

            console.log(`   >>> setSwapDstTxData swap: ${swap.id} / msgId: ${msgId} / from: ${fromBlock.toString()} / to: ${blockNumber.toString()} / logs: ${serialize(msgReceivedLogs)}`)

            swap.dstTxHash = txHash
            swap.dstTimestamp = block && Number(block.timestamp) * 1000
            swap.dstLastCheckedBlock = blockNumber
            swap.isDstQueryInProgress = false

            if (receipt) {

                const cellAbi = getCellAbi(finalHop.dstData.cell)
                const bridgeType = getBridgePaths({
                    token: swap.dstData.token,
                    srcChain: finalHop.srcData.chain,
                    dstChain: swap.dstData.chain,
                }).at(0)?.dstData.type
                const bridgeAbi = bridgeType && BridgeTypeAbi[bridgeType]

                const callFailedLogs = bridgeAbi && parseEventLogs({
                    abi: bridgeAbi,
                    logs: receipt.logs,
                    eventName: "CallFailed",
                })
                if (callFailedLogs && callFailedLogs.length > 0) {
                    throw new Error("Execution Failed")
                }

                const rollbackLogs = cellAbi && parseEventLogs({
                    abi: cellAbi,
                    logs: receipt.logs,
                    eventName: "Rollback",
                })
                if (rollbackLogs && rollbackLogs.length > 0) {
                    throw new Error("Rollback")
                }

                if (bridgeAbi) {
                    swap.dstAmount = parseEventLogs({
                        abi: bridgeAbi,
                        logs: receipt.logs,
                        eventName: "TokensWithdrawn",
                        args: {
                            recipient: swap.recipientAddress,
                        },
                    }).at(0)?.args.amount
                }

                if (!swap.dstAmount) {
                    swap.dstAmount = parseEventLogs({
                        abi: erc20Abi,
                        logs: receipt.logs,
                        eventName: "Transfer",
                        args: {
                            to: swap.recipientAddress,
                        },
                    }).at(-1)?.args.value
                }

                if (!swap.dstAmount) {
                    swap.dstAmount = parseEventLogs({
                        abi: nativeDepositWithdrawAbi,
                        logs: receipt.logs,
                        eventName: "Withdrawal",
                    }).findLast((log) => swap.dstData.token.wrappedAddress && isAddressEqual(log.address, swap.dstData.token.wrappedAddress))?.args.wad
                }
            }
        }

        catch (err) {
            error = getParsedError(err)
            swap.status = SwapStatus.Error
            swap.error = error
        }

        finally {
            setSwapHistory(swap, error)
        }

        return error

    }, [messengerAddress, receivedMsgEvent, getLatestBlock, setSwapHistory])

    useEffect(() => {

        for (const txHash of pendingSwapTxHashes) {

            const swap = swapHistoryData[txHash]
            const hop = swap.hops.find((data) => data.status === SwapStatus.Pending)
            const latestBlock = getLatestBlock(hop?.srcData.chain.id ?? swap.dstData.chain.id)

            if (hop && latestBlock?.number) {
                console.log(`>>> call setSwapHopQueryData for swap: ${swap.id} / hop: ${hop.index} / block: ${latestBlock.number.toString()}`)
                setSwapHopQueryData(swap, hop.index, latestBlock.number)
            }
            else if (latestBlock?.number && (!swap.dstTxHash || !swap.dstTimestamp || !swap.dstAmount || swap.dstAmount === BigInt(0))) {
                console.log(`>>> call setSwapDstTxData for swap: ${swap.id} / block: ${latestBlock.number.toString()}`)
                setSwapDstTxData(swap, latestBlock.number)
            }
        }

    }, [latestBlocks])

    const refetchSwapHistory = useCallback((swap: SwapHistory) => {
        swap.hops.filter((hop) => hop.status !== SwapStatus.Success).forEach((hop) => hop.lastCheckedBlock = undefined)
        swap.dstLastCheckedBlock = undefined
        setSwapHistory(swap)
    }, [setSwapHistory])

    const context: SwapHistoryContextType = {
        data: swapHistoryData,
        swapHistories: swapHistories,
        getSwapHistory: getSwapHistory,
        getSwapHistories: getSwapHistories,
        setSwapHistory: setSwapHistory,
        setInitiateSwapData: setInitiateSwapData,
        setSwapHopQueryData: setSwapHopQueryData,
        refetchSwapHistory: refetchSwapHistory,
    }

    return (
        <SwapHistoryContext.Provider value={context} >
            {children}
        </SwapHistoryContext.Provider>
    )
}

export default SwapHistoryProvider