"use client"

import { AnimatePresence, motion, Transition, Variants } from "motion/react"
import { useRouter } from "next/navigation"
import React, { use, useCallback, useEffect, useState } from "react"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SlideInOut from "@/app/components/animations/SlideInOut"
import { ChainImage } from "@/app/components/images/ChainImage"
import CustomTokenInput from "@/app/components/tokens/CustomTokenInput"
import { TokenDetailItem } from "@/app/components/tokens/TokenDetailItem"
import { Page } from "@/app/components/ui/Page"
import SearchInput from "@/app/components/ui/SearchInput"
import { SelectItemToggle } from "@/app/components/ui/SelectItemToggle"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { defaultNetworkMode, SupportedChains } from "@/app/config/chains"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useAddToken from "@/app/hooks/tokens/useAddToken"
import useFavouriteTokens from "@/app/hooks/tokens/useFavouriteTokens"
import useTokens from "@/app/hooks/tokens/useTokens"
import { filterTokens } from "@/app/lib/tokens"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { PageType } from "@/app/types/navigation"
import { PreferenceType } from "@/app/types/preferences"

interface Params {
    select: string,
}

const SelectOptions = {
    src: "from",
    dst: "to",
}

const defaultDelay = 0.025
const defaultTransition: Transition = {
    type: "spring",
    duration: 0.5,
}

// slide / fade in and out
const defaultVariants: Variants = {
    initial: {
        x: "-50%",
        y: "-50%",
        opacity: 0,
        height: 0,
        transition: defaultTransition,
    },
    animate: {
        x: 0,
        y: 0,
        opacity: 1,
        height: "auto",
    },
    exit: {
        x: "50%",
        y: "-50%",
        opacity: 0,
        height: 0,
    },
}

// slide / fade in and out
const TokenAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    transition = defaultTransition,
    variants = defaultVariants,
    layout = true,
    custom,
    ...props
}, ref) => {
    return (
        <motion.div
            layout={layout}
            transition={transition}
        >
            <motion.div
                ref={ref}
                className="overflow-hidden"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={{
                    ...variants,
                    animate: {
                        ...variants.animate,
                        transition: {
                            ...transition,
                            delay: custom ? custom.index * defaultDelay : undefined,
                        },
                    },
                    exit: {
                        ...variants.exit,
                        transition: {
                            ...transition,
                            delay: custom ? (custom.numItems - custom.index - 1) * defaultDelay : undefined,
                        },
                    },
                }}
                {...props}
            />
        </motion.div>
    )
})
TokenAnimation.displayName = "TokenAnimation"

// const defaultVariants: Variants = {
//     initial: {
//         // y: "50%",
//         opacity: 0,
//         // height: 0,
//         scale: 0,
//         transition: defaultTransition,
//     },
//     animate: {
//         // y: 0,
//         opacity: 1,
//         // height: "auto",
//         scale: 1,
//     },
//     exit: {
//         // y: "50%",
//         opacity: 0,
//         // height: 0,
//         scale: 0,
//     },
// }

// const TokenAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
//     transition = defaultTransition,
//     variants = defaultVariants,
//     layout = true,
//     custom,
//     ...props
// }, ref) => {
//     return (
//         // <motion.div
//         //     layout={layout}
//         //     transition={transition}
//         // >
//             <motion.div
//                 ref={ref}
//                 className="p-0 m-0 overflow-hidden"
//                 initial="initial"
//                 animate="animate"
//                 exit="exit"
//                 layout={layout}
//                 variants={{
//                     ...variants,
//                     animate: {
//                         ...variants.animate,
//                         transition: {
//                             ...transition,
//                             delay: custom.index * defaultDelay,
//                         },
//                     },
//                     exit: {
//                         ...variants.exit,
//                         transition: {
//                             ...transition,
//                             delay: (custom.numItems - custom.index - 1) * defaultDelay,
//                         },
//                     },
//                 }}
//                 {...props}
//             />
//         // </motion.div>
//     )
// })
// TokenAnimation.displayName = "TokenAnimation"

const SwapSelectPage = ({
    params,
}: {
    params: Promise<Params>,
}) => {

    const { select } = use(params)
    const isDst = select === SelectOptions.dst

    const { tokens: allTokens } = useTokens()
    const { swapRoute, setSwapRoute } = useQuoteData()
    const { favouriteTokens } = useFavouriteTokens()
    const allChains = Object.values(SupportedChains).filter((chain) => !chain.isDisabled).slice(0)

    const [tokens, setTokens] = useState(allTokens)
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
            allTokens, 
            preferences[PreferenceType.NetworkMode] ?? defaultNetworkMode,
            query, 
            selectedFilterChain, 
            favouriteTokens,
        )
        
        setTokens(tokenResults)
        setChains(chainResults)
    }, [allTokens, favouriteTokens, query, selectedFilterChain, preferences])

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
                        placeholder="Search for token or paste address"
                        isDataSuccess={tokens.length === 0 && useAddTokenData.addressStatus.isSuccess && !!useAddTokenData.address}
                        isDataError={tokens.length === 0 && useAddTokenData.addressStatus.isError}
                    />
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <AnimatePresence>
                            {tokens.length > 0 ? tokens.map((token, i) => {
                                const isSelected = selectedToken && selectedToken.id === token.id && selectedToken.chainId === token.chainId
                                return (
                                    <TokenAnimation
                                        key={`${token.id}-${token.chainId}`}
                                        custom={{
                                            index: i,
                                            numItems: tokens.length,
                                        }}
                                    >
                                        <TokenDetailItem
                                            token={token}
                                            onClick={isSelected ? selectOnClick.bind(this) : setSelectedToken.bind(this, token)}
                                            isSelected={isSelected}
                                            className="container-select-transparent flex flex-row flex-1 p-4 gap-4"
                                            replaceClass={true}
                                        />
                                    </TokenAnimation>
                                )
                            }) : (
                                <CustomTokenInput
                                    key="not-found"
                                    useAddTokenData={useAddTokenData}
                                    showNotFoundMsg={true}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </SlideInOut>
        </Page>
    )
}

export default SwapSelectPage