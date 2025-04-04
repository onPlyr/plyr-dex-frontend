import { Address, Hex } from "viem"

import { dexalotCellAbi } from "@/app/abis/cells/dexalot"
import { hopOnlyCellAbi } from "@/app/abis/cells/hopOnly"
import { uniV2CellAbi } from "@/app/abis/cells/uniV2"
import { yakSwapCellAbi } from "@/app/abis/cells/yakSwap"
import { ApiProvider, ApiRoute } from "@/app/types/apis"
import { DexalotFirmQuoteOrder } from "@/app/types/dexalot"
import { HopType, SwapSource } from "@/app/types/swaps"

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
    apiData?: {
        provider: ApiProvider,
        getQuote: ApiRoute,
        getOrder: ApiRoute,
    },
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
    DexalotOrder = "order",
    Signature = "signature",
}

export interface CellTrade {
    [CellTradeParameter.AmountIn]?: bigint,
    [CellTradeParameter.AmountOut]?: bigint,
    [CellTradeParameter.Path]?: Address[],
    [CellTradeParameter.Adapters]?: Address[],
    [CellTradeParameter.TokenOut]?: Address,
    [CellTradeParameter.MinAmountOut]?: bigint,
    [CellTradeParameter.DexalotOrder]?: DexalotFirmQuoteOrder,
    [CellTradeParameter.Signature]?: Hex,
}

export enum CellTradeDataParameter {
    YakSwapFeeBips = "yakSwapFeeBips",
}

export interface CellTradeData {
    trade: CellTrade,
    [CellTradeDataParameter.YakSwapFeeBips]?: bigint,
}

export type CellAbiType = typeof hopOnlyCellAbi | typeof uniV2CellAbi | typeof yakSwapCellAbi | typeof dexalotCellAbi

////////////////////////////////////////////////////////////////////////////////
// cell interfaces
// https://github.com/tesseract-protocol/smart-contracts/blob/main/src/interfaces/ICell.sol

export const CellHopAction = {
    [HopType.Hop]: 0,
    [HopType.HopAndCall]: 1,
    [HopType.SwapAndHop]: 2,
    [HopType.SwapAndTransfer]: 3,
} as const
export type CellHopAction = (typeof CellHopAction)[keyof typeof CellHopAction]

export const CellSwapSource = {
    [SwapSource.Tesseract]: BigInt(1),
} as const
export type CellSwapSource = (typeof CellSwapSource)[keyof typeof CellSwapSource]

// The fixedNativeFee is a native token amount of that chain. You will need to add that to the value of the Initiate transaction.
// The baseFee is a tokenIn amount. You will need to add that to the approve value before Initiate.
export const CellFeeType = {
    FixedNative: "fixedNativeFee",
    Base: "baseFee",
} as const
export type CellFeeType = (typeof CellFeeType)[keyof typeof CellFeeType]

/**
* @notice Defines the complete path for cross-chain token bridging
* @dev Contains all necessary information for token movement between chains
*
* Fee Handling:
* - Primary fee is in input token if no swap occurred, output token if swapped
* - Secondary fee used for multi-hop scenarios
*
* @param bridgeSourceChain Address of bridge contract on source chain
* @param sourceBridgeIsNative True if bridge handles native tokens
* @param bridgeDestinationChain Address of bridge contract on destination chain
* @param cellDestinationChain Address of Cell contract on destination chain
* @param destinationBlockchainID Unique identifier of destination blockchain
* @param teleporterFee Primary fee for Teleporter service
* @param secondaryTeleporterFee Additional fee for multi-hop operations
*/

export type CellBridgePath = {
    bridgeSourceChain: Address,
    sourceBridgeIsNative: boolean,
    bridgeDestinationChain: Address,
    cellDestinationChain: Address,
    destinationBlockchainID: Hex,
    teleporterFee: bigint,
    secondaryTeleporterFee: bigint,
}

/**
* @notice Represents a single step in a cross-chain operation
* @dev Each hop can involve a swap, transfer, or both, between chains
* @param action Enum defining the type of operation for this hop
* @param requiredGasLimit Gas limit for the whole operation (bridge + recipientGasLimit)
* @param recipientGasLimit Gas limit for any recipient contract calls
* @param trade Encoded trade data (interpretation depends on action type)
* @param bridgePath Detailed path information for cross-chain token movement
*/

export type CellHop = {
    action: CellHopAction,
    requiredGasLimit: bigint,
    recipientGasLimit: bigint,
    trade: Hex,
    bridgePath: CellBridgePath,
}

/**
* @notice Detailed instructions for cross-chain operations
* @dev Defines the complete path and parameters for token movement across chains
* @param receiver Address that will receive the final tokens
* @param payableReceiver Boolean indicating if receiver can/should receive native tokens
* @param rollbackTeleporterFee Amount of input token for rollback operation fees
* @param rollbackGasLimit Gas limit for rollback operations
* @param hops Ordered array of Hop structures defining the complete operation path
*/

export interface CellInstructions {
    receiver: Address,
    payableReceiver: boolean,
    rollbackTeleporterFee: bigint,
    rollbackGasLimit: bigint,
    hops: CellHop[],
    sourceId: CellSwapSource,
}

////////////////////////////////////////////////////////////////////////////////
