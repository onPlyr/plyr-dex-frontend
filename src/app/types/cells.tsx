import { Address } from "viem"

export enum CellType {
    HopOnly = "hopOnly",
    YakSwap = "yakSwap",
    UniV2 = "uniV2",
    Dexalot = "dexalot",
}

export interface CellTypeData {
    type: CellType,
    routeDataParams?: CellRouteDataParameter[],
    tradeParams?: CellTradeParameter[],
    tradeDataParams?: CellTradeDataParameter[],
    canSwap: boolean,
    isApiRoute: boolean,
}

export interface Cell extends CellTypeData {
    address: Address,
}

export enum CellRouteDataParameter {
    SlippageBips = "slippageBips",
    MaxSteps = "maxSteps",
    GasPrice = "gasPrice",
    YakSwapFeeBips = "yakSwapFeeBips",
}

export interface CellRouteData {
    [CellRouteDataParameter.MaxSteps]?: bigint,
    [CellRouteDataParameter.GasPrice]?: bigint,
    [CellRouteDataParameter.SlippageBips]: bigint,
    [CellRouteDataParameter.YakSwapFeeBips]?: bigint,
}

export enum CellTradeParameter {
    AmountIn = "amountIn",
    AmountOut = "amountOut",
    Path = "path",
    Adapters = "adapters",
    TokenOut = "tokenOut",
    MinAmountOut = "minAmountOut",
}

export interface CellTrade {
    [CellTradeParameter.AmountIn]?: bigint,
    [CellTradeParameter.AmountOut]: bigint,
    [CellTradeParameter.Path]?: Address[],
    [CellTradeParameter.Adapters]?: Address[],
    [CellTradeParameter.TokenOut]?: Address,
    [CellTradeParameter.MinAmountOut]?: bigint,
}

export enum CellTradeDataParameter {
    YakSwapFeeBips = "yakSwapFeeBips",
}

export interface CellTradeData {
    trade: CellTrade,
    [CellTradeDataParameter.YakSwapFeeBips]?: bigint,
}
