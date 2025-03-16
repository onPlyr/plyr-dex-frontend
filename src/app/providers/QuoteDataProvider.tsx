"use client"

import { MotionValue, useMotionValue } from "motion/react"
import { createContext, useCallback, useEffect, useState } from "react"
import { parseUnits } from "viem"

import { defaultNetworkMode } from "@/app/config/chains"
import { DefaultSwapRouteConfig, SwapQuoteConfig } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useSwapQuotes, { UseSwapQuotesReturnType } from "@/app/hooks/swap/useSwapQuotes"
import useTokens from "@/app/hooks/tokens/useTokens"
import useDebounce from "@/app/hooks/utils/useDebounce"
import useInterval from "@/app/hooks/utils/useInterval"
import useSessionStorage from "@/app/hooks/utils/useSessionStorage"
import { getChain } from "@/app/lib/chains"
import { getNativeToken } from "@/app/lib/tokens"
import { StorageKey } from "@/app/types/storage"
import { SwapQuote, SwapRoute, SwapRouteJson } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

export type SetSwapRouteFunction = ({
    srcToken,
    srcAmount,
    dstToken,
    isSwitchTokens,
}: {
    srcToken?: Token,
    srcAmount?: bigint,
    dstToken?: Token,
    isSwitchTokens?: boolean,
}) => void

interface QuoteDataContextType {
    swapRoute: SwapRoute,
    setSwapRoute: SetSwapRouteFunction,
    switchTokens: () => void,
    srcAmountInput: string,
    setSrcAmountInput: (value: string) => void,
    useSwapQuotesData: UseSwapQuotesReturnType,
    selectedQuote?: SwapQuote,
    setSelectedQuote: (quote?: SwapQuote) => void,
    quoteExpiry: number,
    quoteExpiryProgress: MotionValue<number>,
    isQuoteExpired: boolean,
}

export const QuoteDataContext = createContext({} as QuoteDataContextType)

const QuoteDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { data: tokens, getTokenData } = useTokens()
    const { preferences } = usePreferences()
    const networkMode = preferences.networkMode ?? defaultNetworkMode

    const swapRouteSerializer = useCallback((route: SwapRoute): string => {
        return JSON.stringify({
            srcData: {
                chain: route.srcData.chain?.id,
                token: route.srcData.token?.id,
                amount: route.srcData.amount?.toString(),
            },
            dstData: {
                chain: route.dstData.chain?.id,
                token: route.dstData.token?.id,
            },
        } as SwapRouteJson)
    }, [])

    const swapRouteDeserializer = useCallback((value: string): SwapRoute => {
        const route = JSON.parse(value) as SwapRouteJson
        return {
            srcData: {
                chain: route.srcData.chain && getChain(route.srcData.chain),
                token: getTokenData(route.srcData.token, route.srcData.chain),
                amount: route.srcData.amount ? BigInt(route.srcData.amount) : undefined,
            },
            dstData: {
                chain: route.dstData.chain && getChain(route.dstData.chain),
                token: getTokenData(route.dstData.token, route.dstData.chain),
            },
        }
    }, [getTokenData])

    const [swapRoute, setSwapRouteState] = useSessionStorage({
        key: StorageKey.SwapRoute,
        initialValue: {
            srcData: {},
            dstData: {},
        },
        options: {
            serializer: swapRouteSerializer,
            deserializer: swapRouteDeserializer,
        },
    })

    const setSwapRoute: SetSwapRouteFunction = useCallback(({
        srcToken,
        srcAmount,
        dstToken,
        isSwitchTokens = false,
    }) => {

        setSwapRouteState((prev) => {

            if (isSwitchTokens) {
                return {
                    srcData: {
                        chain: prev.dstData.chain,
                        token: prev.dstData.token,
                        amount: BigInt(0),
                    },
                    dstData: {
                        chain: prev.srcData.chain,
                        token: prev.srcData.token,
                    },
                }
            }

            let srcDataToken = srcToken ?? prev.srcData.token
            let dstDataToken = dstToken ?? prev.dstData.token

            if (srcDataToken && dstDataToken && srcDataToken.id === dstDataToken.id && srcDataToken.chainId === dstDataToken.chainId) {
                if (srcToken) {
                    dstDataToken = undefined
                }
                else if (dstToken) {
                    srcDataToken = undefined
                }
                else {
                    srcDataToken = undefined
                    dstDataToken = undefined
                }
            }

            return {
                srcData: {
                    chain: (srcDataToken && getChain(srcDataToken.chainId)) ?? prev.srcData.chain,
                    token: (srcDataToken && getTokenData(srcDataToken.id, srcDataToken.chainId)) ?? prev.srcData.token,
                    amount: srcAmount ?? (prev.srcData.token && srcDataToken && prev.srcData.token.id === srcDataToken.id ? prev.srcData.amount : BigInt(0)),
                },
                dstData: {
                    chain: (dstDataToken && getChain(dstDataToken.chainId)) ?? prev.dstData.chain,
                    token: (dstDataToken && getTokenData(dstDataToken.id, dstDataToken.chainId)) ?? prev.dstData.token,
                },
            }
        })

    }, [setSwapRouteState, getTokenData])

    const useSwapQuotesData = useSwapQuotes(swapRoute)
    const [selectedQuote, setSelectedQuoteState] = useState<SwapQuote>()
    const setSelectedQuote = useCallback((quote?: SwapQuote) => {
        setSelectedQuoteState(quote)
    }, [setSelectedQuoteState])

    useEffect(() => {
        setSelectedQuote(useSwapQuotesData.data?.quotes[0])
    }, [useSwapQuotesData.data?.quotes])

    const [srcAmountInput, setSrcAmountInputState] = useState("")
    const setSrcAmountInput = useCallback((value: string) => {
        setSrcAmountInputState(value)
    }, [setSrcAmountInputState])

    const srcAmountDebounced = useDebounce(srcAmountInput)
    useEffect(() => {
        setSwapRoute({
            srcAmount: parseUnits(srcAmountDebounced.replace(",", "."), swapRoute.srcData.token?.decimals || 18),
        })
    }, [srcAmountDebounced])

    useEffect(() => {
        setSrcAmountInput("")
        setSelectedQuote(undefined)
    }, [swapRoute.srcData.token?.id])

    const switchTokens = useCallback(() => {
        setSrcAmountInput("")
        setSelectedQuote(undefined)
        setSwapRoute({
            isSwitchTokens: true,
        })
    }, [setSwapRoute, setSelectedQuote, setSrcAmountInput])

    useEffect(() => {
        if (!swapRoute.srcData.token || !swapRoute.dstData.token) {
            setSrcAmountInput("")
            setSwapRoute({
                srcToken: swapRoute.srcData.token ?? getNativeToken(DefaultSwapRouteConfig[networkMode].srcChain),
                srcAmount: BigInt(0),
                dstToken: swapRoute.dstData.token ?? getNativeToken(DefaultSwapRouteConfig[networkMode].dstChain),
            })
        }
    }, [])

    useEffect(() => {
        setSrcAmountInput("")
        setSwapRoute({
            srcToken: getNativeToken(DefaultSwapRouteConfig[networkMode].srcChain),
            srcAmount: BigInt(0),
            dstToken: getNativeToken(DefaultSwapRouteConfig[networkMode].dstChain),
        })
    }, [networkMode])

    useEffect(() => {
        if (swapRoute.srcData.token || swapRoute.dstData.token) {
            setSwapRoute({
                srcToken: swapRoute.srcData.token,
                dstToken: swapRoute.dstData.token,
            })
        }
    }, [tokens])

    const [quoteExpiry, setQuoteExpiryState] = useState(0)
    const quoteExpiryProgress = useMotionValue(0)
    const [isQuoteExpired, setIsQuoteExpired] = useState(false)
    const [quoteExpiryInterval, setQuoteExpiryInterval] = useState(selectedQuote ? 1000 : undefined)

    const setQuoteExpiry = useCallback((ms: number) => {

        const isExpired = ms < 0
        const expiry = isExpired ? 0 : ms

        if (isExpired) {
            quoteExpiryProgress.set(1)
            setQuoteExpiryState(0)
            setIsQuoteExpired(true)
            setQuoteExpiryInterval(undefined)
            useSwapQuotesData.refetch()
        }
        else {
            quoteExpiryProgress.set(1 - (expiry / SwapQuoteConfig.QuoteValidMs))
            setQuoteExpiryState(expiry - 1000)
            setIsQuoteExpired(false)
        }

    }, [useSwapQuotesData, setQuoteExpiryState, quoteExpiryProgress, setIsQuoteExpired, setQuoteExpiryInterval])

    useInterval(() => {
        setQuoteExpiry(quoteExpiry)
    }, quoteExpiryInterval)

    useEffect(() => {
        setQuoteExpiry(SwapQuoteConfig.QuoteValidMs - 1000)
        setQuoteExpiryInterval(selectedQuote ? 1000 : undefined)
    }, [selectedQuote?.id])

    const context: QuoteDataContextType = {
        swapRoute: swapRoute,
        setSwapRoute: setSwapRoute,
        switchTokens: switchTokens,
        srcAmountInput: srcAmountInput,
        setSrcAmountInput: setSrcAmountInput,
        useSwapQuotesData: useSwapQuotesData,
        selectedQuote: selectedQuote,
        setSelectedQuote: setSelectedQuote,
        quoteExpiry: quoteExpiry,
        quoteExpiryProgress: quoteExpiryProgress,
        isQuoteExpired: isQuoteExpired,
    }

    return (
        <QuoteDataContext.Provider value={context} >
            {children}
        </QuoteDataContext.Provider>
    )
}

export default QuoteDataProvider
