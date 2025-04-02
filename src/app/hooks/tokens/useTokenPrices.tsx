import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatUnits, parseUnits } from "viem"

import { Currency } from "@/app/config/numbers"
import { TokenPriceConfig } from "@/app/config/prices"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PriceResponse } from "@/app/lib/prices/types"
import { getInitialTokenAmountDataMap } from "@/app/lib/tokens"
import { getParsedError } from "@/app/lib/utils"
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
    return (token.isCustomToken ? token.uid : `${prefix}${separator}${token.id}`).toLowerCase()
}

const fetchPrices = async ({
    tokens,
    sources,
    currency,
    initialData,
}: FetchPricesParameters) => {

    const prices = new Map(initialData)

    try {

        if (!tokens.length) {
            return prices
        }

        const tokenIdData: TokenIdMap = new Map(tokens.map((token) => [token.uid, getPriceApiTokenId(token)]))
        const tokenApiIds = Array.from(new Set(tokenIdData.values()))

        const urlParams = new URLSearchParams({
            tokens: tokenApiIds.join(","),
            currency: currency,
        })

        if (sources && sources.length > 0) {
            urlParams.append("sources", sources.join(","))
        }

        const url = new URL(`/api/prices/?${urlParams}`, process.env.NEXT_PUBLIC_BASE_API_URL)
        const response = await fetch(url.href)
        if (!response.ok) {
            throw new Error(`Failed to fetch token prices: ${response.statusText}`)
        }

        const responseData: PriceResponse = await response.json()
        if (!responseData.data.prices) {
            throw new Error(`Invalid API response structure: missing data.prices`)
        }

        for (const priceData of responseData.data.prices) {

            const apiId = priceData.id
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const tokenUids = Array.from(tokenIdData.entries()).filter(([uid, id]) => apiId === id && prices.has(uid)).map(([uid, _]) => uid)

            tokenUids.forEach((uid) => prices.set(uid, {
                amount: parseUnits(priceData.price, TokenPriceConfig.Decimals),
                formatted: priceData.price,
            }))
        }

        return prices
    }

    catch (err) {
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
