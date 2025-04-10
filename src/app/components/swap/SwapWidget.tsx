"use client"

import { AnimatePresence } from "motion/react"
import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"
import { formatUnits } from "viem"

import ArrowIcon from "@/app/components/icons/ArrowIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import RouteIcon from "@/app/components/icons/RouteIcon"
import SwapPreview from "@/app/components/swap/SwapPreview"
import SwapWidgetAnimation from "@/app/components/swap/SwapWidgetAnimation"
import UnwrapNativeToken from "@/app/components/swap/UnwrapNativeToken"
import TokenInput from "@/app/components/tokens/TokenInput"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import Button from "@/app/components/ui/Button"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes } from "@/app/config/styling"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import { StyleDirection, StyleToggleDirection } from "@/app/types/styling"

interface SwapWidgetProps extends React.ComponentPropsWithoutRef<"div"> {
    showIntro?: boolean,
}

const SwapWidget = React.forwardRef<HTMLDivElement, SwapWidgetProps>(({
    className,
    showIntro,
    ...props
}, ref) => {

    const { swapRoute, switchTokens, srcAmountInput, setSrcAmountInput, useSwapQuotesData, selectedQuote, swapMsgData } = useQuoteData()
    const { isPending, data: quoteData } = useSwapQuotesData

    return (
        <div
            ref={ref}
            className={twMerge("flex flex-col flex-none gap-4 w-full h-fit overflow-hidden", className)}
            {...props}
        >
            <TokenInput
                key="src"
                route={swapRoute}
                value={srcAmountInput}
                amount={swapRoute.srcData.amount}
                feeData={selectedQuote?.feeData}
                setValue={setSrcAmountInput}
                isDisabled={showIntro}
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
                key="dst"
                route={swapRoute}
                value={selectedQuote ? formatUnits(selectedQuote.estDstAmount, selectedQuote.dstData.token.decimals) : undefined}
                amount={selectedQuote?.estDstAmount}
                isDst={true}
                isDisabled={showIntro}
            />
            <UnwrapNativeToken />

            {!showIntro && (
                <div className="flex flex-col flex-1">
                    <div className="flex flex-row flex-1 px-4 pb-4 gap-4 font-bold">
                        <div className="flex flex-row flex-1 gap-4 justify-start items-center">
                            <RouteIcon />
                            Quotes
                        </div>
                        {!isPending && quoteData && quoteData.quotes.length > 1 && (
                            <Link
                                href="/swap/routes"
                                className="flex flex-row flex-none gap-2 justify-end items-center text-end transition text-muted-500 hover:text-white"
                            >
                                View all {quoteData.quotes.length} quotes
                                <ChevronIcon direction={StyleDirection.Right} className={iconSizes.xs} />
                            </Link>
                        )}
                    </div>
                    <AnimatePresence mode="wait">
                        {selectedQuote && swapMsgData?.isShowErrorWithQuote && (
                            <SwapWidgetAnimation>
                                <AlertDetail
                                    className="mb-4"
                                    type={AlertType.Error}
                                    msg={swapMsgData.msg}
                                />
                            </SwapWidgetAnimation>
                        )}
                    </AnimatePresence>
                    {(selectedQuote || swapMsgData) && (
                        <div
                            className="container-select overflow-hidden"
                            data-selected={true}
                        >
                            <AnimatePresence mode="wait">
                                <SwapWidgetAnimation key={selectedQuote?.id ?? swapMsgData?.type ?? "empty"}>
                                    {selectedQuote ? (
                                        <SwapPreview
                                            swap={selectedQuote}
                                            isSelected={true}
                                            isSwapWidget={true}
                                        />
                                    ) : swapMsgData && (
                                        <div className="flex flex-row flex-1 p-6 gap-4">
                                            <div className="flex flex-row flex-1 justify-start items-center">
                                                {swapMsgData.msg}
                                            </div>
                                            <div className="flex flex-row flex-none justify-end items-center">
                                                {swapMsgData.icon}
                                            </div>
                                        </div>
                                    )}
                                </SwapWidgetAnimation>
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
})
SwapWidget.displayName = "SwapWidget"

export default SwapWidget
