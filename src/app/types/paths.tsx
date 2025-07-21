import { BridgePath } from "@/app/types/bridges"
import { Cell } from "@/app/types/cells"
import { Chain, ChainId } from "@/app/types/chains"
import { CrossChainHopType, HopQuote, HopType, SameChainHopType } from "@/app/types/swaps"
import { CellTokenPairs, Token, TokenUid } from "@/app/types/tokens"
import { WithRequired } from "@/app/types/utils"

interface BaseHopPath<THopType extends HopType = HopType> {
    from: Token,
    to: Token,
    index: number,
    type: THopType,
    cells: Cell[],
    bridgePath?: BridgePath,
}
type CrossChainHopPath = WithRequired<BaseHopPath<CrossChainHopType>, "bridgePath">
type SameChainHopPath = BaseHopPath<SameChainHopType>
export type HopPath = CrossChainHopPath | SameChainHopPath

export interface SwapPath {
    srcToken: Token,
    dstToken: Token,
    paths: HopPath[][],
    quotePaths: HopQuote[][],
}

export type SwapPathId = `${TokenUid}/${TokenUid}`
export type SwapPathData = Map<SwapPathId, SwapPath>
export type SwapPathChainData = Map<ChainId, {
    chain: Chain,
    canSwap: boolean,
    swapCells: Cell[],
    defaultCell: Cell,
}>

export interface HopPathArgs extends Pick<BaseHopPath, "from" | "to"> {
    srcToken?: Token,
    dstChainId?: ChainId,
    dstToken?: Token,
    cell?: Cell,
    canSwap?: boolean,
    swapCells?: Cell[],
    cellPairs?: CellTokenPairs,
    index?: number,
}