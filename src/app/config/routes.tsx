import { SupportedChains } from "@/app/config/chains"
import { getChain } from "@/app/lib/chains"
import { getChainTokens, getIsVariant, getNativeTokenVariant, getToken, getWrappedTokenVariant } from "@/app/lib/tokens"
import { BridgeRoute, ChainBridgeRouteData, TokenBridgeRouteData } from "@/app/types/swaps"
import { TokenId } from "@/app/types/tokens"

const chainBridgeRouteData: Record<number, BridgeRoute[]> = {}
const tokenBridgeRouteData: TokenBridgeRouteData = {}

const allChains = Object.values(SupportedChains)
allChains.forEach((srcChain) => {
    const routes: BridgeRoute[] = []
    const srcTokens = getChainTokens(srcChain, true)
    srcTokens.forEach((srcToken) => {
        if (srcToken.bridges) {
            Object.entries(srcToken.bridges).forEach(([dstChainId, srcBridgeData]) => {
                const dstChain = getChain(parseInt(dstChainId))
                if (dstChain) {
                    const dstNativeToken = srcToken.isNative !== true ? getNativeTokenVariant(srcToken, dstChain) : undefined
                    const dstSameToken = dstNativeToken === undefined ? getToken(srcToken.id, dstChain) : undefined
                    const dstWrappedToken = srcToken.isNative && dstNativeToken === undefined && dstSameToken === undefined ? getWrappedTokenVariant(srcToken, dstChain) : undefined
                    const dstToken = dstNativeToken ?? dstSameToken ?? dstWrappedToken
                    const dstBridgeData = dstToken?.bridges?.[srcChain.id]
                    if (dstToken && dstBridgeData) {
                        routes.push({
                            srcChain: srcChain,
                            srcToken: srcToken,
                            srcBridge: srcBridgeData,
                            dstChain: dstChain,
                            dstToken: dstToken,
                            dstBridge: dstBridgeData,
                        })
                    }
                }
            })
        }
    })
    chainBridgeRouteData[srcChain.id] = routes
})
export const ChainBridgeRoutes = {
    ...chainBridgeRouteData,
} as const as ChainBridgeRouteData

const dstChainBridgeRouteData: Record<number, BridgeRoute[]> = {}
for (const [chainId, routes] of Object.entries(chainBridgeRouteData)) {
    dstChainBridgeRouteData[parseInt(chainId)] = routes.map((route) => ({
        srcChain: route.dstChain,
        srcToken: route.dstToken,
        srcBridge: route.dstBridge,
        dstChain: route.srcChain,
        dstToken: route.srcToken,
        dstBridge: route.srcBridge,
    }))
}
export const DstChainBridgeRoutes = {
    ...dstChainBridgeRouteData,
} as const as ChainBridgeRouteData

const allTokenBridgeRoutes = Object.values(ChainBridgeRoutes).flat()
const bridgeRouteTokens = [...new Set(allTokenBridgeRoutes.map((route) => route.srcToken))]
bridgeRouteTokens.forEach((token) => {
    tokenBridgeRouteData[token.id] = allTokenBridgeRoutes.filter((route) => route.srcToken.id === token.id || (getIsVariant(token, route.srcToken) && getIsVariant(token, route.dstToken)))
})
export const TokenBridgeRoutes: TokenBridgeRouteData = {
    ...tokenBridgeRouteData,
} as const

const dstTokenBridgeRouteData: TokenBridgeRouteData = {}
for (const [tokenId, routes] of Object.entries(tokenBridgeRouteData)) {
    dstTokenBridgeRouteData[tokenId as TokenId] = routes.map((route) => ({
        srcChain: route.dstChain,
        srcToken: route.dstToken,
        srcBridge: route.dstBridge,
        dstChain: route.srcChain,
        dstToken: route.srcToken,
        dstBridge: route.dstBridge,
    }))
}
export const DstTokenBridgeRoutes: TokenBridgeRouteData = {
    ...dstTokenBridgeRouteData,
} as const
