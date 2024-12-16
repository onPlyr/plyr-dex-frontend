import { createContext } from "react"
import { getBalance, getBlock, getBlockNumber, getClient, getTransactionReceipt } from "@wagmi/core"
import { AbiEvent, Address, Client, formatUnits, getAbiItem, Hash, Log, parseEventLogs, TransactionReceipt } from "viem"
import { getLogs } from "viem/actions"

import AccountHistoryDetailDialog from "@/app/components/account/AccountHistoryDetailDialog"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { TokenImage } from "@/app/components/images/TokenImage"
import Button from "@/app/components/ui/Button"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { ToastAction } from "@/app/components/ui/Toast"
import { teleporterExecutedMessageAbiEvent, teleporterFailedMessageExecutionAbiEvent, teleporterMessengerAbi, teleporterSendMessageAbiEvent } from "@/app/config/abis"
import { SupportedChains } from "@/app/config/chains"
import { NumberFormatType } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import { supportedTeleporterMessengerVersion } from "@/app/config/swaps"
import { wagmiConfig } from "@/app/config/wagmi"
import { getBlockExplorerLink, getChain } from "@/app/lib/chains"
import { setStorageItem } from "@/app/lib/storage"
import { toShort } from "@/app/lib/strings"
import { getIsBridgeHop, getRouteTypeLabel, getSwapHistoryQuoteData, getTeleporterMessengerAddress } from "@/app/lib/swaps"
import { getTokens, sortTokens } from "@/app/lib/tokens"
import { AccountDataContextType } from "@/app/types/account"
import { Chain, ChainId } from "@/app/types/chains"
import { StorageDataKey, StorageType } from "@/app/types/storage"
import { EventHistory, HopAction, HopHistory, RouteQuote, StepHistory, SwapHistory, SwapHistoryData, TeleporterMessengerEvent, TxHistory } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

import { serialize } from "wagmi"

export const AccountDataContext = createContext({} as AccountDataContextType)

// todo: check balances are cleared/updated when disconnecting or switching accounts
export const getAccountBalances = async ({
    accountAddress,
    setData,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    setData?: (data?: Token[]) => void,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && accountAddress !== undefined && setData !== undefined

    if (enabled) {

        let tokenData: Token[] = []
        const tokens = getTokens(undefined, true)

        for (const chain of Object.values(SupportedChains)) {

            const chainTokenData: Token[] = []
            const chainTokens = tokens.filter((token) => token.chainId === chain.id)

            const getBalanceQueries = chainTokens.map((token) => getBalance(wagmiConfig, {
                chainId: chain.id,
                address: accountAddress,
                token: token.isNative !== true ? token.address : undefined,
            }))

            await Promise.all(getBalanceQueries).then((results) => {

                results.forEach((resultData) => {

                    // note: try case sensitive first, then case insensitive
                    const token = chainTokens.find((chainToken) => chainToken.symbol === resultData.symbol || chainToken.filters.symbol === resultData.symbol.toLowerCase())

                    if (token) {
                        chainTokenData.push({
                            ...token,
                            balance: resultData.value,
                            balanceFormatted: formatUnits(resultData.value, token.decimals),
                        })
                    }
                })

                if (chainTokenData.length !== 0) {
                    tokenData = [...tokenData, ...chainTokenData]
                    setData(sortTokens(tokenData))
                }
            })
            .catch((err) => {
                console.error(`getAccountBalances error: ${err}`)
            })
        }
    }
    else {
        setData?.(getTokens())
    }
}

export const sortAccountSwapHistory = (accountHistory: SwapHistory[]) => {
    return accountHistory.length > 1 ? accountHistory.sort((a, b) => b.timestamp - a.timestamp) : accountHistory
}

export const addSwapHistoryItem = async ({
    accountAddress,
    storageKey,
    storageType,
    storageData,
    quote,
    txReceipt,
    setData,
    _enabled = true,
}: {
    accountAddress?: Address,
    storageKey?: StorageDataKey,
    storageType?: StorageType,
    storageData?: SwapHistoryData,
    quote?: RouteQuote,
    txReceipt?: TransactionReceipt,
    setData?: (data?: SwapHistory[]) => void,
    _enabled?: boolean,
}) => {

    const existingHistory = storageData && accountAddress && quote && txReceipt ? storageData?.[accountAddress].find((data) => data.srcChainId === quote.srcChain.id && data.id === txReceipt.transactionHash) : undefined
    const enabled = _enabled !== false && existingHistory === undefined && accountAddress !== undefined && storageKey !== undefined && storageType !== undefined && quote !== undefined && txReceipt !== undefined && setData !== undefined

    let history: SwapHistory | undefined = undefined

    if (enabled) {

        let prevHop: HopHistory | undefined = undefined
        const hopData: HopHistory[] = []
        const isSameChainSwapOnly = quote.hops.length === 1 && quote.hops[0].action === HopAction.SwapAndTransfer

        for (const hop of quote.hops) {

            let srcBlockNum: bigint = BigInt(1)
            if (prevHop) {
                srcBlockNum = BigInt(prevHop.dstBlockStart)
            }
            else if (hop.srcChain.id === quote.srcChain.id) {
                srcBlockNum = txReceipt.blockNumber
            }
            else {
                const latestSrcBlockNum = await getBlockNumber(wagmiConfig, {
                    chainId: hop.srcChain.id,
                })
                if (latestSrcBlockNum > BigInt(Math.ceil(hop.srcChain.clientData.maxQueryChunkSize / 2))) {
                    srcBlockNum = latestSrcBlockNum - BigInt(Math.ceil(hop.srcChain.clientData.maxQueryChunkSize / 2))
                }
            }

            let dstBlockNum: bigint = BigInt(1)
            if (hop.srcChain.id === hop.dstChain.id) {
                dstBlockNum = srcBlockNum
            }
            else {
                const latestDstBlockNum = await getBlockNumber(wagmiConfig, {
                    chainId: hop.dstChain.id,
                })
                if (latestDstBlockNum > BigInt(Math.ceil(hop.dstChain.clientData.maxQueryChunkSize / 2))) {
                    dstBlockNum = latestDstBlockNum - BigInt(Math.ceil(hop.dstChain.clientData.maxQueryChunkSize / 2))
                }
            }

            const stepHistory = hop.steps.map((step) => {
                return {
                    srcChainId: step.srcChain.id,
                    srcTokenId: step.srcToken.id,
                    srcAmount: step.srcAmount.toString(),
                    dstChainId: step.dstChain.id,
                    dstTokenId: step.dstToken.id,
                    dstAmountEstimated: step.dstAmount.toString(),
                    type: step.type,
                } as StepHistory
            })

            const baseHopData = {
                srcChainId: hop.srcChain.id,
                srcBlockStart: srcBlockNum.toString(),
                srcTokenId: hop.srcToken.id,
                srcAmount: hop.srcAmount.toString(),
                dstChainId: hop.dstChain.id,
                dstBlockStart: dstBlockNum.toString(),
                dstTokenId: hop.dstToken.id,
                dstAmountEstimated: hop.dstAmount.toString(),
                action: hop.action,
                steps: stepHistory,
            }

            if (prevHop) {
                const hopHistory: HopHistory = {
                    ...baseHopData,
                    status: "pending",
                    receiveMsgId: prevHop.sendMsgId,
                }
                hopData.push(hopHistory)
                prevHop = hopHistory
            }

            else {

                const srcBlock = await getBlock(wagmiConfig, {
                    chainId: hop.srcChain.id,
                    blockNumber: srcBlockNum,
                    includeTransactions: false,
                })

                const txHistory: TxHistory = {
                    chainId: hop.srcChain.id,
                    hash: txReceipt.transactionHash,
                    block: txReceipt.blockNumber.toString(),
                    timestamp: Number(srcBlock.timestamp) * 1000,
                    reverted: txReceipt.status === "reverted",
                }

                let sendMsgId: Hash | undefined = undefined
                if (hop.action !== HopAction.SwapAndTransfer) {
                    const sendMsgLogs = parseEventLogs({
                        abi: teleporterMessengerAbi,
                        logs: txReceipt.logs,
                        eventName: teleporterSendMessageAbiEvent.name,
                    })
                    sendMsgId = sendMsgLogs[0].args.messageID
                }

                const hopHistory: HopHistory = {
                    ...baseHopData,
                    // status: txHistory.reverted ? "error" : isSameChainSwapOnly ? "success" : "pending",
                    status: txHistory.reverted ? "error" : "success",
                    tx: txHistory,
                    sendMsgId: sendMsgId,
                }
                hopData.push(hopHistory)
                prevHop = hopHistory
            }
        }

        const events = quote.events.map((event) => {
            return {
                srcChainId: event.srcChain.id,
                srcTokenId: event.srcToken.id,
                srcAmount: event.srcAmount?.toString(),
                dstChainId: event.dstChain.id,
                dstTokenId: event.dstToken.id,
                dstAmountEstimated: event.dstAmount?.toString(),
                // dstAmount?: string,
                hop: event.hop,
                type: event.type,
                status: hopData[event.hop].status,
                adapterAddress: event.adapterAddress,
                adapter: event.adapter,
                bridge: event.bridge,
            } as EventHistory
        })

        const srcTx = hopData[0].tx
        const dstTx = isSameChainSwapOnly ? srcTx : undefined
        if (srcTx) {

            history = {
                id: srcTx.hash,
                srcChainId: quote.srcChain.id,
                srcTokenId: quote.srcToken.id,
                srcAmount: quote.srcAmount.toString(),
                dstChainId: quote.dstChain.id,
                dstTokenId: quote.dstToken.id,
                dstAmountEstimated: quote.dstAmount.toString(),
                messenger: supportedTeleporterMessengerVersion,
                type: quote.type,
                hops: hopData,
                events: events,
                status: hopData[0].status === "error" ? "error" : isSameChainSwapOnly ? "success" : "pending",
                timestamp: srcTx.timestamp,
                dstTx: dstTx,
            } as SwapHistory

            const accountData = storageData?.[accountAddress] ?? []
            const newAccountData = [...accountData, history]
            const newData: SwapHistoryData = {
                ...storageData,
                [accountAddress]: newAccountData,
            }
            setStorageItem(storageKey, newData, storageType)
            setData(newAccountData)
            return history
        }
    }
    return history
}

export const updateSwapHistoryItemStatus = async ({
    accountAddress,
    storageKey,
    storageType,
    storageData,
    history,
    setData,
    _enabled = true,
}: {
    accountAddress?: Address,
    storageKey?: StorageDataKey,
    storageType?: StorageType,
    storageData?: SwapHistoryData,
    history?: SwapHistory,
    setData?: (data?: SwapHistory[]) => void,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && history !== undefined && history.status !== "success" && accountAddress !== undefined && storageKey !== undefined && storageType !== undefined && storageData !== undefined && setData !== undefined

    let newHistory: SwapHistory | undefined = undefined

    if (enabled) {

        const messengerAddress = getTeleporterMessengerAddress(history.messenger)
        const hopData: HopHistory[] = [
            ...history.hops,
        ]
        const eventData: EventHistory[] = history.events ? [
            ...history.events,
        ] : []

        let dstTx: TxHistory | undefined = undefined

        for (let i = 0; i < history.hops.length; i++) {

            const isFinalHop = i === history.hops.length - 1
            const hop: HopHistory = {
                ...history.hops[i],
            }
            // const txChain = getChain(isFinalHop ? hop.dstChainId : hop.srcChainId)
            const prevSendMsgId = hop.receiveMsgId ?? history.hops[isFinalHop ? (i > 0 ? i - 1 : 0) : i].sendMsgId

            const txChainIds: ChainId[] = isFinalHop ? (history.hops.length > 1 && getIsBridgeHop(hop.action) ? [hop.srcChainId, hop.dstChainId] : [hop.dstChainId]) : [hop.srcChainId]
            const txChains: Chain[] = txChainIds.map((id) => getChain(id)).filter((chain) => chain !== undefined)

            for (let chainIdx = 0; chainIdx < txChains.length; chainIdx++) {

                const txChain = txChains[chainIdx]
                const isDst = chainIdx === txChains.length - 1

                if (txChain && (isFinalHop || hop.status === "pending") && prevSendMsgId !== undefined) {

                    const client: Client = getClient(wagmiConfig, {
                        chainId: txChain.id,
                    })
                    const latestBlock = await getBlockNumber(wagmiConfig, {
                        chainId: txChain.id,
                    })
                    const startBlock = BigInt(isDst ? hop.dstBlockStart : hop.srcBlockStart)
                    const endChunkBlock = startBlock + BigInt(txChain.clientData.maxQueryChunkSize)

                    let receiveMsgLog: Log | undefined = undefined
                    let fromBlock = startBlock
                    let toBlock = endChunkBlock < latestBlock ? endChunkBlock : latestBlock

                    for (let batchIdx = 0; batchIdx < txChain.clientData.maxQueryNumBatches; batchIdx++) {

                        if (receiveMsgLog === undefined) {

                            const receiveMsgQueries = []
                            const receiveMsgEvent: AbiEvent = getAbiItem({
                                abi: teleporterMessengerAbi,
                                name: TeleporterMessengerEvent.Receive,
                            })

                            for (let queryIdx = 0; queryIdx < txChain.clientData.maxQueryBatchSize; queryIdx++) {

                                if (toBlock <= latestBlock) {

                                    if (receiveMsgLog === undefined) {
                                        const query = getLogs(client, {
                                            address: messengerAddress,
                                            event: receiveMsgEvent,
                                            args: {
                                                messageID: prevSendMsgId,
                                                // sourceBlockchainID: txChain.blockchainId,
                                            },
                                            fromBlock: fromBlock,
                                            toBlock: toBlock,
                                            strict: true,
                                        })
                                        receiveMsgQueries.push(query)
                                    }

                                    const toChunkBlock = toBlock + BigInt(txChain.clientData.maxQueryChunkSize)
                                    fromBlock = toBlock
                                    toBlock = toChunkBlock < latestBlock ? toChunkBlock : latestBlock
                                }
                            }

                            if (receiveMsgLog === undefined && receiveMsgQueries.length !== 0) {
                                receiveMsgLog = await Promise.all(receiveMsgQueries).then((results) => results.find((logs) => logs.length !== 0 && logs[0].transactionHash !== null && logs[0].blockNumber !== null)).then((logs) => logs?.[0])
                            }
                        }
                    }

                    if (receiveMsgLog && receiveMsgLog.transactionHash !== null && receiveMsgLog.blockNumber !== null) {

                        console.log(`>>> updateSwapHistoryItemStatus receiveMsgLog: ${serialize(receiveMsgLog)}`)

                        const txReceipt = await getTransactionReceipt(wagmiConfig, {
                            chainId: txChain.id,
                            hash: receiveMsgLog.transactionHash,
                        })
                        const block = await getBlock(wagmiConfig, {
                            chainId: txChain.id,
                            blockNumber: receiveMsgLog.blockNumber,
                            includeTransactions: false,
                        })

                        const txHistory: TxHistory = {
                            chainId: txChain.id,
                            hash: txReceipt.transactionHash,
                            block: txReceipt.blockNumber.toString(),
                            timestamp: Number(block.timestamp) * 1000,
                            reverted: txReceipt.status === "reverted",
                        }

                        if (hop.tx === undefined) {
                            hop.tx = txHistory
                        }
                        if (isFinalHop) {
                            dstTx = txHistory
                        }

                        const txReceiptLogs = parseEventLogs({
                            abi: teleporterMessengerAbi,
                            logs: txReceipt.logs,
                            eventName: [
                                teleporterExecutedMessageAbiEvent.name,
                                teleporterFailedMessageExecutionAbiEvent.name,
                                teleporterSendMessageAbiEvent.name,
                            ],
                        })
                        const executedMsgLog = txReceiptLogs.find((logs) => logs.eventName === TeleporterMessengerEvent.Executed)
                        const failedMsgLog = executedMsgLog === undefined ? txReceiptLogs.find((logs) => logs.eventName === TeleporterMessengerEvent.Failed) : undefined
                        const sendMsgLog = failedMsgLog === undefined ? txReceiptLogs.find((logs) => logs.eventName === TeleporterMessengerEvent.Send) : undefined

                        hop.receiveMsgId = prevSendMsgId
                        hop.status = failedMsgLog || hop.tx.reverted ? "error" : executedMsgLog && (isFinalHop || sendMsgLog) ? "success" : "pending"
                        if (sendMsgLog) {
                            hop.sendMsgId = sendMsgLog.args.messageID
                        }
                        hopData[i] = hop
                        eventData.filter((event) => event.hop === i)?.forEach((event) => {
                            event.status = hop.status
                        })
                    }
                }
            }

            if (isFinalHop) {

                newHistory = {
                    ...history,
                    hops: hopData,
                    events: eventData,
                    status: hopData.some((hop) => hop.status === "error") || dstTx?.reverted ? "error" : hopData.every((hop) => hop.status === "success") ? "success" : "pending",
                    dstTx: dstTx,
                } as SwapHistory

                const accountData = storageData?.[accountAddress].filter((h) => h.id !== history.id) ?? []
                const newAccountData = [...accountData, newHistory]
                const newData: SwapHistoryData = {
                    ...storageData,
                    [accountAddress]: newAccountData,
                }
                setStorageItem(storageKey, newData, storageType)
                setData(newAccountData)
                console.log(">>> updateHistoryStatus newHistory: " + serialize(newHistory))
                return newHistory
            }
        }
    }
    return newHistory
}

export const getSwapStatusToastData = (swapHistory: SwapHistory, duration?: number) => {

    const swapType = getRouteTypeLabel(swapHistory.type)
    const swapData = getSwapHistoryQuoteData(swapHistory)
    const initiateTxUrl = getBlockExplorerLink({
        chain: swapData?.srcChain,
        tx: swapHistory.id,
    })
    const receivedTxUrl = getBlockExplorerLink({
        chain: swapData?.dstChain,
        tx: swapHistory.dstTx?.hash,
    })

    return {
        header: <div className="flex flex-row flex-1 gap-4">
            <SwapStatusIcon status={swapHistory.status} className={iconSizes.sm} />
            <span>{swapType} {swapHistory.status === "success" ? "Completed" : swapHistory.status === "error" ? "Error" : "Started"}</span>
        </div>,
        description: <div className="flex flex-col flex-1 gap-1">
            <div className="flex flex-row flex-1 gap-4 justify-between">
                <div className="flex flex-row shrink justify-start items-center">
                    From
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-end items-center">
                    <DecimalAmount
                        amount={swapData?.srcAmount}
                        symbol={swapData?.srcToken.symbol}
                        token={swapData?.srcToken}
                        type={NumberFormatType.Precise}
                        className="font-bold text-sm text-white"
                    />
                    {swapData?.srcToken && (
                        <TokenImage
                            token={swapData.srcToken}
                            size="xs"
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-row flex-1 gap-4 justify-between">
                <div className="flex flex-row shrink justify-start items-center">
                    To
                </div>
                <div className="flex flex-row flex-1 gap-4 justify-end items-center">
                    <DecimalAmount
                        amount={swapData?.dstAmount}
                        symbol={swapData?.dstToken.symbol}
                        token={swapData?.dstToken}
                        type={NumberFormatType.Precise}
                        className="font-bold text-sm text-white"
                    />
                    {swapData?.dstToken && (
                        <TokenImage
                            token={swapData.dstToken}
                            size="xs"
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-row flex-1 gap-4 justify-between">
                <div className="flex flex-row shrink justify-start items-center">
                    Tx
                </div>
                <div className="flex flex-row flex-1 justify-end items-center">
                    {swapHistory.status === "success" ? (<>
                        {swapHistory.dstTx && receivedTxUrl ? (
                            <ExternalLink
                                href={receivedTxUrl}
                                iconSize="xs"
                            >
                                {toShort(swapHistory.dstTx.hash)}
                            </ExternalLink>
                        ) : toShort(swapHistory.dstTx ? swapHistory.dstTx.hash : swapHistory.id)}
                    </>) : initiateTxUrl ? (
                        <ExternalLink
                            href={initiateTxUrl}
                            iconSize="xs"
                        >
                            {toShort(swapHistory.id)}
                        </ExternalLink>
                    ) : toShort(swapHistory.id)}
                </div>
            </div>
        </div>,
        action: <ToastAction altText="View Swap Status">
            <AccountHistoryDetailDialog
                trigger=<Button className="px-3 py-2 text-sm">Details</Button>
                header={swapType}
                history={swapHistory}
            />
        </ToastAction>,
        duration: duration ?? 5000,
    }
}
