import { NextRequest } from "next/server"
import { Address } from "viem"
import { serialize } from "wagmi"

import { ApiProviderData } from "@/app/config/apis"
import { Tokens } from "@/app/config/tokens"
import { getApiParamsData, getApiUrl } from "@/app/lib/apis"
import { ApiProvider, ApiResult, ApiRoute, ApiRouteType, ApiTokenPairData, ApiTokenPairName } from "@/app/types/apis"

export const dynamicParams = false
export const revalidate = 3600
export const fetchCache = "only-cache"

const provider = ApiProvider.Dexalot
const route = ApiRoute.Pairs
const providerData = ApiProviderData[provider]

export interface PairsResponseData {
    [pairName: ApiTokenPairName]: {
        base: string,
        quote: string,
        liquidityUSD: number,
        baseAddress: Address,
        quoteAddress: Address,
        baseDecimals: number,
        quoteDecimals: number,
    },
}

export const GET = async (request: NextRequest) => {

    const result: ApiResult = {}
    const { chain, _enabled } = getApiParamsData({
        provider: provider,
        searchParams: request.nextUrl.searchParams,
    })
    const url = getApiUrl({
        provider: provider,
        route: route,
        type: ApiRouteType.Api,
        params: {
            chainid: chain?.id.toString(),
        },
    })
    const enabled = !(!_enabled || !chain || !url)

    if (!enabled) {
        return Response.json(result)
    }

    try {

        const response = await fetch(url.href, providerData.apiFetchOptions)
        if (!response.ok) {
            result.error = `Bad response from endpoint: ${url.href}`
            throw new Error(result.error)
        }

        const data = await response.json() as PairsResponseData
        const tokens = Tokens.filter((token) => token.chainId === chain.id && token.apiData?.[provider])

        if (tokens.length === 0) {
            result.msg = "No tokens found"
            throw new Error(result.msg)
        }

        const tokenPairData: ApiTokenPairData = {}
        for (const token of tokens) {

            const providerTokenId = token.apiData?.[provider]?.id.toLowerCase()
            if (!providerTokenId) {
                continue
            }

            const asBaseToken = Object.entries(data).filter(([_, pair]) => pair.base.toLowerCase() === providerTokenId)
            const asQuoteToken = Object.entries(data).filter(([_, pair]) => pair.quote.toLowerCase() === providerTokenId)
            if (asBaseToken.length === 0 && asQuoteToken.length === 0) {
                continue
            }

            if (!tokenPairData[token.id]) {
                tokenPairData[token.id] = {
                    asBaseToken: {},
                    asQuoteToken: {},
                }
            }

            for (const [name, pair] of asBaseToken) {

                const quoteToken = tokens.find((t) => t.apiData?.[provider]?.id.toLowerCase() === pair.quote.toLowerCase())
                if (!quoteToken) {
                    continue
                }

                tokenPairData[token.id].asBaseToken[quoteToken.id] = name as ApiTokenPairName
            }

            for (const [name, pair] of asQuoteToken) {

                const baseToken = tokens.find((t) => t.apiData?.[provider]?.id.toLowerCase() === pair.base.toLowerCase())
                if (!baseToken) {
                    continue
                }

                tokenPairData[token.id].asQuoteToken[baseToken.id] = name as ApiTokenPairName
            }
        }

        result.data = tokenPairData
    }

    catch (err) {
        if (!result.msg) {
            result.isError = true
            if (!result.error) {
                result.error = `Error fetching pairs data: ${err}`
            }
        }
    }

    console.log(`>>> dexalot pairs result: ${serialize(result)}`)
    return Response.json(result)
}
