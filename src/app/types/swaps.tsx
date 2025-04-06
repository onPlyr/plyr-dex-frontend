import { Address, Hash, Hex, toHex } from "viem"

import { PlatformId } from "@/app/config/platforms"
import { BridgeProvider, BridgePath } from "@/app/types/bridges"
import { Cell, CellAbiType, CellFeeType, CellInstructions, CellTrade } from "@/app/types/cells"
import { Chain, ChainId } from "@/app/types/chains"
import { Token, TokenDataMap } from "@/app/types/tokens"
import { WithRequired } from "@/app/types/utils"

////////////////////////////////////////////////////////////////////////////////
// generic

export const SwapStatus = {
    Pending: "pending",
    Success: "success",
    Error: "error",
} as const
export type SwapStatus = (typeof SwapStatus)[keyof typeof SwapStatus]

export const SwapType = {
    Swap: "swap",
    Transfer: "transfer",
} as const
export type SwapType = (typeof SwapType)[keyof typeof SwapType]

export const HopType = {
    Hop: "hop",
    HopAndCall: "hopAndCall",
    SwapAndHop: "swapAndHop",
    SwapAndTransfer: "swapAndTransfer",
} as const
export type HopType = (typeof HopType)[keyof typeof HopType]

export const InitiateSwapAction = {
    Review: "review",
    Initiate: "initiate",
} as const
export type InitiateSwapAction = (typeof InitiateSwapAction)[keyof typeof InitiateSwapAction]

export const SwapHopType = [HopType.SwapAndHop, HopType.SwapAndTransfer] as const
export type SwapHopType = typeof SwapHopType[number]

export const CrossChainHopType = [HopType.Hop, HopType.HopAndCall, HopType.SwapAndHop] as const
export type CrossChainHopType = typeof CrossChainHopType[number]

export const SwapTypeLabel: Record<SwapType, string> = {
    [SwapType.Swap]: "Swap",
    [SwapType.Transfer]: "Transfer",
} as const

export const SwapAction = {
    Send: "send",
    Sent: "sent",
    Receive: "receive",
    Received: "received",
} as const
export type SwapAction = (typeof SwapAction)[keyof typeof SwapAction]

export const SwapActionLabel: Record<SwapType, Record<SwapAction, string>> = {
    [SwapType.Swap]: {
        [SwapAction.Send]: "Sell",
        [SwapAction.Sent]: "Sold",
        [SwapAction.Receive]: "Receive at least",
        [SwapAction.Received]: "Received",
    },
    [SwapType.Transfer]: {
        [SwapAction.Send]: "Send",
        [SwapAction.Sent]: "Sent",
        [SwapAction.Receive]: "Receive",
        [SwapAction.Received]: "Received",
    },
} as const

export interface SwapAdapter {
    address: Address,
    name: string,
    platform: PlatformId,
}

export const SwapSource = {
    Tesseract: "tesseract",
} as const
export type SwapSource = (typeof SwapSource)[keyof typeof SwapSource]

export const SwapMsgType = {
    SelectTokens: "Select Tokens",
    Amount: "Enter Amount",
    IsFetching: "Fetching Quotes",
    NoQuotesFound: "No Quotes Available",
    SelectQuote: "Select Quote",
    InsufficientBalance: "Insufficient Balance",
    IsError: "Error Fetching Quotes",
} as const
export type SwapMsgType = (typeof SwapMsgType)[keyof typeof SwapMsgType]

export interface SwapMsgData {
    type: SwapMsgType,
    msg: React.ReactNode,
    icon: React.ReactNode,
    isShowErrorWithQuote?: boolean,
}

export const isSwapType = (type: SwapType): type is typeof SwapType.Swap => {
    return type === SwapType.Swap
}

export const isTransferType = (type: SwapType): type is typeof SwapType.Transfer => {
    return type === SwapType.Transfer
}

export const isSwapHopType = (type: HopType): type is SwapHopType => {
    return SwapHopType.includes(type as SwapHopType)
}

export const isCrossChainHopType = (type: HopType): type is CrossChainHopType => {
    return CrossChainHopType.includes(type as CrossChainHopType)
}

////////////////////////////////////////////////////////////////////////////////
// base data

interface SwapBaseData {
    chain: Chain,
    token: Token,
    cell?: Cell,
    estAmount?: bigint,
    minAmount?: bigint,
}
type QuoteData = WithRequired<SwapBaseData, "cell">
type ValidQuoteData = Required<SwapBaseData>
interface HistoryBaseData extends Required<Omit<SwapBaseData, "cell">> {
    cell?: Cell,
    amount?: bigint,
}
type EventHistoryBaseData = WithRequired<Partial<HistoryBaseData>, "chain" | "token">
export type BaseData = SwapBaseData | QuoteData | ValidQuoteData | HistoryBaseData | EventHistoryBaseData

export interface SwapBaseJson {
    chain: ChainId,
    tokenAddress: Address,
    cell?: Address,
    estAmount: string,
    minAmount: string,
    amount?: string,
}
export type EventBaseJson = WithRequired<Partial<SwapBaseJson>, "chain" | "tokenAddress">
export type BaseJson = SwapBaseJson | EventBaseJson

type BaseFeeData = {
    [type in CellFeeType]?: bigint
}
export type ValidSwapFeeData = Required<BaseFeeData>
export type SwapFeeData = BaseFeeData | ValidSwapFeeData

export type SwapFeeJson = {
    [type in CellFeeType]: string
}

export const isValidSwapFeeData = (data: SwapFeeData): data is ValidSwapFeeData => {
    return Object.values(CellFeeType).every((feeType) => feeType in data && data[feeType] !== undefined)
}

////////////////////////////////////////////////////////////////////////////////
// routes

export interface SwapRouteData extends Partial<Omit<SwapBaseData, "estAmount" | "minAmount">> {
    amount?: bigint,
}

interface BaseSwapRoute<TSrcData = SwapRouteData, TDstData = SwapRouteData> {
    srcData: TSrcData,
    dstData: TDstData,
}
type ValidSwapRoute = BaseSwapRoute<Required<SwapRouteData>, Required<Omit<SwapRouteData, "amount">>>
export type SwapRoute = BaseSwapRoute | ValidSwapRoute

export interface SwapRouteBaseJson {
    chain?: ChainId,
    tokenAddress?: Address,
    amount?: string,
}
export interface SwapRouteJson {
    srcData: SwapRouteBaseJson,
    dstData: Omit<SwapRouteBaseJson, "amount">,
}

export const isValidSwapRoute = (route: SwapRoute): route is ValidSwapRoute => {
    return !(!route.srcData.chain || !route.srcData.token || !route.srcData.amount || route.srcData.amount === BigInt(0) || route.srcData.chain.cells.length === 0 || !route.dstData.chain || !route.dstData.token || route.dstData.chain.cells.length === 0)
}

////////////////////////////////////////////////////////////////////////////////
// swaps

export type SwapId = string
interface BaseSwap<TSrcData = BaseData, TDstData = BaseData, THop = Hop, TEvent = HopEvent, TFeeData = SwapFeeData> {
    id: SwapId,
    tesseractId?: Hex,
    srcData: TSrcData,
    dstData: TDstData,
    type: SwapType,
    hops: THop[],
    events: TEvent[],
    accountAddress?: Address,
    recipientAddress?: Address,
    plyrId?: string,
    srcAmount: bigint,
    dstAmount?: bigint,
    minDstAmount?: bigint,
    estDstAmount?: bigint,
    duration?: number,
    estDuration: number,
    feeData: TFeeData,
    gasFee?: bigint,
    estGasFee: bigint,
    estGasUnits: bigint,
    timestamp: number,
    txHash?: Hash,
    dstTxHash?: Hash,
    dstTimestamp?: number,
    dstInitiatedBlock?: bigint,
    dstLastCheckedBlock?: bigint,
    isDstQueryInProgress?: boolean,
    isConfirmed?: boolean,
    status?: SwapStatus,
    error?: string,
}
export type SwapQuote = WithRequired<BaseSwap<QuoteData, BaseData, ValidHopQuote>, "estDstAmount" | "minDstAmount">
export type InitiateSwapQuote = WithRequired<BaseSwap<ValidQuoteData, ValidQuoteData, ValidHopQuote, HopEvent, ValidSwapFeeData>, "accountAddress" | "recipientAddress" | "estDstAmount" | "minDstAmount">
export type BaseSwapHistory = WithRequired<BaseSwap<HistoryBaseData, HistoryBaseData, HopHistory, HopEventHistory, ValidSwapFeeData>, "accountAddress" | "recipientAddress" | "estDstAmount" | "minDstAmount" | "txHash" | "status">
export type CompletedSwapHistory = WithRequired<BaseSwapHistory, "dstAmount" | "duration" | "gasFee" | "dstTxHash" | "dstTimestamp">
export type SwapHistory = BaseSwapHistory | CompletedSwapHistory
export type Swap = BaseSwap | SwapQuote | InitiateSwapQuote | SwapHistory

export interface SwapJson extends WithRequired<Omit<SwapHistory, "srcData" | "dstData" | "hops" | "events" | "srcAmount" | "dstAmount" | "minDstAmount" | "estDstAmount" | "feeData" | "gasFee" | "estGasFee" | "estGasUnits" | "dstInitiatedBlock" | "dstLastCheckedBlock">, "status"> {
    srcData: SwapBaseJson,
    dstData: SwapBaseJson,
    hops: HopJson[],
    events: HopEventJson[],
    srcAmount: string,
    dstAmount?: string,
    minDstAmount: string,
    estDstAmount: string,
    feeData: SwapFeeJson,
    gasFee?: string,
    estGasFee: string,
    estGasUnits: string,
    dstInitiatedBlock?: string,
    dstLastCheckedBlock?: string,
}

export interface SwapQuoteData {
    srcData: BaseData,
    dstData: BaseData,
    timestamp: number,
    maxDstAmount: bigint,
    minDuration: number,
    quotes: SwapQuote[],
    quoteTokens?: TokenDataMap,
}

export const isValidQuoteData = (data: BaseData): data is ValidQuoteData => {
    return !(!data.cell || !data.estAmount || data.estAmount === BigInt(0) || !data.minAmount || data.minAmount === BigInt(0))
}

export const isValidSwapQuote = (swap: Swap): swap is SwapQuote => {
    return !(!swap.srcData.cell || !swap.estDstAmount || swap.estDstAmount === BigInt(0) || !swap.minDstAmount || swap.minDstAmount === BigInt(0) || !isValidSwapFeeData(swap.feeData)) && swap.hops.length > 0 && swap.hops.every((hop) => isValidHopQuote(hop))
}

export const isValidInitiateSwapQuote = (swap: Swap): swap is InitiateSwapQuote => {
    return isValidSwapQuote(swap) && isValidQuoteData(swap.srcData) && isValidQuoteData(swap.dstData) && !(!swap.accountAddress || !swap.recipientAddress)
}

export const isSwapHistory = (swap: Swap): swap is SwapHistory => {
    if (!("amount" in swap.srcData) || !("amount" in swap.dstData) || swap.hops.length === 0 || !swap.hops.every((hop) => isHopHistory(hop)) || swap.events.length === 0 || !swap.events.every((event) => isEventHistory(event))) {
        return false
    }
    return !(!swap.estDstAmount || swap.estDstAmount === BigInt(0) || !swap.minDstAmount || swap.minDstAmount === BigInt(0) || !swap.accountAddress || !swap.recipientAddress || !swap.txHash || !swap.status)
}

export const isCompletedSwapHistory = (swap: Swap): swap is CompletedSwapHistory => {
    return isSwapHistory(swap) && swap.status === SwapStatus.Success && !(!swap.dstAmount || swap.dstAmount === BigInt(0) || swap.duration === undefined || !swap.gasFee || swap.gasFee === BigInt(0) || !swap.dstTxHash || !swap.dstTimestamp)
}

export const isSameChainSwap = (swap: Swap) => {
    return swap.srcData.chain.id === swap.dstData.chain.id && swap.hops.every((hop) => hop.srcData.chain.id === hop.dstData.chain.id)
}

////////////////////////////////////////////////////////////////////////////////
// hops

interface BaseHop<THopType = HopType, TBaseData = BaseData> {
    srcData: TBaseData,
    dstData: TBaseData,
    type: THopType,
    index: number,
    estGasUnits?: bigint,

    trade?: CellTrade,
    encodedTrade?: Hex,
    bridgePath?: BridgePath,
    queryIndex?: number,

    msgReceivedId?: Hex,
    msgSentId?: Hex,
    txHash?: Hash,
    timestamp?: number,

    initiatedBlock?: bigint,
    lastCheckedBlock?: bigint,
    isQueryInProgress?: boolean,

    isError?: boolean,
    isConfirmed?: boolean,
    status?: SwapStatus,
    error?: string,
}
type SwapHop = BaseHop<SwapHopType>
type CrossChainHop = BaseHop<CrossChainHopType>

type BaseHopQuote<THopType = HopType, TBaseData = QuoteData> = WithRequired<BaseHop<THopType, TBaseData>, "estGasUnits">
type SwapHopQuote = BaseHopQuote<SwapHopType>
type CrossChainHopQuote = BaseHopQuote<CrossChainHopType>

type BaseValidHopQuote<THopType = HopType> = BaseHopQuote<THopType, ValidQuoteData>
type ValidSwapHopQuote = WithRequired<BaseValidHopQuote<SwapHopType>, "trade" | "encodedTrade" | "queryIndex">
type ValidCrossChainHopQuote = WithRequired<BaseValidHopQuote<CrossChainHopType>, "bridgePath">

export type HopQuote = SwapHopQuote | CrossChainHopQuote
export type ValidHopQuote = ValidSwapHopQuote | ValidCrossChainHopQuote
export type HopHistory = WithRequired<BaseHop<HopType, HistoryBaseData>, "status">
export type Hop = SwapHop | CrossChainHop | HopQuote | ValidHopQuote | HopHistory

export interface HopJson extends WithRequired<Omit<HopHistory, "srcData" | "dstData" | "trade" | "bridgePath" | "initiatedBlock" | "lastCheckedBlock">, "status"> {
    srcData: SwapBaseJson,
    dstData: SwapBaseJson,
    initiatedBlock?: string,
    lastCheckedBlock?: string,
}

export interface HopGasUnitsData {
    estBase: bigint,
    estDefault: bigint,
    recipientLimitBase: bigint,
    requiredLimitBase: bigint,
}

export const isValidHopQuote = (hop: Hop): hop is ValidHopQuote => {
    if (!("estGasUnits" in hop)) {
        return false
    }
    if (!isValidQuoteData(hop.srcData) || !isValidQuoteData(hop.dstData) || !hop.estGasUnits || hop.estGasUnits === BigInt(0)) {
        return false
    }
    if (isSwapHopType(hop.type) && (!hop.trade || !hop.encodedTrade || hop.encodedTrade === toHex("") || hop.queryIndex === undefined || hop.srcData.token.id === hop.dstData.token.id)) {
        return false
    }
    if (isCrossChainHopType(hop.type) && (!hop.bridgePath || hop.srcData.chain.id === hop.dstData.chain.id)) {
        return false
    }
    return true
}

export const isHopHistory = (hop: Hop): hop is HopHistory => {
    return "amount" in hop.srcData && "amount" in hop.dstData && !!hop.status
}

////////////////////////////////////////////////////////////////////////////////
// queries

export type HopApiQuery = URL
export interface HopContractQuery {
    chainId: ChainId,
    address: Address,
    abi: CellAbiType,
    functionName: "route",
    args: [bigint, Address, Address, Hex],
}

export interface HopQueryResult {
    amount?: bigint,
    encodedTrade?: Hex,
    estGasUnits?: bigint,
}

export interface HopQueryData {
    apiQuery?: HopApiQuery,
    contractQuery?: HopContractQuery,
}

export interface SwapFeeQuery {
    chainId: ChainId,
    address: Address,
    abi: CellAbiType,
    functionName: "calculateFees",
    args: [CellInstructions, bigint],
}

export interface SwapGasFeeQuery {
    chainId: ChainId,
    address: Address,
    account: Address,
    abi: CellAbiType,
    functionName: "initiate",
    args: [Address, bigint, CellInstructions],
    value?: bigint,
}

////////////////////////////////////////////////////////////////////////////////
// events

interface BaseEvent<TBaseData = BaseData, TSwapType = SwapType> {
    srcData: TBaseData,
    dstData: TBaseData,
    type: TSwapType,
    index: number,
    hopIndex: number,
    adapter?: SwapAdapter,
    adapterAddress?: Address,
    bridge?: BridgeProvider,
    isError?: boolean,
    status?: SwapStatus,
}
export type SwapEvent = WithRequired<BaseEvent<BaseData, typeof SwapType.Swap>, "adapterAddress">
export type TransferEvent = WithRequired<BaseEvent<BaseData, typeof SwapType.Transfer>, "bridge">
export type HopEventHistory = WithRequired<BaseEvent<EventHistoryBaseData>, "status">
export type HopEvent = SwapEvent | TransferEvent | HopEventHistory

export interface HopEventJson extends Omit<HopEventHistory, "srcData" | "dstData"> {
    srcData: EventBaseJson,
    dstData: EventBaseJson,
}

export const isSwapEvent = (event: HopEvent): event is SwapEvent => {
    return isSwapType(event.type) && !!event.adapterAddress
}

export const isTransferEvent = (event: HopEvent): event is TransferEvent => {
    return isTransferType(event.type) && !!event.bridge
}

export const isEventHistory = (event: HopEvent): event is HopEventHistory => {
    return "amount" in event.srcData && "amount" in event.dstData && !!event.status
}

////////////////////////////////////////////////////////////////////////////////
// function return types

export type GetValidHopQuoteDataReturnData = Record<SwapId, ValidHopQuote[]>
export type GetSwapQuoteDataReturnData = SwapQuoteData
export type SwapQuoteReturnData = GetValidHopQuoteDataReturnData | GetSwapQuoteDataReturnData

interface BaseGetSwapQuoteDataReturnType<TData = SwapQuoteReturnData> {
    data?: TData,
    error?: string,
}
export type GetValidHopQuoteDataReturnType = BaseGetSwapQuoteDataReturnType<GetValidHopQuoteDataReturnData>
export type GetSwapQuoteDataReturnType = BaseGetSwapQuoteDataReturnType<GetSwapQuoteDataReturnData>
