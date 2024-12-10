import { QueryStatus } from "@tanstack/react-query"
import { Abi, Address, Hash, Hex } from "viem"

import { PlatformId } from "@/app/config/platforms"
import { Cell, CellTradeData } from "@/app/types/cells"
import { Chain, ChainId } from "@/app/types/chains"
import { Token, TokenBridgeData, TokenId } from "@/app/types/tokens"

export enum TeleporterMessengerEvent {
    Send = "SendCrossChainMessage",
    Receive = "ReceiveCrossChainMessage",
    Executed = "MessageExecuted",
    Failed = "MessageExecutionFailed",
}

// note: use string union type to add new versions
export type TeleporterMessengerVersion = "v1.0.0"
export type TeleporterMessengerContractData = Record<TeleporterMessengerVersion, Address>

// todo: tbc
export enum BridgeType {
    ICTT = "ICTT",
}

// todo: tbc
export enum RouteType {
    Swap = "swap",
    Bridge = "bridge",
    // Wrap = "wrap",
}

export enum RouteSortType {
    Amount = "amount",
    Value = "value",
    Duration = "duration",
}

////////////////////////////////////////////////////////////////////////////////
// todo: tbc

export interface BaseHistoryData {
    srcChainId: ChainId,
    srcTokenId: TokenId,
    srcAmount?: string,
    dstChainId: ChainId,
    dstTokenId: TokenId,
    dstAmountEstimated?: string,
    dstAmount?: string,
}

// note: id is the hash of the initiate tx
export interface SwapHistory extends BaseHistoryData {
    id: Hash,
    messenger: TeleporterMessengerVersion,
    type: RouteType,
    hops: HopHistory[],
    events?: EventHistory[],
    status: QueryStatus,
    timestamp: number,
    dstTx?: TxHistory,
}

export interface EventHistory extends BaseHistoryData {
    hop: number,
    type: RouteType,
    status: QueryStatus,
    adapterAddress?: Address,
    adapter?: Adapter,
    bridge?: BridgeType,
}

export interface HopHistory extends BaseHistoryData {
    srcBlockStart: string,
    dstBlockStart: string,
    action: HopAction,
    steps: StepHistory[],
    tx?: TxHistory,
    status: QueryStatus,
    sendMsgId?: Hash,
    receiveMsgId?: Hash,
}

export interface StepHistory extends BaseHistoryData {
    type: RouteType,
}

export interface TxHistory {
    chainId: ChainId,
    hash: Hash,
    block: string,
    timestamp: number,
    reverted: boolean,
}

export interface SwapHistoryData {
    [key: Address]: SwapHistory[]
}

export interface SelectedSwapData {
    srcChainId?: ChainId,
    srcTokenId?: TokenId,
    dstChainId?: ChainId,
    dstTokenId?: TokenId,
}

////////////////////////////////////////////////////////////////////////////////
// todo: new types/interfaces need organising after rewrite

export type ChainBridgeRouteData = Record<ChainId, BridgeRoute[]>
export type TokenBridgeRouteData = Record<TokenId, BridgeRoute[]>

export interface BridgeRoute {
    srcChain: Chain,
    srcToken: Token,
    srcBridge: TokenBridgeData,
    dstChain: Chain,
    dstToken: Token,
    dstBridge: TokenBridgeData,
}

// quotedata types use minimal data, quote types use full objects
export interface BaseQuoteData {
    srcChainId: ChainId,
    srcTokenId: TokenId,
    srcAmount?: bigint,
    dstChainId: ChainId,
    dstTokenId: TokenId,
    dstAmount?: bigint,
    minDstAmount?: bigint,
}

export interface RouteQuoteData extends BaseQuoteData {
    srcCellAddress: Address,
    dstCellAddress: Address,
    type: RouteType,
    hops: HopQuoteData[],
}

export interface HopQuoteData extends BaseQuoteData {
    srcCellAddress: Address,
    srcBridgeData?: TokenBridgeData,
    dstCellAddress: Address,
    dstBridgeData?: TokenBridgeData,
    action: HopAction,
    steps: StepQuoteData[],
}

export interface StepQuoteData extends BaseQuoteData {
    swapSrcTokenAddress?: Address,
    swapDstTokenAddress?: Address,
    type: RouteType,
}

// final quotes populated with query results
export interface BaseQuote {
    srcChain: Chain,
    srcToken: Token,
    srcAmount: bigint,
    dstChain: Chain,
    dstToken: Token,
    dstAmount: bigint,
    minDstAmount: bigint,
}

export interface RouteQuote extends BaseQuote {
    srcCell: Cell,
    dstCell: Cell,
    type: RouteType,
    hops: HopQuote[],
    data: RouteQuoteData,
    events: RouteEvent[],
    timestamp: number,
}

export interface RouteEvent {
    srcChain: Chain,
    srcToken: Token,
    srcAmount?: bigint,
    dstChain: Chain,
    dstToken: Token,
    dstAmount?: bigint,
    hop: number,
    type: RouteType,
    adapterAddress?: Address,
    adapter?: Adapter,
    bridge?: BridgeType,
}

export interface HopQuote extends BaseQuote {
    srcCell: Cell,
    srcBridge?: TokenBridgeData,
    dstCell: Cell,
    dstBridge?: TokenBridgeData,
    action: HopAction,
    steps: StepQuote[],
    data: HopQuoteData,
    result?: RouteQueryResult,
    minAmountResult?: RouteQueryResult,
}

export interface StepQuote extends BaseQuote {
    swapSrcToken?: Token,
    swapDstToken?: Token,
    type: RouteType,
    data: StepQuoteData,
}

export interface SwapQueryData {
    data: RouteQuoteData,
    primaryHop: SwapQueryHopData,
    secondaryHop?: SwapQueryHopData,
    finalHop?: SwapQueryHopData,
}

export interface SwapQueryHopData {
    data: HopQuoteData,
    isPrimaryQuery?: boolean,
    isSecondaryQuery?: boolean,
    isFinalQuery?: boolean,
    index?: number,
    minAmountIndex?: number,
    result?: RouteQueryResult,
    minAmountResult?: RouteQueryResult,
}

export enum SwapQueryType {
    Primary,
    Secondary,
    Final,
}

export interface RouteQuery {
    chainId: ChainId,
    address: Address,
    abi: Abi,
    functionName: string,
    args: [bigint, Address, Address, Hex],
    query?: {
        enabled?: boolean,
    },
}

export interface RouteQueryResult {
    tradeData: CellTradeData,
    estimatedGasFee: bigint,
    encodedTradeData: Hex,
}

export type EncodedRouteQueryResult = [Hex, bigint]

////////////////////////////////////////////////////////////////////////////////

export interface BaseRouteData {
    srcChain: Chain,
    srcToken: Token,
    srcAmount: bigint,
    srcAmountFormatted: string,
    dstChain: Chain,
    dstToken: Token,
    dstAmount: bigint,
    dstAmountFormatted: string,
    type: RouteType,
}

export interface RouteAction extends BaseRouteData {
    order: number,
    swapAdapter?: string,
    bridgeType?: BridgeType,
}

// todo: fee accounting
export interface Route extends BaseRouteData {
    srcCell: Cell,
    dstCell: Cell,
    minDstAmountFormatted: string,
    hopData: HopData[],
    actions: RouteAction[],
    totalGasEstimate: bigint,
    totalGasEstimateFormatted: string,
    totalGasCost: bigint,
    totalGasCostFormatted: string,
    // totalFee: bigint,
    // totalFeeFormatted: string,
    durationEstimate: number,
    initiateTx?: Hash,
    quote: RouteQuote,
}

export interface BaseHopData {
    action: HopAction,
    srcChain: Chain,
    srcToken: Token,
    // srcAmount: bigint,
    dstChain: Chain,
    dstToken: Token,
}

export interface HopData extends BaseHopData {
    srcAmount: bigint,
    dstAmount: bigint,
    hop: Hop,
    tradeData?: CellTradeData,
    gasEstimate: bigint,
}

export enum SwapStatus {
    Pending = "pending",
    Success = "success",
    Error = "error",
}

export interface RouteTxData {
    approveTx?: Hash,
    initiateTx?: Hash,
}

// todo: tbc
export type Adapter = {
    name: string,
    platform: PlatformId,
}

////////////////////////////////////////////////////////////////////////////////

// yak router interface
// https://github.com/tesseract-protocol/smart-contracts/blob/9e85faab7a930730ab799085a5bc3a57e2873028/src/interfaces/IYakRouter.sol
export type HopTrade = {
    amountIn: bigint,
    amountOut: bigint,
    path: Address[],
    adapters: Address[],
}

// yak swap cell interface
// https://github.com/tesseract-protocol/smart-contracts/blob/9e85faab7a930730ab799085a5bc3a57e2873028/src/YakSwapCell.sol
export type HopTradeData = {
    trade: HopTrade,
    yakSwapFeeBips: bigint,
}

////////////////////////////////////////////////////////////////////////////////

// cell interface
// https://github.com/tesseract-protocol/smart-contracts/blob/main/src/interfaces/ICell.sol

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
export type BridgePath = {
    bridgeSourceChain: Address,
    sourceBridgeIsNative: boolean,
    bridgeDestinationChain: Address,
    cellDestinationChain: Address,
    destinationBlockchainID: Hex,
    teleporterFee: bigint,
    secondaryTeleporterFee: bigint,
}

/**
* @notice Available actions for each hop in a cross-chain operation
* @dev Defines all possible operations that can be performed in a single hop
*
* Actions:
* @param Hop Simple token transfer between chains
*        - No swap involved
*        - Direct bridge transfer
*
* @param HopAndCall Token transfer with destination contract call
*        - Includes contract interaction
*        - Requires recipient gas limit
*
* @param SwapAndHop Token swap followed by chain transfer
*        - Performs swap first
*        - Then bridges to destination
*
* @param SwapAndTransfer Token swap with final transfer
*        - Last hop in path
*        - Delivers to final receiver
*/
export enum HopAction {
    Hop,
    HopAndCall,
    SwapAndHop,
    SwapAndTransfer,
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
export type Hop = {
    action: HopAction,
    requiredGasLimit: bigint,
    recipientGasLimit: bigint,
    trade: Hex,
    bridgePath: BridgePath,
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
export type Instructions = {
    receiver: Address,
    payableReceiver: boolean,
    rollbackTeleporterFee: bigint,
    rollbackGasLimit: bigint,
    hops: Hop[],
}

////////////////////////////////////////////////////////////////////////////////
