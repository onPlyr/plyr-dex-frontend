import { TokenBridgePaths } from "@/app/config/tokens"
import { getChainCanSwap } from "@/app/lib/cells"
import { getChain } from "@/app/lib/chains"
import { generateSwapId, getHopTypeEstGasUnits, getMinAmount } from "@/app/lib/swaps"
import { getToken } from "@/app/lib/tokens"
import { BridgePath, BridgePathHopData } from "@/app/types/bridges"
import { Chain } from "@/app/types/chains"
import { Hop, HopType, isSwapHopType, isValidSwapRoute, SwapRoute } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

export const getBridgePaths = ({
    token,
    srcChain,
    dstChain,
}: {
    token?: Token,
    srcChain?: Chain,
    dstChain?: Chain,
}) => {
    return (token ? TokenBridgePaths[token.id] : Object.values(TokenBridgePaths).flat()).filter((path) => (!srcChain || path.srcData.chainId === srcChain.id) && (!dstChain || path.dstData.chainId === dstChain.id))
}

export const getBridgePathHops = ({
    route,
    maxHops,
    slippageBps,
}: {
    route: SwapRoute,
    maxHops: number,
    slippageBps?: bigint,
}) => {

    if (!isValidSwapRoute(route)) {
        return
    }

    const { srcData, dstData } = route
    const bridgePathHopData: Record<number, BridgePathHopData[]> = {}

    for (let hopIndex = 0; hopIndex < maxHops; hopIndex++) {

        if (!bridgePathHopData[hopIndex]) {
            bridgePathHopData[hopIndex] = []
        }

        const prevHopData = hopIndex > 0 ? bridgePathHopData[hopIndex - 1] : [undefined]

        for (const prevData of prevHopData) {

            const prevId = prevData?.id
            const prevHop = prevData?.hop
            const isGetHopData = hopIndex === 0 || prevData?.isNextHop
            const hopSrcChain = hopIndex === 0 ? srcData.chain : prevHop?.dstData.chain
            const paths = isGetHopData && hopSrcChain && getBridgePaths({
                srcChain: hopSrcChain,
            }).filter((path) => !prevHop || (path.dstData.chainId !== prevHop.srcData.chain.id || path.dstData.token.id !== prevHop.dstData.token.id))

            if (!isGetHopData || !hopSrcChain || !paths || paths.length === 0) {
                continue
            }

            for (const path of paths) {

                const hopData = getBridgePathHop({
                    route: route,
                    path: path,
                    prevHop: prevHop,
                    hopIndex: hopIndex,
                    slippageBps: slippageBps,
                    maxHops: maxHops,
                })

                if (!hopData?.hop) {
                    continue
                }

                const hopId = generateSwapId()
                bridgePathHopData[hopIndex].push({
                    id: hopId,
                    parentId: prevId,
                    hop: hopData.hop,
                    isNextHop: hopData.isNextHop,
                })

                if (hopData.hop.dstData.chain.id === dstData.chain.id) {

                    const swapAndTransferHop = getBridgePathSwapAndTransferHop({
                        route: route,
                        prevHop: hopData.hop,
                        hopIndex: hopIndex + 1,
                        slippageBps: slippageBps,
                    })

                    if (swapAndTransferHop) {
                        if (!bridgePathHopData[hopIndex + 1]) {
                            bridgePathHopData[hopIndex + 1] = []
                        }
                        bridgePathHopData[hopIndex + 1].push({
                            id: generateSwapId(),
                            parentId: hopId,
                            hop: swapAndTransferHop,
                            isNextHop: false,
                        })
                    }
                }
            }
        }
    }

    const bridgePathHops: Hop[][] = []

    for (let hopIndex = maxHops - 1; hopIndex >= 0; hopIndex--) {

        const pathDstHopData = bridgePathHopData[hopIndex].filter((data) => !data.isNextHop)
        if (!pathDstHopData || pathDstHopData.length === 0) {
            continue
        }

        for (const dstHopData of pathDstHopData) {

            let parentId = dstHopData.parentId
            const pathHops = [
                dstHopData.hop,
            ]

            if (hopIndex > 0) {

                for (let prevHopIndex = hopIndex - 1; prevHopIndex >= 0; prevHopIndex--) {

                    const prevHop = bridgePathHopData[prevHopIndex].find((data) => data.id === parentId)
                    if (!prevHop) {
                        break
                    }

                    pathHops.push(prevHop.hop)
                    parentId = prevHop.parentId
                }
            }

            const hops = pathHops.sort((a, b) => a.index - b.index)
            const [srcHop, dstHop] = [hops[0], hops[hops.length - 1]]
            if ((srcHop.srcData.chain.id !== srcData.chain.id || srcHop.srcData.token.id !== srcData.token.id) || (dstHop.dstData.chain.id !== dstData.chain.id || dstHop.dstData.token.id !== dstData.token.id)) {
                continue
            }

            bridgePathHops.push(hops)
        }
    }

    return bridgePathHops
}

export const getBridgePathHop = ({
    route,
    path,
    prevHop,
    hopIndex,
    slippageBps,
    maxHops,
}: {
    route: SwapRoute,
    path: BridgePath,
    prevHop?: Hop,
    hopIndex: number,
    slippageBps?: bigint,
    maxHops: number,
}) => {

    if (!isValidSwapRoute(route) || (hopIndex > 0 && !prevHop)) {
        return
    }

    const { srcData, dstData } = route
    const isFinalHop = hopIndex === maxHops - 1
    if (isFinalHop && path.dstData.chainId !== dstData.chain.id) {
        return
    }

    const hopSrcChain = getChain(path.srcData.chainId)
    const hopDstChain = getChain(path.dstData.chainId)
    if (!hopSrcChain || !hopDstChain) {
        return
    }

    const prevDstToken = hopIndex === 0 ? srcData.token : prevHop?.dstData.token
    const hopSrcToken = prevDstToken && getToken(prevDstToken.id, hopSrcChain)
    if (!prevDstToken || !hopSrcToken) {
        return
    }

    const isSrcSwap = hopSrcToken.id !== path.srcData.token.id
    const isPrevSwap = prevHop && isSwapHopType(prevHop.type)
    if (isSrcSwap && !getChainCanSwap(hopSrcChain)) {
        return
    }

    const isNextHop = hopDstChain.id !== dstData.chain.id || path.dstData.token.id !== dstData.token.id
    if (isNextHop && isFinalHop) {
        return
    }

    const hopType = isSrcSwap ? HopType.SwapAndHop : isNextHop ? HopType.HopAndCall : HopType.Hop
    const srcEstAmount = hopIndex === 0 ? srcData.amount : !isPrevSwap ? prevHop?.dstData.estAmount : undefined
    const srcMinAmount = hopIndex === 0 || !isPrevSwap ? srcEstAmount : getMinAmount(srcEstAmount, slippageBps)

    const dstEstAmount = !isSrcSwap ? srcEstAmount : undefined
    const dstMinAmount = !isSrcSwap ? dstEstAmount : undefined

    const hop: Hop = {
        srcData: {
            chain: hopSrcChain,
            token: hopSrcToken,
            estAmount: srcEstAmount,
            minAmount: srcMinAmount,
        },
        dstData: {
            chain: hopDstChain,
            token: path.dstData.token,
            estAmount: dstEstAmount,
            minAmount: dstMinAmount,
        },
        type: hopType,
        index: hopIndex,
        bridgePath: path,
        estGasUnits: getHopTypeEstGasUnits(hopType),
    }

    return {
        hop: hop,
        isNextHop: isNextHop,
    }
}

export const getBridgePathSwapAndTransferHop = ({
    route,
    prevHop,
    hopIndex,
    slippageBps,
}: {
    route: SwapRoute,
    prevHop?: Hop,
    hopIndex: number,
    slippageBps?: bigint,
}) => {

    if (!isValidSwapRoute(route) || !prevHop || prevHop.dstData.chain.id !== route.dstData.chain.id || prevHop.dstData.token.id === route.dstData.token.id) {
        return
    }

    const { dstData: srcData } = prevHop
    const { dstData } = route

    const isPrevSwap = isSwapHopType(prevHop.type)
    const estAmount = prevHop.dstData.estAmount
    const minAmont = isPrevSwap ? getMinAmount(estAmount, slippageBps) : estAmount

    const hop: Hop = {
        srcData: {
            chain: srcData.chain,
            token: srcData.token,
            estAmount: estAmount,
            minAmount: minAmont,
        },
        dstData: {
            chain: dstData.chain,
            token: dstData.token,
        },
        type: HopType.SwapAndTransfer,
        index: hopIndex,
        estGasUnits: getHopTypeEstGasUnits(HopType.SwapAndTransfer),
    }

    return hop
}
