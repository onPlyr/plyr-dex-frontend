import { Address, Hex } from "viem"

import { Cell } from "@/app/types/cells"
import { Chain, ChainId } from "@/app/types/chains"
import { NetworkMode } from "@/app/types/preferences"
import { Token, TokenApiData, TokenId } from "@/app/types/tokens"

export const ApiProvider = {
    Dexalot: "dexalot",
} as const
export type ApiProvider = (typeof ApiProvider)[keyof typeof ApiProvider]

export const ApiRoute = {
    Pairs: "pairs",
    SimpleQuote: "simple-quote",
    FirmQuote: "firm-quote",
}
export type ApiRoute = (typeof ApiRoute)[keyof typeof ApiRoute]

export const ApiRouteType = {
    Api: "api",
    App: "app",
}
export type ApiRouteType = (typeof ApiRouteType)[keyof typeof ApiRouteType]

export interface ApiProviderDataType {
    baseApiUrl: {
        [mode in NetworkMode]: `https://${string}`
    },
    apiFetchOptions?: RequestInit,
    routes: {
        [type in ApiRouteType]?: {
            [route in ApiRoute]?: `/${string}`
        }
    },
    supportedChains: ChainId[],
}

export interface BaseApiData {
    networkMode?: NetworkMode,
    chain?: Chain,
    cell?: Cell,
    accountAddress?: Address,
    srcToken?: Token,
    srcTokenData?: TokenApiData,
    srcAmount?: bigint,
    dstToken?: Token,
    dstTokenData?: TokenApiData,
    slippage?: number,
    pair?: ApiTokenPairName,
    isBase?: boolean,
    _enabled: boolean,
}

export interface ApiResult {
    data?: object,
    msg?: string,
    error?: string,
    isError?: boolean,
}

export type ApiTokenPairName = `${string}/${string}`
export interface ApiTokenPairData {
    [tokenId: TokenId]: {
        asBaseToken: {
            [quoteTokenId: TokenId]: ApiTokenPairName,
        },
        asQuoteToken: {
            [baseTokenId: TokenId]: ApiTokenPairName,
        },
    },
}

export type ApiProviderTokenData = {
    [provider in ApiProvider]?: {
        [chainId in ChainId]?: ApiTokenPairData
    }
}

export interface ApiSimpleQuoteResultData {
    amount: string,
}

export interface ApiFirmQuoteResultData {
    encodedTrade: Hex,
    signature: Hex,
    amount: string,
}