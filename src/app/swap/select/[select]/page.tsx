"use client"

import { AnimatePresence, motion, Transition } from "motion/react"
import { useRouter } from "next/navigation"
import React, { use, useCallback } from "react"

import SlideInOut from "@/app/components/animations/SlideInOut"
import { ChainImage } from "@/app/components/images/ChainImage"
import CustomTokenInput from "@/app/components/tokens/CustomTokenInput"
import TokenDetailItem, { TokenDetailAnimation } from "@/app/components/tokens/TokenDetailItem"
import { Page } from "@/app/components/ui/Page"
import SearchInput from "@/app/components/ui/SearchInput"
import { SelectItemToggle } from "@/app/components/ui/SelectItemToggle"
import { Tooltip } from "@/app/components/ui/Tooltip"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useAddToken from "@/app/hooks/tokens/useAddToken"
import useTokenFilters from "@/app/hooks/tokens/useTokenFilters"
import useTokens from "@/app/hooks/tokens/useTokens"
import { PageType } from "@/app/types/navigation"
import { Token } from "@/app/types/tokens"

interface Params {
    select: string,
}

const SelectOptions = {
    src: "from",
    dst: "to",
}

const animationTransition: Transition = {
    type: "spring",
    duration: 0.5,
} as const

const ChainAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    initial = "initial",
    animate = "animate",
    exit = "initial",
    layout = false,
    transition = animationTransition,
    variants = {
        initial: {
            scale: 0,
            width: 0,
            opacity: 0,
            marginRight: 0,
        },
        animate: {
            scale: 1,
            width: "auto",
            opacity: 1,
            marginRight: "0.5rem",
        },
    },
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className="overflow-hidden"
        initial={initial}
        animate={animate}
        exit={exit}
        layout={layout}
        transition={transition}
        variants={variants}
        {...props}
    />
))
ChainAnimation.displayName = "ChainAnimation"

const SwapSelectPage = ({
    params,
}: {
    params: Promise<Params>,
}) => {

    const { select } = use(params)
    const isDst = select === SelectOptions.dst

    // const { swapRoute, setSwapRoute } = useQuoteData()
    const { swapRoute, setSelectedToken: testSetSelectedToken } = useQuoteData()

    const router = useRouter()
    const selectOnClick = useCallback(() => {
        router.push("/swap")
    }, [router])

    const { srcData, dstData } = swapRoute
    const selectedToken = isDst ? dstData.token : srcData.token

    const setSelectedToken = useCallback((token?: Token) => {
        testSetSelectedToken(token, isDst)
        selectOnClick()
    }, [isDst, testSetSelectedToken, selectOnClick])

    const { tokens } = useTokens()
    const { filteredTokens, filteredChains, selectedChainId, setSelectedChainId, query, setQuery } = useTokenFilters(tokens)

    const handleSearchInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }, [setQuery])

    const clearQuery = useCallback(() => {
        setQuery(undefined)
    }, [setQuery])

    const useAddTokenData = useAddToken({
        addressInput: query,
        setAddressInput: setQuery,
        onSuccess: setSelectedToken,
    })

    return (
        <Page
            key={isDst ? PageType.SelectDst : PageType.SelectSrc}
            header="Select Token"
            backUrl="/swap"
        >
            <SlideInOut
                key={isDst ? PageType.SelectDst : PageType.SelectSrc}
                from="right"
                to="right"
            >
                <div className="flex flex-col flex-none w-full h-fit">
                    <AnimatePresence mode="wait">
                        {filteredChains.length > 0 && (
                            <motion.div
                                key="chains"
                                className="flex flex-row gap-y-2 justify-start items-start flex-wrap"
                                initial="initial"
                                animate="animate"
                                exit="initial"
                                transition={animationTransition}
                                variants={{
                                    initial: {
                                        scale: 0,
                                        height: 0,
                                        opacity: 0,
                                        marginBottom: 0,
                                    },
                                    animate: {
                                        scale: 1,
                                        height: "auto",
                                        opacity: 1,
                                        marginBottom: "1rem",
                                    },
                                }}
                            >
                                 <AnimatePresence> 
                                    {filteredChains.map((chain) => {
                                        const isSelected = selectedChainId === chain.id
                                        return (
                                            <Tooltip
                                                key={chain.id}
                                                trigger=<ChainAnimation key={chain.id}>
                                                    <SelectItemToggle
                                                        onClick={setSelectedChainId.bind(this, isSelected ? undefined : chain.id)}
                                                        isSelected={isSelected}
                                                        className="container-select px-3 py-2 rounded-lg before:rounded-lg"
                                                        replaceClass={true}
                                                    >
                                                        <ChainImage chain={chain} size="xs" />
                                                    </SelectItemToggle>
                                                </ChainAnimation>
                                            >
                                                {chain.name}
                                            </Tooltip>
                                        )
                                    })}
                                 </AnimatePresence> 
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex flex-col flex-1 gap-4">
                        <SearchInput
                            value={query}
                            clearValue={clearQuery}
                            handleInput={handleSearchInput}
                            placeholder="Search for token or paste address"
                            isDataSuccess={filteredTokens.length === 0 && useAddTokenData.addressStatus.isSuccess && !!useAddTokenData.address}
                            isDataError={filteredTokens.length === 0 && useAddTokenData.addressStatus.isError}
                        />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <AnimatePresence>
                                {filteredTokens.length > 0 ? filteredTokens.map((token, i) => {
                                    const isSelected = selectedToken && selectedToken.id === token.id && selectedToken.chainId === token.chainId
                                    return (
                                        <TokenDetailAnimation
                                            key={token.uid}
                                            index={i}
                                            numTokens={filteredTokens.length}
                                        >
                                            <TokenDetailItem
                                                token={token}
                                                onClick={isSelected ? selectOnClick.bind(this) : setSelectedToken.bind(this, token)}
                                                isSelected={isSelected}
                                                className="container-select-transparent flex flex-row flex-1 p-4 gap-4"
                                                replaceClass={true}
                                            />
                                        </TokenDetailAnimation>
                                    )
                                }) : (
                                    <CustomTokenInput
                                        key="custom-token"
                                        useAddTokenData={useAddTokenData}
                                        showNotFoundMsg={true}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </SlideInOut>
        </Page>
    )
}

export default SwapSelectPage
