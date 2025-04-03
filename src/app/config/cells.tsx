import { AbiParameter } from "viem"

import { dexalotCellAbi } from "@/app/abis/cells/dexalot"
import { hopOnlyCellAbi } from "@/app/abis/cells/hopOnly"
import { uniV2CellAbi } from "@/app/abis/cells/uniV2"
import { yakSwapCellAbi } from "@/app/abis/cells/yakSwap"
import { ApiProvider, ApiRoute } from "@/app/types/apis"
import { CellAbiType, CellRouteDataParameter, CellTradeDataParameter, CellTradeParameter, CellType, CellTypeData } from "@/app/types/cells"

export const CellTypeAbi: Record<CellType, CellAbiType> = {
    [CellType.HopOnly]: hopOnlyCellAbi,
    [CellType.YakSwap]: yakSwapCellAbi,
    [CellType.UniV2]: uniV2CellAbi,
    [CellType.Dexalot]: dexalotCellAbi,
} as const

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
    [CellTradeParameter.DexalotOrder]: {
        internalType: "struct",
        name: "order",
        type: "tuple",
        components: [
            {
                internalType: "uint256",
                name: "nonceAndMeta",
                type: "uint256",
            },
            {
                internalType: "uin128",
                name: "expiry",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "makerAsset",
                type: "address",
            },
            {
                internalType: "address",
                name: "takerAsset",
                type: "address",
            },
            {
                internalType: "address",
                name: "maker",
                type: "address",
            },
            {
                internalType: "address",
                name: "taker",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "makerAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "takerAmount",
                type: "uint256",
            },
        ],
    },
    [CellTradeParameter.Signature]: {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
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
        canSwap: false,
    },
    [CellType.YakSwap]: {
        type: CellType.YakSwap,
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
    [CellType.Dexalot]: {
        type: CellType.Dexalot,
        tradeParams: [
            CellTradeParameter.DexalotOrder,
            CellTradeParameter.Signature,
            CellTradeParameter.MinAmountOut,
        ],
        canSwap: true,
        apiData: {
            provider: ApiProvider.Dexalot,
            getQuote: ApiRoute.SimpleQuote,
            getOrder: ApiRoute.SimpleQuote,
        },
    },
} as const
