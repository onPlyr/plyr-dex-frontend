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
    if (token.isCustomToken) {
        if (!token.uid) {
            console.warn('[getPriceApiTokenId] Custom token has no uid');
            return "";
        }
        return token.uid.toLowerCase();
    }
    if (!token.id) {
        console.warn('[getPriceApiTokenId] Token has no id');
        return `${prefix}${separator}undefined`.toLowerCase();
    }
    return `${prefix}${separator}${token.id}`.toLowerCase();
}

const fetchPrices = async ({
    tokens,
    sources,
    currency,
    initialData,
}: FetchPricesParameters) => {

    const prices = new Map(initialData)

    try {

        if (!tokens || !tokens.length) {
            return prices;
        }

        // Filter out any invalid tokens
        const validTokens = tokens.filter(token => token && token.uid);
        if (validTokens.length !== tokens.length) {
            console.warn(`[fetchPrices] Filtered out ${tokens.length - validTokens.length} invalid tokens`);
        }
        
        const tokenIdData: TokenIdMap = new Map(validTokens.map((token) => {
            const apiId = getPriceApiTokenId(token);
            return [token.uid, apiId];
        }));
        const tokenApiIds = Array.from(new Set(tokenIdData.values()))

        const urlParams = new URLSearchParams({
            tokens: tokenApiIds.join(","),
            currency: "usd", // todo: use currency from preferences
        })

        if (sources && sources.length > 0) {
            urlParams.append("sources", sources.join(","))
        }

        const baseUrl = getBaseUrl();
        const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
        const url = new URL(`${apiPath}/prices/?${urlParams}`, baseUrl);
        
        const response = await fetch(url.href)
        
        if (!response.ok) {
            console.error(`[fetchPrices] API error: ${response.status} ${response.statusText}`);
            try {
                const errorText = await response.text();
                console.error(`[fetchPrices] Error details: ${errorText}`);
            } catch (err) {
                console.error(`[fetchPrices] Could not read error details:`, err);
            }
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
        console.error(`[fetchPrices] Error:`, err);
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
