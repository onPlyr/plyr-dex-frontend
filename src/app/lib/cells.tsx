import { AbiParameter, decodeAbiParameters, encodeAbiParameters, Hex, parseUnits, toHex, zeroAddress } from "viem"

import { cellRouteDataParameters, cellTradeDataParameters, cellTradeParameters, CellTypeAbi } from "@/app/config/cells"
import { defaultGasPriceExponent, defaultMinGasPrice, GasUnits, HopTypeGasUnits, YakSwapConfig } from "@/app/config/swaps"
import { isNativeBridge } from "@/app/types/bridges"
import { Cell, CellHopAction, CellInstructions, CellRouteData, CellRouteDataParameter, CellSwapSource, CellTrade, CellTradeData, CellTradeParameter } from "@/app/types/cells"
import { Chain } from "@/app/types/chains"
import { SlippageConfig } from "@/app/types/preferences"
import { HopQuote, isValidInitiateSwapQuote, isValidSwapRoute, SwapQuote, SwapRoute, SwapSource } from "@/app/types/swaps"
import { TeleporterFee } from "@/app/types/teleporter"
import { isNativeToken } from "@/app/types/tokens"

export const getChainCanSwap = (chain?: Chain) => {
    return chain ? chain.cells.some((cell) => cell.canSwap) : false
}

export const getSwapCells = (chain?: Chain) => {
    return chain && chain.cells.length > 0 ? chain.cells.filter((cell) => cell.canSwap) : []
}

export const getBridgePathCells = (chain: Chain, isSwap?: boolean) => {
    return isSwap ? getSwapCells(chain) : [chain.cells[0]]
}

export const getCellRouteDataParams = (cell?: Cell) => {
    return cell && cell.routeDataParams && cell.routeDataParams.length > 0 ? cell.routeDataParams.map((param) => cellRouteDataParameters[param]) : undefined
}

export const getCellRouteDataArgs = (cell?: Cell, routeData?: CellRouteData) => {
    return cell?.routeDataParams !== undefined && cell.routeDataParams.length > 0 && routeData !== undefined ? cell.routeDataParams.map((param) => routeData[param]) : undefined
}

export const getCellAbi = (cell?: Cell) => {
    return cell && CellTypeAbi[cell.type]
}

export const getCellRouteData = (chain?: Chain, cell?: Cell, routeData?: CellRouteData, useSlippage?: boolean) => {

    if (!chain || !cell) {
        return
    }

    const cellRouteData: CellRouteData = {
        [CellRouteDataParameter.SlippageBips]: useSlippage ? (routeData?.[CellRouteDataParameter.SlippageBips] ?? BigInt(SlippageConfig.DefaultBps)) : BigInt(0),
    }
    if (cell.routeDataParams?.includes(CellRouteDataParameter.MaxSteps)) {
        cellRouteData[CellRouteDataParameter.MaxSteps] = routeData?.[CellRouteDataParameter.MaxSteps] ?? BigInt(YakSwapConfig.DefaultMaxSteps)
    }
    if (cell.routeDataParams?.includes(CellRouteDataParameter.GasPrice)) {
        cellRouteData[CellRouteDataParameter.GasPrice] = routeData?.[CellRouteDataParameter.GasPrice] ?? parseUnits((chain.minGasPrice || defaultMinGasPrice).toString(), chain.gasPriceExponent || defaultGasPriceExponent)
    }
    if (cell.routeDataParams?.includes(CellRouteDataParameter.YakSwapFeeBips)) {
        cellRouteData[CellRouteDataParameter.YakSwapFeeBips] = routeData?.[CellRouteDataParameter.YakSwapFeeBips] ?? YakSwapConfig.Fee
    }

    return cellRouteData
}

export const getEncodedCellRouteData = (chain: Chain, cell: Cell, routeData?: CellRouteData, useSlippage?: boolean) => {

    const params = getCellRouteDataParams(cell)
    const cellRouteData = getCellRouteData(chain, cell, routeData, useSlippage)
    const args = getCellRouteDataArgs(cell, cellRouteData)

    if (!cell.canSwap || !params || params.length === 0 || !args || args.length === 0 || params.length !== args.length) {
        return
    }

    return encodeAbiParameters(params, args)
}

export const getCellTradeParams = (cell?: Cell, tradeParams?: CellTradeParameter[]) => {

    const params = tradeParams ?? cell?.tradeParams
    if (!params || params.length === 0) {
        return
    }

    return [
        {
            components: params.map((param) => cellTradeParameters[param]),
            internalType: "struct Trade",
            name: "trade",
            type: "tuple",
        },
    ] as AbiParameter[]
}

export const getCellTradeDataParams = (cell?: Cell) => {

    const params = getCellTradeParams(cell)
    if (!cell || !params || params.length === 0) {
        return
    }

    if (cell.tradeDataParams) {
        params.push(...cell.tradeDataParams.map((param) => cellTradeDataParameters[param]))
    }

    return [
        {
            components: params,
            internalType: "struct TradeData",
            name: "tradeData",
            type: "tuple",
        },
    ] as AbiParameter[]
}

export const getDecodedCellTradeData = (cell?: Cell, data?: Hex) => {

    const params = cell?.tradeDataParams ? getCellTradeDataParams(cell) : getCellTradeParams(cell)

    if (!cell || !data || data === toHex("") || !params || params.length === 0) {
        return
    }
    else if (cell.tradeDataParams) {
        return decodeAbiParameters(params, data)?.[0] as CellTradeData
    }

    const trade = decodeAbiParameters(params, data)?.[0] as CellTrade
    return {
        trade: trade,
    } as CellTradeData
}

export const getEncodedCellTrade = (cell?: Cell, trade?: CellTrade, tradeParams?: CellTradeParameter[]) => {

    const params = getCellTradeParams(cell, tradeParams)
    const paramNames = tradeParams ?? cell?.tradeParams
    const args = params && paramNames && trade ? paramNames.map((name) => trade[name]) : undefined

    if (!params || params.length === 0 || !args || args.length === 0 || args.some((data) => data === undefined)) {
        return
    }

    return encodeAbiParameters(params, [args])
}

export const getEncodedCellTradeData = (cell?: Cell, tradeData?: CellTradeData) => {

    const tradeParams = getCellTradeParams(cell)
    const tradeParamNames = cell?.tradeParams
    const tradeArgs = tradeParams && tradeParamNames && tradeData ? tradeParamNames.map((name) => tradeData.trade[name]) : undefined

    const params = getCellTradeDataParams(cell)
    const paramNames = cell?.tradeDataParams
    const args = params && paramNames && tradeData && tradeArgs ? [tradeArgs, ...paramNames.map((name) => tradeData[name])] : undefined

    if (!params || params.length === 0 || !args || args.length === 0 || args.some((data) => data === undefined)) {
        return
    }

    return encodeAbiParameters(params, [args])
}

export const getInitiateCellInstructions = (quote?: SwapQuote, swapSource: SwapSource = SwapSource.Tesseract): CellInstructions | undefined => {

    if (!quote || !isValidInitiateSwapQuote(quote)) {
        return
    }

    return {
        receiver: quote.recipientAddress,
        rollbackReceiver: getCellRollbackReceiverAddress(quote),
        payableReceiver: isNativeToken(quote.dstData.token),
        rollbackTeleporterFee: TeleporterFee.Rollback,
        rollbackGasLimit: GasUnits.Est,
        sourceId: CellSwapSource[swapSource],
        hops: quote.hops.map((hop) => ({
            action: CellHopAction[hop.type],
            requiredGasLimit: HopTypeGasUnits[hop.type].requiredLimitBase + hop.estGasUnits,
            recipientGasLimit: HopTypeGasUnits[hop.type].recipientLimitBase + hop.estGasUnits,
            trade: hop.encodedTrade || toHex(""),
            bridgePath: {
                bridgeSourceChain: hop.bridgePath?.srcData.address ?? zeroAddress,
                sourceBridgeIsNative: !!(hop.bridgePath && isNativeBridge(hop.bridgePath.srcData.type)),
                bridgeDestinationChain: hop.bridgePath?.dstData.address ?? zeroAddress,
                cellDestinationChain: hop.dstData.cell.address,
                destinationBlockchainID: hop.dstData.chain.blockchainId,
                teleporterFee: TeleporterFee.Primary,
                secondaryTeleporterFee: TeleporterFee.Secondary,
            },
        })),
    }
}

export const getQuoteCellInstructions = (route?: SwapRoute, cell?: Cell, hops?: HopQuote[], swapSource: SwapSource = SwapSource.Tesseract): CellInstructions | undefined => {

    if (!route || !isValidSwapRoute(route) || !cell || !hops || !hops.length) {
        return
    }

    return {
        receiver: zeroAddress,
        rollbackReceiver: getCellRollbackReceiverAddress(),
        payableReceiver: isNativeToken(route.dstData.token),
        rollbackTeleporterFee: TeleporterFee.Rollback,
        rollbackGasLimit: GasUnits.Est,
        sourceId: CellSwapSource[swapSource],
        hops: hops.map((hop) => ({
            action: CellHopAction[hop.type],
            requiredGasLimit: HopTypeGasUnits[hop.type].requiredLimitBase + GasUnits.Est,
            recipientGasLimit: HopTypeGasUnits[hop.type].recipientLimitBase + GasUnits.Est,
            trade: hop.encodedTrade || toHex(""),
            bridgePath: {
                bridgeSourceChain: hop.bridgePath?.srcData.address ?? zeroAddress,
                sourceBridgeIsNative: !!(hop.bridgePath && isNativeBridge(hop.bridgePath.srcData.type)),
                bridgeDestinationChain: hop.bridgePath?.dstData.address ?? zeroAddress,
                cellDestinationChain: cell.address,
                destinationBlockchainID: hop.dstData.chain.blockchainId,
                teleporterFee: TeleporterFee.Primary,
                secondaryTeleporterFee: TeleporterFee.Secondary,
            },
        })),
    }
}

export const getCellRollbackReceiverAddress = (quote?: SwapQuote) => {
    return quote?.accountAddress || zeroAddress
}