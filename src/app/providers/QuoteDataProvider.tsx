"use client"

import { createContext, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { formatUnits, parseUnits } from "viem"
import { useAccount } from "wagmi"

import AccountIcon from "@/app/components/icons/AccountIcon"
import CheckIcon, { CheckIconVariant } from "@/app/components/icons/CheckIcon"
import CoinsIcon from "@/app/components/icons/CoinsIcon"
import ErrorIcon from "@/app/components/icons/ErrorIcon"
import InfoIcon from "@/app/components/icons/InfoIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import useCellPairs from "@/app/hooks/cells/useCellPairs"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useSwapQuotes, { UseSwapQuotesReturnType } from "@/app/hooks/swap/useSwapQuotes"
import useTokens from "@/app/hooks/tokens/useTokens"
import useDebounce from "@/app/hooks/utils/useDebounce"
import useEventListener from "@/app/hooks/utils/useEventListener"
import useSessionStorage from "@/app/hooks/utils/useSessionStorage"
import { getChain, getNetworkModeChainIds } from "@/app/lib/chains"
import { getSwapPathData, getSwapPathId } from "@/app/lib/paths"
import { getSwapNativeTokenAmount, getSwapQuotePriceImpact, getSwapQuotePriceImpactData } from "@/app/lib/swaps"
import { getTokenAddress } from "@/app/lib/tokens"
import { SwapPath } from "@/app/types/paths"
import { NetworkMode, PreferenceType } from "@/app/types/preferences"
import { StorageKey } from "@/app/types/storage"
import { isValidNetworkModeSwapRouteTokenData, isValidSwapRouteTokenData, SwapMsgData, SwapMsgType, SwapQuote, SwapQuotePriceImpact, SwapQuotePriceImpactData, SwapRoute, SwapRouteJson } from "@/app/types/swaps"
import { isNativeToken, isValidTokenAmount, Token, TokenAmount } from "@/app/types/tokens"

const SwapRouteActionType = {
    SetSrcToken: "token-set-src",
    SetDstToken: "token-set-dst",
    SetBothTokens: "token-set-both",
    SetSrcAmount: "amount-set-src",
} as const
type SwapRouteActionType = (typeof SwapRouteActionType)[keyof typeof SwapRouteActionType]

interface SwapRouteAction {
    srcToken?: Token,
    srcAmount?: string,
    dstToken?: Token,
    type: SwapRouteActionType,
}

interface SearchParamsTokenUids {
    srcUid?: string,
    dstUid?: string,
}

interface QuoteDataContextType {
    swapRoute: SwapRoute,
    swapPath?: SwapPath,
    switchTokens: () => void,
    setSelectedToken: (token?: Token, isDst?: boolean) => void,
    srcAmountInput: string,
    setSrcAmountInput: (value: string) => void,
    useSwapQuotesData: UseSwapQuotesReturnType,
    selectedQuote?: SwapQuote,
    setSelectedQuote: (quote?: SwapQuote) => void,
    setSearchParamsTokenUids: Dispatch<SetStateAction<SearchParamsTokenUids>>,
    priceImpactData: SwapQuotePriceImpactData,
    getPriceImpact: (quote?: SwapQuote) => SwapQuotePriceImpact | undefined,
    swapMsgData?: SwapMsgData,
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
                    amount: state.srcData.amount && state.srcData.token && action.srcToken && state.srcData.token.decimals !== action.srcToken.decimals ? parseUnits(formatUnits(state.srcData.amount, state.srcData.token.decimals), action.srcToken.decimals) : state.srcData.amount,
                },
            }

            if (action.srcToken && action.srcToken.uid === state.dstData.token?.uid) {
                swapRoute.dstData = {
                    ...state.srcData,
                    amount: undefined,
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
                }
            }

            return swapRoute
        }

        case SwapRouteActionType.SetBothTokens: {
            return {
                srcData: {
                    chain: action.srcToken && getChain(action.srcToken.chainId),
                    token: action.srcToken,
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
            throw new Error(`swapRouteReducer error: unknown action: ${action.type}`)
        }
    }
}

export const getSwapMsgData = ({
    route,
    isConnected,
    isFetching,
    error,
    numQuotes,
    selectedQuote,
    srcBalance,
    nativeAmount,
    nativeBalance,
}: {
    route: SwapRoute,
    isConnected: boolean,
    isFetching: boolean,
    error?: string,
    numQuotes?: number,
    selectedQuote?: SwapQuote,
    srcBalance?: TokenAmount,
    nativeAmount?: bigint,
    nativeBalance?: TokenAmount,
}): SwapMsgData | undefined => {

    let msgType: SwapMsgType | undefined = undefined
    let msg: React.ReactNode | undefined = undefined
    let icon: React.ReactNode | undefined = undefined
    let isShowErrorWithQuote = false
    let isConnectAccountError = false

    if (!route.srcData.token || !route.srcData.chain || !route.dstData.token || !route.dstData.chain) {
        msgType = SwapMsgType.SelectTokens
        msg = "Please select the tokens you would like to swap or transfer."
        icon = <CoinsIcon />
    }
    else if (!route.srcData.amount || route.srcData.amount === BigInt(0)) {
        msgType = SwapMsgType.Amount
        msg = `Please enter the amount of ${route.srcData.token.symbol} you would like to sell or transfer.`
        icon = <CoinsIcon />
    }
    else if (isFetching) {
        msgType = selectedQuote ? SwapMsgType.IsUpdating : SwapMsgType.IsFetching
        msg = `Finding the best quotes from ${route.srcData.token.symbol} on ${route.srcData.chain.name} to ${route.dstData.token.symbol} on ${route.dstData.chain.name}.`
        icon = <LoadingIcon />
    }
    else if (!numQuotes) {
        msgType = SwapMsgType.NoQuotesFound
        msg = "Please try entering a different amount, adjusting your slippage tolerance or selecting different tokens."
        icon = <InfoIcon highlight={false} />
    }
    else if (!selectedQuote) {
        msgType = SwapMsgType.SelectQuote
        msg = "Please select your preferred quote."
        icon = <CheckIcon variant={CheckIconVariant.SquareOffset} />
    }
    else if (!isConnected) {
        msgType = SwapMsgType.NoAccountConnected
        msg = "Please connect your account to complete this transaction."
        icon = <AccountIcon />
        isShowErrorWithQuote = true
        isConnectAccountError = true
    }
    else if (!isValidTokenAmount(srcBalance) || srcBalance.amount < selectedQuote.srcAmount || !isValidTokenAmount(nativeBalance) || (nativeAmount !== undefined && nativeBalance.amount < nativeAmount)) {
        msgType = SwapMsgType.InsufficientBalance
        msg = `The connected account does not have enough ${route.srcData.token.symbol} to complete this transaction.`
        icon = <AccountIcon />
        isShowErrorWithQuote = true
    }
    else if (error) {
        msgType = SwapMsgType.IsError
        msg = error
        icon = <ErrorIcon highlight={false} />
    }

    return msgType && msg && icon ? {
        type: msgType,
        msg: msg,
        icon: icon,
        isShowErrorWithQuote: isShowErrorWithQuote,
        isConnectAccountError: isConnectAccountError,
    } : undefined
}

const isNetworkModeToken = (networkMode: NetworkMode, token?: Token) => Boolean(token && getNetworkModeChainIds(networkMode).includes(token.chainId))

const QuoteDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const { isConnected } = useAccount()
    const { tokens, getToken, getNativeToken, useBalancesData, getSearchParamsTokenData, getDefaultNetworkModeTokenData, useTokenPricesData: { getAmountValue } } = useTokens()
    const { getBalance } = useBalancesData
    const { getPreference, setPreference } = usePreferences()
    const networkMode = useMemo(() => getPreference(PreferenceType.NetworkMode), [getPreference])

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
                // @ts-ignore
                token: route.srcData.tokenAddress && route.srcData.chain && getToken({
                    address: route.srcData.tokenAddress,
                    chainId: route.srcData.chain,
                }),
                amount: route.srcData.amount ? BigInt(route.srcData.amount) : undefined,
            },
            dstData: {
                chain: route.dstData.chain && getChain(route.dstData.chain),
                // @ts-ignore
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
                ...getDefaultNetworkModeTokenData(networkMode),
                amount: BigInt(0),
            },
            dstData: {
                ...getDefaultNetworkModeTokenData(networkMode, true),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const [searchParamsTokenUids, setSearchParamsTokenUids] = useState<SearchParamsTokenUids>({})
    const [isSearchParamsNetworkModeSwitch, setIsSearchParamsNetworkModeSwitch] = useState(false)

    const searchParamsTokenData = useMemo(() => ({
        srcData: getSearchParamsTokenData(searchParamsTokenUids?.srcUid),
        dstData: getSearchParamsTokenData(searchParamsTokenUids?.dstUid),
    }), [searchParamsTokenUids, getSearchParamsTokenData])

    useEffect(() => {

        let srcToken: Token | undefined = undefined
        let dstToken: Token | undefined = undefined
        let tokenNetworkMode: NetworkMode | undefined = undefined

        const { srcData, dstData } = searchParamsTokenData
        const srcDataIsValid = isValidSwapRouteTokenData(srcData)
        const dstDataIsValid = isValidSwapRouteTokenData(dstData)

        if (srcDataIsValid && dstDataIsValid && srcData.networkMode === dstData.networkMode && srcData.token.uid !== dstData.token.uid) {
            srcToken = srcData.token
            dstToken = dstData.token
            tokenNetworkMode = srcData.networkMode
        }

        else if (srcDataIsValid) {
            const srcNetworkModeDstData = getDefaultNetworkModeTokenData(srcData.networkMode, true)
            srcToken = isValidNetworkModeSwapRouteTokenData(srcNetworkModeDstData) && srcNetworkModeDstData.token.uid === srcData.token.uid ? getDefaultNetworkModeTokenData(srcData.networkMode).token : srcData.token
            dstToken = srcNetworkModeDstData.token
            tokenNetworkMode = srcData.networkMode
        }

        else if (dstDataIsValid) {
            const dstNetworkModeSrcData = getDefaultNetworkModeTokenData(dstData.networkMode)
            srcToken = dstNetworkModeSrcData.token
            dstToken = isValidNetworkModeSwapRouteTokenData(dstNetworkModeSrcData) && dstNetworkModeSrcData.token.uid === dstData.token.uid ? getDefaultNetworkModeTokenData(dstData.networkMode, true).token : dstData.token
            tokenNetworkMode = dstData.networkMode
        }

        if (srcToken || dstToken) {

            if (tokenNetworkMode && tokenNetworkMode !== networkMode) {
                setPreference(PreferenceType.NetworkMode, tokenNetworkMode)
                setIsSearchParamsNetworkModeSwitch(true)
            }

            dispatchSwapRoute({
                srcToken: srcToken,
                dstToken: dstToken,
                type: SwapRouteActionType.SetBothTokens,
            })

            setSrcAmountInput("")
            setSearchParamsTokenUids({})
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParamsTokenData])

    useEffect(() => {
        if (isSearchParamsNetworkModeSwitch) {
            setIsSearchParamsNetworkModeSwitch(false)
            dispatchSwapRoute({
                srcToken: swapRoute.srcData.token && getToken(swapRoute.srcData.token),
                dstToken: swapRoute.dstData.token && getToken(swapRoute.dstData.token),
                type: SwapRouteActionType.SetBothTokens,
            })
        }
        else if (!isNetworkModeToken(networkMode, swapRouteData.srcData.token) || !isNetworkModeToken(networkMode, swapRouteData.dstData.token)) {
            dispatchSwapRoute({
                srcToken: getDefaultNetworkModeTokenData(networkMode).token,
                dstToken: getDefaultNetworkModeTokenData(networkMode, true).token,
                type: SwapRouteActionType.SetBothTokens,
            })
            setSrcAmountInput("")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkMode])

    const setSelectedToken = useCallback((token?: Token, isDst?: boolean) => {
        dispatchSwapRoute({
            srcToken: isDst ? undefined : token,
            dstToken: isDst ? token : undefined,
            type: isDst ? SwapRouteActionType.SetDstToken : SwapRouteActionType.SetSrcToken,
        })
    }, [])

    const { data: cellPairs } = useCellPairs()
    const swapPathData = useMemo(() => getSwapPathData(tokens, cellPairs), [tokens, cellPairs])
    const swapPathId = useMemo(() => swapRoute.srcData.token && swapRoute.dstData.token && getSwapPathId({ from: swapRoute.srcData.token, to: swapRoute.dstData.token }), [swapRoute])
    const swapPath = useMemo(() => swapPathId && swapPathData.get(swapPathId), [swapPathData, swapPathId])

    const useSwapQuotesData = useSwapQuotes(swapRoute, swapPath)
    const { data: swapQuotesData, isFetching: quotesIsFetching, error: quotesError } = useSwapQuotesData
    const [selectedQuote, setSelectedQuoteState] = useState<SwapQuote>()

    const setSelectedQuote = useCallback((quote?: SwapQuote) => {
        setSelectedQuoteState(quote)
    }, [setSelectedQuoteState])

    const switchTokens = useCallback(() => {
        dispatchSwapRoute({
            srcToken: swapRoute.dstData.token,
            dstToken: swapRoute.srcData.token,
            type: SwapRouteActionType.SetBothTokens,
        })
        setSrcAmountInput(selectedQuote?.estDstAmount && swapRoute.dstData.token ? formatUnits(selectedQuote.estDstAmount, swapRoute.dstData.token.decimals) : "")
    }, [swapRoute, setSrcAmountInput, selectedQuote])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setSelectedQuote(swapQuotesData?.quotes.at(0)), [swapQuotesData])

    const swapMsgData = useMemo(() => {

        const srcBalance = getBalance(swapRoute.srcData.token)
        const nativeBalance = isNativeToken(swapRoute.srcData.token) ? srcBalance : getBalance(getNativeToken(swapRoute.srcData.chain?.id))

        return getSwapMsgData({
            route: swapRoute,
            isConnected: isConnected,
            isFetching: quotesIsFetching,
            error: quotesError,
            numQuotes: swapQuotesData?.quotes.length,
            selectedQuote: selectedQuote,
            srcBalance: srcBalance,
            nativeAmount: getSwapNativeTokenAmount(selectedQuote),
            nativeBalance: nativeBalance,
        })

    }, [isConnected, swapRoute, quotesIsFetching, quotesError, swapQuotesData?.quotes.length, selectedQuote, getNativeToken, getBalance])

    const priceImpactData = useMemo(() => getSwapQuotePriceImpactData({ quotes: swapQuotesData?.quotes, getAmountValue: getAmountValue }), [getAmountValue, swapQuotesData?.quotes])
    const getPriceImpact = useCallback((quote?: SwapQuote) => quote && (priceImpactData.get(quote.id) ?? getSwapQuotePriceImpact({ quote: quote, getAmountValue: getAmountValue })), [getAmountValue, priceImpactData])

    useEventListener("beforeunload", () => dispatchSwapRoute({
        srcAmount: "",
        type: SwapRouteActionType.SetSrcAmount,
    }))

    const context: QuoteDataContextType = {
        swapRoute: swapRoute,
        swapPath: swapPath,
        switchTokens: switchTokens,
        setSelectedToken: setSelectedToken,
        srcAmountInput: srcAmountInput,
        setSrcAmountInput: setSrcAmountInput,
        useSwapQuotesData: useSwapQuotesData,
        selectedQuote: selectedQuote,
        setSelectedQuote: setSelectedQuote,
        setSearchParamsTokenUids: setSearchParamsTokenUids,
        priceImpactData: priceImpactData,
        getPriceImpact: getPriceImpact,
        swapMsgData: swapMsgData,
    }

    return (
        <QuoteDataContext.Provider value={context} >
            {children}
        </QuoteDataContext.Provider>
    )
}

export default QuoteDataProvider