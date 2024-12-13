import { AbiParameter } from "viem"

import { cellAbi, uniV2CellAbi } from "@/app/config/abis"
import { CellRouteDataParameter, CellTradeDataParameter, CellTradeParameter, CellType, CellTypeData } from "@/app/types/cells"

export const cellRouteDataParameters: Record<CellRouteDataParameter, AbiParameter> = {
    [CellRouteDataParameter.MaxSteps]: {
        internalType: "uint256",
        name: "maxSteps",
        type: "uint256",
    },
    [CellRouteDataParameter.GasPrice]: {
        internalType: "uint256",
        name: "gasPrice",
        type: "uint256",
    },
    [CellRouteDataParameter.SlippageBips]: {
        internalType: "uint256",
        name: "slippageBips",
        type: "uint256",
    },
    [CellRouteDataParameter.YakSwapFeeBips]: {
        internalType: "uint256",
        name: "yakSwapFeeBips",
        type: "uint256",
    },
} as const

export const cellTradeParameters: Record<CellTradeParameter, AbiParameter> = {
    [CellTradeParameter.AmountIn]: {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
    },
    [CellTradeParameter.AmountOut]: {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
    },
    [CellTradeParameter.Path]: {
        internalType: "address[]",
        name: "path",
        type: "address[]",
    },
    [CellTradeParameter.Adapters]: {
        internalType: "address[]",
        name: "adapters",
        type: "address[]",
    },
    [CellTradeParameter.TokenOut]: {
        internalType: "address",
        name: "tokenOut",
        type: "address",
    },
    [CellTradeParameter.MinAmountOut]: {
        internalType: "uint256",
        name: "minAmountOut",
        type: "uint256",
    },
} as const

export const cellTradeDataParameters: Record<CellTradeDataParameter, AbiParameter> = {
    [CellTradeDataParameter.YakSwapFeeBips]: {
        internalType: "uint256",
        name: "yakSwapFeeBips",
        type: "uint256",
    },
} as const

export const cellTypeDefinitions: Record<CellType, CellTypeData> = {
    [CellType.HopOnly]: {
        type: CellType.HopOnly,
        abi: cellAbi,
        canSwap: false,
    },
    [CellType.YakSwap]: {
        type: CellType.YakSwap,
        abi: cellAbi,
        routeDataParams: [
            CellRouteDataParameter.MaxSteps,
            CellRouteDataParameter.GasPrice,
            CellRouteDataParameter.SlippageBips,
            CellRouteDataParameter.YakSwapFeeBips,
        ],
        tradeParams: [
            CellTradeParameter.AmountIn,
            CellTradeParameter.AmountOut,
            CellTradeParameter.Path,
            CellTradeParameter.Adapters,
        ],
        tradeDataParams: [
            CellTradeDataParameter.YakSwapFeeBips,
        ],
        canSwap: true,
    },
    [CellType.UniV2]: {
        type: CellType.UniV2,
        abi: uniV2CellAbi,
        routeDataParams: [
            CellRouteDataParameter.SlippageBips,
        ],
        tradeParams: [
            CellTradeParameter.Path,
            CellTradeParameter.AmountOut,
            CellTradeParameter.MinAmountOut,
        ],
        canSwap: true,
    },
} as const
