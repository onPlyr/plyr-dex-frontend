"use client"

import "@/app/styles/globals.css"

import Link from "next/link"
import { twMerge } from "tailwind-merge"

import SlideInOut from "@/app/components/animations/SlideInOut"
import { CurrencyIcon, CurrencyIconVariant } from "@/app/components/icons/CurrencyIcon"
import SwapStatusIcon from "@/app/components/icons/SwapStatusIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { Page } from "@/app/components/ui/Page"
import { NumberFormatType } from "@/app/config/numbers"
import { SwapTab } from "@/app/config/pages"
import { imgSizes } from "@/app/config/styling"
import { swapHistoryLocalStorageMsg } from "@/app/config/swaps"
import useSwapData from "@/app/hooks/swap/useSwapData"
import { timestampAgo } from "@/app/lib/datetime"

const swapsPerPage = 10

const HistoryPage = () => {

    const { data: swapData } = useSwapData()
    const pageSwaps = swapData.slice(0, swapsPerPage)

    return (
        <Page
            key={SwapTab.Transactions}
            header="Transactions"
            backUrl="/swap"
        >
            <div className="flex flex-col flex-none gap-4 w-full h-fit">
                {swapData.length > 0 ? pageSwaps.map((swap, i) => (
                    <SlideInOut
                        key={`${swap.srcData.chain.id}-${swap.id}`}
                        from="left"
                        to="right"
                        delays={{
                            animate: i * 0.05,
                            exit: (pageSwaps.length - 1 - i) * 0.05,
                        }}
                    >
                        <Link
                            href={`/swap/${swap.id}/${swap.srcData.chain.id}`}
                            className="container flex flex-col flex-1 p-4 gap-4"
                        >
                            <div className="flex flex-row flex-1 gap-4">
                                <div className="flex flex-row flex-none justify-center items-center">
                                    {swap.dstData ? (
                                        <TokenImage token={swap.dstData.token} />
                                    ) : (
                                        <CurrencyIcon
                                            variant={CurrencyIconVariant.UsdCircle}
                                            className={twMerge(imgSizes.default, "text-muted-500")}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex flex-row flex-1 font-bold text-base">
                                        {swap.dstData ? (
                                            <DecimalAmount
                                                amount={swap.dstData.amount}
                                                symbol={swap.dstData.token.symbol}
                                                token={swap.dstData.token}
                                                type={NumberFormatType.Precise}
                                            />
                                        ) : "Pending"}
                                    </div>
                                    {swap.dstData && (
                                        <div className="flex flex-row gap-2 items-center text-muted-500">
                                            
                                            <ChainImageInline
                                                chain={swap.dstData.chain}
                                                size="xs"
                                            />
                                            <div className="flex flex-col flex-1 items-start text-muted-500">
                                                <span className="leading-none">{swap.dstData.chain.name}</span>
                                                {swap.plyrId && <span className="text-xs leading-none font-bold">@{swap.plyrId.toUpperCase()}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-row flex-1 gap-2 justify-end items-center text-end">
                                    {swap.timestamp && <div className="hidden sm:inline text-muted-500">{timestampAgo(swap.timestamp)}</div>}
                                    <SwapStatusIcon status={swap.status} highlight={true} />
                                </div>
                            </div>
                        </Link>
                    </SlideInOut>
                )) : (
                    <SlideInOut
                        key="error"
                        from="left"
                        to="right"
                    >
                        <AlertDetail
                            type={AlertType.Info}
                            header="No Swaps Found"
                            msg="You must initiate at least one swap for your history to be displayed."
                        />
                    </SlideInOut>
                )}
                <div className="flex flex-row flex-1 justify-center items-center font-bold text-muted-500 text-center">
                    {swapHistoryLocalStorageMsg}
                </div>
            </div>
        </Page>
    )
}

export default HistoryPage