"use client"

import "@/app/styles/globals.css"

import { Variants } from "motion/react"
import { useRouter } from "next/navigation"
import { use, useCallback, useEffect, useState } from "react"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SlideInOut from "@/app/components/animations/SlideInOut"
import { defaultAnimations as slideInOutAnimations } from "@/app/components/animations/SlideInOut"
import { ChainImage } from "@/app/components/images/ChainImage"
import { TokenDetailItem } from "@/app/components/tokens/TokenDetailItem"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import { Page } from "@/app/components/ui/Page"
import SearchInput from "@/app/components/ui/SearchInput"
import { SelectItemToggle } from "@/app/components/ui/SelectItemToggle"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { defaultNetworkMode, SupportedChains } from "@/app/config/chains"
import { SwapTab } from "@/app/config/pages"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useFavouriteTokens from "@/app/hooks/tokens/useFavouriteTokens"
import useTokens from "@/app/hooks/tokens/useTokens"
import { filterTokens } from "@/app/lib/tokens"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PreferenceType } from "@/app/types/preferences"

interface Params {
    select: string,
}

const SelectOptions = {
    src: "from",
    dst: "to",
}

const tokenAnimations: Variants = {
    initial: {
        ...slideInOutAnimations.left.initial,
        height: 0,
    },
    animate: {
        ...slideInOutAnimations.left.animate,
        height: "auto",
    },
    exit: {
        ...slideInOutAnimations.right.exit,
        height: 0,
    },
}

const SwapSelectPage = ({
    params,
}: {
    params: Promise<Params>,
}) => {

    const { select } = use(params)
    const isDst = select === SelectOptions.dst

    const { data: tokenData } = useTokens()
    const { swapRoute, setSwapRoute } = useQuoteData()
    const { favouriteTokens } = useFavouriteTokens()
    const allChains = Object.values(SupportedChains).filter((chain) => !chain.isDisabled).slice(0)

    const [tokens, setTokens] = useState(tokenData)
    const [chains, setChains] = useState(allChains)
    const [selectedFilterChain, setSelectedFilterChain] = useState<Chain>()
    const [query, setQuery] = useState<string>()

    const router = useRouter()
    const selectOnClick = useCallback(() => {
        router.push("/swap")
    }, [router])

    const { srcData, dstData } = swapRoute
    const selectedToken = isDst ? dstData.token : srcData.token
    const setSelectedToken = useCallback((token?: Token) => {
        setSwapRoute({
            srcToken: isDst ? undefined : token,
            dstToken: isDst ? token : undefined
        })
        selectOnClick()
    }, [isDst, setSwapRoute, selectOnClick])

    const { preferences } = usePreferences()
    
    useEffect(() => {
        const { tokenResults, chainResults } = filterTokens(
            tokenData, 
            preferences[PreferenceType.NetworkMode] ?? defaultNetworkMode,
            query, 
            selectedFilterChain, 
            favouriteTokens,
        )
        
        setTokens(tokenResults)
        setChains(chainResults)
    }, [tokenData, favouriteTokens, query, selectedFilterChain, preferences])

    const handleSearchInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }, [setQuery])

    const clearQuery = useCallback(() => {
        setQuery(undefined)
    }, [setQuery])

    return (
        <Page
            key={isDst ? SwapTab.SelectDst : SwapTab.SelectSrc}
            header="Select Token"
            backUrl="/swap"
        >
            <SlideInOut
                key={isDst ? SwapTab.SelectDst : SwapTab.SelectSrc}
                from="right"
                to="right"
            >
                <div className="flex flex-col flex-none gap-4 w-full h-fit">
                    {chains && chains.length !== 0 && (
                        <div className="flex flex-row flex-1 gap-y-2 justify-start items-start flex-wrap">
                            {/* <AnimatePresence mode="wait"> */}
                                {chains?.map((chain, i) => {
                                    const isSelected = selectedFilterChain && selectedFilterChain.id === chain.id
                                    return (
                                        <Tooltip
                                            key={`${chain.id}`}
                                            trigger=<ScaleInOut
                                                key={`scale-${chain.id}`}
                                                className={i !== 0 ? "ms-2" : undefined}
                                            >
                                                <SelectItemToggle
                                                    onClick={setSelectedFilterChain.bind(this, isSelected ? undefined : chain)}
                                                    isSelected={isSelected}
                                                    className="container-select px-3 py-2 rounded-lg before:rounded-lg"
                                                    replaceClass={true}
                                                >
                                                    <ChainImage chain={chain} size="xs" />
                                                </SelectItemToggle>
                                            </ScaleInOut>
                                        >
                                            {chain.name}
                                        </Tooltip>
                                    )
                                })}
                            {/* </AnimatePresence> */}
                        </div>
                    )}
                    <SearchInput
                        value={query}
                        clearValue={clearQuery}
                        handleInput={handleSearchInput}
                        placeholder="Search by name, symbol or address"
                    />
                    <div className="flex flex-col flex-1">
                        {/* <AnimatePresence mode="wait"> */}
                            {tokens && tokens.length > 0 ? tokens.map((token, i) => {
                                const isSelected = selectedToken && selectedToken.id === token.id && selectedToken.chainId === token.chainId
                                return (
                                    <SlideInOut
                                        key={`${token.chainId}-${token.id}`}
                                        from="left"
                                        to="right"
                                        animations={tokenAnimations}
                                        delays={{
                                            animate: i * 0.025,
                                            exit: (tokens.length - 1 - i) * 0.025,
                                        }}
                                    >
                                        <TokenDetailItem
                                            token={token}
                                            onClick={isSelected ? selectOnClick.bind(this) : setSelectedToken.bind(this, token)}
                                            isSelected={isSelected}
                                            className="container-select-transparent flex flex-row flex-1 p-4 gap-4"
                                            replaceClass={true}
                                        />
                                    </SlideInOut>
                                )
                            }) : (
                                <SlideInOut
                                    key="error"
                                    from="left"
                                    to="right"
                                    animations={tokenAnimations}
                                >
                                    <AlertDetail
                                        type={AlertType.Error}
                                        header="Error: No Results Found"
                                        msg="No tokens were found matching your query. Please check or clear any selected filters and try again."
                                    />
                                </SlideInOut>
                            )}
                        {/* </AnimatePresence> */}
                    </div>
                </div>
            </SlideInOut>
        </Page>
    )
}

export default SwapSelectPage