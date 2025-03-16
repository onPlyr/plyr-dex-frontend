"use client"

import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Page } from "@/app/components/ui/Page"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useTokens from "@/app/hooks/tokens/useTokens"
import { formatDuration } from "@/app/lib/datetime"
import { getInitiateSwapError } from "@/app/lib/swaps"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { StyleDirection, StyleToggleDirection } from "@/app/types/styling"
import { InitiateSwapAction } from "@/app/types/swaps"

const SwapQuotePreviewAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
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

    const router = useRouter()
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
            key={SwapTab.Swap}
            header={pageHeader}
            footer=<ReviewRouteButton
                err={errorMsg}
                isConnectWalletErr={isConnectError}
                queryStatus={useSwapQuotesData.status}
                onClick={onClickReview.bind(this)}
            />
        >
            <SlideInOut
                key={SwapTab.Swap}
                from="left"
                to="left"
            >
                <div className="flex flex-col flex-none gap-4 w-full h-fit overflow-hidden">
                    <TokenInput
                        route={swapRoute}
                        value={srcAmountInput}
                        setValue={setSrcAmountInput}
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
            </SlideInOut>
        </Page>
    )
}

export default SwapPage
