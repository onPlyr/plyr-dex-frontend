import { useEffect, useMemo } from "react"
import { QueryStatus } from "@tanstack/query-core"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { SwapQuoteConfig } from "@/app/config/swaps"
import useApiData from "@/app/hooks/apis/useApiData"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokens from "@/app/hooks/tokens/useTokens"
import usePrevious from "@/app/hooks/utils/usePrevious"
import { getSwapQuoteData } from "@/app/lib/swaps"
import { getParsedError } from "@/app/lib/utils"
import { GetApiTokenPairFunction } from "@/app/providers/ApiDataProvider"
import { CellRouteData, CellRouteDataParameter } from "@/app/types/cells"
import { PreferenceType } from "@/app/types/preferences"
import { isValidSwapRoute, SwapQuoteData, SwapRoute } from "@/app/types/swaps"
import { GetSupportedTokenByIdFunction, GetTokenFunction } from "@/app/types/tokens"

export interface UseSwapQuotesReturnType {
    data?: SwapQuoteData,
    isPending: boolean,
    isFetching: boolean,
    isInProgress: boolean,
    status: QueryStatus,
    error?: string,
    refetch: () => void,
}

interface FetchQuotesParameters {
    route?: SwapRoute,
    getToken: GetTokenFunction,
    getSupportedTokenById: GetSupportedTokenByIdFunction,
    getApiTokenPair: GetApiTokenPairFunction,
    cellRouteData: CellRouteData,
}

const fetchQuotes = async ({
    route,
    getToken,
    getSupportedTokenById,
    getApiTokenPair,
    cellRouteData,
}: FetchQuotesParameters) => {

    try {

        if (!route || !isValidSwapRoute(route)) {
            return null
        }

        const { data, error } = await getSwapQuoteData({
            route: route,
            getApiTokenPair: getApiTokenPair,
            cellRouteData: cellRouteData,
            getToken: getToken,
            getSupportedTokenById: getSupportedTokenById,
        })

        if (error) {
            throw new Error(error)
        }
        else if (!data) {
            return null
        }

        return data
    }

    catch (err) {
        throw new Error(getParsedError(err))
    }
}

const useSwapQuotes = (route?: SwapRoute): UseSwapQuotesReturnType => {

    const { getToken, getSupportedTokenById, setCustomToken } = useTokens()
    const { getApiTokenPair } = useApiData()
    const { getPreference } = usePreferences()
    const cellRouteData: CellRouteData = useMemo(() => ({ [CellRouteDataParameter.SlippageBips]: BigInt(getPreference(PreferenceType.Slippage)) }), [getPreference])
    const enabled = useMemo(() => Boolean(route && isValidSwapRoute(route)), [route])

    const queryClient = useQueryClient()
    const queryKey = useMemo(() => ["quotes", route, getToken, getSupportedTokenById, getApiTokenPair, cellRouteData], [route, getToken, getSupportedTokenById, getApiTokenPair, cellRouteData])
    const previousQueryKey = usePrevious(queryKey)

    const { data, isPending, isFetching, error, status, refetch } = useQuery({
        queryKey: queryKey,
        queryFn: async () => fetchQuotes({
            route: route,
            getToken: getToken,
            getSupportedTokenById: getSupportedTokenById,
            getApiTokenPair: getApiTokenPair,
            cellRouteData: cellRouteData,
        }),
        enabled: enabled,
        staleTime: 0,
        gcTime: SwapQuoteConfig.QuoteValidMs,
        refetchInterval: SwapQuoteConfig.QuoteValidMs,
        refetchIntervalInBackground: true,
    })

    const swapQuoteData = useMemo(() => enabled && data ? data : undefined, [enabled, data])
    const quoteTokenData = useMemo(() => data?.quoteTokens, [data])
    const errorMsg = useMemo(() => error ? getParsedError(error) : undefined, [error])

    useEffect(() => {
        if (quoteTokenData) {
            quoteTokenData.forEach((token) => setCustomToken(token))
        }
    }, [quoteTokenData])

    useEffect(() => {
        if (previousQueryKey && previousQueryKey !== queryKey) {
            queryClient.cancelQueries({
                queryKey: previousQueryKey,
                exact: true,
            })
        }
    }, [queryKey, previousQueryKey])

    return {
        data: swapQuoteData,
        isPending: isPending,
        isFetching: isFetching,
        isInProgress: isFetching,
        status: status,
        error: errorMsg,
        refetch: refetch,
    }
}

export default useSwapQuotes
