import { QueryStatus } from "@tanstack/react-query"
import { Address, formatUnits, Hash } from "viem"

import { txActionInProgressMessages, txActionMessages, txActionSuccessMessages } from "@/app/config/txs"
import { routeTypeLabels, supportedTeleporterMessengerVersion, teleporterMessengerContracts, tmpGasBuffer, tmpHopGasEstimate } from "@/app/config/swaps"
import { getChain } from "@/app/lib/chains"
import { maxBigInt } from "@/app/lib/numbers"
import { getStorageItem, setStorageItem } from "@/app/lib/storage"
import { getToken } from "@/app/lib/tokens"
import { Chain, ChainId } from "@/app/types/chains"
import { StorageDataKey, StorageType } from "@/app/types/storage"
import { BaseQuote, EventHistory, HopAction, HopHistory, Route, RouteAction, RouteTxData, RouteType, SelectedSwapData, StepHistory, SwapHistory, TeleporterMessengerVersion } from "@/app/types/swaps"
import { Token, TokenId } from "@/app/types/tokens"
import { TxActionType, TxReceiptStatusType, TxStatusType } from "@/app/types/txs"

export const getPercentBalance = ({
    token,
    balance,
    percent,
}: {
    token?: Token,
    balance?: bigint,
    percent?: number,
}) => {

    let amount = undefined
    let amountFormatted = undefined

    if (token && balance && percent && percent >= 0) {
        amount = percent === 100 ? balance : (balance * BigInt(percent)) / BigInt(100)
        amountFormatted = formatUnits(amount, token.decimals)
    }

    return {
        amount,
        amountFormatted,
    }
}

export const getIsTradeHop = (action: HopAction) => {
    return action === HopAction.SwapAndHop || action === HopAction.SwapAndTransfer
}

export const getIsBridgeHop = (action: HopAction) => {
    return action !== HopAction.SwapAndTransfer
}

export const getRouteCanBridgeDirect = (srcChain: Chain, srcToken: Token, dstChain: Chain, dstToken: Token) => {
    if (srcChain.id !== dstChain.id) {
        if (srcToken.id === dstToken.id) {
            return true
        }
        if (srcToken.isNative && srcToken.wrappedToken && srcToken.wrappedToken === dstToken.id) {
            return true
        }
        if (dstToken.isNative && dstToken.wrappedToken && dstToken.wrappedToken === srcToken.id) {
            return true
        }
    }
    return false
}

export const getHopGasEstimate = (action: HopAction, estimate: bigint) => {
    if (action === HopAction.HopAndCall) {
        return estimate + tmpGasBuffer
    }
    if (action === HopAction.SwapAndHop) {
        console.log('estimate',estimate)
        console.log('tmpHopGasEstimate',tmpHopGasEstimate)
        return estimate + tmpHopGasEstimate
    }
    if (action === HopAction.SwapAndTransfer) {
        return estimate + tmpGasBuffer
    }
    return estimate
}

export const getActionTxStatus = (action: TxActionType, txStatus: TxStatusType, txReceiptStatus: TxReceiptStatusType, txHash?: Hash, routeTxData?: RouteTxData) => {

    const data = {
        msg: txActionMessages[action],
        isInProgress: false,
        isComplete: false,
        tx: txHash,
    }
    const routeTxHash = action === TxActionType.Approve ? routeTxData?.approveTx : routeTxData?.initiateTx

    if (txReceiptStatus === "pending" && (txStatus === "pending" || (txStatus === "success" && txHash && routeTxHash && txHash === routeTxHash))) {
        data.msg = txActionInProgressMessages[action]
        data.isInProgress = true
    }
    else if (txReceiptStatus === "success" && txHash && routeTxHash && txHash === routeTxHash) {
        data.msg = txActionSuccessMessages[action]
        data.isComplete = true
    }

    return data
}

export const getSwapHistoryQuoteData = (swapHistory: SwapHistory | HopHistory | StepHistory) => {

    const srcChain = getChain(swapHistory.srcChainId)
    const dstChain = getChain(swapHistory.dstChainId)
    if (srcChain === undefined || dstChain === undefined) {
        return undefined
    }

    const srcToken = getToken(swapHistory.srcTokenId, srcChain)
    const dstToken = getToken(swapHistory.dstTokenId, dstChain)
    if (srcToken === undefined || dstToken === undefined) {
        return undefined
    }

    const srcAmount = swapHistory.srcAmount ? BigInt(swapHistory.srcAmount) : undefined
    const dstAmountEstimated = swapHistory.dstAmountEstimated ? BigInt(swapHistory.dstAmountEstimated) : undefined
    if (srcAmount === undefined || dstAmountEstimated === undefined) {
        return undefined
    }

    const quoteData: BaseQuote = {
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
        dstAmount: dstAmountEstimated,
        minDstAmount: dstAmountEstimated,
    }

    return quoteData
}

export const getSwapHistoryEventData = (event: EventHistory) => {

    const srcChain = getChain(event.srcChainId)
    const dstChain = getChain(event.dstChainId)
    if (srcChain === undefined || dstChain === undefined) {
        return undefined
    }

    const srcToken = getToken(event.srcTokenId, srcChain)
    const dstToken = getToken(event.dstTokenId, dstChain)
    if (srcToken === undefined || dstToken === undefined) {
        return undefined
    }

    const srcAmount = event.srcAmount ? BigInt(event.srcAmount) : BigInt(0)
    const dstAmountEstimated = event.dstAmountEstimated ? BigInt(event.dstAmountEstimated) : BigInt(0)

    const quoteData: BaseQuote = {
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
        dstAmount: dstAmountEstimated,
        minDstAmount: dstAmountEstimated,
    }

    return quoteData
}

export const getSwapHistoryActionData = (swapHistory: SwapHistory) => {

    let order = 1
    const actions: RouteAction[] = []

    swapHistory.hops.forEach((hop) => {
        hop.steps.forEach((step) => {
            const quoteData = getSwapHistoryQuoteData(step)
            if (quoteData) {
                const action: RouteAction = {
                    srcChain: quoteData.srcChain,
                    srcToken: quoteData.srcToken,
                    srcAmount: quoteData.srcAmount,
                    srcAmountFormatted: formatUnits(quoteData.srcAmount, quoteData.srcToken.decimals),
                    dstChain: quoteData.dstChain,
                    dstToken: quoteData.dstToken,
                    dstAmount: quoteData.dstAmount,
                    dstAmountFormatted: formatUnits(quoteData.dstAmount, quoteData.dstToken.decimals),
                    type: step.type,
                    order: order++,
                }
                actions.push(action)
            }
        })
    })

    return actions
}

export const getSwapProgress = (history?: SwapHistory, start?: number) => {
    const startNum = start ?? 10
    return history?.status === "success" ? 100 : history?.hops.some((hop) => hop.status === "success") ? 50 : startNum
}

export const getRouteTypeLabel = (type: RouteType) => {
    return routeTypeLabels[type]
}

export const getTeleporterMessengerAddress = (version?: TeleporterMessengerVersion) => {
    return teleporterMessengerContracts[version ? version : supportedTeleporterMessengerVersion]
}

export const getRoutesMaxDstAmount = (routes?: Route[]) => {
    return routes && routes.length !== 0 ? routes.length === 1 ? routes[0].dstAmount : maxBigInt(routes.map((route) => route.dstAmount)) : BigInt(0)
}

export const getReviewRouteErrMsg = ({
    accountAddress,
    connectedChain,
    srcChain,
    srcToken,
    srcAmount,
    dstChain,
    dstToken,
    routes,
    selectedRoute,
    queryStatus,
    disabled,
}: {
    accountAddress?: Address,
    connectedChain?: Chain,
    srcChain?: Chain,
    srcToken?: Token,
    srcAmount?: bigint,
    dstChain?: Chain,
    dstToken?: Token,
    routes?: Route[],
    selectedRoute?: Route,
    queryStatus?: QueryStatus,
    disabled?: boolean,
}) => {

    let err = undefined
    let isConnectWalletErr = false

    if (srcChain === undefined || srcToken === undefined || dstChain === undefined || dstToken === undefined) {
        err = "Select Tokens"
    }
    else if (srcAmount === undefined || srcAmount === BigInt(0)) {
        err = "Enter Amount"
    }
    else if (queryStatus && queryStatus === "success" && (routes === undefined || routes.length === 0)) {
        err = "No Routes Found"
    }
    else if (selectedRoute === undefined) {
        err = "Select Route"
    }
    else if (accountAddress === undefined || connectedChain === undefined) {
        err = "Connect Wallet"
        isConnectWalletErr = true
    }
    else if (disabled) {
        err = "Disabled"
    }

    return {
        err,
        isConnectWalletErr,
    }
}

export const getInitiateSwapErrMsg = ({
    accountAddress,
    connectedChain,
    route,
    disabled,
}: {
    accountAddress?: Address,
    connectedChain?: Chain,
    route?: Route,
    disabled?: boolean,
}) => {

    let err = undefined

    if (accountAddress === undefined || connectedChain === undefined) {
        err = "Connect Wallet"
    }
    else if (route === undefined) {
        err = "Select Route"
    }
    else if (route.srcAmount === BigInt(0)) {
        err = "Enter Amount"
    }
    else if (route.srcToken.balance === undefined || route.srcToken.balance < route.srcAmount) {
        err = "Insufficient Balance"
    }
    else if (disabled) {
        err = "Disabled"
    }

    return err
}

export const getSelectedSwapData = () => {

    const storedData = getStorageItem(StorageDataKey.SwapSelection, StorageType.Session)
    const swapData = storedData ? storedData as SelectedSwapData : undefined

    const srcChain = swapData?.srcChainId ? getChain(swapData.srcChainId) : undefined
    const srcToken = srcChain && swapData?.srcTokenId ? getToken(swapData.srcTokenId, srcChain) : undefined

    const dstChain = swapData?.dstChainId ? getChain(swapData.dstChainId) : undefined
    const dstToken = dstChain && swapData?.dstTokenId ? getToken(swapData.dstTokenId, dstChain) : undefined

    return {
        srcChain,
        srcToken,
        dstChain,
        dstToken,
    }
}

export const setSelectedSwapData = ({
    srcChainId,
    srcTokenId,
    dstChainId,
    dstTokenId,
}: {
    srcChainId?: ChainId,
    srcTokenId?: TokenId,
    dstChainId?: ChainId,
    dstTokenId?: TokenId,
}) => {

    const storedData = getStorageItem(StorageDataKey.SwapSelection, StorageType.Session)
    const swapData: SelectedSwapData = storedData ? {
        ...storedData as SelectedSwapData,
    } : {}

    if (srcChainId) {
        swapData.srcChainId = srcChainId
    }
    if (srcTokenId) {
        swapData.srcTokenId = srcTokenId
    }
    if (dstChainId) {
        swapData.dstChainId = dstChainId
    }
    if (dstTokenId) {
        swapData.dstTokenId = dstTokenId
    }

    setStorageItem(StorageDataKey.SwapSelection, swapData, StorageType.Session)
}
