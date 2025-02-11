import { createContext, useCallback, useEffect, useState } from "react"
import { QueryStatus } from "@tanstack/query-core"
import { parseUnits } from "viem"

import { defaultChain } from "@/app/config/chains"
import { defaultDstTokenId } from "@/app/config/swaps"
import useReadSwapRoutes from "@/app/hooks/swap/useReadSwapRoutes"
import useTokens from "@/app/hooks/tokens/useTokens"
import useDebounce from "@/app/hooks/utils/useDebounce"
import { getChain } from "@/app/lib/chains"
import { getSuggestedRoute } from "@/app/lib/routes"
import { getRoutesMaxDstAmount, getSelectedSwapData, setSelectedSwapData } from "@/app/lib/swaps"
import { getNativeToken } from "@/app/lib/tokens"
import { Chain } from "@/app/types/chains"
import { Route } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

interface QuoteDataContextType {
    srcChain?: Chain,
    srcToken?: Token,
    setSrcToken: (token?: Token, ignoreSameToken?: boolean) => void,
    srcAmount: bigint,
    setSrcAmount: (value: string) => void,
    srcAmountFormatted: string,
    setSrcAmountFormatted: (value: string) => void,
    handleSrcAmountInput: (value: string) => void,
    dstChain?: Chain,
    dstToken?: Token,
    setDstToken: (token?: Token, ignoreSameToken?: boolean) => void,
    switchTokens: (srcToken?: Token, dstToken?: Token, dstAmountFormatted?: string) => void,
    routes?: Route[],
    routesQueryStatus?: QueryStatus,
    refetchRoutes: () => void,
    selectedRoute?: Route,
    setSelectedRoute: (route?: Route) => void,
    maxDstAmount: bigint,
}

export const QuoteDataContext = createContext({} as QuoteDataContextType)

const QuoteDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    ////////////////////////////////////////////////////////////////////////////////
    // tokens and related data

    const { data: tokens, getTokenData } = useTokens()

    const [srcChain, setSrcChain] = useState<Chain>()
    const [srcToken, setSrcTokenState] = useState<Token>()

    const [dstChain, setDstChain] = useState<Chain>()
    const [dstToken, setDstTokenState] = useState<Token>()

    const setSrcToken = useCallback((token?: Token, ignoreSameToken?: boolean) => {

        setSrcTokenState(getTokenData(token?.id, token?.chainId))
        setSrcChain(token ? getChain(token.chainId) : undefined)
        setSelectedSwapData({
            srcChainId: token?.chainId,
            srcTokenId: token?.id,
        })

        if (!ignoreSameToken && token && dstToken && token.id === dstToken.id && token.chainId === dstToken.chainId) {
            setDstTokenState(undefined)
            setDstChain(undefined)
            setSelectedSwapData({
                dstChainId: undefined,
                dstTokenId: undefined,
            })
        }

    }, [setSrcTokenState, setSrcChain, getTokenData, setDstChain, setDstTokenState, dstToken])

    const setDstToken = useCallback((token?: Token, ignoreSameToken?: boolean) => {

        setDstTokenState(getTokenData(token?.id, token?.chainId))
        setDstChain(token ? getChain(token.chainId) : undefined)
        setSelectedSwapData({
            dstChainId: token?.chainId,
            dstTokenId: token?.id,
        })

        if (!ignoreSameToken && token && srcToken && token.id === srcToken.id && token.chainId === srcToken.chainId) {
            setSrcTokenState(undefined)
            setSrcChain(undefined)
            setSelectedSwapData({
                srcChainId: undefined,
                srcTokenId: undefined,
            })
        }

    }, [setDstTokenState, setDstChain, getTokenData, setSrcChain, setSrcTokenState, srcToken])

    const [srcAmount, setSrcAmountState] = useState(BigInt(0))
    const [srcAmountFormatted, setSrcAmountFormatted] = useState("")

    const handleSrcAmountInput = useCallback((value: string) => {
        setSrcAmountFormatted(value)
    }, [setSrcAmountFormatted])

    const srcAmountInput = useDebounce(srcAmountFormatted)
    const setSrcAmount = useCallback((value: string) => {
        setSrcAmountState(parseUnits(value.replace(",", "."), srcToken?.decimals || 18))
    }, [srcToken, setSrcAmountState])

    useEffect(() => {
        setSrcAmount(srcAmountInput)
    }, [srcToken, srcAmountInput])

    const switchTokens = useCallback((srcToken?: Token, dstToken?: Token, dstAmountFormatted?: string) => {
        if (srcToken || dstToken || dstAmountFormatted) {
            setSrcToken(dstToken, true)
            setDstToken(srcToken, true)
            handleSrcAmountInput(dstAmountFormatted ?? "")
        }
    }, [setSrcToken, setDstToken, handleSrcAmountInput])

    // run once to set initial stored or default values
    useEffect(() => {
        const storedSwapData = getSelectedSwapData()
        if (!srcToken) {
            const defaultSrcToken = getNativeToken(defaultChain)
            setSrcToken(storedSwapData.srcToken ?? getTokenData(defaultSrcToken?.id, defaultSrcToken?.chainId))
        }
        if (!dstToken) {
            setDstToken(storedSwapData.dstToken ?? getTokenData(defaultDstTokenId, defaultChain.id))
        }
    }, [])

    useEffect(() => {
        if (srcToken) {
            setSrcToken(srcToken)
        }
        if (dstToken) {
            setDstToken(dstToken)
        }
    }, [tokens])

    ////////////////////////////////////////////////////////////////////////////////
    // routes

    // todo: split into separate provider and add only to swap pages where needed
    // should store the results in state and add a countdown timer to automatically refetch after eg. 60 seconds
    // should not refetch automatically, and instead only manually or when the timer expires

    const [selectedRoute, setSelectedRouteState] = useState<Route>()
    const setSelectedRoute = useCallback((route?: Route) => {
        setSelectedRouteState(route)
    }, [setSelectedRouteState])

    const { routes, status: routesQueryStatus, refetch: refetchRoutes } = useReadSwapRoutes({
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
    })

    useEffect(() => {
        setSelectedRoute(getSuggestedRoute(routes))
    }, [routes, setSelectedRoute])

    const [maxDstAmount, setMaxDstAmount] = useState<bigint>(BigInt(0))
    useEffect(() => {
        setMaxDstAmount(getRoutesMaxDstAmount(routes))
    }, [routes])

    const context: QuoteDataContextType = {
        srcChain: srcChain,
        srcToken: srcToken,
        setSrcToken: setSrcToken,
        srcAmount: srcAmount,
        setSrcAmount: setSrcAmount,
        srcAmountFormatted: srcAmountFormatted,
        setSrcAmountFormatted: setSrcAmountFormatted,
        handleSrcAmountInput: handleSrcAmountInput,
        dstChain: dstChain,
        dstToken: dstToken,
        setDstToken: setDstToken,
        switchTokens: switchTokens,
        routes: routes,
        routesQueryStatus: routesQueryStatus,
        refetchRoutes: refetchRoutes,
        selectedRoute: selectedRoute,
        setSelectedRoute: setSelectedRoute,
        maxDstAmount: maxDstAmount,
    }

    return (
        <QuoteDataContext.Provider value={context} >
            {children}
        </QuoteDataContext.Provider>
    )
}

export default QuoteDataProvider
