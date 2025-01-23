"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useAccount } from "wagmi"

import "@/app/styles/globals.css"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import AccountIcon from "@/app/components/icons/AccountIcon"
import ArrowIcon from "@/app/components/icons/ArrowIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { RefreshIcon } from "@/app/components/icons/RefreshIcon"
import { SettingsIcon } from "@/app/components/icons/SettingsIcon"
import { TxIcon } from "@/app/components/icons/TxIcon"
import { ReviewRouteButton } from "@/app/components/routes/ReviewRouteButton"
import SwapSummary from "@/app/components/swap/SwapSummary"
import { UnwrapNativeToken } from "@/app/components/swap/UnwrapNativeToken"
import { TokenInput } from "@/app/components/tokens/TokenInput"
import Button from "@/app/components/ui/Button"
import { Page } from "@/app/components/ui/Page"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { SwapTab } from "@/app/config/pages"
import { iconSizes } from "@/app/config/styling"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getReviewRouteErrMsg } from "@/app/lib/swaps"
import { StyleDirection, StyleToggleDirection } from "@/app/types/styling"

const SwapPage = () => {

    const { address: accountAddress } = useAccount()
    const { srcChain, srcToken, srcAmount, srcAmountFormatted, handleSrcAmountInput, dstChain, dstToken, switchTokens, selectedRoute, routes, routesQueryStatus, refetchRoutes } = useQuoteData()
    const { refetch: refetchTokens } = useTokens()

    const { err: reviewError, isConnectWalletErr: reviewIsConnectWalletError } = getReviewRouteErrMsg({
        accountAddress: accountAddress,
        srcChain: srcChain,
        srcToken: srcToken,
        srcAmount: srcAmount,
        dstChain: dstChain,
        dstToken: dstToken,
        routes: routes,
        selectedRoute: selectedRoute,
        queryStatus: routesQueryStatus,
    })

    const refetch = useCallback(() => {
        refetchTokens()
        refetchRoutes()
    }, [refetchTokens, refetchRoutes])

    const router = useRouter()
    const onClickReview = useCallback(() => {
        if (accountAddress) {
            router.push("/swap/review")
        }
    }, [accountAddress, router])

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
                        <SettingsIcon className={`${iconSizes.sm} text-brand-green`} />
                    </Link>
                </Button>
            >
                My Preferences
            </Tooltip>
            <Tooltip
                trigger=<Button
                    label="Refresh Data"
                    className="icon-btn transition hover:rotate-180"
                    replaceClass={true}
                    onClick={refetch.bind(this)}
                >
                    <RefreshIcon className={`${iconSizes.sm} text-brand-green`} />
                </Button>
            >
                Refresh Data
            </Tooltip>
        </div>
    </div>

    return (
        <Page
            key={SwapTab.Swap}
            header={pageHeader}
            footer=<ReviewRouteButton
                err={reviewError}
                isConnectWalletErr={reviewIsConnectWalletError}
                queryStatus={routesQueryStatus}
                onClick={onClickReview.bind(this)}
            />
        >
            <ScaleInOut className="flex flex-col flex-none gap-4 w-full h-fit">
                <TokenInput
                    selectedChain={srcChain}
                    selectedToken={srcToken}
                    amountValue={srcAmountFormatted}
                    handleAmountInput={handleSrcAmountInput}
                />
                <div className="z-30 flex flex-row flex-1 -my-8 justify-center items-center">
                    <Button
                        label="Switch Tokens"
                        className="p-3 rounded-full transition bg-layout-950/50 hover:bg-layout-950/75 hover:rotate-180"
                        replaceClass={true}
                        onClick={switchTokens.bind(this, srcToken, dstToken, selectedRoute?.dstAmountFormatted)}
                    >
                        <ArrowIcon toggleDirection={StyleToggleDirection.UpDown} />
                    </Button>
                </div>
                <TokenInput
                    selectedChain={dstChain}
                    selectedToken={dstToken}
                    amountValue={selectedRoute?.dstAmountFormatted}
                    isDst={true}
                />
                <UnwrapNativeToken />
                {routes && selectedRoute && (
                    <div className="flex flex-col flex-1 gap-4 w-full">
                        <SwapSummary
                            route={selectedRoute}
                            isSelectedRoute={true}
                        />
                        {routes.length > 1 && (
                            <div className="flex flex-row flex-1 justify-end text-end">
                                <Link
                                    className="inline-flex gap-2 w-fit justify-end items-center transition font-bold text-muted-500 hover:text-white"
                                    href="/swap/routes"
                                >
                                    View all {routes.length} routes
                                    <ChevronIcon direction={StyleDirection.Right} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </ScaleInOut>
        </Page>
    )
}

export default SwapPage
