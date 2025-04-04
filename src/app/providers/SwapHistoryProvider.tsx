"use client"

import { createContext, useCallback, useEffect, useMemo } from "react"
import { Address, Block, Hash, Hex, parseEventLogs, TransactionReceipt, zeroAddress } from "viem"
import { getBlock, getTransactionReceipt } from "@wagmi/core"

import { uniV2AdapterAbi } from "@/app/abis/adapters/uniV2Adapter"
import { yakAdapterAbi } from "@/app/abis/adapters/yakAdapter"
import { dexalotRfqAbi } from "@/app/abis/dexalot/dexalotRfq"
import { NotificationBody, NotificationHeader } from "@/app/components/notifications/SwapHistory"
import { wagmiConfig } from "@/app/config/wagmi"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useWatchSwapEvents, { EventQueryMap, getSwapEventQueryMap, isDstTxEventQueryResult, isHopEventQueryResult } from "@/app/hooks/swap/useWatchSwapEvents"
import useTokens from "@/app/hooks/tokens/useTokens"
import useLocalStorage from "@/app/hooks/utils/useLocalStorage"
import { getCellAbi } from "@/app/lib/cells"
import { getChain, getNetworkModeChainIds } from "@/app/lib/chains"
import { getCellRoutedError, getCellRoutedLog, getInitiatedError, getInitiatedLog, getTokensWithdrawnLog, isCallFailed, isRollback } from "@/app/lib/events"
import { getSwapAdapter, getSwapHopStatus, getSwapStatus } from "@/app/lib/swaps"
import { getTokenAddress } from "@/app/lib/tokens"
import { getParsedError, isEqualAddress } from "@/app/lib/utils"
import { BridgeProvider } from "@/app/types/bridges"
import { CellFeeType, CellType } from "@/app/types/cells"
import { BaseData, BaseJson, HopHistory, isCrossChainHopType, isTransferType, SwapFeeData, SwapFeeJson, SwapHistory, SwapJson, SwapStatus, ValidSwapFeeData } from "@/app/types/swaps"
import { NotificationType } from "@/app/types/notifications"
import { PreferenceType } from "@/app/types/preferences"
import { StorageKey } from "@/app/types/storage"
import { GetTokenFunction } from "@/app/types/tokens"

type GetSwapHistoryFunction = (txHash?: Hash) => SwapHistory | undefined
type GetSwapHistoriesFunction = (accountAddress?: Address) => SwapHistory[]
type SetSwapHistoryFunction = (swap?: SwapHistory, error?: string) => void

type SwapHistoryMap = Map<Hash, SwapHistory>
interface SwapHistoryContextType {
    data: SwapHistoryMap,
    swapHistories: SwapHistory[],
    getSwapHistory: GetSwapHistoryFunction,
    getSwapHistories: GetSwapHistoriesFunction,
    setSwapHistory: SetSwapHistoryFunction,
    setInitiateSwapData: (swap: SwapHistory, txReceipt?: TransactionReceipt) => void,
    refetchSwapHistory: (swap: SwapHistory) => void,
}

export const SwapHistoryContext = createContext({} as SwapHistoryContextType)

const getSwapHistoriesFromMap = (data: SwapHistoryMap) => Array.from(data.values())
const getSwapHistoryMap = (histories: SwapHistory[]): SwapHistoryMap => new Map(histories.map((swap) => [swap.txHash, swap]))

const swapBaseDataToJson = (data: BaseData): BaseJson => ({
    chain: data.chain.id,
    tokenAddress: getTokenAddress(data.token),
    cell: data.cell?.address,
    estAmount: data.estAmount?.toString(),
    minAmount: data.minAmount?.toString(),
    amount: "amount" in data ? data.amount?.toString() : undefined,
})

const swapBaseJsonToData = (data: BaseJson, getToken: GetTokenFunction): BaseData => ({
    chain: getChain(data.chain)!,
    token: getToken({
        address: data.tokenAddress,
        chainId: data.chain,
    }),
    cell: data.cell && getChain(data.chain)?.cells.find((cell) => isEqualAddress(cell.address, data.cell)),
    estAmount: data.estAmount ? BigInt(data.estAmount) : undefined,
    minAmount: data.minAmount ? BigInt(data.minAmount) : undefined,
    amount: data.amount ? BigInt(data.amount) : undefined,
})

const swapFeeDataToJson = (data: ValidSwapFeeData): SwapFeeJson => ({
    [CellFeeType.FixedNative]: data[CellFeeType.FixedNative].toString(),
    [CellFeeType.Base]: data[CellFeeType.Base].toString(),
})

const swapFeeJsonToData = (data: SwapFeeJson): SwapFeeData => ({
    [CellFeeType.FixedNative]: BigInt(data[CellFeeType.FixedNative]),
    [CellFeeType.Base]: BigInt(data[CellFeeType.Base].toString()),
})

const swapHistorySerializer = (data: SwapHistoryMap) => JSON.stringify(
    getSwapHistoriesFromMap(data).map((swap) => ({
        ...swap,
        srcData: swapBaseDataToJson(swap.srcData),
        dstData: swapBaseDataToJson(swap.dstData),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        hops: swap.hops.map(({ trade, bridgePath, ...hop }) => ({
            ...hop,
            srcData: swapBaseDataToJson(hop.srcData),
            dstData: swapBaseDataToJson(hop.dstData),
            estGasUnits: hop.estGasUnits?.toString(),
            initiatedBlock: hop.initiatedBlock?.toString(),
            lastCheckedBlock: hop.lastCheckedBlock?.toString(),
        })),
        events: swap.events.map((event) => ({
            ...event,
            srcData: swapBaseDataToJson(event.srcData),
            dstData: swapBaseDataToJson(event.dstData),
        })),
        srcAmount: swap.srcAmount.toString(),
        dstAmount: swap.dstAmount?.toString(),
        minDstAmount: swap.minDstAmount.toString(),
        estDstAmount: swap.estDstAmount.toString(),
        feeData: swapFeeDataToJson(swap.feeData),
        gasFee: swap.gasFee?.toString(),
        estGasFee: swap.estGasFee.toString(),
        estGasUnits: swap.estGasUnits.toString(),
        dstInitiatedBlock: swap.dstInitiatedBlock?.toString(),
        dstLastCheckedBlock: swap.dstLastCheckedBlock?.toString(),
    } as SwapJson)).sort((a, b) => b.timestamp - a.timestamp)
)

const swapHistoryDeserializerFunction = (data: string, getToken: GetTokenFunction) => getSwapHistoryMap(
    (JSON.parse(data) as SwapJson[]).map((swap) => ({
        ...swap,
        srcData: swapBaseJsonToData(swap.srcData, getToken),
        dstData: swapBaseJsonToData(swap.dstData, getToken),
        hops: swap.hops.map((hop) => ({
            ...hop,
            srcData: swapBaseJsonToData(hop.srcData, getToken),
            dstData: swapBaseJsonToData(hop.dstData, getToken),
            initiatedBlock: hop.initiatedBlock ? BigInt(hop.initiatedBlock) : undefined,
            lastCheckedBlock: hop.lastCheckedBlock ? BigInt(hop.lastCheckedBlock) : undefined,
        })),
        events: swap.events.map((event) => ({
            ...event,
            srcData: swapBaseJsonToData(event.srcData, getToken),
            dstData: swapBaseJsonToData(event.dstData, getToken),
        })),
        srcAmount: BigInt(swap.srcAmount),
        dstAmount: swap.dstAmount ? BigInt(swap.dstAmount) : undefined,
        minDstAmount: BigInt(swap.minDstAmount),
        estDstAmount: BigInt(swap.estDstAmount),
        feeData: swapFeeJsonToData(swap.feeData),
        gasFee: swap.gasFee ? BigInt(swap.gasFee) : undefined,
        estGasFee: BigInt(swap.estGasFee),
        estGasUnits: BigInt(swap.estGasUnits),
        dstInitiatedBlock: swap.dstInitiatedBlock ? BigInt(swap.dstInitiatedBlock) : undefined,
        dstLastCheckedBlock: swap.dstLastCheckedBlock ? BigInt(swap.dstLastCheckedBlock) : undefined,
        isConfirmed: true,
    }) as SwapHistory).sort((a, b) => b.timestamp - a.timestamp)
)

const SwapHistoryProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { getNotification, setNotification } = useNotifications()
    const { getToken, refetch: refetchTokens } = useTokens()
    const { getPreference } = usePreferences()
    const networkMode = useMemo(() => getPreference(PreferenceType.NetworkMode), [getPreference])
    const chainIds = useMemo(() => getNetworkModeChainIds(networkMode), [networkMode])

    const swapHistoryDeserializer = useCallback((data: string) => swapHistoryDeserializerFunction(data, getToken), [getToken])
    const [swapHistoryData, setSwapHistoryData] = useLocalStorage({
        key: StorageKey.SwapHistory,
        initialValue: getSwapHistoryMap([]),
        options: {
            serializer: swapHistorySerializer,
            deserializer: swapHistoryDeserializer,
        },
    })

    const swapHistories = useMemo(() => getSwapHistoriesFromMap(swapHistoryData).filter((swap) => chainIds.includes(swap.srcData.chain.id)), [chainIds, swapHistoryData])
    const getSwapHistory: GetSwapHistoryFunction = useCallback((txHash) => txHash && swapHistoryData.get(txHash), [swapHistoryData])
    const getSwapHistories: GetSwapHistoriesFunction = useCallback((accountAddress) => accountAddress ? swapHistories.filter((swap) => isEqualAddress(swap.accountAddress, accountAddress)) : swapHistories, [swapHistories])

    const updatePendingSwapNotification = useCallback((swap: SwapHistory) => {

        const notification = getNotification({ txHash: swap.txHash })
        const isSuccess = swap.status === SwapStatus.Success
        const isError = swap.status === SwapStatus.Error

        if (notification || (isSuccess || isError)) {
            setNotification({
                id: notification?.id ?? swap.id,
                type: isSuccess ? NotificationType.Success : isError ? NotificationType.Error : NotificationType.Pending,
                header: <NotificationHeader swap={swap} />,
                body: <NotificationBody swap={swap} />,
                status: swap.status,
                txHash: swap.txHash,
            })
        }
    }, [getNotification, setNotification])

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

        setSwapHistoryData((prev) => new Map(prev).set(swap.txHash, swap))
        updatePendingSwapNotification(swap)

    }, [setSwapHistoryData, updatePendingSwapNotification])

    const setHopHistoryLogData = useCallback((swap: SwapHistory, hop: HopHistory, receipt: TransactionReceipt) => {

        let error: string | undefined = undefined

        try {

            const cellAbi = getCellAbi(hop.srcData.cell)
            if (!cellAbi) {
                throw new Error(hop.srcData.cell ? `abi for cell at ${hop.srcData.cell.address} on ${hop.srcData.chain.id} not found` : "Cell address not provided")
            }

            const prevHop = swap.hops.find((data) => data.index === hop.index - 1)
            if (hop.index > 0 && !prevHop) {
                throw new Error(`Previous data for hop ${hop.index} not found`)
            }

            const cellRoutedLog = getCellRoutedLog(receipt)
            const cellRoutedError = getCellRoutedError(hop, cellRoutedLog)

            if (!cellRoutedLog || cellRoutedError) {
                throw new Error(cellRoutedError || "CellRouted event not found")
            }

            if (prevHop && isRollback(receipt)) {
                throw new Error(`Hop ${hop.index} rollback`)
            }
            else if (prevHop && isCallFailed(receipt)) {
                throw new Error(`Hop ${hop.index} call failed`)
            }

            hop.srcData.amount = cellRoutedLog.args.amountIn
            hop.dstData.amount = cellRoutedLog.args.amountOut
            hop.msgSentId = cellRoutedLog.args.messageID
            hop.srcData.cell = hop.srcData.cell || hop.srcData.chain.cells.find((cell) => isEqualAddress(cell.address, cellRoutedLog.address))
            if (!hop.dstData.cell && !isEqualAddress(cellRoutedLog.args.destinationCell, zeroAddress)) {
                hop.dstData.cell = hop.dstData.chain.cells.find((cell) => isEqualAddress(cell.address, cellRoutedLog.args.destinationCell))
            }
        }

        catch (err) {
            error = getParsedError(err)
            hop.status = SwapStatus.Error
            hop.error = error
            swap.status = SwapStatus.Error
        }

        return error

    }, [])

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
                if (hop.index === 0 && event.index === 0) {
                    event.srcData.amount = hop.srcData.amount
                }
                else {
                    event.srcData.amount = prevDstAmount
                }
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

    const setInitiateSwapData = useCallback(async (swap: SwapHistory, txReceipt?: TransactionReceipt) => {

        let hop: HopHistory | undefined = undefined
        let error: string | undefined = undefined

        try {

            hop = swap.hops.find((data) => data.index === 0)
            if (!hop) {
                throw new Error("Swap has no hop at index 0")
            }

            const receipt = txReceipt ?? await getTransactionReceipt(wagmiConfig, {
                chainId: swap.srcData.chain.id,
                hash: swap.txHash,
            })

            if (receipt.status === "reverted" || !receipt.to) {
                throw new Error(receipt.status === "reverted" ? "Transaction reverted" : "Invalid transaction")
            }

            const cell = hop.srcData.cell ?? swap.srcData.chain.cells.find((data) => receipt.to && isEqualAddress(data.address, receipt.to))
            const abi = getCellAbi(cell)

            if (!cell || !abi) {
                throw new Error(cell ? `abi for cell at ${cell.address} on ${swap.srcData.chain.id} not found` : `Cell at ${receipt.to} on ${swap.srcData.chain.id} not found`)
            }

            const initiatedLog = getInitiatedLog(receipt)
            const initiatedError = getInitiatedError(swap, hop, initiatedLog)

            if (!initiatedLog || initiatedError) {
                throw new Error(initiatedError || "Initiated event not found")
            }

            const block = await getBlock(wagmiConfig, {
                chainId: swap.srcData.chain.id,
                blockNumber: receipt.blockNumber,
            })

            hop.srcData.amount = initiatedLog.args.amount
            hop.txHash = receipt.transactionHash
            hop.timestamp = Number(block.timestamp) * 1000
            hop.status = SwapStatus.Success

            swap.srcAmount = swap.srcAmount || initiatedLog.args.amount
            swap.tesseractId = initiatedLog.args.tesseractId
            swap.timestamp = hop.timestamp
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

    }, [setSwapHistory, setHopHistoryLogData, setHopEventData])

    const setSwapHopResult = useCallback((swap: SwapHistory, hopIndex: number, receipt: TransactionReceipt, block: Block, msgId: Hex) => {

        let hop: HopHistory | undefined = undefined
        let error: string | undefined = undefined

        try {

            if (!block.number) {
                throw new Error(`Hop ${hopIndex} transaction block is unfinalised`)
            }

            hop = swap.hops.find((data) => data.index === hopIndex)
            if (!hop) {
                throw new Error(`Invalid Hop Index: ${hopIndex}`)
            }

            hop.msgReceivedId = msgId
            hop.txHash = receipt.transactionHash
            hop.timestamp = Number(block.timestamp) * 1000
            hop.status = SwapStatus.Success
            hop.lastCheckedBlock = block.number 

            error = setHopHistoryLogData(swap, hop, receipt)
            setHopEventData(swap, hop, receipt)
        }

        catch (err) {
            error = getParsedError(err)
            if (swap) {
                swap.status = SwapStatus.Error
                swap.error = error
            }
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

    }, [setHopHistoryLogData, setHopEventData, setSwapHistory])

    const setSwapDstTxResult = useCallback((swap: SwapHistory, receipt: TransactionReceipt, block: Block) => {

        let error: string | undefined = undefined

        try {

            if (!block.number) {
                throw new Error("Destination transaction block is unfinalised")
            }

            const finalHop = swap.hops.at(-1)
            const isCrossChainHop = finalHop && isCrossChainHopType(finalHop.type)
            const msgId = finalHop?.msgSentId

            if (!finalHop || finalHop.status !== SwapStatus.Success || (isCrossChainHop && !msgId) || (!isCrossChainHop && (swap.dstData.chain.id !== finalHop.dstData.chain.id || swap.dstData.token.id !== finalHop.dstData.token.id))) {
                throw new Error(finalHop ? `Invalid final hop with index ${finalHop.index}` : "No final hop")
            }

            const tokensWithdrawnLog = getTokensWithdrawnLog(swap, receipt)

            if (isRollback(receipt)) {
                throw new Error("Destination transaction rollback")
            }
            else if (isCallFailed(receipt)) {
                throw new Error("Destination transaction call failed")
            }
            else if (!tokensWithdrawnLog) {
                throw new Error("TokensWithdrawn event not found")
            }

            swap.dstTxHash = receipt.transactionHash
            swap.dstTimestamp = Number(block.timestamp) * 1000
            swap.dstLastCheckedBlock = block.number
            swap.dstAmount = tokensWithdrawnLog.args.amount
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

    }, [setSwapHistory])

    const swapEventQueryMap: EventQueryMap = useMemo(() => getSwapEventQueryMap(swapHistories), [swapHistories])
    const { results: swapEventResultsMap, setResults: setSwapEventResultsMap } = useWatchSwapEvents(swapEventQueryMap)

    useEffect(() => {
        if (!swapEventResultsMap.size) {
            return
        }

        swapEventResultsMap.forEach((result, txHash) => {
            const swap = getSwapHistory(txHash)
            if (swap && isHopEventQueryResult(result)) {
                setSwapHopResult(swap, result.hopIndex, result.txReceipt, result.block, result.msgId)
            }
            else if (swap && isDstTxEventQueryResult(result)) {
                setSwapDstTxResult(swap, result.txReceipt, result.block)
            }
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [swapEventResultsMap])

    const updatedSwapTxHashes = useMemo(() => swapHistories.filter((swap) => swapEventResultsMap.has(swap.txHash) && swap.status !== SwapStatus.Pending).map((swap) => swap.txHash), [swapHistories, swapEventResultsMap])

    useEffect(() => {
        if (updatedSwapTxHashes.length) {
             
            setSwapEventResultsMap((prev) => new Map(Array.from(prev.entries()).filter(([txHash, _]) => !updatedSwapTxHashes.includes(txHash))))
            refetchTokens()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updatedSwapTxHashes, setSwapEventResultsMap])

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
        refetchSwapHistory: refetchSwapHistory,
    }

    return (
        <SwapHistoryContext.Provider value={context} >
            {children}
        </SwapHistoryContext.Provider>
    )
}

export default SwapHistoryProvider
