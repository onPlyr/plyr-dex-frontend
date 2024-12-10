import { Address, formatUnits, Hash, parseUnits, toHex, zeroAddress } from "viem"

import { defaultRouteSortType, durationEstimateNumConfirmations, supportedTeleporterMessengerVersion, tmpGasBuffer, tmpHopGasEstimate, tmpRollbackTeleporterFee, tmpSecondaryTeleporterFee, tmpTeleporterFee } from "@/app/config/swaps"
import { ChainBridgeRoutes, DstChainBridgeRoutes, DstTokenBridgeRoutes, TokenBridgeRoutes } from "@/app/config/routes"
import { getDecodedCellTradeData, getEncodedCellRouteData, getSwapCells } from "@/app/lib/cells"
import { getChain } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { getHopGasEstimate, getIsBridgeHop, getIsTradeHop } from "@/app/lib/swaps"
import { getIsTokenOrVariant, getNativeToken, getNativeTokenVariant, getToken, getTokenByAddress, getWrappedTokenVariant } from "@/app/lib/tokens"
import { Cell, CellRouteData, CellTradeParameter } from "@/app/types/cells"
import { Chain } from "@/app/types/chains"
import { BridgePath, BridgeRoute, BridgeType, EncodedRouteQueryResult, EventHistory, Hop, HopAction, HopData, HopHistory, HopQuote, HopQuoteData, Instructions, Route, RouteAction, RouteEvent, RouteQuery, RouteQueryResult, RouteQuote, RouteQuoteData, RouteSortType, RouteType, StepHistory, StepQuote, StepQuoteData, SwapHistory, SwapQueryData, SwapQueryHopData, SwapQueryType } from "@/app/types/swaps"
import { Token, TokenBridgeType } from "@/app/types/tokens"

export const getRouteType = (hopData: HopData[]) => {
    return hopData.some((data) => getIsTradeHop(data.action)) ? RouteType.Swap : RouteType.Bridge
}

export const sortRoutes = (routes?: Route[], sortType?: RouteSortType) => {

    // todo: add value fields to route and uncomment/update the relevant line below as needed
    if (routes === undefined || routes.length <= 1) {
        return routes
    }

    const sortedRoutes = routes.slice(0)
    const sortBy = sortType ?? defaultRouteSortType

    if (sortBy === RouteSortType.Amount) {
        sortedRoutes.sort((a, b) => parseFloat(b.dstAmountFormatted || "0") - parseFloat(a.dstAmountFormatted || "0"))
    }
    else if (sortBy === RouteSortType.Value) {
        // sortedRoutes.sort((a, b) => parseFloat(b.dstAmountValueFormatted || "0") - parseFloat(a.dstAmountValueFormatted || "0"))
    }
    else if (sortBy === RouteSortType.Duration) {
        sortedRoutes.sort((a, b) => b.durationEstimate - a.durationEstimate)
    }

    return sortedRoutes
}

// todo: sort functionality added, now need to allow selecting sort type
export const getSuggestedRoute = (routes?: Route[], sortType?: RouteSortType) => {
    if (routes === undefined || routes.length === 0) {
        return undefined
    }
    return sortRoutes(routes, sortType)?.[0]
}

export const getRouteInstructions = (accountAddress?: Address, route?: Route) => {
    if (accountAddress === undefined || route === undefined) {
        return undefined
    }
    return {
        receiver: accountAddress,
        payableReceiver: route.dstToken.isNative ? true : false,
        rollbackTeleporterFee: tmpRollbackTeleporterFee,
        rollbackGasLimit: tmpHopGasEstimate,
        hops: route.hopData.map((data) => data.hop),
    } as Instructions
}

export const getSwapQuoteTokenAddress = (chain: Chain, token: Token) => {
    return token.isNative && token.wrappedToken ? getWrappedTokenVariant(token, chain)?.address : token.chainId === chain.id ? token.address : getToken(token.id, chain)?.address
}

export const getSwapQuoteTokenAddresses = (srcChain: Chain, srcToken: Token, dstChain: Chain, dstToken: Token) => {
    return {
        srcAddress: getSwapQuoteTokenAddress(srcChain, srcToken),
        dstAddress: getSwapQuoteTokenAddress(dstChain, dstToken),
    }
}

export const getIsHopOnlyRoute = (srcToken: Token, dstToken: Token, bridgeRoute: BridgeRoute) => {
    return getIsTokenOrVariant(srcToken, bridgeRoute.srcToken) && getIsTokenOrVariant(dstToken, bridgeRoute.dstToken) ? true : false
}

export const getIsSourceBridgeNative = (bridgeType: TokenBridgeType) => {
    return bridgeType === TokenBridgeType.NativeHome || bridgeType === TokenBridgeType.NativeRemote
}

export const getChainBridgeRoutes = (chain: Chain, isDstChain?: boolean) => {
    return isDstChain ? DstChainBridgeRoutes[chain.id] : ChainBridgeRoutes[chain.id]
}

export const getTokenBridgeRoutes = (token: Token, isDstToken?: boolean) => {
    return isDstToken ? DstTokenBridgeRoutes[token.id] : TokenBridgeRoutes[token.id]
}

export const getQuoteBridgeRoutes = (srcChain?: Chain, srcToken?: Token, dstChain?: Chain, dstToken?: Token) => {

    const srcBridgeRoutes: BridgeRoute[] = []
    const dstBridgeRoutes: BridgeRoute[] = []

    if (srcChain === undefined || srcToken === undefined || dstChain === undefined || dstToken === undefined) {
        return {
            srcBridgeRoutes,
            dstBridgeRoutes,
        }
    }

    let initialSrcBridgeRoutes = getChainBridgeRoutes(srcChain)
    let initialDstBridgeRoutes = getChainBridgeRoutes(dstChain, true)

    const srcTokenWrapped = srcToken.isNative ? getWrappedTokenVariant(srcToken, srcChain) : undefined
    if (srcToken.isNative && srcTokenWrapped && initialSrcBridgeRoutes.some((route) => route.srcToken.id === srcToken.id)) {
        initialSrcBridgeRoutes = initialSrcBridgeRoutes.filter((route) => route.srcToken.id !== srcTokenWrapped.id)
    }

    const srcTokenNative = srcToken.isNative !== true ? getNativeTokenVariant(srcToken, srcChain) : undefined
    if (srcToken.isNative !== true && srcTokenNative && initialSrcBridgeRoutes.some((route) => route.srcToken.id === srcToken.id)) {
        initialSrcBridgeRoutes = initialSrcBridgeRoutes.filter((route) => route.srcToken.id !== srcTokenNative.id)
    }

    initialSrcBridgeRoutes.forEach((route) => {
        const routeSrcTokenNative = route.srcToken.isNative !== true ? getNativeTokenVariant(route.srcToken, route.srcChain) : undefined
        if (route.srcToken.isNative !== true && routeSrcTokenNative) {
            if (initialSrcBridgeRoutes.some((r) => r.srcToken.id === routeSrcTokenNative.id) !== true) {
                srcBridgeRoutes.push(route)
            }
        }
        else {
            srcBridgeRoutes.push(route)
        }
    })

    const dstTokenWrapped = dstToken.isNative ? getWrappedTokenVariant(dstToken, dstChain) : undefined
    if (dstToken.isNative && dstTokenWrapped && initialDstBridgeRoutes.some((route) => route.dstToken.id === dstToken.id)) {
        initialDstBridgeRoutes = initialDstBridgeRoutes.filter((route) => route.dstToken.id !== dstTokenWrapped.id)
    }

    const dstTokenNative = dstToken.isNative !== true ? getNativeTokenVariant(dstToken, dstChain) : undefined
    if (dstToken.isNative !== true && dstTokenNative && initialDstBridgeRoutes.some((route) => route.dstToken.id === dstToken.id)) {
        initialDstBridgeRoutes = initialDstBridgeRoutes.filter((route) => route.dstToken.id !== dstTokenNative.id)
    }

    initialDstBridgeRoutes.forEach((route) => {
        const routeSrcTokenNative = route.srcToken.isNative !== true ? getNativeTokenVariant(route.srcToken, route.srcChain) : undefined
        if (route.srcToken.isNative !== true && routeSrcTokenNative) {
            if (initialDstBridgeRoutes.some((r) => r.srcToken.id === routeSrcTokenNative.id) !== true) {
                dstBridgeRoutes.push(route)
            }
        }
        else {
            dstBridgeRoutes.push(route)
        }
    })

    return {
        srcBridgeRoutes,
        dstBridgeRoutes,
    }
}

export const getHopOnlyQuoteData = ({
    srcCell,
    dstCell,
    srcAmount,
    bridgeRoute,
}: {
    srcCell: Cell,
    dstCell: Cell,
    srcAmount?: bigint,
    bridgeRoute: BridgeRoute,
}) => {

    const stepQuote: StepQuoteData = {
        srcChainId: bridgeRoute.srcChain.id,
        srcTokenId: bridgeRoute.srcToken.id,
        srcAmount: srcAmount,
        dstChainId: bridgeRoute.dstChain.id,
        dstTokenId: bridgeRoute.dstToken.id,
        dstAmount: srcAmount,
        minDstAmount: srcAmount,
        type: RouteType.Bridge,
    }

    const hopQuote: HopQuoteData = {
        srcChainId: bridgeRoute.srcChain.id,
        srcCellAddress: srcCell.address,
        srcBridgeData: bridgeRoute.srcBridge,
        srcTokenId: bridgeRoute.srcToken.id,
        srcAmount: stepQuote.srcAmount,
        dstChainId: bridgeRoute.dstChain.id,
        dstCellAddress: dstCell.address,
        dstBridgeData: bridgeRoute.dstBridge,
        dstTokenId: bridgeRoute.dstToken.id,
        dstAmount: stepQuote.dstAmount,
        minDstAmount: stepQuote.minDstAmount,
        action: HopAction.Hop,
        steps: [
            stepQuote,
        ],
    }

    return hopQuote
}

export const getSwapAndTransferHopQuoteData = ({
    srcChain,
    srcCell,
    srcToken,
    srcAmount,
    dstChain,
    dstCell,
    dstToken,
}: {
    srcChain: Chain,
    srcCell: Cell,
    srcToken: Token,
    srcAmount?: bigint,
    dstChain: Chain,
    dstCell: Cell,
    dstToken: Token,
}) => {

    const { srcAddress: swapSrcTokenAddress, dstAddress: swapDstTokenAddress } = getSwapQuoteTokenAddresses(srcChain, srcToken, dstChain, dstToken)
    const swapQuote: StepQuoteData = {
        srcChainId: srcChain.id,
        srcTokenId: srcToken.id,
        srcAmount: srcAmount,
        dstChainId: dstChain.id,
        dstTokenId: dstToken.id,
        swapSrcTokenAddress: swapSrcTokenAddress,
        swapDstTokenAddress: swapDstTokenAddress,
        type: RouteType.Swap,
    }

    const swapAndTransferQuote: HopQuoteData = {
        srcChainId: srcChain.id,
        srcCellAddress: srcCell.address,
        srcTokenId: srcToken.id,
        srcAmount: swapQuote.srcAmount,
        dstChainId: dstChain.id,
        dstCellAddress: dstCell.address,
        dstTokenId: dstToken.id,
        action: HopAction.SwapAndTransfer,
        steps: [
            swapQuote,
        ],
    }

    return swapAndTransferQuote
}

export const getHopAndCallHopQuoteData = ({
    srcChain,
    srcCell,
    srcToken,
    srcAmount,
    dstChain,
    dstCell,
    dstToken,
    dstAmount,
    bridgeRoute,
}: {
    srcChain: Chain,
    srcCell: Cell,
    srcToken: Token,
    srcAmount?: bigint,
    dstChain: Chain,
    dstCell: Cell,
    dstToken: Token,
    dstAmount?: bigint,
    bridgeRoute: BridgeRoute,
}) => {

    const bridgeQuote: StepQuoteData = {
        srcChainId: srcChain.id,
        srcTokenId: srcToken.id,
        srcAmount: srcAmount,
        dstChainId: dstChain.id,
        dstTokenId: dstToken.id,
        dstAmount: dstAmount,
        minDstAmount: dstAmount,
        type: RouteType.Bridge,
    }

    const hopAndCallQuote: HopQuoteData = {
        srcChainId: srcChain.id,
        srcCellAddress: srcCell.address,
        srcBridgeData: bridgeRoute.srcBridge,
        srcTokenId: srcToken.id,
        srcAmount: bridgeQuote.srcAmount,
        dstChainId: dstChain.id,
        dstCellAddress: dstCell.address,
        dstBridgeData: bridgeRoute.dstBridge,
        dstTokenId: dstToken.id,
        dstAmount: bridgeQuote.dstAmount,
        minDstAmount: bridgeQuote.minDstAmount,
        action: HopAction.HopAndCall,
        steps: [
            bridgeQuote,
        ],
    }

    return hopAndCallQuote
}

export const getSwapAndHopQuoteData = ({
    srcCell,
    srcToken,
    srcAmount,
    dstCell,
    bridgeRoute,
}: {
    srcCell: Cell,
    srcToken: Token,
    srcAmount?: bigint,
    dstCell: Cell,
    bridgeRoute: BridgeRoute,
}) => {

    const { srcAddress: swapSrcTokenAddress, dstAddress: swapDstTokenAddress } = getSwapQuoteTokenAddresses(bridgeRoute.srcChain, srcToken, bridgeRoute.srcChain, bridgeRoute.srcToken)
    const swapQuote: StepQuoteData = {
        srcChainId: bridgeRoute.srcChain.id,
        srcTokenId: srcToken.id,
        srcAmount: srcAmount,
        dstChainId: bridgeRoute.srcChain.id,
        dstTokenId: bridgeRoute.srcToken.id,
        swapSrcTokenAddress: swapSrcTokenAddress,
        swapDstTokenAddress: swapDstTokenAddress,
        type: RouteType.Swap,
    }

    const bridgeQuote: StepQuoteData = {
        srcChainId: bridgeRoute.srcChain.id,
        srcTokenId: bridgeRoute.srcToken.id,
        srcAmount: swapQuote.dstAmount,
        dstChainId: bridgeRoute.dstChain.id,
        dstTokenId: bridgeRoute.dstToken.id,
        dstAmount: swapQuote.dstAmount,
        minDstAmount: swapQuote.minDstAmount,
        type: RouteType.Bridge,
    }

    const swapAndHopQuote: HopQuoteData = {
        srcChainId: bridgeRoute.srcChain.id,
        srcCellAddress: srcCell.address,
        srcBridgeData: bridgeRoute.srcBridge,
        srcTokenId: srcToken.id,
        srcAmount: swapQuote.srcAmount,
        dstChainId: bridgeRoute.dstChain.id,
        dstCellAddress: dstCell.address,
        dstBridgeData: bridgeRoute.dstBridge,
        dstTokenId: bridgeRoute.dstToken.id,
        dstAmount: bridgeQuote.dstAmount,
        minDstAmount: bridgeQuote.minDstAmount,
        action: HopAction.SwapAndHop,
        steps: [
            swapQuote,
            bridgeQuote,
        ],
    }

    return swapAndHopQuote
}

export const getRouteQuoteData = (srcChain?: Chain, srcToken?: Token, srcAmount?: bigint, dstChain?: Chain, dstToken?: Token) => {

    const routeQuotes: RouteQuoteData[] = []
    const { srcBridgeRoutes, dstBridgeRoutes } = getQuoteBridgeRoutes(srcChain, srcToken, dstChain, dstToken)
    if (srcChain === undefined || srcToken === undefined || srcAmount === undefined || srcAmount === BigInt(0) || dstChain === undefined || dstToken === undefined || srcBridgeRoutes.length === 0 || dstBridgeRoutes.length === 0) {
        return routeQuotes
    }

    const routeDstSwapCells = getSwapCells(dstChain)
    const routeCanSwapDst = routeDstSwapCells.length > 0
    const baseQuoteData = {
        srcChainId: srcChain.id,
        srcTokenId: srcToken.id,
        srcAmount: srcAmount,
        dstChainId: dstChain.id,
        dstTokenId: dstToken.id,
    }

    // same chain swap only, no bridge
    if (routeCanSwapDst && srcChain.id === dstChain.id) {
        routeDstSwapCells.forEach((dstCell) => {
            const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                srcChain: srcChain,
                srcCell: dstCell,
                srcToken: srcToken,
                srcAmount: srcAmount,
                dstChain: dstChain,
                dstCell: dstCell,
                dstToken: dstToken,
            })
            const routeQuote: RouteQuoteData = {
                ...baseQuoteData,
                srcCellAddress: dstCell.address,
                dstCellAddress: dstCell.address,
                dstAmount: swapAndTransferQuote.dstAmount,
                type: RouteType.Swap,
                hops: [
                    swapAndTransferQuote,
                ],
            }
            routeQuotes.push(routeQuote)
        })
    }

    srcBridgeRoutes.forEach((bridgeRoute) => {

        if (dstChain.id === bridgeRoute.dstChain.id) {

            // bridge only, no swap
            if (getIsHopOnlyRoute(srcToken, dstToken, bridgeRoute)) {

                const srcCell = bridgeRoute.srcChain.cells[0]
                const dstCell = bridgeRoute.dstChain.cells[0]

                const hopOnlyQuote = getHopOnlyQuoteData({
                    srcCell: srcCell,
                    dstCell: dstCell,
                    srcAmount: srcAmount,
                    bridgeRoute: bridgeRoute,
                })

                const routeQuote: RouteQuoteData = {
                    ...baseQuoteData,
                    srcCellAddress: srcCell.address,
                    dstCellAddress: dstCell.address,
                    dstAmount: hopOnlyQuote.dstAmount,
                    minDstAmount: hopOnlyQuote.minDstAmount,
                    type: RouteType.Bridge,
                    hops: [
                        hopOnlyQuote,
                    ],
                }
                routeQuotes.push(routeQuote)
            }

            else {

                const srcSwapCells = getSwapCells(bridgeRoute.srcChain)
                const dstSwapCells = getSwapCells(bridgeRoute.dstChain)
                const canSwapSrc = srcSwapCells.length > 0
                const canSwapDst = dstSwapCells.length > 0

                // bridge -> swap
                if (canSwapDst && getIsTokenOrVariant(bridgeRoute.srcToken, srcToken)) {
                    dstSwapCells.forEach((dstCell) => {

                        const hopAndCallQuote = getHopAndCallHopQuoteData({
                            srcChain: srcChain,
                            srcCell: bridgeRoute.srcChain.cells[0],
                            srcToken: srcToken,
                            srcAmount: srcAmount,
                            dstChain: dstChain,
                            dstCell: dstCell,
                            dstToken: bridgeRoute.dstToken,
                            dstAmount: srcAmount,
                            bridgeRoute: bridgeRoute,
                        })

                        const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                            srcChain: dstChain,
                            srcCell: dstCell,
                            srcToken: bridgeRoute.dstToken,
                            srcAmount: hopAndCallQuote.dstAmount,
                            dstChain: dstChain,
                            dstCell: dstCell,
                            dstToken: dstToken,
                        })

                        const routeQuote: RouteQuoteData = {
                            ...baseQuoteData,
                            srcCellAddress: hopAndCallQuote.srcCellAddress,
                            dstCellAddress: swapAndTransferQuote.dstCellAddress,
                            dstAmount: swapAndTransferQuote.dstAmount,
                            type: RouteType.Swap,
                            hops: [
                                hopAndCallQuote,
                                swapAndTransferQuote,
                            ],
                        }
                        routeQuotes.push(routeQuote)
                    })
                }

                // swap -> bridge -> swap again if needed
                else if (canSwapSrc) {

                    const dstSwapRequired = getIsTokenOrVariant(bridgeRoute.dstToken, dstToken) !== true
                    const dstCells = dstSwapRequired ? routeDstSwapCells : [bridgeRoute.dstChain.cells[0]]

                    srcSwapCells.forEach((srcCell) => {
                        dstCells.forEach((dstCell) => {

                            const hopQuotes: HopQuoteData[] = []
                            const swapAndHopQuote = getSwapAndHopQuoteData({
                                srcCell: srcCell,
                                srcToken: srcToken,
                                srcAmount: srcAmount,
                                dstCell: dstCell,
                                bridgeRoute: bridgeRoute,
                            })
                            hopQuotes.push(swapAndHopQuote)

                            if (dstSwapRequired) {
                                const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                                    srcChain: bridgeRoute.dstChain,
                                    srcCell: dstCell,
                                    srcToken: bridgeRoute.dstToken,
                                    srcAmount: swapAndHopQuote.dstAmount,
                                    dstChain: dstChain,
                                    dstCell: dstCell,
                                    dstToken: dstToken,
                                })
                                hopQuotes.push(swapAndTransferQuote)
                            }

                            const finalHop = hopQuotes[hopQuotes.length - 1]
                            const routeQuote: RouteQuoteData = {
                                ...baseQuoteData,
                                srcCellAddress: srcCell.address,
                                dstCellAddress: dstCell.address,
                                dstAmount: finalHop.dstAmount,
                                type: RouteType.Swap,
                                hops: hopQuotes,
                            }
                            routeQuotes.push(routeQuote)
                        })
                    })
                }
            }
        }

        else {

            const dstRoutes = dstBridgeRoutes.filter((dstRoute) => bridgeRoute.dstChain.id === dstRoute.srcChain.id)
            dstRoutes.forEach((dstRoute) => {

                const srcSwapRequired = getIsTokenOrVariant(srcToken, bridgeRoute.srcToken) !== true
                const srcSwapCells = getSwapCells(bridgeRoute.srcChain)
                const srcCells = srcSwapRequired ? srcSwapCells : [srcChain.cells[0]]
                const canSwapSrc = srcSwapCells.length > 0

                const interimSwapRequired = getIsTokenOrVariant(bridgeRoute.dstToken, dstRoute.srcToken) !== true
                const interimSwapCells = getSwapCells(bridgeRoute.dstChain)
                const interimCells = interimSwapRequired ? interimSwapCells : [bridgeRoute.dstChain.cells[0]]
                const canSwapInterim = interimSwapCells.length > 0

                const dstSwapRequired = getIsTokenOrVariant(dstRoute.dstToken, dstToken) !== true
                const dstSwapCells = getSwapCells(dstRoute.dstChain)
                const dstCells = dstSwapRequired ? dstSwapCells : [dstRoute.dstChain.cells[0]]
                const canSwapDst = dstSwapCells.length > 0

                // swap if needed -> bridge -> swap if needed -> bridge -> swap and transfer if needed
                if ((canSwapSrc || srcSwapRequired !== true) && (canSwapInterim || interimSwapRequired !== true) && (canSwapDst || dstSwapRequired !== true)) {
                    srcCells.forEach((srcCell) => {
                        interimCells.forEach((interimCell) => {
                            dstCells.forEach((dstCell) => {

                                const hopQuotes: HopQuoteData[] = []

                                let srcDstAmount: bigint | undefined = undefined
                                let interimDstAmount: bigint | undefined = undefined

                                if (srcSwapRequired) {
                                    const srcSwapAndHopQuote = getSwapAndHopQuoteData({
                                        srcCell: srcCell,
                                        srcToken: srcToken,
                                        srcAmount: srcAmount,
                                        dstCell: interimCell,
                                        bridgeRoute: bridgeRoute,
                                    })
                                    hopQuotes.push(srcSwapAndHopQuote)
                                }
                                else {
                                    const srcHopAndCallQuote = getHopAndCallHopQuoteData({
                                        srcChain: srcChain,
                                        srcCell: srcCell,
                                        srcToken: srcToken,
                                        srcAmount: srcAmount,
                                        dstChain: bridgeRoute.dstChain,
                                        dstCell: interimCell,
                                        dstToken: bridgeRoute.dstToken,
                                        dstAmount: srcAmount,
                                        bridgeRoute: bridgeRoute,
                                    })
                                    hopQuotes.push(srcHopAndCallQuote)
                                    srcDstAmount = srcAmount
                                }

                                if (interimSwapRequired) {
                                    const interimSwapAndHopQuote = getSwapAndHopQuoteData({
                                        srcCell: interimCell,
                                        srcToken: bridgeRoute.dstToken,
                                        srcAmount: srcDstAmount,
                                        dstCell: dstCell,
                                        bridgeRoute: dstRoute,
                                    })
                                    hopQuotes.push(interimSwapAndHopQuote)
                                }
                                else {
                                    const interimHopAndCallQuote = getHopAndCallHopQuoteData({
                                        srcChain: dstRoute.srcChain,
                                        srcCell: interimCell,
                                        srcToken: dstRoute.srcToken,
                                        srcAmount: srcDstAmount,
                                        dstChain: dstRoute.dstChain,
                                        dstCell: dstCell,
                                        dstToken: dstRoute.dstToken,
                                        dstAmount: srcDstAmount,
                                        bridgeRoute: bridgeRoute,
                                    })
                                    hopQuotes.push(interimHopAndCallQuote)
                                    interimDstAmount = srcDstAmount
                                }

                                if (dstSwapRequired) {
                                    const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                                        srcChain: dstRoute.srcChain,
                                        srcCell: dstCell,
                                        srcToken: dstRoute.dstToken,
                                        srcAmount: interimDstAmount,
                                        dstChain: dstChain,
                                        dstCell: dstCell,
                                        dstToken: dstToken,
                                    })
                                    hopQuotes.push(swapAndTransferQuote)
                                }

                                const finalHop = hopQuotes[hopQuotes.length - 1]
                                const routeQuote: RouteQuoteData = {
                                    ...baseQuoteData,
                                    srcCellAddress: srcCell.address,
                                    dstCellAddress: dstCell.address,
                                    dstAmount: finalHop.dstAmount,
                                    type: RouteType.Swap,
                                    hops: hopQuotes,
                                }
                                routeQuotes.push(routeQuote)
                            })
                        })
                    })
                }
            })
        }
    })

    return routeQuotes
}

export const getBaseQuoteData = (data: RouteQuoteData | HopQuoteData | StepQuoteData, getTokenBalanceData: (token?: Token) => Token | undefined) => {
    const srcChain = getChain(data.srcChainId)
    const srcCell = srcChain && "srcCellAddress" in data && data.srcCellAddress ? srcChain.cells.find((cell) => cell.address === data.srcCellAddress) : undefined
    const srcToken = srcChain ? getToken(data.srcTokenId, srcChain) : undefined
    const srcTokenWithBalance = srcToken ? getTokenBalanceData(srcToken) : undefined
    const dstChain = getChain(data.dstChainId)
    const dstCell = dstChain && "dstCellAddress" in data && data.dstCellAddress ? dstChain.cells.find((cell) => cell.address === data.dstCellAddress) : undefined
    const dstToken = dstChain ? getToken(data.dstTokenId, dstChain) : undefined
    const dstTokenWithBalance = dstToken ? getTokenBalanceData(dstToken) : undefined
    return {
        srcChain,
        srcCell,
        srcToken: srcTokenWithBalance ?? srcToken,
        dstChain,
        dstCell,
        dstToken: dstTokenWithBalance ?? dstToken,
    }
}

export const getStepQuote = (data: StepQuoteData, getTokenBalanceData: (token?: Token) => Token | undefined) => {

    const { srcChain, srcToken, dstChain, dstToken } = getBaseQuoteData(data, getTokenBalanceData)
    if (srcChain === undefined || srcToken === undefined || data.srcAmount === undefined || data.srcAmount === BigInt(0) || dstChain === undefined || dstToken === undefined || data.dstAmount === undefined || data.dstAmount === BigInt(0) || data.minDstAmount === undefined || data.minDstAmount === BigInt(0)) {
        return undefined
    }

    const swapSrcToken = data.swapSrcTokenAddress ? getTokenByAddress(data.swapSrcTokenAddress, srcChain) : undefined
    const swapDstToken = data.swapDstTokenAddress ? getTokenByAddress(data.swapDstTokenAddress, srcChain) : undefined
    if (data.type === RouteType.Swap && (swapSrcToken === undefined || swapDstToken === undefined)) {
        return undefined
    }

    const stepQuote: StepQuote = {
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: data.srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
        dstAmount: data.dstAmount,
        minDstAmount: data.minDstAmount,
        swapSrcToken: swapSrcToken,
        swapDstToken: swapDstToken,
        type: data.type,
        data: data,
    }

    return stepQuote
}

export const getHopQuote = (data: HopQuoteData, getTokenBalanceData: (token?: Token) => Token | undefined) => {

    const { srcChain, srcCell, srcToken, dstChain, dstCell, dstToken } = getBaseQuoteData(data, getTokenBalanceData)
    if (srcChain === undefined || srcCell === undefined || srcToken === undefined || data.srcAmount === undefined || data.srcAmount === BigInt(0) || dstChain === undefined || dstCell === undefined || dstToken === undefined || data.steps.length === 0) {
        return undefined
    }
    else if (data.dstAmount === undefined || data.dstAmount === BigInt(0) || data.minDstAmount === undefined || data.minDstAmount === BigInt(0)) {
        return undefined
    }
    else if (getIsBridgeHop(data.action) && (data.srcBridgeData === undefined || data.dstBridgeData === undefined)) {
        return undefined
    }

    const stepQuotes: StepQuote[] = []
    data.steps.forEach((step) => {
        const quote = getStepQuote(step, getTokenBalanceData)
        if (quote) {
            stepQuotes.push(quote)
        }
    })
    if (stepQuotes.length !== data.steps.length) {
        return undefined
    }

    const hopQuote: HopQuote = {
        srcChain: srcChain,
        srcCell: srcCell,
        srcBridge: data.srcBridgeData,
        srcToken: srcToken,
        srcAmount: data.srcAmount,
        dstChain: dstChain,
        dstCell: dstCell,
        dstBridge: data.dstBridgeData,
        dstToken: dstToken,
        dstAmount: data.dstAmount,
        minDstAmount: data.minDstAmount,
        action: data.action,
        steps: stepQuotes,
        data: data,
    }

    return hopQuote
}

export const getRouteEvents = (hops: HopQuote[]) => {

    const events: RouteEvent[] = []
    hops.forEach((hop, hopIdx) => {

        const isSwap = getIsTradeHop(hop.action)
        const isBridge = getIsBridgeHop(hop.action)

        if (isSwap && hop.result !== undefined) {

            const adapterAddresses = hop.result.tradeData.trade[CellTradeParameter.Adapters]
            const tradePath = hop.result.tradeData.trade[CellTradeParameter.Path]
            const amountOut = hop.result.tradeData.trade[CellTradeParameter.AmountOut]

            if (adapterAddresses && tradePath) {
                adapterAddresses.forEach((adapterAddress, i) => {
                    const swapSrcToken = getTokenByAddress(tradePath[i], hop.srcChain)
                    const swapDstToken = getTokenByAddress(tradePath[i + 1], hop.srcChain)
                    const adapter = hop.srcChain.adapters?.[adapterAddress]
                    if (swapSrcToken && swapDstToken) {
                        const swapEvent: RouteEvent = {
                            srcChain: hop.srcChain,
                            srcToken: swapSrcToken,
                            srcAmount: i === 0 ? hop.srcAmount : undefined,
                            dstChain: hop.srcChain,
                            dstToken: swapDstToken,
                            dstAmount: i === adapterAddresses.length - 1 ? amountOut : undefined,
                            hop: hopIdx,
                            type: RouteType.Swap,
                            adapterAddress: adapterAddress,
                            adapter: adapter,
                        }
                        events.push(swapEvent)
                    }
                })
            }
            else {
                const swapDstTokenAddress = hop.result.tradeData.trade[CellTradeParameter.TokenOut]
                const swapDstToken = swapDstTokenAddress ? getTokenByAddress(swapDstTokenAddress, hop.srcChain) : undefined
                if (swapDstToken) {
                    const swapEvent: RouteEvent = {
                        srcChain: hop.srcChain,
                        srcToken: hop.srcToken,
                        srcAmount: hop.srcAmount,
                        dstChain: hop.srcChain,
                        dstToken: swapDstToken,
                        dstAmount: amountOut,
                        hop: hopIdx,
                        type: RouteType.Swap,
                        adapterAddress: hop.srcCell.address,
                        adapter: hop.srcChain.adapters?.[hop.srcCell.address],
                    }
                    events.push(swapEvent)
                }
            }
        }

        if (isBridge && hop.srcBridge !== undefined && hop.dstBridge !== undefined) {
            const bridgeStep = hop.steps.find((step) => step.type === RouteType.Bridge)
            if (bridgeStep) {
                const bridgeSrcAmount = events.length > 0 ? events[events.length - 1].dstAmount : hop.srcAmount
                const bridgeEvent: RouteEvent = {
                    srcChain: bridgeStep.srcChain,
                    srcToken: bridgeStep.srcToken,
                    srcAmount: bridgeSrcAmount,
                    dstChain: bridgeStep.dstChain,
                    dstToken: bridgeStep.dstToken,
                    dstAmount: hop.dstAmount,
                    hop: hopIdx,
                    type: RouteType.Bridge,
                    bridge: BridgeType.ICTT,
                }
                events.push(bridgeEvent)
            }
        }
    })

    return events
}

export const getBridgeQuote = (data: RouteQuoteData, getTokenBalanceData: (token?: Token) => Token | undefined) => {

    if (data.type !== RouteType.Bridge || data.hops.length !== 1 || data.hops.some((hop) => hop.action !== HopAction.Hop || hop.steps.length !== 1 || hop.steps.some((step) => step.type !== RouteType.Bridge)) || data.srcAmount === undefined || data.srcAmount === BigInt(0) || data.dstAmount === undefined || data.dstAmount === BigInt(0) || data.minDstAmount === undefined || data.minDstAmount === BigInt(0)) {
        return undefined
    }

    const hopQuote = getHopQuote(data.hops[0], getTokenBalanceData)
    const { srcChain, srcCell, srcToken, dstChain, dstCell, dstToken } = getBaseQuoteData(data, getTokenBalanceData)
    if (srcChain === undefined || srcCell === undefined || srcToken === undefined || dstChain === undefined || dstCell === undefined || dstToken === undefined || hopQuote === undefined) {
        return undefined
    }

    const hops: HopQuote[] = [
        hopQuote,
    ]
    const events = getRouteEvents(hops)
    const routeQuote: RouteQuote = {
        srcChain: srcChain,
        srcCell: srcCell,
        srcToken: srcToken,
        srcAmount: data.srcAmount,
        dstChain: dstChain,
        dstCell: dstCell,
        dstToken: dstToken,
        dstAmount: data.dstAmount,
        minDstAmount: data.minDstAmount,
        type: data.type,
        hops: hops,
        events: events,
        data: data,
        timestamp: Date.now(),
    }

    return routeQuote
}

export const getSwapQuote = (swapData: SwapQueryData, getTokenBalanceData: (token?: Token) => Token | undefined) => {

    const quoteData = swapData.data
    const { srcChain, srcCell, srcToken, dstChain, dstCell, dstToken } = getBaseQuoteData(quoteData, getTokenBalanceData)
    if (srcChain === undefined || srcCell === undefined || srcToken === undefined || quoteData.srcAmount === undefined || quoteData.srcAmount === BigInt(0) || dstChain === undefined || dstCell === undefined || dstToken === undefined) {
        return undefined
    }

    const primaryHop = swapData.primaryHop.isPrimaryQuery !== true || swapData.primaryHop.result !== undefined ? swapData.primaryHop : undefined
    const secondaryHop = swapData.secondaryHop && ((swapData.secondaryHop.isPrimaryQuery !== true && swapData.secondaryHop.isSecondaryQuery !== true) || swapData.secondaryHop.result !== undefined) ? swapData.secondaryHop : undefined
    const finalHop = swapData.finalHop && ((swapData.finalHop.isPrimaryQuery !== true && swapData.finalHop.isSecondaryQuery !== true && swapData.finalHop.isFinalQuery !== true) || swapData.finalHop.result !== undefined) ? swapData.finalHop : undefined
    if (primaryHop === undefined || (swapData.secondaryHop && secondaryHop === undefined) || (swapData.finalHop && finalHop === undefined)) {
        return undefined
    }

    const primaryHopQuote = getHopQuote(primaryHop.data, getTokenBalanceData)
    const secondaryHopQuote = secondaryHop ? getHopQuote(secondaryHop.data, getTokenBalanceData) : undefined
    const finalHopQuote = finalHop ? getHopQuote(finalHop.data, getTokenBalanceData) : undefined
    if (primaryHopQuote === undefined || (secondaryHop && secondaryHopQuote === undefined) || (finalHop && finalHopQuote === undefined)) {
        return undefined
    }

    primaryHopQuote.result = primaryHop.result
    primaryHopQuote.minAmountResult = primaryHop.minAmountResult
    const hopQuotes: HopQuote[] = [
        primaryHopQuote,
    ]
    if (secondaryHop && secondaryHopQuote) {
        secondaryHopQuote.result = secondaryHop.result
        secondaryHopQuote.minAmountResult = secondaryHop.minAmountResult
        hopQuotes.push(secondaryHopQuote)
    }
    if (finalHop && finalHopQuote) {
        finalHopQuote.result = finalHop.result
        finalHopQuote.minAmountResult = finalHop.minAmountResult
        hopQuotes.push(finalHopQuote)
    }

    quoteData.hops = secondaryHop && finalHop ? [
        primaryHop.data,
        secondaryHop.data,
        finalHop.data,
    ] : secondaryHop ? [
        primaryHop.data,
        secondaryHop.data,
    ] : finalHop ? [
        primaryHop.data,
        finalHop.data,
    ] : [
        primaryHop.data,
    ]

    const dstAmount = quoteData.hops[quoteData.hops.length - 1].dstAmount
    const minDstAmount = quoteData.hops[quoteData.hops.length - 1].minDstAmount
    if (dstAmount === undefined || dstAmount === BigInt(0) || minDstAmount === undefined || minDstAmount === BigInt(0)) {
        return undefined
    }

    quoteData.dstAmount = dstAmount
    quoteData.minDstAmount = minDstAmount
    const events = getRouteEvents(hopQuotes)
    const routeQuote: RouteQuote = {
        srcChain: srcChain,
        srcCell: srcCell,
        srcToken: srcToken,
        srcAmount: quoteData.srcAmount,
        dstChain: dstChain,
        dstCell: dstCell,
        dstToken: dstToken,
        dstAmount: dstAmount,
        minDstAmount: minDstAmount,
        type: quoteData.type,
        hops: hopQuotes,
        events: events,
        data: quoteData,
        timestamp: Date.now(),
    }

    return routeQuote
}

export const getSwapQueryData = (quoteData: RouteQuoteData[]) => {

    const swapQueryData: SwapQueryData[] = []

    quoteData.forEach((data) => {

        if (data.type !== RouteType.Swap) {
            return
        }

        const primaryQuoteData = data.hops[0]
        const primaryIsSwap = getIsTradeHop(primaryQuoteData.action)
        const primaryHopData: SwapQueryHopData = {
            data: primaryQuoteData,
            isPrimaryQuery: primaryIsSwap,
        }

        const secondaryQuoteData = data.hops.length === 3 ? data.hops[1] : undefined
        const secondaryIsSwap = secondaryQuoteData ? getIsTradeHop(secondaryQuoteData.action) : false
        const secondaryIsPrimaryQuery = primaryIsSwap !== true && secondaryIsSwap
        const secondaryHopData = secondaryQuoteData ? {
            data: secondaryQuoteData,
            isPrimaryQuery: secondaryIsPrimaryQuery,
            isSecondaryQuery: primaryIsSwap && secondaryIsSwap,
        } as SwapQueryHopData : undefined

        const finalQuoteData = data.hops.length > 1 ? data.hops[data.hops.length - 1] : undefined
        const finalIsSwap = finalQuoteData ? getIsTradeHop(finalQuoteData.action) : false
        const finalIsPrimaryQuery = primaryIsSwap !== true && secondaryIsSwap !== true && finalIsSwap
        const finalHopData = finalQuoteData ? {
            data: finalQuoteData,
            isPrimaryQuery: finalIsPrimaryQuery,
            isSecondaryQuery: (primaryIsSwap || secondaryIsSwap) && finalIsSwap,
            isFinalQuery: primaryIsSwap && secondaryIsSwap && finalIsSwap,
        } as SwapQueryHopData : undefined

        const queryData: SwapQueryData = {
            data: data,
            primaryHop: primaryHopData,
            secondaryHop: secondaryHopData,
            finalHop: finalHopData,
        }

        swapQueryData.push(queryData)
    })

    return swapQueryData
}

export const getSwapQuery = (data: HopQuoteData, cellRouteData?: CellRouteData, useSlippage?: boolean) => {

    const swapData = data.steps.find((step) => step.type === RouteType.Swap)
    if (getIsTradeHop(data.action) !== true || swapData === undefined || swapData.swapSrcTokenAddress === undefined || swapData.swapDstTokenAddress === undefined || swapData.srcAmount === undefined || swapData.srcAmount === BigInt(0)) {
        return undefined
    }

    const swapChain = getChain(swapData.srcChainId)
    const swapCell = swapChain?.cells.find((cell) => cell.address === data.srcCellAddress && cell.canSwap)
    const encodedRouteData = swapChain && swapCell ? getEncodedCellRouteData(swapChain, swapCell, cellRouteData, useSlippage) : undefined
    if (swapChain === undefined || swapCell === undefined || encodedRouteData === undefined) {
        return undefined
    }

    const query: RouteQuery = {
        chainId: swapChain.id,
        address: swapCell.address,
        abi: swapCell.abi,
        functionName: "route",
        args: [swapData.srcAmount, swapData.swapSrcTokenAddress, swapData.swapDstTokenAddress, encodedRouteData],
    }

    return query
}

export const getSwapQueryResultData = ({
    queryData,
    queryType,
    queryCell,
    encodedResult,
    encodedMinAmountResult,
    cellRouteData,
}: {
    queryData: SwapQueryData,
    queryType: SwapQueryType,
    queryCell?: Cell,
    encodedResult?: EncodedRouteQueryResult,
    encodedMinAmountResult?: EncodedRouteQueryResult,
    cellRouteData?: CellRouteData,
}) => {

    let hopData: SwapQueryHopData | undefined = undefined
    let nextHopData: SwapQueryHopData | undefined = undefined
    let isNextQuery = false
    let nextQuery: RouteQuery | undefined = undefined
    let nextMinAmountQuery: RouteQuery | undefined = undefined
    let isError = false

    if (queryType === SwapQueryType.Primary) {
        if (queryData.primaryHop.isPrimaryQuery) {
            hopData = queryData.primaryHop
            nextHopData = queryData.secondaryHop ?? queryData.finalHop
            isNextQuery = nextHopData?.isSecondaryQuery === true || queryData.finalHop?.isSecondaryQuery === true
        }
        else if (queryData.secondaryHop?.isPrimaryQuery) {
            hopData = queryData.secondaryHop
            nextHopData = queryData.finalHop
            isNextQuery = nextHopData?.isSecondaryQuery === true
        }
        else if (queryData.finalHop?.isPrimaryQuery) {
            hopData = queryData.finalHop
        }
    }
    else if (queryType === SwapQueryType.Secondary) {
        if (queryData.secondaryHop?.isSecondaryQuery) {
            hopData = queryData.secondaryHop
            nextHopData = queryData.finalHop
            isNextQuery = nextHopData?.isFinalQuery === true
        }
        else if (queryData.finalHop?.isSecondaryQuery) {
            hopData = queryData.finalHop
        }
    }
    else if (queryType === SwapQueryType.Final && queryData.finalHop?.isFinalQuery) {
        hopData = queryData.finalHop
    }

    if (hopData === undefined || queryCell === undefined || encodedResult === undefined || encodedMinAmountResult === undefined) {
        isError = true
    }
    else {

        const [encodedTradeData, estimatedGasFee] = encodedResult

        const tradeData = getDecodedCellTradeData(queryCell, encodedTradeData)

        const [encodedMinAmountTradeData, estimatedMinAmountGasFee] = encodedMinAmountResult
        const minAmountTradeData = getDecodedCellTradeData(queryCell, encodedMinAmountTradeData)

        if (tradeData === undefined || minAmountTradeData === undefined) {
            isError = true
        }
        else {

            const tradeDstAmount = tradeData.trade[CellTradeParameter.AmountOut]
            const result: RouteQueryResult = {
                tradeData: tradeData,
                estimatedGasFee: BigInt(estimatedGasFee),
                encodedTradeData: encodedTradeData,
            }

            hopData.result = result
            hopData.data.dstAmount = tradeDstAmount

            const minTradeDstAmount = minAmountTradeData.trade[CellTradeParameter.AmountOut]
            const minAmountResult: RouteQueryResult = {
                tradeData: minAmountTradeData,
                estimatedGasFee: estimatedMinAmountGasFee,
                encodedTradeData: encodedMinAmountTradeData,
            }
            hopData.minAmountResult = minAmountResult
            hopData.data.minDstAmount = minTradeDstAmount

            const swapStepIndex = hopData.data.steps.findIndex((step) => step.type === RouteType.Swap)
            if (swapStepIndex !== -1) {
                hopData.data.steps[swapStepIndex].dstAmount = tradeDstAmount
                hopData.data.steps[swapStepIndex].minDstAmount = minTradeDstAmount
                if (hopData.data.steps.length > swapStepIndex + 1) {
                    hopData.data.steps[swapStepIndex + 1].srcAmount = tradeDstAmount
                    if (hopData.data.steps[swapStepIndex + 1].type === RouteType.Bridge) {
                        hopData.data.steps[swapStepIndex + 1].dstAmount = tradeDstAmount
                        hopData.data.steps[swapStepIndex + 1].minDstAmount = minTradeDstAmount
                    }
                }
            }

            if (nextHopData) {
                nextHopData.data.srcAmount = tradeDstAmount
                nextHopData.data.steps[0].srcAmount = tradeDstAmount
                if (isNextQuery) {
                    nextQuery = getSwapQuery(nextHopData.data, cellRouteData)
                    const nextHopMinAmountData: SwapQueryHopData = {
                        ...nextHopData,
                    }
                    nextHopMinAmountData.data.srcAmount = minTradeDstAmount
                    nextHopMinAmountData.data.steps[0].srcAmount = minTradeDstAmount
                    nextMinAmountQuery = getSwapQuery(nextHopMinAmountData.data, cellRouteData)
                }
            }
        }
    }

    return {
        hopData,
        nextHopData,
        isNextQuery,
        nextQuery,
        nextMinAmountQuery,
        isError,
    }
}

export const getRouteData = (quote: RouteQuote) => {

    const routeHopData: HopData[] = []
    const routeActions: RouteAction[] = []

    let actionOrder = 1

    quote.hops.forEach((data) => {

        const isSwap = getIsTradeHop(data.action)
        const isBridge = getIsBridgeHop(data.action)
        // const bridgeStep = data.steps.find((step) => step.type === RouteType.Bridge) ?? data.steps[data.steps.length - 1]



        const gasEstimate = getHopGasEstimate(data.action, data.result?.estimatedGasFee || tmpHopGasEstimate)
        const recipientGasLimit = gasEstimate + tmpGasBuffer
        const totalGasLimit = recipientGasLimit + (data.action === HopAction.SwapAndTransfer ? BigInt(0) : tmpHopGasEstimate)

        if (data.srcAmount === undefined || data.srcAmount === BigInt(0) || data.dstAmount === undefined || data.dstAmount === BigInt(0) || (isBridge && (data.srcBridge === undefined || data.dstBridge === undefined)) || (isSwap && data.minAmountResult === undefined)) {
            return
        }

        const bridgePath: BridgePath = {
            bridgeSourceChain: data.srcBridge?.address ?? zeroAddress,
            sourceBridgeIsNative: data.srcBridge && getIsSourceBridgeNative(data.srcBridge.type) ? true : false,
            bridgeDestinationChain: data.dstBridge?.address ?? zeroAddress,
            cellDestinationChain: data.dstCell.address,
            destinationBlockchainID: data.dstChain.blockchainId,
            teleporterFee: tmpTeleporterFee,
            secondaryTeleporterFee: tmpSecondaryTeleporterFee,
        }

        const hop: Hop = {
            action: data.action,
            requiredGasLimit: totalGasLimit,
            recipientGasLimit: recipientGasLimit,
            trade: isSwap && data.minAmountResult ? data.minAmountResult.encodedTradeData : toHex(""),
            bridgePath: bridgePath,
        }

        const hopData: HopData = {
            action: data.action,
            srcChain: data.srcChain,
            srcToken: data.srcToken,
            srcAmount: data.srcAmount,
            dstChain: data.dstChain,
            dstToken: data.dstToken,
            dstAmount: data.dstAmount,
            hop: hop,
            tradeData: isSwap && data.minAmountResult ? data.minAmountResult.tradeData : undefined,
            gasEstimate: gasEstimate,
        }
        routeHopData.push(hopData)

        if (isSwap && data.result) {

            const adapterAddresses = data.result.tradeData.trade[CellTradeParameter.Adapters]
            const tradePath = data.result.tradeData.trade[CellTradeParameter.Path]

            if (adapterAddresses && tradePath) {
                adapterAddresses.forEach((adapterAddress, i) => {
                    const swapSrcToken = getTokenByAddress(tradePath[i], data.srcChain)
                    const swapDstToken = getTokenByAddress(tradePath[i + 1], data.srcChain)
                    const adapter = data.srcChain.adapters?.[adapterAddress]
                    if (swapSrcToken && swapDstToken) {
                        const swapAction: RouteAction = {
                            srcChain: data.srcChain,
                            srcToken: swapSrcToken,
                            srcAmount: data.srcAmount!,
                            srcAmountFormatted: formatUnits(data.srcAmount!, swapSrcToken.decimals),
                            dstChain: data.srcChain,
                            dstToken: swapDstToken,
                            dstAmount: data.dstAmount!,
                            dstAmountFormatted: formatUnits(data.dstAmount!, swapDstToken.decimals),
                            type: RouteType.Swap,
                            order: actionOrder++,
                            swapAdapter: adapter?.platform || toShort(adapterAddress),
                        }
                        routeActions.push(swapAction)
                    }
                })
            }
            else {

                // todo: univ2 data
                const swapAction: RouteAction = {
                    srcChain: data.srcChain,
                    srcToken: data.srcToken,
                    srcAmount: data.srcAmount!,
                    srcAmountFormatted: formatUnits(data.srcAmount!, data.srcToken.decimals),
                    dstChain: data.srcChain,
                    dstToken: data.dstToken,
                    dstAmount: data.dstAmount!,
                    dstAmountFormatted: formatUnits(data.dstAmount!, data.dstToken.decimals),
                    type: RouteType.Swap,
                    order: actionOrder++,
                    swapAdapter: "uniswap",
                }
                routeActions.push(swapAction)
            }
        }

        if (isBridge) {
            const bridgeStep = data.steps.find((step) => step.type === RouteType.Bridge)
            if (bridgeStep) {
                const bridgeAction: RouteAction = {
                    srcChain: bridgeStep.srcChain,
                    srcToken: bridgeStep.srcToken,
                    srcAmount: data.srcAmount,
                    srcAmountFormatted: formatUnits(data.srcAmount, bridgeStep.srcToken.decimals),
                    dstChain: bridgeStep.dstChain,
                    dstToken: bridgeStep.dstToken,
                    dstAmount: data.dstAmount,
                    dstAmountFormatted: formatUnits(data.dstAmount, bridgeStep.dstToken.decimals),
                    type: RouteType.Bridge,
                    order: actionOrder++,
                    bridgeType: BridgeType.ICTT,
                }
                routeActions.push(bridgeAction)
            }
        }
    })

    if (routeHopData.length === 0 || routeActions.length === 0) {
        return undefined
    }

    const routeDstAmount = routeHopData[routeHopData.length - 1].dstAmount
    const totalGasEstimate = routeHopData.reduce((sum, hop) => sum + hop.gasEstimate, BigInt(0))


    const totalGasCostFormatted = formatUnits(totalGasEstimate * quote.srcChain.minGasPrice, quote.srcChain.gasPriceExponent)
    const gasToken = getNativeToken(quote.srcChain)
    const durationEstimate = routeHopData.reduce((sum, hop) => sum + (hop.srcChain.avgBlockTimeMs * durationEstimateNumConfirmations), 0) + (quote.dstChain.avgBlockTimeMs * durationEstimateNumConfirmations)
    const routeType = getRouteType(routeHopData)

    const route: Route = {
        quote: quote,
        srcChain: quote.srcChain,
        srcCell: quote.srcCell,
        srcToken: quote.srcToken,
        srcAmount: quote.srcAmount,
        srcAmountFormatted: formatUnits(quote.srcAmount, quote.srcToken.decimals),
        dstChain: quote.dstChain,
        dstCell: quote.dstCell,
        dstToken: quote.dstToken,
        dstAmount: routeDstAmount,
        dstAmountFormatted: formatUnits(routeDstAmount, quote.dstToken.decimals),
        minDstAmountFormatted: formatUnits(quote.minDstAmount, quote.dstToken.decimals),
        type: routeType,
        hopData: routeHopData,
        actions: routeActions,
        totalGasEstimate: totalGasEstimate,
        totalGasEstimateFormatted: formatUnits(totalGasEstimate, quote.srcChain.gasPriceExponent),
        totalGasCost: parseUnits(totalGasCostFormatted, gasToken?.decimals || 18),
        totalGasCostFormatted: totalGasCostFormatted,
        durationEstimate: durationEstimate,
    }

    return route
}

export const getPendingSwapHistory = (quote?: RouteQuote, txid?: Hash) => {

    if (quote === undefined || txid === undefined) {
        return undefined
    }

    const hopData: HopHistory[] = []

    for (const hop of quote.hops) {

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

        const hopHistory: HopHistory = {
            srcChainId: hop.srcChain.id,
            srcBlockStart: "",
            srcTokenId: hop.srcToken.id,
            srcAmount: hop.srcAmount.toString(),
            dstChainId: hop.dstChain.id,
            dstBlockStart: "",
            dstTokenId: hop.dstToken.id,
            dstAmountEstimated: hop.dstAmount.toString(),
            action: hop.action,
            steps: stepHistory,
            status: "pending",
        }
        hopData.push(hopHistory)
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

    const history: SwapHistory = {
        id: txid,
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
        status: "pending",
        timestamp: Date.now(),
    }

    return history
}
