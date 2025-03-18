"use client"

import { AnimatePresence, motion, Transition } from "motion/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useCallback, useEffect } from "react"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"

import "@/app/styles/globals.css"

import SlideInOut from "@/app/components/animations/SlideInOut"
import AccountIcon from "@/app/components/icons/AccountIcon"
import ArrowIcon from "@/app/components/icons/ArrowIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import RouteIcon from "@/app/components/icons/RouteIcon"
import { SettingsIcon } from "@/app/components/icons/SettingsIcon"
import { TxIcon } from "@/app/components/icons/TxIcon"
import { ReviewRouteButton } from "@/app/components/routes/ReviewRouteButton"

import { UnwrapNativeToken } from "@/app/components/swap/UnwrapNativeToken"
import SwapQuoteExpiryTimer from "@/app/components/swapQuotes/SwapQuoteExpiryTimer"
import SwapQuotePreview from "@/app/components/swapQuotes/SwapQuotePreview"
import { TokenInput } from "@/app/components/tokens/TokenInput"
import Button from "@/app/components/ui/Button"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { socialLinks } from "@/app/config/navigation"
import { iconSizes } from "@/app/config/styling"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useTokens from "@/app/hooks/tokens/useTokens"
import useSessionStorage from "@/app/hooks/utils/useSessionStorage"
import { formatDuration } from "@/app/lib/datetime"
import { getInitiateSwapError } from "@/app/lib/swaps"
import { PageType } from "@/app/types/navigation"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { StorageKey } from "@/app/types/storage"
import { StyleDirection, StyleToggleDirection } from "@/app/types/styling"
import { InitiateSwapAction } from "@/app/types/swaps"
import { twMerge } from "tailwind-merge"

const defaultIntroTransition: Transition = {
    type: "spring",
    duration: 1,
} as const

const SwapQuotePreviewAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    className,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = {
        type: "spring",
        duration: 0.15,
    },
    variants = {
        initial: {
            y: "-50%",
            opacity: 0,
        },
        animate: {
            y: 0,
            opacity: 1,
        },
        exit: {
            y: "-50%",
            opacity: 0,
        },
    },
    layout = true,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        className={twMerge("overflow-hidden", className)}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        layout={layout}
        variants={variants}
        {...props}
    />
))
SwapQuotePreviewAnimation.displayName = "SwapQuotePreviewAnimation"

const SwapPage = () => {

    const router = useRouter()
    const searchParams = useSearchParams()
    const isShowIntro = !!searchParams.get("intro")?.trim()
    const [showIntro, setShowIntro] = useSessionStorage({
        key: StorageKey.ShowIntro,
        initialValue: isShowIntro,
    })
   
    useEffect(() => {
        if (isShowIntro) {
            setShowIntro(true)
            router.replace("/swap")
        }
    }, [isShowIntro])

    const { isConnected } = useAccount()
    const { swapRoute, switchTokens, srcAmountInput, setSrcAmountInput, useSwapQuotesData, selectedQuote, quoteExpiry } = useQuoteData()
    const { refetch: refetchTokens } = useTokens()

    const { errorMsg, isConnectError } = getInitiateSwapError({
        action: InitiateSwapAction.Review,
        isConnected: isConnected,
        srcChain: swapRoute.srcData.chain,
        srcToken: swapRoute.srcData.token,
        srcAmount: swapRoute.srcData.amount,
        dstChain: swapRoute.dstData.chain,
        dstToken: swapRoute.dstData.token,
        quoteData: useSwapQuotesData.data,
        selectedQuote: selectedQuote,
        isInProgress: useSwapQuotesData.isInProgress,
        queryStatus: useSwapQuotesData.status,
        error: useSwapQuotesData.error,
    })

    const refetch = useCallback(() => {
        refetchTokens()
        useSwapQuotesData.refetch()
    }, [refetchTokens, useSwapQuotesData])


    const onClickReview = useCallback(() => {
        if (isConnected) {
            router.push("/swap/review")
        }
    }, [isConnected, router])

    const { setNotification } = useNotifications()
    useEffect(() => {
        if (useSwapQuotesData.error) {
            setNotification({
                id: useSwapQuotesData.error,
                type: NotificationType.Error,
                header: `Error Fetching Quotes`,
                body: useSwapQuotesData.error,
                status: NotificationStatus.Error,
            })
        }
    }, [useSwapQuotesData.error])

    const pageHeader = <div className="flex flex-row flex-1 justify-between items-center">
        <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>SWAP</div>
        <div className="flex flex-row gap-4">
            <Tooltip
                trigger=<Button
                    label="My Account"
                    className="icon-btn transition hover:rotate-[360deg]"
                    replaceClass={true}
                >
                    <Link href="/account">
                        <AccountIcon className={`${iconSizes.sm} text-brand-green`} />
                    </Link>
                </Button>
            >
                My Account
            </Tooltip>
            <Tooltip
                trigger=<Button
                    label="My Transactions"
                    className="icon-btn transition hover:rotate-[360deg]"
                    replaceClass={true}
                >
                    <Link href="/swap/history">
                        <TxIcon className={`${iconSizes.sm} text-brand-green`} />
                    </Link>
                </Button>
            >
                My Transactions
            </Tooltip>
            <Tooltip
                trigger=<Button
                    label="My Preferences"
                    className="icon-btn transition hover:rotate-90"
                    replaceClass={true}
                >
                    <Link href="/preferences">
                        <SettingsIcon className={iconSizes.sm} />
                    </Link>
                </Button>
            >
                My Preferences
            </Tooltip>
            <Tooltip
                trigger=<Button
                    label="Refresh"
                    className="icon-btn"
                    replaceClass={true}
                    onClick={refetch.bind(this)}
                >
                    <SwapQuoteExpiryTimer />
                </Button>
            >
                Refresh{selectedQuote && ` in ${formatDuration(quoteExpiry)}`}
            </Tooltip>
        </div>
    </div>

    return (
        <Page
            key={PageType.Swap}
            hideNetworkMsg={true}
            pageWidth="max-w-screen-lg w-full"
            isContainerPage={true}
        >
            <div className="flex flex-col flex-none w-full h-fit">
                <div className="relative flex flex-row flex-none justify-center overflow-hidden">
                    <motion.div
                        className={twMerge("relative flex flex-col flex-1 w-full h-full", showIntro ? "cursor-pointer" : undefined)}
                        initial={showIntro ? "showIntro" : "initial"}
                        animate={showIntro ? "showIntro" : "initial"}
                        exit="initial"
                        transition={defaultIntroTransition}
                        whileHover={showIntro ? "hover" : undefined}
                        variants={{
                            initial: {
                                paddingTop: 0,
                                paddingBottom: 0,
                            },
                            showIntro: {
                                paddingTop: "10%",
                                paddingBottom: 0,
                            },
                            hover: {
                                paddingTop: "7.5%",
                                paddingBottom: "2.5%",
                            },
                        }}
                        onClick={showIntro ? setShowIntro.bind(this, false) : undefined}
                    >
                        <AnimatePresence mode="wait">
                            {showIntro && (
                                <motion.div
                                    className="z-[50] flex flex-col flex-1 w-full h-full absolute start-0 top-0"
                                    transition={{
                                        type: "tween",
                                        ease: "easeOut",
                                        duration: defaultIntroTransition.duration * 0.75,
                                    }}
                                    variants={{
                                        initial: {
                                            backdropFilter: "blur(0px)",
                                        },
                                        showIntro: {
                                            backdropFilter: "blur(4px)",
                                        },
                                        hover: {
                                            backdropFilter: "blur(0px)",
                                            transition: {
                                                type: "tween",
                                                ease: "easeOut",
                                                duration: defaultIntroTransition.duration * 0.5,
                                            },
                                        },
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        <motion.div
                            transition={defaultIntroTransition}
                            variants={{
                                initial: {
                                    scale: 1,
                                },
                                showIntro: {
                                    scale: 0.9,
                                },
                                hover: {
                                    scale: 1,
                                },
                            }}
                        >
                            <Page
                                key={PageType.Swap}
                                header={pageHeader}
                                footer={!showIntro && <ReviewRouteButton
                                    err={errorMsg}
                                    isConnectWalletErr={isConnectError}
                                    queryStatus={useSwapQuotesData.status}
                                    onClick={onClickReview.bind(this)}
                                />}
                                isNestedPage={true}
                            >
                                <div className="flex flex-col flex-none gap-4 w-full h-fit overflow-hidden">
                                    <TokenInput
                                        route={swapRoute}
                                        value={srcAmountInput}
                                        setValue={setSrcAmountInput}
                                        isDisabled={isShowIntro}
                                    />
                                    <div className="z-30 flex flex-row flex-1 -my-8 justify-center items-center">
                                        <Tooltip
                                            trigger=<Button
                                                label="Switch"
                                                className="p-3 rounded-full transition bg-layout-950/50 hover:bg-layout-950/75 hover:rotate-180"
                                                replaceClass={true}
                                                onClick={switchTokens.bind(this)}
                                            >
                                                <ArrowIcon toggleDirection={StyleToggleDirection.UpDown} />
                                            </Button>
                                        >
                                            Switch
                                        </Tooltip>
                                    </div>
                                    <TokenInput
                                        route={swapRoute}
                                        value={selectedQuote ? formatUnits(selectedQuote.estDstAmount, selectedQuote.dstData.token.decimals) : undefined}
                                        isDst={true}
                                        isDisabled={isShowIntro}
                                    />
                                    <UnwrapNativeToken />
                                    <AnimatePresence mode="wait">
                                        {selectedQuote && (
                                            <SwapQuotePreviewAnimation
                                                key={selectedQuote.id}
                                                className="flex flex-col flex-1 gap-4"
                                            >
                                                <div className="flex flex-row flex-1 px-4 gap-4 font-bold">
                                                    <div className="flex flex-row flex-1 gap-4 justify-start items-center">
                                                        <RouteIcon />
                                                        Routes
                                                    </div>
                                                    {!useSwapQuotesData.isInProgress && useSwapQuotesData.data && useSwapQuotesData.data.quotes.length > 1 && (
                                                        <Link
                                                            href="/swap/routes"
                                                            className="flex flex-row flex-none gap-2 justify-end items-center text-end transition text-muted-500 hover:text-white"
                                                        >
                                                            View all {useSwapQuotesData.data.quotes.length} routes
                                                            <ChevronIcon direction={StyleDirection.Right} className={iconSizes.xs} />
                                                        </Link>
                                                    )}
                                                </div>
                                                <SwapQuotePreview quote={selectedQuote} />
                                            </SwapQuotePreviewAnimation>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Page>
                        </motion.div>
                    </motion.div>
                </div>
                <AnimatePresence mode="wait">
                    {showIntro && (
                        <motion.div
                            initial="initial"
                            animate="showIntro"
                            exit="initial"
                            transition={defaultIntroTransition}
                            variants={{
                                initial: {
                                    y: "25%",
                                    opacity: 0,
                                    scale: 0.8,
                                },
                                showIntro: {
                                    y: 0,
                                    opacity: 1,
                                    scale: 1,
                                },
                            }}
                        >
                            <div className="flex flex-col flex-1 p-4 my-4 gap-4">
                                <div className="flex flex-row flex-1 justify-center font-bold text-center text-3xl">
                                    {"Avalanche's Liquidity Marketplace"}
                                </div>
                                <div className="flex flex-row flex-1 justify-center font-bold text-center text-muted-500">
                                    <div className="page-width">{"Move & Swap Any Asset Instantly: Tapping Every Avalanche Liquidity Source."}</div>
                                </div>
                                <div className="flex flex-row flex-1 gap-4 justify-center items-center">
                                    <Button
                                        className="gradient-btn"
                                        onClick={setShowIntro.bind(this, false)}
                                    >
                                        Start Swapping
                                    </Button>
                                    <ExternalLink
                                        href={"https://docs.tesseract.finance/"}
                                        className="container p-4 w-fit"
                                        replaceClass={true}
                                        hideIcon={true}
                                    >
                                        Documentation
                                    </ExternalLink>
                                </div>
                                
                                <div className="flex flex-row flex-1 gap-4 justify-center items-center">
                                    {socialLinks.map((link) => (
                                        <ExternalLink
                                            key={link.id}
                                            href={link.href}
                                            className="contents"
                                            replaceClass={true}
                                            hideIcon={true}
                                        >
                                            <motion.div
                                                className="flex flex-row max-h-14 h-14 justify-center items-center rounded-full bg-white text-black"
                                                initial="initial"
                                                whileHover="hover"
                                                transition={{
                                                    type: "spring",
                                                    duration: 0.5,
                                                }}
                                                variants={{
                                                    initial: {
                                                        gap: 0,
                                                        padding: "0.75rem",
                                                        paddingRight: "0.75rem",
                                                    },
                                                    hover: {
                                                        gap: "0.75rem",
                                                        paddingRight: "1.25rem",
                                                    },
                                                }}
                                            >
                                                {link.icon}
                                                <motion.div
                                                    className="font-bold text-nowrap"
                                                    transition={{
                                                        type: "spring",
                                                        duration: 0.5,
                                                    }}
                                                    variants={{
                                                        initial: {
                                                            opacity: 0,
                                                            scale: 0,
                                                            width: 0,
                                                        },
                                                        hover: {
                                                            opacity: 1,
                                                            scale: 1,
                                                            width: "auto",
                                                        },
                                                    }}
                                                >
                                                    {link.name}
                                                </motion.div>
                                            </motion.div>
                                        </ExternalLink>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Page>
    )
}

export default SwapPage
