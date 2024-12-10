import { AbiParameter, decodeAbiParameters, encodeAbiParameters, Hex, parseUnits, toHex } from "viem"

import { cellRouteDataParameters, cellTradeDataParameters, cellTradeParameters } from "@/app/config/cells"
import { defaultGasPriceExponent, defaultMinGasPrice, defaultSlippageBps, tmpMaxSteps, tmpYakSwapFee } from "@/app/config/swaps"
import { Cell, CellRouteData, CellRouteDataParameter, CellTradeData } from "@/app/types/cells"
import { Chain } from "@/app/types/chains"

export const getSwapCells = (chain?: Chain) => {
    return chain && chain.cells.length > 0 ? chain.cells.filter((cell) => cell.canSwap === true) : []
}

export const getCellRouteDataParams = (cell?: Cell) => {
    return cell && cell.routeDataParams && cell.routeDataParams.length > 0 ? cell.routeDataParams.map((param) => cellRouteDataParameters[param]) : undefined
}

export const getCellRouteDataArgs = (cell?: Cell, routeData?: CellRouteData) => {
    return cell?.routeDataParams !== undefined && cell.routeDataParams.length > 0 && routeData !== undefined ? cell.routeDataParams.map((param) => routeData[param]) : undefined
}

export const getCellRouteData = (chain?: Chain, cell?: Cell, routeData?: CellRouteData, useSlippage?: boolean) => {

    if (chain === undefined || cell === undefined) {
        return undefined
    }

    const cellRouteData: CellRouteData = {
        [CellRouteDataParameter.SlippageBips]: useSlippage ? (routeData?.[CellRouteDataParameter.SlippageBips] ?? BigInt(defaultSlippageBps)) : BigInt(0),
    }
    if (cell.routeDataParams?.includes(CellRouteDataParameter.MaxSteps)) {
        cellRouteData[CellRouteDataParameter.MaxSteps] = routeData?.[CellRouteDataParameter.MaxSteps] ?? tmpMaxSteps
    }
    if (cell.routeDataParams?.includes(CellRouteDataParameter.GasPrice)) {
        cellRouteData[CellRouteDataParameter.GasPrice] = routeData?.[CellRouteDataParameter.GasPrice] ?? parseUnits((chain.minGasPrice || defaultMinGasPrice).toString(), chain.gasPriceExponent || defaultGasPriceExponent)
    }
    if (cell.routeDataParams?.includes(CellRouteDataParameter.YakSwapFeeBips)) {
        cellRouteData[CellRouteDataParameter.YakSwapFeeBips] = routeData?.[CellRouteDataParameter.YakSwapFeeBips] ?? tmpYakSwapFee
    }

    return cellRouteData
}

export const getEncodedCellRouteData = (chain: Chain, cell: Cell, routeData?: CellRouteData, useSlippage?: boolean) => {

    const params = getCellRouteDataParams(cell)
    const cellRouteData = getCellRouteData(chain, cell, routeData, useSlippage)
    const args = getCellRouteDataArgs(cell, cellRouteData)

    if (cell.canSwap !== true || params === undefined || params.length === 0 || args === undefined || args.length === 0 || params.length !== args.length) {
        return undefined
    }

    return encodeAbiParameters(params, args)
}

export const getCellTradeParams = (cell?: Cell) => {
    if (cell && cell.tradeParams && cell.tradeParams.length > 0) {
        return [
            {
                components: cell.tradeParams.map((param) => cellTradeParameters[param]),
                internalType: "struct Trade",
                name: "trade",
                type: "tuple",
            },
        ] as AbiParameter[]
    }
    return undefined
}

export const getCellTradeDataParams = (cell?: Cell) => {
    const tradeDataComponents = getCellTradeParams(cell)
    if (cell && tradeDataComponents) {
        cell.tradeDataParams?.forEach((param) => {
            tradeDataComponents.push(cellTradeDataParameters[param])
        })
        return [
            {
                components: tradeDataComponents,
                internalType: "struct TradeData",
                name: "tradeData",
                type: "tuple",
            },
        ] as AbiParameter[]
    }
    return undefined
}

export const getDecodedCellTradeData = (cell?: Cell, data?: Hex) => {
    const params = getCellTradeDataParams(cell)
    if (cell === undefined || data === undefined || data === toHex("") || params === undefined || params.length === 0) {
        return undefined
    }
    return decodeAbiParameters(params, data)?.[0] as CellTradeData
}
