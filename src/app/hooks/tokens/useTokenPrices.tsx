import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatUnits, parseUnits } from "viem"

import { TokenPriceConfig } from "@/app/config/prices"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PriceResponse } from "@/app/types/prices"
import { getInitialTokenAmountDataMap } from "@/app/lib/tokens"
import { getParsedError, getBaseUrl } from "@/app/lib/utils"
import { Currency } from "@/app/types/currency"
import { PreferenceType } from "@/app/types/preferences"
import { GetTokenAmountFunction, GetTokenAmountValueFunction, isValidTokenAmount, Token, TokenAmount, TokenAmountDataMap, TokenUid } from "@/app/types/tokens"

type TokenIdMap = Map<TokenUid, string>

export interface UseTokenPricesReturnType {
    prices: TokenAmountDataMap,
    getPrice: GetTokenAmountFunction,
    getAmountValue: GetTokenAmountValueFunction,
    isPending: boolean,
    isFetching: boolean,
    isInProgress: boolean,
    error?: string,
    refetch: () => void,
}

interface FetchPricesParameters {
    tokens: Token[],
    sources?: string[],
    currency: Currency,
    initialData: TokenAmountDataMap,
}

const getPriceApiTokenId = (token: Token, prefix: string = TokenPriceConfig.ApiIdPrefix, separator: string = ":") => {

    if (!token.priceId) {
        switch (token.uid) {
            // BLUB
            case '16180:0x528B5C9f4a401B230F6e15014522e1b60a15f342':
                return '43114:0x0f669808d88B2b0b3D23214DCD2a1cc6A8B1B5cd'.toLowerCase()
            // KIMBO
            case '16180:0xcEf949Aaf9a0d91892eb452FB03914F40eAc16dd':
                return '43114:0x184ff13B3EBCB25Be44e860163A5D8391Dd568c1'.toLowerCase()
            // WINK
            case '16180:0x3433DC3a55D9C77315CD939AD775000D31F426D5':
                return '43114:0x7698A5311DA174A95253Ce86C21ca7272b9B05f8'.toLowerCase()
            // APEX
            case '16180:0x612A487212710fCDc022935Ae5757FaCABD2881a':
                return '43114:0x98B172A09102869adD73116FC92A0A60BFF4778F'.toLowerCase()
            // JOE
            case '16180:0xef40C286c6D7c90C19ffcEb54d8C225DAa554C3F':
                return '43114:0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd'.toLowerCase()
            // KEY
            case '16180:0x78DE1332ef4775811fff5000D5A9eBF70a665B5b':
                return '43114:0xFFFF003a6BAD9b743d658048742935fFFE2b6ED7'.toLowerCase()
            // GAMR
            case '16180:0x413F1a8F0A2Bd9b6D31B2CA91c4aa7bC08266731':
                return '43114:0xEcB70d85aA4dAc4102688c313588710A3f143529'.toLowerCase()
        }

    }



    return (token.priceId ? `${prefix}${separator}${token.priceId}` : token.uid).toLowerCase()
    // if (token.isCustomToken) {
    //     if (!token.uid) {
    //         console.warn('[getPriceApiTokenId] Custom token has no uid');
    //         return "";
    //     }
    //     return token.uid.toLowerCase();
    // }
    // if (!token.id) {
    //     console.warn('[getPriceApiTokenId] Token has no id');
    //     return `${prefix}${separator}undefined`.toLowerCase();
    // }
    // return `${prefix}${separator}${token.id}`.toLowerCase();
}

const fetchPrices = async ({
    tokens,
    sources,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currency,
    initialData,
}: FetchPricesParameters) => {

    const prices = new Map(initialData)

    try {

        if (!tokens.length) {
            return prices
        }

        // // Filter out any invalid tokens
        // const validTokens = tokens.filter(token => token && token.uid);
        // if (validTokens.length !== tokens.length) {
        //     console.warn(`[fetchPrices] Filtered out ${tokens.length - validTokens.length} invalid tokens`);
        // }

        const tokenIdData: TokenIdMap = new Map(tokens.map((token) => [token.uid, getPriceApiTokenId(token)]))
        const tokenApiIds = Array.from(new Set(tokenIdData.values()))

        const urlParams = new URLSearchParams({
            tokens: tokenApiIds.join(","),
            currency: "usd", // todo: use currency from preferences
        })

        if (sources && sources.length > 0) {
            urlParams.append("sources", sources.join(","))
        }

        const baseUrl = getBaseUrl()
        const apiPath = baseUrl.endsWith('/api') ? '' : '/api'
        const url = new URL(`${apiPath}/prices/?${urlParams}`, baseUrl)

        const response = await fetch(url.href)

        if (!response.ok) {
            console.warn(`[fetchPrices] API error: ${response.status} ${response.statusText}`)
            try {
                const errorText = await response.text()
                console.warn(`[fetchPrices] Error details: ${errorText}`)
            } catch (err) {
                console.warn(`[fetchPrices] Could not read error details:`, err)
            }
            throw new Error(`Failed to fetch token prices: ${response.statusText}`)
        }

        const responseData: PriceResponse = await response.json()

        if (!responseData.data.prices) {
            throw new Error(`Invalid API response structure: missing data.prices`)
        }

        for (const priceData of responseData.data.prices) {

            const apiId = priceData.id
            const tokenUids = Array.from(tokenIdData.entries()).filter(([uid, id]) => apiId === id && prices.has(uid)).map(([uid, _]) => uid)

            tokenUids.forEach((uid) => prices.set(uid, {
                amount: parseUnits(priceData.price, TokenPriceConfig.Decimals),
                formatted: priceData.price,
            }))
        }

        return prices
    }

    catch (err) {
        console.warn(`[fetchPrices] Error:`, err);
        throw new Error(getParsedError(err))
    }

}

const useTokenPrices = (tokens: Token[], sources?: string[]): UseTokenPricesReturnType => {

    const { getPreference } = usePreferences()
    const currency = useMemo(() => getPreference(PreferenceType.Currency), [getPreference])
    const initialPrices = useMemo(() => getInitialTokenAmountDataMap(tokens), [tokens])

    const { data, isPending, isFetching, error, refetch } = useQuery({
        queryKey: ["prices", tokens, sources, currency],
        queryFn: async () => fetchPrices({
            tokens: tokens,
            sources: sources,
            currency: currency,
            initialData: initialPrices,
        }),
        staleTime: TokenPriceConfig.QueryStaleMs,
        // placeholderData: initialPrices,
    })

    const prices = useMemo(() => data ?? initialPrices, [initialPrices, data])
    const errorMsg = useMemo(() => error ? getParsedError(error) : undefined, [error])

    const getPrice = useCallback((token?: Token) => (token && prices.get(token.uid)) ?? {}, [prices])
    const getAmountValue = useCallback((token?: Token, amount?: TokenAmount): TokenAmount => {

        const price = getPrice(token)
        if (!token || !isValidTokenAmount(amount) || !isValidTokenAmount(price)) {
            return {}
        }

        const formatted = formatUnits(amount.amount * price.amount, token.decimals + TokenPriceConfig.Decimals)
        return {
            amount: parseUnits(formatted, TokenPriceConfig.Decimals),
            formatted: formatted,
        }

    }, [getPrice])

    return {
        prices: prices,
        getPrice: getPrice,
        getAmountValue: getAmountValue,
        isPending: isPending,
        isFetching: isFetching,
        isInProgress: isFetching,
        error: errorMsg,
        refetch: refetch,
    }
}

export default useTokenPrices