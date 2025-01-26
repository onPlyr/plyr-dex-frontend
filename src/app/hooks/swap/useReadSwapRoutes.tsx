import { useCallback, useEffect, useState } from "react"
import { QueryStatus } from "@tanstack/react-query"
import { useReadContracts } from "wagmi"

import { defaultSlippageBps, RouteValidMs } from "@/app/config/swaps"
import useToast from "@/app/hooks/toast/useToast"
import useTokens from "@/app/hooks/tokens/useTokens"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { getBaseQuoteData, getBridgeQuote, getQuoteData, getRouteData, getSwapQuery, getSwapQueryData, getSwapQueryResultData, getSwapQuote, sortRoutes } from "@/app/lib/routes"
import { getErrorToastData } from "@/app/lib/utils"
import { CellRouteData, CellRouteDataParameter } from "@/app/types/cells"
import { Chain } from "@/app/types/chains"
import { PreferenceType } from "@/app/types/preferences"
import { EncodedRouteQueryResult, Route, RouteQuery, RouteQuote, RouteQuoteData, RouteType, SwapQueryData, SwapQueryType } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

const useReadSwapRoutes = ({
    srcChain,
    srcToken,
    srcAmount,
    dstChain,
    dstToken,
    _enabled = true,
}: {
    srcChain?: Chain,
    srcToken?: Token,
    srcAmount: bigint,
    dstChain?: Chain,
    dstToken?: Token,
    _enabled?: boolean,
}) => {

    const { preferences } = usePreferences()
    const { getTokenData } = useTokens()
    const cellRouteData: CellRouteData = {
        [CellRouteDataParameter.SlippageBips]: BigInt(preferences[PreferenceType.Slippage] || defaultSlippageBps),
    }

    // todo: update ui to deal with quotes returned and routes when proceeding to swap instead
    // todo: consider waiting until all queries are completed before returning routes as it causes multiple rerenders currently
    const enabled = _enabled !== false && srcChain !== undefined && srcToken !== undefined && srcAmount > 0 && dstChain !== undefined && dstToken !== undefined && srcChain.cells.length > 0 && dstChain.cells.length > 0

    const [queryStatus, setQueryStatus] = useState<QueryStatus>("pending")
    const [routeQuotes, setRouteQuotes] = useState<RouteQuote[]>([])
    const [bridgeQuotes, setBridgeQuotes] = useState<RouteQuote[]>([])

    const [routes, setRoutes] = useState<Route[]>()

    const [bridgeQuoteData, setBridgeQuoteData] = useState<RouteQuoteData[]>([])
    const [swapQuoteData, setSwapQuoteData] = useState<RouteQuoteData[]>([])

    const [primaryQueryData, setPrimaryQueryData] = useState<SwapQueryData[]>([])
    const [secondaryQueryData, setSecondaryQueryData] = useState<SwapQueryData[]>([])
    const [finalQueryData, setFinalQueryData] = useState<SwapQueryData[]>([])

    const [primaryQueries, setPrimaryQueries] = useState<RouteQuery[]>([])
    const [secondaryQueries, setSecondaryQueries] = useState<RouteQuery[]>([])
    const [finalQueries, setFinalQueries] = useState<RouteQuery[]>([])

    const [primaryQuotes, setPrimaryQuotes] = useState<RouteQuote[]>([])
    const [secondaryQuotes, setSecondaryQuotes] = useState<RouteQuote[]>([])
    const [finalQuotes, setFinalQuotes] = useState<RouteQuote[]>([])

    useEffect(() => {

        const bridgeData: RouteQuoteData[] = []
        const swapData: RouteQuoteData[] = []

        if (enabled) {
            const quoteData = getQuoteData(srcChain, srcToken, srcAmount, dstChain, dstToken)
            quoteData?.forEach((data) => {
                if (data.type === RouteType.Bridge) {
                    bridgeData.push(data)
                }
                else {
                    swapData.push(data)
                }
            })
        }

        setBridgeQuoteData(bridgeData)
        setSwapQuoteData(swapData)

    }, [enabled, srcChain, srcToken, srcAmount, dstChain, dstToken])

    useEffect(() => {
        const bridgeRouteQuotes: RouteQuote[] = []
        if (enabled && bridgeQuoteData.length > 0) {
            bridgeQuoteData.forEach((data) => {
                const quote = getBridgeQuote(data, getTokenData)
                if (quote) {
                    bridgeRouteQuotes.push(quote)
                }
            })
        }
        setBridgeQuotes(bridgeRouteQuotes)
    }, [enabled, bridgeQuoteData])

    useEffect(() => {

        const swapQueryData: SwapQueryData[] = []
        const queries: RouteQuery[] = []

        if (enabled && swapQuoteData.length > 0) {
            const queryData = getSwapQueryData(swapQuoteData)
            queryData.forEach((data) => {
                if (data.primaryHop.isPrimaryQuery) {
                    const query = getSwapQuery(data.primaryHop.data, cellRouteData)
                    const minAmountQuery = getSwapQuery(data.primaryHop.data, cellRouteData, true)
                    if (query) {
                        data.primaryHop.index = queries.push(query) - 1
                        if (minAmountQuery) {
                            data.primaryHop.minAmountIndex = queries.push(minAmountQuery) - 1
                        }
                        swapQueryData.push(data)
                    }
                }
                else if (data.secondaryHop && data.secondaryHop.isPrimaryQuery) {
                    const query = getSwapQuery(data.secondaryHop.data, cellRouteData)
                    const minAmountQuery = getSwapQuery(data.secondaryHop.data, cellRouteData, true)
                    if (query) {
                        data.secondaryHop.index = queries.push(query) - 1
                        if (minAmountQuery) {
                            data.secondaryHop.minAmountIndex = queries.push(minAmountQuery) - 1
                        }
                        swapQueryData.push(data)
                    }
                }
                else if (data.finalHop && data.finalHop.isPrimaryQuery) {
                    const query = getSwapQuery(data.finalHop.data, cellRouteData)
                    const minAmountQuery = getSwapQuery(data.finalHop.data, cellRouteData, true)
                    if (query) {
                        data.finalHop.index = queries.push(query) - 1
                        if (minAmountQuery) {
                            data.finalHop.minAmountIndex = queries.push(minAmountQuery) - 1
                        }
                        swapQueryData.push(data)
                    }
                }
            })
        }

        setPrimaryQueries(queries)
        setPrimaryQueryData(swapQueryData)

    }, [enabled, swapQuoteData])

    const { data: primaryQueryResults, refetch: refetchPrimaryQueryResults, status: primaryQueryStatus, error: primaryQueryError } = useReadContracts({
        contracts: primaryQueries,
        query: {
            enabled: enabled && primaryQueries.length > 0,
            gcTime: 0,
            refetchInterval: RouteValidMs,
        },
    })

    // console.log(`>>> useReadSwapRoutes primaryQueryResults: ${serialize(primaryQueryResults)}`)
    // console.log(`>>> useReadSwapRoutes primaryQueries.length: ${serialize(primaryQueries.length)}`)

    useEffect(() => {

        const swapQueryData: SwapQueryData[] = []
        const queries: RouteQuery[] = []
        const quotes: RouteQuote[] = []

        if (enabled && primaryQueryData.length > 0 && primaryQueryResults && primaryQueryResults.length > 0) {

            primaryQueryData.forEach((data) => {
                if (data.primaryHop.isPrimaryQuery && data.primaryHop.index !== undefined && primaryQueryResults[data.primaryHop.index]?.result !== undefined) {

                    const { srcCell: queryCell } = getBaseQuoteData(data.primaryHop.data, getTokenData)
                    const encodedResult = queryCell ? primaryQueryResults[data.primaryHop.index].result as EncodedRouteQueryResult : undefined
                    const encodedMinAmountResult = queryCell && data.primaryHop.minAmountIndex !== undefined ? primaryQueryResults[data.primaryHop.minAmountIndex].result as EncodedRouteQueryResult : undefined
                    const { hopData, nextHopData, isNextQuery, nextQuery, nextMinAmountQuery, isError } = getSwapQueryResultData({
                        queryData: data,
                        queryType: SwapQueryType.Primary,
                        queryCell: queryCell,
                        encodedResult: encodedResult,
                        encodedMinAmountResult: encodedMinAmountResult,
                        cellRouteData: cellRouteData,
                    })

                    if (hopData && isError !== true) {
                        data.primaryHop = hopData
                        if (nextHopData && nextQuery) {
                            nextHopData.index = queries.push(nextQuery) - 1
                            if (nextMinAmountQuery) {
                                nextHopData.minAmountIndex = queries.push(nextMinAmountQuery) - 1
                            }
                            if (data.secondaryHop?.isSecondaryQuery) {
                                data.secondaryHop = nextHopData
                                swapQueryData.push(data)
                            }
                            else if (data.finalHop?.isSecondaryQuery) {
                                data.finalHop = nextHopData
                                swapQueryData.push(data)
                            }
                        }
                        else if (isNextQuery !== true) {
                            const quote = getSwapQuote(data, getTokenData)
                            if (quote) {
                                quotes.push(quote)
                            }
                        }
                    }
                }

                else if (data.secondaryHop?.isPrimaryQuery && data.secondaryHop.index !== undefined && primaryQueryResults[data.secondaryHop.index]?.result !== undefined) {

                    const { srcCell: queryCell } = getBaseQuoteData(data.secondaryHop.data, getTokenData)
                    const encodedResult = queryCell ? primaryQueryResults[data.secondaryHop.index].result as EncodedRouteQueryResult : undefined
                    const encodedMinAmountResult = queryCell && data.secondaryHop.minAmountIndex !== undefined ? primaryQueryResults[data.secondaryHop.minAmountIndex].result as EncodedRouteQueryResult : undefined
                    const { hopData, nextHopData, isNextQuery, nextQuery, nextMinAmountQuery, isError } = getSwapQueryResultData({
                        queryData: data,
                        queryType: SwapQueryType.Primary,
                        queryCell: queryCell,
                        encodedResult: encodedResult,
                        encodedMinAmountResult: encodedMinAmountResult,
                        cellRouteData: cellRouteData,
                    })

                    if (hopData && isError !== true) {
                        data.secondaryHop = hopData
                        if (nextHopData && nextQuery) {
                            nextHopData.index = queries.push(nextQuery) - 1
                            if (nextMinAmountQuery) {
                                nextHopData.minAmountIndex = queries.push(nextMinAmountQuery) - 1
                            }
                            if (data.finalHop?.isSecondaryQuery) {
                                data.finalHop = nextHopData
                                swapQueryData.push(data)
                            }
                        }
                        else if (isNextQuery !== true) {
                            const quote = getSwapQuote(data, getTokenData)
                            if (quote) {
                                quotes.push(quote)
                            }
                        }
                    }
                }

                else if (data.finalHop?.isPrimaryQuery && data.finalHop.index !== undefined && primaryQueryResults[data.finalHop.index]?.result !== undefined) {

                    const { srcCell: queryCell } = getBaseQuoteData(data.finalHop.data, getTokenData)
                    const encodedResult = queryCell ? primaryQueryResults[data.finalHop.index].result as EncodedRouteQueryResult : undefined
                    const encodedMinAmountResult = queryCell && data.finalHop.minAmountIndex !== undefined ? primaryQueryResults[data.finalHop.minAmountIndex].result as EncodedRouteQueryResult : undefined
                    const { hopData, isError } = getSwapQueryResultData({
                        queryData: data,
                        queryType: SwapQueryType.Primary,
                        queryCell: queryCell,
                        encodedResult: encodedResult,
                        encodedMinAmountResult: encodedMinAmountResult,
                        cellRouteData: cellRouteData,
                    })

                    if (hopData && isError !== true) {
                        data.finalHop = hopData
                        const quote = getSwapQuote(data, getTokenData)
                        if (quote) {
                            quotes.push(quote)
                        }
                    }
                }
            })
        }

        setSecondaryQueries(queries)
        setSecondaryQueryData(swapQueryData)
        setPrimaryQuotes(quotes)

    }, [enabled, primaryQueryData, primaryQueryResults])

    const { data: secondaryQueryResults, refetch: refetchSecondaryQueryResults, status: secondaryQueryStatus, error: secondaryQueryError } = useReadContracts({
        contracts: secondaryQueries,
        query: {
            enabled: enabled && secondaryQueries.length > 0,
            gcTime: 0,
            refetchInterval: RouteValidMs,
        },
    })

    // console.log(`>>> useReadSwapRoutes secondaryQueryResults: ${serialize(secondaryQueryResults)}`)
    // console.log(`>>> useReadSwapRoutes secondaryQueries.length: ${serialize(secondaryQueries.length)}`)

    useEffect(() => {

        const swapQueryData: SwapQueryData[] = []
        const queries: RouteQuery[] = []
        const quotes: RouteQuote[] = []

        if (enabled && secondaryQueryData.length > 0 && secondaryQueryResults && secondaryQueryResults.length > 0) {

            secondaryQueryData.forEach((data) => {
                if (data.secondaryHop?.isSecondaryQuery && data.secondaryHop.index !== undefined && secondaryQueryResults[data.secondaryHop.index]?.result !== undefined) {

                    const { srcCell: queryCell } = getBaseQuoteData(data.secondaryHop.data, getTokenData)
                    const encodedResult = queryCell ? secondaryQueryResults[data.secondaryHop.index].result as EncodedRouteQueryResult : undefined
                    const encodedMinAmountResult = queryCell && data.secondaryHop.minAmountIndex !== undefined ? secondaryQueryResults[data.secondaryHop.minAmountIndex].result as EncodedRouteQueryResult : undefined
                    const { hopData, nextHopData, isNextQuery, nextQuery, nextMinAmountQuery, isError } = getSwapQueryResultData({
                        queryData: data,
                        queryType: SwapQueryType.Secondary,
                        queryCell: queryCell,
                        encodedResult: encodedResult,
                        encodedMinAmountResult: encodedMinAmountResult,
                        cellRouteData: cellRouteData,
                    })

                    if (hopData && isError !== true) {
                        data.secondaryHop = hopData
                        if (nextHopData && nextQuery) {
                            nextHopData.index = queries.push(nextQuery) - 1
                            if (nextMinAmountQuery) {
                                nextHopData.minAmountIndex = queries.push(nextMinAmountQuery) - 1
                            }
                            if (data.finalHop?.isSecondaryQuery) {
                                data.finalHop = nextHopData
                                swapQueryData.push(data)
                            }
                        }
                        else if (isNextQuery !== true) {
                            const quote = getSwapQuote(data, getTokenData)
                            if (quote) {
                                quotes.push(quote)
                            }
                        }
                    }
                }

                else if (data.finalHop?.isSecondaryQuery && data.finalHop.index !== undefined && secondaryQueryResults[data.finalHop.index]?.result !== undefined) {

                    const { srcCell: queryCell } = getBaseQuoteData(data.finalHop.data, getTokenData)
                    const encodedResult = queryCell ? secondaryQueryResults[data.finalHop.index].result as EncodedRouteQueryResult : undefined
                    const encodedMinAmountResult = queryCell && data.finalHop.minAmountIndex !== undefined ? secondaryQueryResults[data.finalHop.minAmountIndex].result as EncodedRouteQueryResult : undefined
                    const { hopData, isError } = getSwapQueryResultData({
                        queryData: data,
                        queryType: SwapQueryType.Secondary,
                        queryCell: queryCell,
                        encodedResult: encodedResult,
                        encodedMinAmountResult: encodedMinAmountResult,
                        cellRouteData: cellRouteData,
                    })

                    if (hopData && isError !== true) {
                        data.finalHop = hopData
                        const quote = getSwapQuote(data, getTokenData)
                        if (quote) {
                            quotes.push(quote)
                        }
                    }
                }
            })
        }

        setFinalQueries(queries)
        setFinalQueryData(swapQueryData)
        setSecondaryQuotes(quotes)

    }, [enabled, secondaryQueryData, secondaryQueryResults])

    const { data: finalQueryResults, refetch: refetchFinalQueryResults, status: finalQueryStatus, error: finalQueryError } = useReadContracts({
        contracts: finalQueries,
        query: {
            enabled: enabled && finalQueries.length > 0,
            gcTime: 0,
            refetchInterval: RouteValidMs,
        },
    })

    // console.log(`>>> useReadSwapRoutes finalQueryResults: ${serialize(finalQueryResults)}`)
    // console.log(`>>> useReadSwapRoutes finalQueries.length: ${serialize(finalQueries.length)}`)

    useEffect(() => {

        const quotes: RouteQuote[] = []

        if (enabled && finalQueryData.length > 0 && finalQueryResults && finalQueryResults.length > 0) {
            finalQueryData.forEach((data) => {
                if (data.finalHop?.isSecondaryQuery && data.finalHop.index !== undefined && finalQueryResults[data.finalHop.index]?.result !== undefined) {

                    const { srcCell: queryCell } = getBaseQuoteData(data.finalHop.data, getTokenData)
                    const encodedResult = queryCell ? finalQueryResults[data.finalHop.index].result as EncodedRouteQueryResult : undefined
                    const encodedMinAmountResult = queryCell && data.finalHop.minAmountIndex !== undefined ? finalQueryResults[data.finalHop.minAmountIndex].result as EncodedRouteQueryResult : undefined
                    const { hopData, isError } = getSwapQueryResultData({
                        queryData: data,
                        queryType: SwapQueryType.Final,
                        queryCell: queryCell,
                        encodedResult: encodedResult,
                        encodedMinAmountResult: encodedMinAmountResult,
                        cellRouteData: cellRouteData,
                    })

                    if (hopData && isError !== true) {
                        data.finalHop = hopData
                        const quote = getSwapQuote(data, getTokenData)
                        if (quote) {
                            quotes.push(quote)
                        }
                    }
                }
            })
        }

        setFinalQuotes(quotes)

    }, [enabled, finalQueryData, finalQueryResults])

    useEffect(() => {
        setRouteQuotes(enabled ? [
            ...bridgeQuotes,
            ...primaryQuotes,
            ...secondaryQuotes,
            ...finalQuotes,
        ] : [])
    }, [enabled, bridgeQuotes, primaryQuotes, secondaryQuotes, finalQuotes])

    // console.log(`>>> useReadSwapRoutes routeQuotes: ${serialize(routeQuotes)}`)
    // console.log(`>>> useReadSwapRoutes routeQuotes.length: ${serialize(routeQuotes.length)}`)

    useEffect(() => {
        const routeData: Route[] = []
        if (enabled && routeQuotes.length > 0) {
            routeQuotes.forEach((quote) => {
                const route = getRouteData(quote)
                if (route) {
                    routeData.push(route)
                }
            })
        }
        setRoutes(sortRoutes(routeData))
    }, [enabled, routeQuotes])

    useEffect(() => {
        if (enabled && swapQuoteData.length > 0) {
            if (primaryQueryStatus === "error" || secondaryQueryStatus === "error" || finalQueryStatus === "error") {
                setQueryStatus("error")
            }
            else if (
                (primaryQueryStatus === "success" || (primaryQueryStatus === "pending" && primaryQueryData.length === 0)) &&
                (secondaryQueryStatus === "success" || (secondaryQueryStatus === "pending" && secondaryQueryData.length === 0)) &&
                (finalQueryStatus === "success" || (finalQueryStatus === "pending" && finalQueryData.length === 0))
            ) {
                setQueryStatus("success")
            }
            else {
                setQueryStatus("pending")
            }
        }
        else if (enabled && bridgeQuoteData.length === bridgeQuotes.length) {
            setQueryStatus("success")
        }
        else {
            setQueryStatus("pending")
        }
    }, [enabled, primaryQueryData, primaryQueryStatus, secondaryQueryData, secondaryQueryStatus, finalQueryData, finalQueryStatus, swapQuoteData, bridgeQuoteData, bridgeQuotes])

    const { addToast } = useToast()
    useEffect(() => {
        if (primaryQueryError) {
            addToast(getErrorToastData({
                description: "Error querying routes. Please check the browser console for more details."
            }))
            console.error(`useReadSwapRoutes - primary query error - name: ${primaryQueryError.name}, message: ${primaryQueryError.message}`)
        }
        if (secondaryQueryError) {
            addToast(getErrorToastData({
                description: "Error querying routes. Please check the browser console for more details."
            }))
            console.error(`useReadSwapRoutes - secondary query error - name: ${secondaryQueryError.name}, message: ${secondaryQueryError.message}`)
        }
        if (finalQueryError) {
            addToast(getErrorToastData({
                description: "Error querying routes. Please check the browser console for more details."
            }))
            console.error(`useReadSwapRoutes - final query error - name: ${finalQueryError.name}, message: ${finalQueryError.message}`)
        }
    }, [primaryQueryError, secondaryQueryError, finalQueryError])

    const refetch = useCallback(() => {
        refetchPrimaryQueryResults()
        refetchSecondaryQueryResults()
        refetchFinalQueryResults()
    }, [refetchPrimaryQueryResults, refetchSecondaryQueryResults, refetchFinalQueryResults])

    return {
        routes: routes,
        quotes: routeQuotes,
        status: queryStatus,
        refetch: refetch,
    }
}

export default useReadSwapRoutes
