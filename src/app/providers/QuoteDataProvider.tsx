"use client"

import { createContext, useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { parseUnits } from "viem"

import { DefaultUserPreferences } from "@/app/config/preferences"
import { DefaultSwapRouteConfig } from "@/app/config/swaps"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useSwapQuotes, { UseSwapQuotesReturnType } from "@/app/hooks/swap/useSwapQuotes"
import useTokens from "@/app/hooks/tokens/useTokens"
import useDebounce from "@/app/hooks/utils/useDebounce"
import useEventListener from "@/app/hooks/utils/useEventListener"
import useSessionStorage from "@/app/hooks/utils/useSessionStorage"
import { getChain, getNetworkModeChainIds } from "@/app/lib/chains"
import { getTokenAddress } from "@/app/lib/tokens"
import { NetworkMode, PreferenceType } from "@/app/types/preferences"
import { StorageKey } from "@/app/types/storage"
import { SwapQuote, SwapRoute, SwapRouteJson } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

const SwapRouteActionType = {
    SetSrcToken: "token-set-src",
    SetDstToken: "token-set-dst",
    SetBothTokens: "token-set-both",
    SetSrcAmount: "amount-set-src",
} as const
export type SwapRouteActionType = (typeof SwapRouteActionType)[keyof typeof SwapRouteActionType]

interface SwapRouteAction {
    srcToken?: Token,
    srcAmount?: string,
    dstToken?: Token,
    type: SwapRouteActionType,
}

interface QuoteDataContextType {
    swapRoute: SwapRoute,
    switchTokens: () => void,
    setSelectedToken: (token?: Token, isDst?: boolean) => void,
    srcAmountInput: string,
    setSrcAmountInput: (value: string) => void,
    useSwapQuotesData: UseSwapQuotesReturnType,
    selectedQuote?: SwapQuote,
    setSelectedQuote: (quote?: SwapQuote) => void,
}

export const QuoteDataContext = createContext({} as QuoteDataContextType)

const swapRouteReducer = (state: SwapRoute, action: SwapRouteAction): SwapRoute => {

    switch (action.type) {

        case SwapRouteActionType.SetSrcToken: {

            const swapRoute: SwapRoute = {
                ...state,
                srcData: {
                    chain: action.srcToken && getChain(action.srcToken.chainId),
                    token: action.srcToken,
                    amount: BigInt(0),
                },
            }

            if (action.srcToken && action.srcToken.uid === state.dstData.token?.uid) {
                swapRoute.dstData = {
                    ...state.srcData,
                }
            }

            return swapRoute
        }

        case SwapRouteActionType.SetDstToken: {

            const swapRoute: SwapRoute = {
                ...state,
                dstData: {
                    chain: action.dstToken && getChain(action.dstToken.chainId),
                    token: action.dstToken,
                },
            }

            if (action.dstToken && action.dstToken.uid === state.srcData.token?.uid) {
                swapRoute.srcData = {
                    ...state.dstData,
                    amount: BigInt(0),
                }
            }

            return swapRoute
        }

        case SwapRouteActionType.SetBothTokens: {
            return {
                srcData: {
                    chain: action.srcToken && getChain(action.srcToken.chainId),
                    token: action.srcToken,
                    amount: BigInt(0),
                },
                dstData: {
                    chain: action.dstToken && getChain(action.dstToken.chainId),
                    token: action.dstToken,
                },
            }
        }

        case SwapRouteActionType.SetSrcAmount: {
            return {
                ...state,
                srcData: {
                    ...state.srcData,
                    amount: action.srcAmount && state.srcData.token ? parseUnits(action.srcAmount.replace(",", "."), state.srcData.token.decimals) : BigInt(0)
                },
            }
        }

        default: {
            return {
                ...state,
            }
        }
    }
}

const isNetworkModeToken = (networkMode: NetworkMode, token?: Token) => {
    return !!token && getNetworkModeChainIds(networkMode).includes(token.chainId)
}

const QuoteDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { getToken, getNativeToken } = useTokens()
    const { preferences } = usePreferences()
    const networkMode = useMemo(() => preferences[PreferenceType.NetworkMode] ?? DefaultUserPreferences[PreferenceType.NetworkMode], [preferences])

    const swapRouteSerializer = useCallback((route: SwapRoute): string => {
        return JSON.stringify({
            srcData: {
                chain: route.srcData.chain?.id,
                tokenAddress: route.srcData.token && getTokenAddress(route.srcData.token),
                amount: route.srcData.amount?.toString(),
            },
            dstData: {
                chain: route.dstData.chain?.id,
                tokenAddress: route.dstData.token && getTokenAddress(route.dstData.token),
            },
        } as SwapRouteJson)
    }, [])

    const swapRouteDeserializer = useCallback((value: string): SwapRoute => {
        const route = JSON.parse(value) as SwapRouteJson
        return {
            srcData: {
                chain: route.srcData.chain && getChain(route.srcData.chain),
                token: route.srcData.tokenAddress && route.srcData.chain && getToken({
                    address: route.srcData.tokenAddress,
                    chainId: route.srcData.chain,
                }),
                amount: route.srcData.amount ? BigInt(route.srcData.amount) : undefined,
            },
            dstData: {
                chain: route.dstData.chain && getChain(route.dstData.chain),
                token: route.dstData.tokenAddress && route.dstData.chain && getToken({
                    address: route.dstData.tokenAddress,
                    chainId: route.dstData.chain,
                }),
            },
        }
    }, [getToken])

    const [swapRouteData, setSwapRouteData] = useSessionStorage({
        key: StorageKey.SwapRoute,
        initialValue: {
            srcData: {
                chain: DefaultSwapRouteConfig[networkMode].srcChain,
                token: getNativeToken(DefaultSwapRouteConfig[networkMode].srcChain.id),
                amount: BigInt(0),
            },
            dstData: {
                chain: DefaultSwapRouteConfig[networkMode].dstChain,
                token: getNativeToken(DefaultSwapRouteConfig[networkMode].dstChain.id),
            },
        },
        options: {
            serializer: swapRouteSerializer,
            deserializer: swapRouteDeserializer,
        },
    })

    const [swapRoute, dispatchSwapRoute] = useReducer(swapRouteReducer, swapRouteData)

    useEffect(() => {
        setSwapRouteData(swapRoute)
    }, [swapRoute])

    const [srcAmountInput, setSrcAmountInputState] = useState("")
    const srcAmountDebounced = useDebounce(srcAmountInput)

    const setSrcAmountInput = useCallback((value: string) => {
        setSrcAmountInputState(value)
    }, [setSrcAmountInputState])

    useEffect(() => {
        if (!srcAmountInput || srcAmountInput === srcAmountDebounced) {
            dispatchSwapRoute({
                srcAmount: srcAmountInput ? srcAmountDebounced : "",
                type: SwapRouteActionType.SetSrcAmount,
            })
        }
    }, [srcAmountInput, srcAmountDebounced])

    useEffect(() => {
        if (!isNetworkModeToken(networkMode, swapRouteData.srcData.token) || !isNetworkModeToken(networkMode, swapRouteData.dstData.token)) {
            dispatchSwapRoute({
                srcToken: getNativeToken(DefaultSwapRouteConfig[networkMode].srcChain.id),
                dstToken: getNativeToken(DefaultSwapRouteConfig[networkMode].dstChain.id),
                type: SwapRouteActionType.SetBothTokens,
            })
            setSrcAmountInput("")
        }
    }, [networkMode])

    const setSelectedToken = useCallback((token?: Token, isDst?: boolean) => {
        dispatchSwapRoute({
            srcToken: isDst ? undefined : token,
            dstToken: isDst ? token : undefined,
            type: isDst ? SwapRouteActionType.SetDstToken : SwapRouteActionType.SetSrcToken,
        })
        if (token && token.uid !== (isDst ? swapRouteData.dstData : swapRouteData.srcData).token?.uid) {
            setSrcAmountInput("")
        }
    }, [swapRouteData, setSrcAmountInput])

    const switchTokens = useCallback(() => {
        dispatchSwapRoute({
            srcToken: swapRoute.dstData.token,
            dstToken: swapRoute.srcData.token,
            type: SwapRouteActionType.SetBothTokens,
        })
        setSrcAmountInput("")
    }, [swapRoute, setSrcAmountInput])

    const useSwapQuotesData = useSwapQuotes(swapRoute)
    const { data: swapQuotesData } = useSwapQuotesData
    const [selectedQuote, setSelectedQuoteState] = useState<SwapQuote>()

    const setSelectedQuote = useCallback((quote?: SwapQuote) => {
        setSelectedQuoteState(quote)
    }, [setSelectedQuoteState])

    useEffect(() => setSelectedQuote(swapQuotesData?.quotes.at(0)), [swapQuotesData])

    useEventListener("beforeunload", () => dispatchSwapRoute({
        srcAmount: "",
        type: SwapRouteActionType.SetSrcAmount,
    }))

    const context: QuoteDataContextType = {
        swapRoute: swapRoute,
        switchTokens: switchTokens,
        setSelectedToken: setSelectedToken,
        srcAmountInput: srcAmountInput,
        setSrcAmountInput: setSrcAmountInput,
        useSwapQuotesData: useSwapQuotesData,
        selectedQuote: selectedQuote,
        setSelectedQuote: setSelectedQuote,
    }

    return (
        <QuoteDataContext.Provider value={context} >
            {children}
        </QuoteDataContext.Provider>
    )
}

export default QuoteDataProvider
