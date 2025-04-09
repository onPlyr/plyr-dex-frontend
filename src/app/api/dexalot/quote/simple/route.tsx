import { NextRequest } from "next/server"
import { formatUnits, parseUnits } from "viem"
import { serialize } from "wagmi"

import { ApiProviderData } from "@/app/config/apis"
import { getApiParamsData, getApiUrl, hasApiKey, isApiKeyRequired } from "@/app/lib/apis"
import { ApiProvider, ApiResult, ApiRoute, ApiRouteType, ApiSimpleQuoteResultData, ApiTokenPairName } from "@/app/types/apis"

const channel = process.env.DEXALOT_API_CHANNEL || ""
const provider = ApiProvider.Dexalot
const route = ApiRoute.SimpleQuote
const providerData = ApiProviderData[provider]

interface SimpleQuoteResponseData {
    success: boolean,
    pair: ApiTokenPairName,
    side: 0 | 1,
    price: string,
    baseAmount: string,
    quoteAmount: string,
}

export const GET = async (request: NextRequest) => {

    const result: ApiResult = {}
    const { networkMode, chain, srcToken, srcAmount, dstToken, pair, isBase, _enabled } = getApiParamsData({
        provider: provider,
        searchParams: request.nextUrl.searchParams,
    })
    const url = getApiUrl({
        provider: provider,
        networkMode: networkMode,
        route: route,
        type: ApiRouteType.Api,
        params: {
            chainid: chain?.id.toString(),
            pair: pair,
            amount: srcToken && srcAmount && formatUnits(srcAmount, srcToken.decimals),
            isbase: isBase ? 1 : 0,
            side: isBase ? 1 : 0,
            channel: channel,
        },
    })
    const enabled = !(!_enabled || !chain || !srcToken || !srcAmount || srcAmount === BigInt(0) || !dstToken || !pair || !url || (isApiKeyRequired(provider) && !hasApiKey(provider)))

    if (!enabled) {
        return Response.json(result)
    }

    try {

        const response = await fetch(url.href, providerData.apiFetchOptions)
        if (!response.ok) {
            result.error = `Bad response from endpoint: ${url.href}`
            throw new Error(result.error)
        }

        const responseData = await response.json() as SimpleQuoteResponseData
        const dstAmount = parseUnits(isBase ? responseData.quoteAmount : responseData.baseAmount, dstToken.decimals)

        if (dstAmount === BigInt(0)) {
            result.msg = "Returned zero amount"
            throw new Error(result.msg)
        }

        result.data = {
            amount: dstAmount.toString(),
        } as ApiSimpleQuoteResultData
    }

    catch (err) {
        if (!result.msg) {
            result.isError = true
            if (!result.error) {
                result.error = `Error fetching simple quote: ${err}`
            }
        }
    }

    console.log(`>>> dexalot simple quote result: ${serialize(result)}`)
    return Response.json(result)
}
