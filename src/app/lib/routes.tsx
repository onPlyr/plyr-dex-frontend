import { Address, formatUnits, isAddressEqual, parseUnits, toHex, zeroAddress } from "viem"

import { defaultRouteSortType, durationEstimateNumConfirmations, tmpGasBuffer, tmpHopGasEstimate, tmpRollbackTeleporterFee, tmpSecondaryTeleporterFee, tmpTeleporterFee } from "@/app/config/swaps"
import { getChainCanSwap, getDecodedCellTradeData, getEncodedCellRouteData, getSwapCells } from "@/app/lib/cells"
import { getChain } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { getHopGasEstimate, getIsBridgeHop, getIsTradeHop } from "@/app/lib/swaps"
import { getChainTokens, getNativeToken, getToken, getTokenByAddress, getTokens } from "@/app/lib/tokens"
import { Cell, CellRouteData, CellTradeParameter } from "@/app/types/cells"
import { Chain, ChainId } from "@/app/types/chains"
import {
    BridgePath, BridgeRoute, BridgeRouteData, BridgeType, EncodedRouteQueryResult, Hop, HopAction, HopData, HopQuote, HopQuoteData, Instructions,
    Route, RouteAction, RouteEvent, RouteQuery, RouteQueryResult, RouteQuote, RouteQuoteData, RouteSortType, RouteType, StepQuote, StepQuoteData, SwapQueryData, SwapQueryHopData, SwapQueryType,
} from "@/app/types/swaps"
import { Token, TokenBridgeType, TokenId } from "@/app/types/tokens"

export const getRouteType = (hopData: HopData[]) => {
    return hopData.some((data) => getIsTradeHop(data.action)) ? RouteType.Swap : RouteType.Bridge
}

export const sortRoutes = (routes?: Route[], sortType?: RouteSortType) => {

    // todo: add value fields to route and uncomment/update the relevant line below as needed
    if (!routes || routes.length === 0) {
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
    if (!routes || routes.length === 0) {
        return undefined
    }
    return sortRoutes(routes, sortType)?.[0]
}

export const getRouteInstructions = (accountAddress?: Address, route?: Route) => {
    if (!accountAddress || !route) {
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
    // return token.isNative && token.wrappedToken ? getWrappedTokenVariant(token, chain)?.address : token.chainId === chain.id ? token.address : getToken(token.id, chain)?.address
    const swapQuoteToken = chain.id === token.chainId ? token : getToken(token.id, chain)
    return swapQuoteToken?.isNative ? swapQuoteToken.wrappedAddress : swapQuoteToken?.address
}

export const getSwapQuoteTokenAddresses = (srcChain: Chain, srcToken: Token, dstChain: Chain, dstToken: Token) => {
    return {
        srcAddress: getSwapQuoteTokenAddress(srcChain, srcToken),
        dstAddress: getSwapQuoteTokenAddress(dstChain, dstToken),
    }
}

export const getIsHopOnlyRoute = (srcToken: Token, dstToken: Token, bridgeRoute: BridgeRoute) => {
    // return getIsTokenOrVariant(srcToken, bridgeRoute.srcToken) && getIsTokenOrVariant(dstToken, bridgeRoute.dstToken) ? true : false
    return srcToken.id === bridgeRoute.srcToken.id && dstToken.id === bridgeRoute.dstToken.id
}

export const getIsSourceBridgeNative = (bridgeType: TokenBridgeType) => {
    return bridgeType === TokenBridgeType.NativeHome || bridgeType === TokenBridgeType.NativeRemote
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

////////////////////////////////////////////////////////////////////////////////
// todo: test the below to ensure working and remove previous bridge route functionality, types, config, etc.

export const getBridgeRoutes = (srcChain?: Chain, srcToken?: Token, dstChain?: Chain, dstToken?: Token) => {

    // const bridgeRoutes: BridgeRoute[][] = []
    const bridgeRoutes: BridgeRouteData[] = []
    if (!srcChain || !srcToken || !dstChain || !dstToken) {
        return bridgeRoutes
    }

    const srcChainCanSwap = getChainCanSwap(srcChain)
    const dstChainCanSwap = getChainCanSwap(dstChain)

    const srcChainBridgeTokens = getChainTokens({
        chain: srcChain,
        ignoreSort: true,
    }).filter((token) => token.bridges && (srcChainCanSwap || token.id === srcToken.id))

    const interimChainBridgeTokens = getTokens({
        ignoreSort: true,
    }).filter((token) => token.bridges && token.chainId !== srcChain.id && token.chainId !== dstChain.id)

    const dstChainBridgeTokens = getChainTokens({
        chain: dstChain,
        ignoreSort: true,
    }).filter((token) => token.bridges && (dstChainCanSwap || token.id === dstToken.id))

    for (const srcBridgeToken of srcChainBridgeTokens) {

        for (const [bridgeDstChainId, srcBridgeData] of Object.entries(srcBridgeToken.bridges!)) {

            const bridgeDstChain = getChain(parseInt(bridgeDstChainId))
            if (!bridgeDstChain) {
                continue
            }

            if (bridgeDstChain.id === dstChain.id) {

                const dstBridgeToken = dstChainBridgeTokens.find((token) => token.id === srcBridgeToken.id && srcBridgeToken.bridges?.[token.chainId])
                const dstBridgeData = dstBridgeToken?.bridges?.[srcChain.id]
                if (!dstBridgeToken || !dstBridgeData) {
                    continue
                }

                const srcRoute: BridgeRoute = {
                    srcChain: srcChain,
                    srcToken: srcBridgeToken,
                    srcBridge: srcBridgeData,
                    dstChain: dstChain,
                    dstToken: dstBridgeToken,
                    dstBridge: dstBridgeData,
                }

                bridgeRoutes.push({
                    srcRoute: srcRoute,
                })
            }

            else {

                const srcToInterimBridgeToken = interimChainBridgeTokens.find((token) => token.id === srcBridgeToken.id && token.chainId === bridgeDstChain.id && srcBridgeToken.bridges?.[token.chainId])
                const srcToInterimBridgeData = srcToInterimBridgeToken?.bridges?.[srcChain.id]
                const interimToDstChainBridgeTokens = interimChainBridgeTokens.filter((token) => token.chainId === bridgeDstChain.id && token.bridges?.[dstChain.id])
                if (!srcToInterimBridgeToken || !srcToInterimBridgeData || interimToDstChainBridgeTokens.length === 0) {
                    continue
                }

                for (const interimToDstBridgeToken of interimToDstChainBridgeTokens) {

                    const interimToDstBridgeData = interimToDstBridgeToken.bridges?.[dstChain.id]
                    const dstBridgeToken = dstChainBridgeTokens.find((token) => token.id === interimToDstBridgeToken.id && token.bridges?.[interimToDstBridgeToken.chainId])
                    const dstBridgeData = dstBridgeToken?.bridges?.[interimToDstBridgeToken.chainId]
                    if (!interimToDstBridgeData || !dstBridgeToken || !dstBridgeData || (dstBridgeToken.chainId === srcChain.id && srcToInterimBridgeToken.id === interimToDstBridgeToken.id)) {
                        continue
                    }

                    const srcRoute: BridgeRoute = {
                        srcChain: srcChain,
                        srcToken: srcBridgeToken,
                        srcBridge: srcBridgeData,
                        dstChain: bridgeDstChain,
                        dstToken: srcToInterimBridgeToken,
                        dstBridge: srcToInterimBridgeData,
                    }

                    const dstRoute: BridgeRoute = {
                        srcChain: bridgeDstChain,
                        srcToken: interimToDstBridgeToken,
                        srcBridge: interimToDstBridgeData,
                        dstChain: dstChain,
                        dstToken: dstBridgeToken,
                        dstBridge: dstBridgeData,
                    }

                    bridgeRoutes.push({
                        srcRoute: srcRoute,
                        dstRoute: dstRoute,
                    })
                }
            }
        }
    }

    return bridgeRoutes
}

export const getQuoteData = (srcChain?: Chain, srcToken?: Token, srcAmount?: bigint, dstChain?: Chain, dstToken?: Token) => {

    const quotes: RouteQuoteData[] = []
    const bridgeRoutes = getBridgeRoutes(srcChain, srcToken, dstChain, dstToken)
    if (!srcChain || !srcToken || !dstChain || !dstToken || !srcAmount || bridgeRoutes.length === 0) {
        return quotes
    }

    const srcChainCanSwap = getChainCanSwap(srcChain)
    const srcChainSwapCells = srcChainCanSwap ? getSwapCells(srcChain) : []
    const srcCellDefault = srcChain.cells[0]

    const dstChainCanSwap = getChainCanSwap(dstChain)
    const dstChainSwapCells = dstChainCanSwap ? getSwapCells(dstChain) : []
    const dstCellDefault = dstChain.cells[0]

    const baseQuoteData = {
        srcChainId: srcChain.id,
        srcTokenId: srcToken.id,
        srcAmount: srcAmount,
        dstChainId: dstChain.id,
        dstTokenId: dstToken.id,
    }

    if (srcChain.id === dstChain.id && srcChainCanSwap) {
        for (const srcCell of srcChainSwapCells) {
            const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                srcChain: srcChain,
                srcCell: srcCell,
                srcToken: srcToken,
                srcAmount: srcAmount,
                dstChain: dstChain,
                dstCell: srcCell,
                dstToken: dstToken,
            })
            const quoteData: RouteQuoteData = {
                ...baseQuoteData,
                srcCellAddress: srcCell.address,
                dstCellAddress: srcCell.address,
                dstAmount: swapAndTransferQuote.dstAmount,
                type: RouteType.Swap,
                hops: [
                    swapAndTransferQuote,
                ],
            }
            quotes.push(quoteData)
        }
    }

    for (const { srcRoute, dstRoute } of bridgeRoutes) {

        if (!dstRoute) {

            const isSrcSwap = srcToken.id !== srcRoute.srcToken.id
            const isDstSwap = dstToken.id !== srcRoute.dstToken.id
            if ((isSrcSwap && !srcChainCanSwap) || (isDstSwap && !dstChainCanSwap)) {
                continue
            }

            const srcCells = isSrcSwap ? srcChainSwapCells : [srcCellDefault]
            const dstCells = isDstSwap ? dstChainSwapCells : [dstCellDefault]

            if (isSrcSwap || isDstSwap) {

                for (const srcCell of srcCells) {
                    for (const dstCell of dstCells) {

                        const hopQuotes: HopQuoteData[] = []

                        if (isSrcSwap) {
                            const swapAndHopQuote = getSwapAndHopQuoteData({
                                srcCell: srcCell,
                                srcToken: srcToken,
                                srcAmount: srcAmount,
                                dstCell: dstCell,
                                bridgeRoute: srcRoute,
                            })
                            hopQuotes.push(swapAndHopQuote)
                        }
                        else {
                            const hopAndCallQuote = getHopAndCallHopQuoteData({
                                srcChain: srcChain,
                                srcCell: srcCell,
                                srcToken: srcToken,
                                srcAmount: srcAmount,
                                dstChain: dstChain,
                                dstCell: dstCell,
                                dstToken: srcRoute.dstToken,
                                dstAmount: srcAmount,
                                bridgeRoute: srcRoute,
                            })
                            hopQuotes.push(hopAndCallQuote)
                        }

                        if (isDstSwap) {
                            const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                                srcChain: dstChain,
                                srcCell: dstCell,
                                srcToken: srcRoute.dstToken,
                                srcAmount: hopQuotes[0].dstAmount,
                                dstChain: dstChain,
                                dstCell: dstCell,
                                dstToken: dstToken,
                            })
                            hopQuotes.push(swapAndTransferQuote)
                        }

                        const quoteData: RouteQuoteData = {
                            ...baseQuoteData,
                            srcCellAddress: srcCell.address,
                            dstCellAddress: dstCell.address,
                            dstAmount: hopQuotes[hopQuotes.length - 1].dstAmount,
                            type: RouteType.Swap,
                            hops: hopQuotes,
                        }
                        quotes.push(quoteData)
                    }
                }
            }

            else {

                const hopOnlyQuote = getHopOnlyQuoteData({
                    srcCell: srcCellDefault,
                    dstCell: dstCellDefault,
                    srcAmount: srcAmount,
                    bridgeRoute: srcRoute,
                })

                const quoteData: RouteQuoteData = {
                    ...baseQuoteData,
                    srcCellAddress: srcCellDefault.address,
                    dstCellAddress: dstCellDefault.address,
                    dstAmount: hopOnlyQuote.dstAmount,
                    minDstAmount: hopOnlyQuote.minDstAmount,
                    type: RouteType.Bridge,
                    hops: [
                        hopOnlyQuote,
                    ],
                }
                quotes.push(quoteData)
            }
        }

        else {

            const interimChain = srcRoute.dstChain
            const interimChainCanSwap = getChainCanSwap(interimChain)
            const interimChainSwapCells = interimChainCanSwap ? getSwapCells(interimChain) : []
            const interimCellDefault = interimChain.cells[0]

            const isSrcSwap = srcToken.id !== srcRoute.srcToken.id
            const isInterimSwap = srcRoute.dstToken.id !== dstRoute.srcToken.id
            const isDstSwap = dstToken.id !== dstRoute.dstToken.id
            if ((isSrcSwap && !srcChainCanSwap) || (isInterimSwap && !interimChainCanSwap) || (isDstSwap && !dstChainCanSwap)) {
                continue
            }

            const srcCells = isSrcSwap ? srcChainSwapCells : [srcCellDefault]
            const interimCells = isInterimSwap ? interimChainSwapCells : [interimCellDefault]
            const dstCells = isDstSwap ? dstChainSwapCells : [dstCellDefault]

            for (const srcCell of srcCells) {
                for (const interimCell of interimCells) {
                    for (const dstCell of dstCells) {

                        const hopQuotes: HopQuoteData[] = []

                        if (isSrcSwap) {
                            const swapAndHopQuote = getSwapAndHopQuoteData({
                                srcCell: srcCell,
                                srcToken: srcToken,
                                srcAmount: srcAmount,
                                dstCell: interimCell,
                                bridgeRoute: srcRoute,
                            })
                            hopQuotes.push(swapAndHopQuote)
                        }
                        else {
                            const hopAndCallQuote = getHopAndCallHopQuoteData({
                                srcChain: srcChain,
                                srcCell: srcCell,
                                srcToken: srcToken,
                                srcAmount: srcAmount,
                                dstChain: interimChain,
                                dstCell: interimCell,
                                dstToken: srcRoute.dstToken,
                                dstAmount: srcAmount,
                                bridgeRoute: srcRoute,
                            })
                            hopQuotes.push(hopAndCallQuote)
                        }

                        if (isInterimSwap) {
                            const swapAndHopQuote = getSwapAndHopQuoteData({
                                srcCell: interimCell,
                                srcToken: srcRoute.dstToken,
                                srcAmount: hopQuotes[0].dstAmount,
                                dstCell: dstCell,
                                bridgeRoute: dstRoute,
                            })
                            hopQuotes.push(swapAndHopQuote)
                        }
                        else {
                            const hopAndCallQuote = getHopAndCallHopQuoteData({
                                srcChain: interimChain,
                                srcCell: interimCell,
                                srcToken: dstRoute.srcToken,
                                srcAmount: hopQuotes[0].dstAmount,
                                dstChain: dstChain,
                                dstCell: dstCell,
                                dstToken: dstRoute.dstToken,
                                dstAmount: hopQuotes[0].dstAmount,
                                bridgeRoute: dstRoute,
                            })
                            hopQuotes.push(hopAndCallQuote)
                        }

                        if (isDstSwap) {
                            const swapAndTransferQuote = getSwapAndTransferHopQuoteData({
                                srcChain: dstChain,
                                srcCell: dstCell,
                                srcToken: dstRoute.dstToken,
                                srcAmount: hopQuotes[1].dstAmount,
                                dstChain: dstChain,
                                dstCell: dstCell,
                                dstToken: dstToken,
                            })
                            hopQuotes.push(swapAndTransferQuote)
                        }

                        const quoteData: RouteQuoteData = {
                            ...baseQuoteData,
                            srcCellAddress: srcCell.address,
                            dstCellAddress: dstCell.address,
                            dstAmount: hopQuotes[hopQuotes.length - 1].dstAmount,
                            type: RouteType.Swap,
                            hops: hopQuotes,
                        }
                        quotes.push(quoteData)
                    }
                }
            }
        }
    }

    return quotes
}

export const getBaseQuoteData = (data: RouteQuoteData | HopQuoteData | StepQuoteData, getTokenBalanceData: (tokenId?: TokenId, chainId?: ChainId) => Token | undefined) => {
    const srcChain = getChain(data.srcChainId)
    const srcCell = srcChain && "srcCellAddress" in data && data.srcCellAddress ? srcChain.cells.find((cell) => isAddressEqual(cell.address, data.srcCellAddress)) : undefined
    const srcToken = srcChain ? getToken(data.srcTokenId, srcChain) : undefined
    const srcTokenWithBalance = srcToken ? getTokenBalanceData(srcToken.id, srcToken.chainId) : undefined
    const dstChain = getChain(data.dstChainId)
    const dstCell = dstChain && "dstCellAddress" in data && data.dstCellAddress ? dstChain.cells.find((cell) => isAddressEqual(cell.address, data.dstCellAddress)) : undefined
    const dstToken = dstChain ? getToken(data.dstTokenId, dstChain) : undefined
    const dstTokenWithBalance = dstToken ? getTokenBalanceData(dstToken.id, dstToken.chainId) : undefined
    return {
        srcChain,
        srcCell,
        srcToken: srcTokenWithBalance ?? srcToken,
        dstChain,
        dstCell,
        dstToken: dstTokenWithBalance ?? dstToken,
    }
}

export const getStepQuote = (data: StepQuoteData, getTokenBalanceData: (tokenId?: TokenId, chainId?: ChainId) => Token | undefined) => {

    const { srcChain, srcToken, dstChain, dstToken } = getBaseQuoteData(data, getTokenBalanceData)
    if (!srcChain || !srcToken || !data.srcAmount || !dstChain || !dstToken || !data.dstAmount || !data.minDstAmount) {
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

export const getHopQuote = (data: HopQuoteData, getTokenBalanceData: (tokenId?: TokenId, chainId?: ChainId) => Token | undefined) => {

    const { srcChain, srcCell, srcToken, dstChain, dstCell, dstToken } = getBaseQuoteData(data, getTokenBalanceData)
    if (!srcChain || !srcCell || !srcToken || !data.srcAmount || !dstChain || !dstCell || !dstToken || data.steps.length === 0 || !data.dstAmount || !data.minDstAmount || (getIsBridgeHop(data.action) && (!data.srcBridgeData || !data.dstBridgeData))) {
        return undefined
    }

    const stepQuotes: StepQuote[] = []
    for (const step of data.steps) {
        const quote = getStepQuote(step, getTokenBalanceData)
        if (quote) {
            stepQuotes.push(quote)
        }
    }
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

        if (isSwap && hop.result) {

            const adapterAddresses = hop.result.tradeData.trade[CellTradeParameter.Adapters]
            const tradePath = hop.result.tradeData.trade[CellTradeParameter.Path]
            const amountOut = hop.result.tradeData.trade[CellTradeParameter.AmountOut]
            const tokenOut = hop.result.tradeData.trade[CellTradeParameter.TokenOut]

            if (adapterAddresses && tradePath) {
                adapterAddresses.forEach((adapterAddress, i) => {
                    const swapSrcToken = hopIdx === 0 && i === 0 ? hop.srcToken : getTokenByAddress(tradePath[i], hop.srcChain)
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
            else if (tradePath && tradePath.length > 0) {
                for (let i = 0; i < tradePath.length - 1; i++) {
                    const swapSrcToken = hopIdx === 0 && i === 0 ? hop.srcToken : getTokenByAddress(tradePath[i], hop.srcChain)
                    const swapDstToken = getTokenByAddress(tradePath[i + 1], hop.srcChain)
                    const adapterAddress = hop.srcCell.address
                    const adapter = hop.srcChain.adapters?.[adapterAddress]
                    if (swapSrcToken && swapDstToken) {
                        const swapEvent: RouteEvent = {
                            srcChain: hop.srcChain,
                            srcToken: swapSrcToken,
                            srcAmount: i === 0 ? hop.srcAmount : undefined,
                            dstChain: hop.srcChain,
                            dstToken: swapDstToken,
                            dstAmount: i === tradePath.length - 1 ? amountOut : undefined,
                            hop: hopIdx,
                            type: RouteType.Swap,
                            adapterAddress: adapterAddress,
                            adapter: adapter,
                        }
                        events.push(swapEvent)
                    }
                }
            }
            else if (tokenOut) {
                const swapDstToken = getTokenByAddress(tokenOut, hop.srcChain)
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

        if (isBridge && hop.srcBridge && hop.dstBridge) {
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

export const getBridgeQuote = (data: RouteQuoteData, getTokenBalanceData: (tokenId?: TokenId, chainId?: ChainId) => Token | undefined) => {

    if (data.type !== RouteType.Bridge || data.hops.length !== 1 || data.hops.some((hop) => hop.action !== HopAction.Hop || hop.steps.length !== 1 || hop.steps.some((step) => step.type !== RouteType.Bridge)) || !data.srcAmount || !data.dstAmount || !data.minDstAmount) {
        return undefined
    }

    const hopQuote = getHopQuote(data.hops[0], getTokenBalanceData)
    const { srcChain, srcCell, srcToken, dstChain, dstCell, dstToken } = getBaseQuoteData(data, getTokenBalanceData)
    if (!srcChain || !srcCell || !srcToken || !dstChain || !dstCell || !dstToken || !hopQuote) {
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

export const getSwapQuote = (swapData: SwapQueryData, getTokenBalanceData: (tokenId?: TokenId, chainId?: ChainId) => Token | undefined) => {

    const quoteData = swapData.data
    const { srcChain, srcCell, srcToken, dstChain, dstCell, dstToken } = getBaseQuoteData(quoteData, getTokenBalanceData)
    if (!srcChain || !srcCell || !srcToken || !quoteData.srcAmount || !dstChain || !dstCell || !dstToken) {
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
    if (!primaryHopQuote || (secondaryHop && !secondaryHopQuote) || (finalHop && !finalHopQuote)) {
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
    if (!dstAmount || !minDstAmount) {
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
    if (!getIsTradeHop(data.action) || !swapData || !swapData.swapSrcTokenAddress || !swapData.swapDstTokenAddress || !swapData.srcAmount) {
        return undefined
    }

    const swapChain = getChain(swapData.srcChainId)
    const swapCell = swapChain?.cells.find((cell) => cell.address === data.srcCellAddress && cell.canSwap)
    const encodedRouteData = swapChain && swapCell ? getEncodedCellRouteData(swapChain, swapCell, cellRouteData, useSlippage) : undefined
    if (!swapChain || !swapCell || !encodedRouteData) {
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

    if (!hopData || !queryCell || !encodedResult || !encodedMinAmountResult) {
        isError = true
    }
    else {

        const [encodedTradeData, estimatedGasFee] = encodedResult
        const tradeData = getDecodedCellTradeData(queryCell, encodedTradeData)

        const [encodedMinAmountTradeData, estimatedMinAmountGasFee] = encodedMinAmountResult
        const minAmountTradeData = getDecodedCellTradeData(queryCell, encodedMinAmountTradeData)

        if (!tradeData || !minAmountTradeData) {
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
                estimatedGasFee: BigInt(estimatedMinAmountGasFee),
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

        if (!data.srcAmount || !data.dstAmount || (isBridge && (!data.srcBridge || !data.dstBridge)) || (isSwap && !data.minAmountResult)) {
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
    const isSameChainSwapOnly = quote.srcChain.id === quote.dstChain.id && routeHopData.length === 1 && routeHopData[0].action === HopAction.SwapAndTransfer
    const durationEstimate = isSameChainSwapOnly ? 0 : routeHopData.reduce((sum, hop) => sum + (hop.srcChain.avgBlockTimeMs * durationEstimateNumConfirmations), 0) + (quote.dstChain.avgBlockTimeMs * durationEstimateNumConfirmations)
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
