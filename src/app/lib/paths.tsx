import { SupportedChains } from "@/app/config/chains"
import { HopTypeGasUnits, SwapQuoteConfig } from "@/app/config/swaps"
import { chainBridgePaths } from "@/app/config/tokens"
import { isValidCellTokenPair } from "@/app/lib/tokens"
import { BridgePath, ChainBridgePathData } from "@/app/types/bridges"
import { isCanSwapCell } from "@/app/types/cells"
import { HopPath, HopPathArgs, SwapPath, SwapPathChainData, SwapPathData, SwapPathId } from "@/app/types/paths"
import { HopQuote, HopType, isSwapHopType } from "@/app/types/swaps"
import { CellTokenPairs, isSwapPathToken, Token } from "@/app/types/tokens"
import { WithRequired } from "@/app/types/utils"

export const isSwapHopPath = (args: HopPathArgs) => args.from.id !== args.to.id
export const isCrossChainHopPath = (args: HopPathArgs) => args.from.chainId !== args.to.chainId
export const isDstChainHopPath = (args: WithRequired<HopPathArgs, "dstChainId">) => args.to.chainId === args.dstChainId
export const isDstTokenHopPath = (args: WithRequired<HopPathArgs, "dstToken">) => args.to.uid === args.dstToken.uid

export const isValidHopPathBridgePath = (args: WithRequired<HopPathArgs, "srcToken" | "dstToken" | "canSwap" | "swapCells" | "cellPairs" | "index">) => {

    // 1. bridge only hop to dst token
    // 2. swap path token for quoting swap on next chain
    // 3. initial bridge only hop to next chain
    if (args.to.id !== args.dstToken.id && !isSwapPathToken(args.to) && !(args.index === 0 && args.from.uid === args.srcToken.uid && args.to.id === args.srcToken.id)) {
        return false
    }

    // for swaps
    // 1. if a specific cell is provided, make sure the pair is tradeable via that cell
    // 2. otherwise check if it's tradeable via at least one cell on the chain
    if (isSwapHopPath(args)) {
        return args.canSwap && (args.cell ? isValidCellTokenPair(args.cellPairs, args.cell, args.from, args.to) : args.swapCells.some((cell) => isValidCellTokenPair(args.cellPairs, cell, args.from, args.to)))
    }

    return true
}

export const getSwapPathId = (args: HopPathArgs): SwapPathId => `${args.from.uid}/${args.to.uid}`
export const getHopPathType = (args: WithRequired<HopPathArgs, "dstToken">) => isSwapHopPath(args) ? isCrossChainHopPath(args) ? HopType.SwapAndHop : HopType.SwapAndTransfer : isDstTokenHopPath(args) ? HopType.Hop : HopType.HopAndCall
export const getMaxHops = (num?: number) => num && num <= SwapQuoteConfig.MaxHops ? num : SwapQuoteConfig.DefaultMaxHops

export const getHopTypeEstGasUnits = (type: HopType, estAmount?: bigint) => {
    return HopTypeGasUnits[type].estBase + (estAmount || HopTypeGasUnits[type].estDefault)
}

export const getSwapPathChainData = (tokens: Token[]): SwapPathChainData => {

    const chainData: SwapPathChainData = new Map()
    const chainIds = new Set(tokens.map((token) => token.chainId))

    chainIds.forEach((id) => {

        const chain = Object.values(SupportedChains).find((data) => data.id === id && !data.isDisabled)
        const defaultCell = chain?.cells.at(0)
        const swapCells = chain?.cells.filter((cell) => isCanSwapCell(cell)) ?? []

        if (!chain || !defaultCell) {
            return
        }

        chainData.set(id, {
            chain: chain,
            canSwap: Boolean(swapCells.length),
            defaultCell: defaultCell,
            swapCells: swapCells,
        })
    })

    return chainData
}

export const isVisitedBridgePath = (path: HopPath[], bridgePath: BridgePath) => {

    const prevHop = path.length ? path.at(-1) : undefined

    if (path.some((hop) => hop.to.chainId === bridgePath.dstData.chainId)) {
        return true
    }

    else if (prevHop?.bridgePath?.srcData.token.uid === bridgePath.dstData.token.uid) {
        return true
    }

    else if (prevHop?.from.uid === bridgePath.dstData.token.uid) {
        return true
    }

    return false
}

export const getHopPathBridgePaths = (hop: HopPath, path: HopPath[], chainData: SwapPathChainData, bridgePathData: ChainBridgePathData) => {
    return bridgePathData.get(hop.to.chainId)?.filter((bridgePath) => !isVisitedBridgePath(path, bridgePath) && (chainData.get(hop.to.chainId)?.canSwap || !isSwapHopPath({ from: hop.to, to: bridgePath.dstData.token })))
}

export const getSwapPath = ({
    srcToken,
    dstToken,
    chainData,
    bridgePathData,
    cellPairs,
    maxHops,
}: {
    srcToken: Token,
    dstToken: Token,
    chainData: SwapPathChainData,
    bridgePathData: ChainBridgePathData,
    cellPairs: CellTokenPairs,
    maxHops: number,
}): SwapPath => {

    const swapPath: SwapPath = {
        srcToken: srcToken,
        dstToken: dstToken,
        paths: [],
        quotePaths: [],
    }

    const srcData = chainData.get(srcToken.chainId)
    const dstData = chainData.get(dstToken.chainId)

    if (srcToken.uid === dstToken.uid || !srcData || !dstData) {
        return swapPath
    }

    if (srcData.chain.id === dstData.chain.id && srcData.canSwap) {
        swapPath.paths.push([{
            from: srcToken,
            to: dstToken,
            index: 0,
            type: HopType.SwapAndTransfer,
            cells: srcData.swapCells,
        }])
    }

    const pathQueue: HopPath[][] = []
    const srcBridgePaths = bridgePathData.get(srcData.chain.id)

    srcBridgePaths?.forEach((srcBridgePath) => {

        const srcPathValid = isValidHopPathBridgePath({
            from: srcToken,
            to: srcBridgePath.dstData.token,
            srcToken: srcToken,
            dstToken: dstToken,
            canSwap: srcData.canSwap,
            swapCells: srcData.swapCells,
            cellPairs: cellPairs,
            index: 0,
        })

        if (!srcPathValid) {
            return
        }

        let path: HopPath[] | undefined = []

        path.push({
            from: srcToken,
            to: srcBridgePath.dstData.token,
            index: 0,
            type: getHopPathType({
                from: srcToken,
                to: srcBridgePath.dstData.token,
                dstToken: dstToken,
            }),
            cells: isSwapHopPath({ from: srcToken, to: srcBridgePath.dstData.token }) ? srcData.swapCells : [srcData.defaultCell],
            bridgePath: srcBridgePath,
        })
        pathQueue.push(path.slice())

        while (pathQueue.length) {

            path = pathQueue.shift()
            const prevHop = path?.at(-1)

            if (!path) {
                break
            }
            else if (!prevHop) {
                continue
            }

            const isDstChain = isDstChainHopPath({ ...prevHop, dstChainId: dstData.chain.id })
            const isDstToken = isDstChain && isDstTokenHopPath({ ...prevHop, dstToken: dstToken })
            const canAddHop = path.length < maxHops

            if (isDstChain) {
                if (isDstToken) {
                    swapPath.paths.push(path)
                }
                else if (canAddHop && dstData.canSwap) {
                    path.push({
                        from: prevHop.to,
                        to: dstToken,
                        index: prevHop.index + 1,
                        type: HopType.SwapAndTransfer,
                        cells: dstData.swapCells,
                    })
                    swapPath.paths.push(path)
                }
            }

            const bridgePaths = canAddHop && getHopPathBridgePaths(prevHop, path, chainData, bridgePathData)
            if (!canAddHop || !bridgePaths || !bridgePaths.length) {
                continue
            }

            bridgePaths.forEach((bridgePath) => {

                const pathSrcData = chainData.get(prevHop.to.chainId)
                const pathValid = pathSrcData && isValidHopPathBridgePath({
                    from: prevHop.to,
                    to: bridgePath.dstData.token,
                    srcToken: srcToken,
                    dstToken: dstToken,
                    canSwap: pathSrcData.canSwap,
                    swapCells: pathSrcData.swapCells,
                    cellPairs: cellPairs,
                    index: prevHop.index + 1
                })

                if (!path || !pathSrcData || !pathValid) {
                    return
                }

                pathQueue.push([...path.slice(), {
                    from: prevHop.to,
                    to: bridgePath.dstData.token,
                    index: prevHop.index + 1,
                    type: getHopPathType({
                        from: prevHop.to,
                        to: bridgePath.dstData.token,
                        dstToken: dstToken,
                    }),
                    cells: isSwapHopPath({ from: prevHop.to, to: bridgePath.dstData.token }) ? pathSrcData.swapCells : [pathSrcData.defaultCell],
                    bridgePath: bridgePath,
                }])
            })
        }
    })

    swapPath.paths.forEach((path) => {

        if (path.some((hop) => !hop.cells.length)) {
            return
        }

        const numQuotes = Math.max(...path.map((hop) => hop.cells.length))

        for (let quoteNum = 0; quoteNum < numQuotes; quoteNum++) {

            const quotePath: HopQuote[] = []

            path.forEach((hop) => {

                const hopSrcData = chainData.get(hop.from.chainId)
                const hopDstData = chainData.get(hop.to.chainId)

                if (!hopSrcData || !hopDstData) {
                    return
                }

                const nextHop = path.at(hop.index + 1)
                const isNextSwap = nextHop && isSwapHopType(nextHop.type)

                const srcCell = hop.cells.at(quoteNum) ?? hopSrcData.defaultCell
                const dstCell = nextHop?.cells.at(quoteNum) || (isNextSwap && hopDstData.swapCells.at(0)) || hopDstData.defaultCell

                const hopValid = isValidHopPathBridgePath({
                    from: hop.from,
                    to: hop.to,
                    srcToken: swapPath.srcToken,
                    dstToken: swapPath.dstToken,
                    canSwap: hopSrcData.canSwap,
                    cell: srcCell,
                    swapCells: hopSrcData.swapCells,
                    cellPairs: cellPairs,
                    index: hop.index,
                })

                if (!hopValid) {
                    return
                }

                quotePath.push({
                    srcData: {
                        chain: hopSrcData.chain,
                        token: hop.from,
                        cell: srcCell,
                    },
                    dstData: {
                        chain: hopDstData.chain,
                        token: hop.to,
                        cell: dstCell,
                    },
                    type: hop.type,
                    index: hop.index,
                    estGasUnits: getHopTypeEstGasUnits(hop.type),
                    bridgePath: hop.bridgePath,
                })
            })

            if (quotePath.length === path.length) {
                swapPath.quotePaths.push(quotePath)
            }
        }
    })

    return swapPath
}

export const getSwapPathData = (tokens: Token[], cellPairs: CellTokenPairs, numMaxHops?: number): SwapPathData => {

    // todo: further optimisations for eg. reducing query time
    //  - prefer fewer swaps due to fees for each pool / swap involved?
    //  - prefer swaps on home chains and / or c-chain due to increased likelihood of deeper liquidity?

    const pathData: SwapPathData = new Map()
    const maxHops = getMaxHops(numMaxHops)
    const chainData = getSwapPathChainData(tokens)
    const bridgePathData: ChainBridgePathData = new Map(Array.from(chainData.keys()).map((chainId) => [chainId, (chainBridgePaths.get(chainId) ?? [])]))

    tokens.forEach((from) => tokens.filter((token) => token.uid !== from.uid).forEach((to) => pathData.set(getSwapPathId({ from: from, to: to }), getSwapPath({
        srcToken: from,
        dstToken: to,
        chainData: chainData,
        bridgePathData: bridgePathData,
        cellPairs: cellPairs,
        maxHops: maxHops,
    }))))

    return pathData
}