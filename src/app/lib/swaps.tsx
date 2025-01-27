import { QueryStatus } from "@tanstack/react-query"
import { Address, formatUnits, Hash, zeroAddress } from "viem"

import { hopActionCompletedLabels, hopActionInProgressLabels, hopActionLabels, routeTypeLabels, supportedTeleporterMessengerVersion, SwapStatus, teleporterMessengerContracts, tmpGasBuffer, tmpHopGasEstimate } from "@/app/config/swaps"
import { getChain, getChainByBlockchainId } from "@/app/lib/chains"
import { MathBigInt } from "@/app/lib/numbers"
import { getStorageItem, setStorageItem } from "@/app/lib/storage"
import { getToken, getTokenByAddress, getTokenByBridgeAddress } from "@/app/lib/tokens"
import { Chain, ChainId } from "@/app/types/chains"
import { StorageDataKey, StorageType } from "@/app/types/storage"
import { BaseSwapData, BaseSwapDataJson, HopAction, Route, RouteType, SelectedSwapData, Swap, SwapEvent, SwapHop, SwapJson, TeleporterMessengerVersion } from "@/app/types/swaps"
import { Token, TokenId } from "@/app/types/tokens"
import { getPlatform } from "./platforms"
import { toShort } from "./strings"

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

export const getHopGasEstimate = (action: HopAction, estimate: bigint) => {
    if (action === HopAction.HopAndCall) {
        return estimate + tmpGasBuffer
    }
    if (action === HopAction.SwapAndHop) {
        return estimate + tmpHopGasEstimate
    }
    if (action === HopAction.SwapAndTransfer) {
        return estimate + tmpGasBuffer
    }
    return estimate
}

export const getRouteTypeLabel = (type: RouteType) => {
    return routeTypeLabels[type]
}

export const getHopActionLabel = ({
    action,
    isInProgress,
    isComplete,
}: {
    action: HopAction,
    isInProgress?: boolean,
    isComplete?: boolean,
}) => {
    return isInProgress ? hopActionInProgressLabels[action] : isComplete ? hopActionCompletedLabels[action] : hopActionLabels[action]
}

export const getTeleporterMessengerAddress = (version?: TeleporterMessengerVersion) => {
    return teleporterMessengerContracts[version ? version : supportedTeleporterMessengerVersion]
}

export const getRoutesMaxDstAmount = (routes?: Route[]) => {
    return routes && routes.length !== 0 ? routes.length === 1 ? routes[0].dstAmount : MathBigInt.max(routes.map((route) => route.dstAmount)) : BigInt(0)
}

export const getReviewRouteErrMsg = ({
    accountAddress,
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
    else if (queryStatus && queryStatus === "error") {
        err = "Error Fetching Routes"
    }
    else if (accountAddress === undefined) {
        err = "Connect Wallet"
        isConnectWalletErr = true
    }
    else if (selectedRoute && (selectedRoute.srcToken.balance === undefined || selectedRoute.srcToken.balance < selectedRoute.srcAmount)) {
        err = "Insufficient Balance"
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
    route,
    disabled,
}: {
    accountAddress?: Address,
    route?: Route,
    disabled?: boolean,
}) => {

    let err = undefined
    let isConnectWalletErr = false

    if (!accountAddress) {
        err = "Connect Wallet"
        isConnectWalletErr = true
    }
    else if (!route) {
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

    return {
        err,
        isConnectWalletErr,
    }
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

////////////////////////////////////////////////////////////////////////////////
// todo: tbc - confirm after finishing new swap status functionality

export const getSwapFromQuote = ({
    route,
    txHash,
    accountAddress,
    plyrId,
    isReviewSwap = false,
}: {
    route?: Route,
    txHash?: Hash,
    accountAddress?: Address,
    plyrId?: string,
    isReviewSwap?: boolean,
}) => {

    // todo: update to use quote only, route only needed for est duration
    // todo: move hop / events to functions, same as the ones from json

    let swap: Swap | undefined = undefined

    const quote = route?.quote
    if (!route || !quote || (!txHash && !isReviewSwap) || !(quote.hops.length > 0) || !(quote.events.length > 0)) {
        return swap
    }

    swap = {
        id: isReviewSwap && !txHash ? zeroAddress : txHash!,
        srcData: {
            chain: quote.srcChain,
            token: quote.srcToken,
            amount: quote.srcAmount,
        },
        dstData: {
            chain: quote.dstChain,
            token: quote.dstToken,
            amount: isReviewSwap ? quote.dstAmount : undefined,
        },
        plyrId: plyrId,
        hops: quote.hops.map((hop, i) => ({
            srcData: {
                chain: hop.srcChain,
                token: hop.srcToken,
                amount: isReviewSwap ? hop.srcAmount : undefined,
                // msgId: Hash,
            },
            dstData: {
                chain: hop.dstChain,
                token: hop.dstToken,
                amount: isReviewSwap ? hop.dstAmount : undefined,
                // msgId: Hash,
            },
            index: i,
            action: hop.action,
            status: SwapStatus.Pending,
        })),
        events: quote.events.map((event) => ({
            srcData: {
                chain: event.srcChain,
                token: event.srcToken,
                amount: isReviewSwap ? event.srcAmount : undefined,
            },
            dstData: {
                chain: event.dstChain,
                token: event.dstToken,
                amount: isReviewSwap ? event.dstAmount : undefined,
            },
            hopIndex: event.hop,
            type: event.type,
            adapter: event.adapter,
            adapterAddress: event.adapterAddress,
            bridge: event.bridge,
            status: SwapStatus.Pending,
        })),
        account: accountAddress,
        estAmount: quote.dstAmount,
        // duration: number,
        estDuration: route.durationEstimate,
        type: quote.type,
        status: SwapStatus.Pending,
    }

    return swap
}

export const getSwapJsonFromQuote = ({
    route,
    txHash,
    accountAddress,
}: {
    route?: Route,
    txHash?: Hash,
    accountAddress?: Address,
}) => {

    // todo: update to use quote only, route only needed for est duration
    // todo: move hop / events to functions, same as the ones from json

    let swapJson: SwapJson | undefined = undefined

    const quote = route?.quote
    if (!route || !quote || !txHash || !(quote.hops.length > 0) || !(quote.events.length > 0)) {
        return swapJson
    }

    swapJson = {
        id: txHash,
        srcData: {
            chain: quote.srcChain.id,
            token: quote.srcToken.id,
            amount: quote.srcAmount.toString(),
        },
        dstData: {
            chain: quote.dstChain.id,
            token: quote.dstToken.id,
            // amount: quote.dstAmount.toString(),
        },
        hops: [],
        events: [],
        account: accountAddress,
        estAmount: quote.dstAmount.toString(),
        // duration: number,
        estDuration: route.durationEstimate,
        type: quote.type,
        status: SwapStatus.Pending,
    }

    swapJson.hops = quote.hops.map((hop, i) => ({
        srcData: {
            chain: hop.srcChain.id,
            token: hop.srcToken.id,
            // amount: hop.srcAmount.toString(),
            // msgId: Hash,
        },
        dstData: {
            chain: hop.dstChain.id,
            token: hop.dstToken.id,
            // amount: hop.dstAmount.toString(),
            // msgId: Hash,
        },
        index: i,
        action: hop.action,
        status: SwapStatus.Pending,
    }))

    swapJson.events = quote.events.map((event) => ({
        srcData: {
            chain: event.srcChain.id,
            token: event.srcToken.id,
            // amount: event.srcAmount?.toString(),
        },
        dstData: {
            chain: event.dstChain.id,
            token: event.dstToken.id,
            // amount: event.dstAmount?.toString(),
        },
        hopIndex: event.hop,
        type: event.type,
        adapter: event.adapter,
        adapterAddress: event.adapterAddress,
        bridge: event.bridge,
        status: SwapStatus.Pending,
    }))

    return swapJson
}

export const getSwapJsonFromSwap = (swap?: Swap) => {

    let json: SwapJson | undefined = undefined

    if (!swap) {
        return json
    }

    json = {
        id: swap.id,
        srcData: {
            chain: swap.srcData.chain.id,
            token: swap.srcData.token.id,
            amount: swap.srcData.amount?.toString(),
        },
        dstData: !swap.dstData ? undefined : {
            chain: swap.dstData.chain.id,
            token: swap.dstData.token.id,
            amount: swap.dstData.amount?.toString(),
        },
        plyrId: swap.plyrId,
        hops: swap.hops.map((hop) => ({
            srcData: {
                chain: hop.srcData.chain.id,
                token: hop.srcData.token.id,
                amount: hop.srcData.amount?.toString(),
            },
            dstData: !hop.dstData ? undefined : {
                chain: hop.dstData.chain.id,
                token: hop.dstData.token.id,
                amount: hop.dstData.amount?.toString(),
            },
            plyrId: swap.plyrId,
            index: hop.index,
            receivedMsgId: hop.receivedMsgId,
            sentMsgId: hop.sentMsgId,
            action: hop.action,
            txHash: hop.txHash,
            timestamp: hop.timestamp,
            status: hop.status,
        })),
        events: swap.events.map((event) => ({
            srcData: {
                chain: event.srcData.chain.id,
                token: event.srcData.token.id,
                amount: event.srcData.amount?.toString(),
            },
            dstData: !event.dstData ? undefined : {
                chain: event.dstData.chain.id,
                token: event.dstData.token.id,
                amount: event.dstData.amount?.toString(),
            },
            plyrId: swap.plyrId,
            hopIndex: event.hopIndex,
            type: event.type,
            adapter: event.adapter,
            adapterAddress: event.adapterAddress,
            bridge: event.bridge,
            txHash: event.txHash,
            timestamp: event.timestamp,
            status: event.status,
        })),
        account: swap.account,
        estAmount: swap.estAmount?.toString(),
        duration: swap.duration,
        estDuration: swap.estDuration,
        type: swap.type,
        timestamp: swap.timestamp,
        status: swap.status,
    }

    return json
}

export const getBaseSwapDataFromJson = (json?: BaseSwapDataJson) => {

    let data: BaseSwapData | undefined = undefined

    if (!json) {
        return data
    }

    const chain = getChain(json.chain)
    const token = chain ? getToken(json.token, chain) : undefined
    if (!chain || !token) {
        return data
    }

    data = {
        chain: chain,
        token: token,
        amount: json.amount ? BigInt(json.amount) : undefined,
    }

    return data
}

export const getSwapHopsFromJson = ({
    json,
    swapSrcData,
}: {
    json?: SwapJson,
    swapSrcData?: BaseSwapData,
}) => {

    // todo: should be able to work out action if undefined

    const hops: SwapHop[] = []
    if (!json || !swapSrcData || !(json.hops.length > 0)) {
        return hops
    }

    let prevHop: SwapHop | undefined = undefined
    for (const hopJson of json.hops) {

        const hopSrcData = getBaseSwapDataFromJson(hopJson.srcData)
        const srcData: BaseSwapData = hopSrcData ?? {
            chain: prevHop?.dstData?.chain ?? swapSrcData.chain,
            token: prevHop?.dstData?.token ?? swapSrcData.token,
            amount: prevHop?.dstData?.amount,
        }
        const dstData = getBaseSwapDataFromJson(hopJson.dstData)

        const hop: SwapHop = {
            srcData: srcData,
            dstData: dstData,
            index: hopJson.index,
            action: hopJson.action,
            txHash: hopJson.txHash,
            timestamp: hopJson.timestamp,
            receivedMsgId: hopJson.receivedMsgId,
            sentMsgId: hopJson.sentMsgId,
            status: hopJson.status,
        }
        hops.push(hop)
        prevHop = hop
    }

    return hops
}

export const getSwapEventsFromJson = ({
    json,
    swapSrcData,
}: {
    json?: SwapJson,
    swapSrcData?: BaseSwapData,
}) => {

    // todo: should be able to work out type if undefined

    const events: SwapEvent[] = []
    if (!json || !swapSrcData || !(json.events.length > 0)) {
        return events
    }

    let prevEvent: SwapEvent | undefined = undefined
    for (const eventJson of json.events) {

        const eventSrcData = getBaseSwapDataFromJson(eventJson.srcData)
        const srcData: BaseSwapData = eventSrcData ?? {
            chain: prevEvent?.dstData?.chain ?? swapSrcData.chain,
            token: prevEvent?.dstData?.token ?? swapSrcData.token,
            amount: prevEvent?.dstData?.amount,
        }
        const dstData = getBaseSwapDataFromJson(eventJson.dstData)

        const event: SwapEvent = {
            srcData: srcData,
            dstData: dstData,
            hopIndex: eventJson.hopIndex,
            type: eventJson.type ?? (dstData ? srcData.token.id !== dstData.token.id ? RouteType.Swap : RouteType.Bridge : undefined),
            adapter: eventJson.adapter,
            adapterAddress: eventJson.adapterAddress,
            bridge: eventJson.bridge,
            txHash: eventJson.txHash,
            timestamp: eventJson.timestamp,
            status: eventJson.status,
        }
        events.push(event)
        prevEvent = event
    }

    return events
}

export const getSwapFromJson = (json?: SwapJson) => {

    let swap: Swap | undefined = undefined

    if (!json || !(json.hops.length > 0) || !(json.events.length > 0)) {
        return swap
    }

    const swapSrcData = getBaseSwapDataFromJson(json.srcData)
    const swapDstData = getBaseSwapDataFromJson(json.dstData)
    if (!swapSrcData) {
        return swap
    }

    swap = {
        id: json.id,
        srcData: swapSrcData,
        dstData: swapDstData,
        plyrId: json.plyrId,
        hops: getSwapHopsFromJson({
            json: json,
            swapSrcData: swapSrcData,
        }),
        events: getSwapEventsFromJson({
            json: json,
            swapSrcData: swapSrcData,
        }),
        account: json.account,
        estAmount: json.estAmount !== undefined ? BigInt(json.estAmount) : undefined,
        duration: json.duration,
        estDuration: json.estDuration,
        type: json.type,
        status: json.status,
        timestamp: json.timestamp,
    }

    return swap
}

export const getBaseSwapData = ({
    chain,
    chainId,
    blockchainId,
    token,
    tokenId,
    tokenAddress,
    srcChain,
    dstBridgeAddress,
    amount,
}: {
    chain?: Chain,
    chainId?: ChainId,
    blockchainId?: Hash,
    token?: Token,
    tokenId?: TokenId,
    tokenAddress?: Address,
    srcChain?: Chain,
    dstBridgeAddress?: Address,
    amount?: bigint,
}) => {

    let data: BaseSwapData | undefined = undefined

    if (!(chain || chainId || blockchainId) && !(token || tokenId || tokenAddress || (srcChain && dstBridgeAddress))) {
        return data
    }

    let dataChain = chain
    let dataToken = token

    if (!chain) {
        dataChain = chainId ? getChain(chainId) : blockchainId ? getChainByBlockchainId(blockchainId) : undefined
    }

    if (!token && dataChain) {
        dataToken = tokenId ? getToken(tokenId, dataChain) : tokenAddress ? getTokenByAddress(tokenAddress, dataChain) : undefined
        if (!dataToken && srcChain && dstBridgeAddress) {
            const dstTokenId = getTokenByBridgeAddress(dstBridgeAddress, srcChain, dataChain)?.id
            dataToken = dstTokenId ? getToken(dstTokenId, srcChain) : undefined
        }
    }

    if (!dataChain || !dataToken) {
        return data
    }

    data = {
        chain: dataChain,
        token: dataToken,
        amount: amount,
    }

    return data
}

export const getSwapEventPlatformData = (event: SwapEvent) => {

    const platform = getPlatform(event.adapter?.platform)
    const platformName = (event.type === RouteType.Bridge ? event.bridge : platform?.name) || event.adapter?.name || (event.adapterAddress && toShort(event.adapterAddress))

    return {
        platform: platform,
        platformName: platformName,
    }
}