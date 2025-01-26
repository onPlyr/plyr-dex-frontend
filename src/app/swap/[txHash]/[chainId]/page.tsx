"use client"

import "@/app/styles/globals.css"

import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { use, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { isHex } from "viem"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SuccessIcon from "@/app/components/icons/SuccessIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import SwapEventSummary from "@/app/components/swap/SwapEventSummary"
import SwapProgressBar from "@/app/components/swap/SwapProgressBar"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import { SwapTab } from "@/app/config/pages"
import { imgSizes } from "@/app/config/styling"
import { SwapStatus } from "@/app/config/swaps"
import useSwapDetails from "@/app/hooks/swap/useSwapDetails"
import { getBlockExplorerLink, getChain } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { getStatusLabel } from "@/app/lib/utils"
import { CurrencyIcon, CurrencyIconVariant } from "@/app/components/icons/CurrencyIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"

import { useSearchParams } from 'next/navigation'
import { toTokens } from "thirdweb/utils"
import { useRouter } from "next/navigation"

interface Params {
    txHash: string,
    chainId: string,
}

const SwapDetailPage = ({
    params,
}: {
    params: Promise<Params>,
}) => {

    const pageParams = use(params)
    const chainId = parseInt(pageParams.chainId)
    const chain = getChain(chainId)
    const txHash = isHex(pageParams.txHash) ? pageParams.txHash : undefined
    const router = useRouter()
    const searchParams = useSearchParams()
    let plyrId = searchParams.get('plyrId');

    if (!chain || !txHash) {
        notFound()
    }

    const { data: swap } = useSwapDetails({
        chain: chain,
        txHash: txHash,
    })

    // Add to Depositlog //
    const addDepositLog = async (plyrId: string, token: string, amount: string, hash: string) => {
        await fetch('/api/addDepositLog/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plyrId: plyrId,
                gameId: null,
                token: token,
                amount: amount,
                hash: hash,
            })
        });
    }

    // Logic to add to Depositlog //
    useEffect(() => {
        //console.log('swap', swap)
        if (swap && swap.status === SwapStatus.Success && plyrId && swap.events.length > 0) {

            // get last event dst token //
            const lastEventDstToken = swap.events[swap.events.length - 1]

            if (lastEventDstToken && lastEventDstToken.dstData && lastEventDstToken.dstData.amount) {

                addDepositLog(plyrId, lastEventDstToken.dstData.token.id, toTokens(lastEventDstToken.dstData.amount, lastEventDstToken.dstData.token.decimals), txHash)

                // remove plyrId from search params
                router.replace(`/swap/${swap.id}/${swap.srcData.chain.id}`)
            }
        }
    }, [swap?.status, plyrId])

    const numPendingIndicators = 5
    const txString = toShort(txHash)
    const txUrl = getBlockExplorerLink({
        chain: chain,
        tx: txHash,
    })

    // todo: add suspense / loading state
    // todo: add proper loading details below


    return swap && (
        <Page
            key={SwapTab.Transactions}
            header={txUrl ? (
                <ExternalLink
                    href={txUrl}
                    iconSize="xs"
                    className="text-white"
                >
                    {txString}
                </ExternalLink>
            ) : txString}
            footer={swap.status === SwapStatus.Success && (
                <Link
                    href="/swap"
                    className="btn gradient-btn rounded w-full"
                >
                    New Swap
                </Link>
            )}
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                <div className="container p-4">
                    <div className="flex flex-col flex-1 gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500">
                                From
                            </div>
                            <div />
                            <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500">
                                To
                            </div>
                            <div className="flex flex-col flex-1 justify-center items-center">
                                <TokenImage token={swap.srcData.token} size="lg" />
                            </div>
                            <div className="flex flex-row flex-1 gap-2 justify-center items-center">
                                <AnimatePresence mode="wait">
                                    {swap.status === SwapStatus.Success ? (
                                        <ScaleInOut
                                            key="success"
                                            fadeInOut={true}
                                        >
                                            <SuccessIcon className={imgSizes.lg} highlight={true} />
                                        </ScaleInOut>
                                    ) : (
                                        <ScaleInOut
                                            key="pending"
                                            fadeInOut={true}
                                            className="flex flex-row flex-1 gap-2 justify-center items-center"
                                        >
                                            {[...Array(numPendingIndicators)].map((_, i) => (
                                                <div key={i} className="flex flex-row flex-1 max-w-4 max-h-4 aspect-square items-center justify-center">
                                                    <motion.div
                                                        key={i}
                                                        className={twMerge("rounded-full aspect-square bg-gradient-btn")}
                                                        animate={{
                                                            height: "100%",
                                                            width: "100%",
                                                        }}
                                                        transition={{
                                                            type: "tween",
                                                            repeat: Infinity,
                                                            repeatType: "mirror",
                                                            repeatDelay: 0.15,
                                                            duration: 0.3,
                                                            delay: 0.15 * i,
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </ScaleInOut>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex flex-col flex-1 justify-center items-center">
                                {swap.dstData ? (
                                    <TokenImage
                                        token={swap.dstData.token}
                                        size="lg"
                                    />
                                ) : (
                                    <CurrencyIcon
                                        variant={CurrencyIconVariant.UsdCircle}
                                        className={twMerge(imgSizes.lg, "text-muted-500")}
                                    />
                                )}
                            </div>
                            <div className="flex flex-row flex-1 gap-2 justify-center items-center font-bold">
                                <ChainImageInline chain={swap.srcData.chain} size="xs" />
                                {swap.srcData.token.symbol}
                            </div>
                            <div className="flex flex-row flex-1 gap-4 justify-center items-center font-bold text-center">
                                {swap.type ? `${getRouteTypeLabel(swap.type)} ` : ""}{getStatusLabel(swap.status)}
                            </div>
                            <div className="flex flex-row flex-1 gap-2 justify-center items-center font-bold">
                                {swap.dstData ? (<>
                                    <ChainImageInline chain={swap.dstData.chain} size="xs" />
                                    {swap.dstData.token.symbol}
                                </>) : (<>
                                    <SwapStatusIcon status={SwapStatus.Pending} className={imgSizes.xs} />
                                    Loading
                                </>)}
                            </div>
                        </div>
                        <SwapProgressBar swap={swap} />
                    </div>
                </div>
                <SwapEventSummary swap={swap} />
            </div>
        </Page>
    )
}

export default SwapDetailPage
