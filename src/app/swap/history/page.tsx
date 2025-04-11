"use client"

import "@/app/styles/globals.css"

import { motion, Transition, Variants } from "motion/react"
import Link from "next/link"
import React from "react"
import { useAccount } from "wagmi"

import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Page } from "@/app/components/ui/Page"
import useSwapHistory from "@/app/hooks/swap/useSwapHistory"
import { timestampAgo } from "@/app/lib/datetime"
import { PageType } from "@/app/types/navigation"
import { NumberFormatType } from "@/app/types/numbers"
import { getStatusLabel } from "@/app/lib/utils"

const swapsPerPage = 10

const defaultTransition: Transition = {
    type: "spring",
    duration: 0.15,
}

const defaultVariants: Variants = {
    initial: {
        y: "50%",
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: "50%",
        opacity: 0,
    },
}

const SwapHistoryAnimation = React.forwardRef<React.ComponentRef<typeof motion.div>, React.ComponentPropsWithoutRef<typeof motion.div>>(({
    transition = defaultTransition,
    variants = defaultVariants,
    layout = true,
    ...props
}, ref) => (
    <motion.div
        ref={ref}
        transition={transition}
        layout={layout}
        variants={variants}
        {...props}
    />
))
SwapHistoryAnimation.displayName = "SwapHistoryAnimation"

const HistoryPage = () => {

    const { address: accountAddress } = useAccount()
    const { getSwapHistories } = useSwapHistory()
    const pageSwaps = getSwapHistories(accountAddress).slice(0, swapsPerPage)

    return (
        <Page
            key={PageType.SwapHistoryList}
            header="Transactions"
            backUrl="/swap"
        >
            <motion.div
                className="flex flex-col flex-none gap-4 w-full h-fit"
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                    staggerChildren: 0.1,
                }}
            >
                {pageSwaps.length > 0 ? pageSwaps.map((swap) => (
                    <SwapHistoryAnimation key={swap.id}>
                        <Link
                            href={`/swap/${swap.txHash}/${swap.srcData.chain.id}/?from=history`}
                            className="container flex flex-col flex-1 p-4 gap-4"
                        >
                            <div className="flex flex-row flex-1 gap-4">
                                <div className="flex flex-row flex-none justify-center items-center">
                                    <TokenImage token={swap.dstData.token} />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex flex-row flex-1 font-bold text-base">
                                        {swap.dstAmount ? (
                                            <DecimalAmount
                                                amount={swap.dstAmount}
                                                symbol={swap.dstData.token.symbol}
                                                token={swap.dstData.token}
                                                type={NumberFormatType.Precise}
                                            />
                                        ) : getStatusLabel(swap.status)}
                                    </div>
                                    <div className="flex flex-row flex-1 gap-2 items-center text-muted-500">
                                        <ChainImageInline
                                            chain={swap.dstData.chain}
                                            size="xs"
                                        />
                                        <div className="flex flex-col flex-1 items-start text-muted-500">
                                            <span className="leading-none">{swap.dstData.chain.name}</span>
                                            {swap.plyrId && <span className="text-xs leading-none font-bold">@{swap.plyrId.toUpperCase()}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row flex-1 gap-2 justify-end items-center text-end">
                                    <div className="hidden sm:inline text-muted-500">{timestampAgo(swap.timestamp)}</div>
                                    <SwapStatusIcon status={swap.status} highlight={true} />
                                </div>
                            </div>
                        </Link>
                    </SwapHistoryAnimation>
                )) : (
                    <SwapHistoryAnimation key="error">
                        <AlertDetail
                            type={AlertType.Info}
                            header="No Swaps Found"
                            msg="Please ensure that you're connected with the same account you used to swap with previously."
                        />
                    </SwapHistoryAnimation>
                )}
                <SwapHistoryAnimation key="storage-msg">
                    <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500 text-center">
                        Transaction history is saved locally and will be erased when you clear your browser cache.
                    </div>
                </SwapHistoryAnimation>
            </motion.div>
        </Page>
    )
}

export default HistoryPage