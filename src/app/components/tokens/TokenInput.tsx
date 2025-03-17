"use client"

import { AnimateNumber } from "motion-plus/react"
import Link from "next/link"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { formatUnits } from "viem"

import AccountIcon from "@/app/components/icons/AccountIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import Button from "@/app/components/ui/Button"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import DecimalAmount from "@/app/components/ui/DecimalAmount"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes, MediaQueries } from "@/app/config/styling"
import { TokenInputPercentOptions } from "@/app/config/swaps"
import useMediaQuery from "@/app/hooks/utils/useMediaQuery"
import { getSwapRouteEstGasFee } from "@/app/lib/swaps"
import { AnimatedNumberFormatOptions, NumberFormatOptions, NumberFormatType } from "@/app/types/numbers"
import { StyleDirection, StyleSize } from "@/app/types/styling"
import { SwapRoute } from "@/app/types/swaps"
import { Token } from "@/app/types/tokens"

export interface TokenInputProps extends React.ComponentPropsWithoutRef<"div"> {
    route: SwapRoute,
    value?: string,
    setValue?: (value: string) => void,
    isDst?: boolean,
}

export interface TokenInputPercentButtonsProps extends React.ComponentPropsWithoutRef<"div"> {
    route: SwapRoute,
    token?: Token,
    setValue?: (value: string) => void,
}

export interface TokenSelectDetailProps extends React.ComponentPropsWithoutRef<typeof Link> {
    token?: Token,
    imgSize: StyleSize,
}

const TokenInputPercentButtons = React.forwardRef<HTMLDivElement, TokenInputPercentButtonsProps>(({
    className,
    route,
    token,
    setValue,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge(
            "container-bg container-border rounded flex flex-row flex-none justify-end items-center transition overflow-hidden",
            className,
        )}
        {...props}
    >
        {TokenInputPercentOptions.map((option) => {

            const minRemainingAmount = option.percent === 100 && token?.isNative && getSwapRouteEstGasFee(route) || BigInt(0)
            const amount = token?.balance && setValue && ((token.balance * BigInt(option.percent)) / BigInt(100)) - minRemainingAmount
            const amountFormatted = amount && amount > BigInt(0) ? formatUnits(amount, token.decimals) : undefined

            return (
                <Button
                    key={option.percent}
                    onClick={amountFormatted ? setValue?.bind(this, amountFormatted) : undefined}
                    className="clear-bg clear-border-outline p-0 m-0"
                    replaceClass={true}
                    disabled={!amountFormatted}
                >
                    <div className="px-2 py-1 transition font-bold text-xs text-muted-500 hover:text-white uppercase hover:container-border-as-bg">
                        {option.label}
                    </div>
                </Button>
            )
        })}
    </div>
))
TokenInputPercentButtons.displayName = "TokenInputPercentButtons"

const TokenSelectDetail = React.forwardRef<React.ComponentRef<typeof Link>, TokenSelectDetailProps>(({
    className,
    prefetch = true,
    token,
    imgSize = "sm",
    ...props
}, ref) => (
    <Link
        ref={ref}
        className={twMerge("group flex flex-row flex-none gap-3 justify-end items-center", className)}
        prefetch={prefetch}
        {...props}
    >
        <TokenImage
            token={token}
            size={imgSize}
        />
        <div className="flex flex-row flex-none font-bold">
            {token?.symbol ?? "Select Token"}
        </div>
        <ChevronIcon
            direction={StyleDirection.Down}
            className={twMerge("transition text-muted-500 group-hover:text-white", iconSizes.xs)}
        />
    </Link>
))
TokenSelectDetail.displayName = "TokenSelectDetail"

export const TokenInput = React.forwardRef<HTMLDivElement, TokenInputProps>(({
    route,
    value,
    setValue,
    isDst = false,
    ...props
}, ref) => {

    const { chain, token } = isDst ? route.dstData : route.srcData
    const selectUrl = `/swap/select/${isDst ? "to" : "from"}`

    const xsBreakpoint = useMediaQuery(MediaQueries.XsBreakpoint)
    const smBreakpoint = useMediaQuery(MediaQueries.SmBreakpoint)

    return (
        <div
            ref={ref}
            className="input-container flex flex-col flex-1 px-4 py-3 gap-3 w-full"
            {...props}
        >
            <div className="flex flex-row flex-1 gap-4">
                <div className="flex flex-row flex-none gap-3 justify-start items-center font-bold">
                    {isDst ? "To" : "From"}
                    <TokenSelectDetail
                        href={selectUrl}
                        token={token}
                        imgSize="xs"
                    />
                </div>
                <div className="flex flex-row flex-1 gap-2 justify-end items-center">
                    <Tooltip
                        trigger=<div className="flex flex-row flex-none gap-2 items-center">
                            {xsBreakpoint && (
                                <DecimalAmount
                                    amountFormatted={token?.balanceFormatted}
                                    symbol={smBreakpoint ? token?.symbol : undefined}
                                    token={token}
                                    type={smBreakpoint ? NumberFormatType.Precise : undefined}
                                    className="justify-end font-bold text-end text-muted-500"
                                />
                            )}
                            <AccountIcon className={twMerge("text-muted-500", iconSizes.xs)} />
                        </div>
                    >
                        Wallet balance:&nbsp;
                        <DecimalAmount
                            amountFormatted={token?.balanceFormatted}
                            symbol={token?.symbol}
                            token={token}
                            type={NumberFormatType.Precise}
                            className="font-bold"
                        />
                    </Tooltip>
                    {!isDst && (
                        <TokenInputPercentButtons
                            route={route}
                            token={token}
                            setValue={setValue}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-row flex-1 gap-4">
                <div className="flex flex-row flex-1 justify-end items-center font-bold text-end">
                    {isDst ? (
                        <AnimateNumber
                            className={twMerge("p-0 m-0 text-2xl", !value ? "text-muted-500" : undefined)}
                            format={NumberFormatOptions[value ? NumberFormatType.Input : NumberFormatType.ZeroWithDecimal] as AnimatedNumberFormatOptions}
                            transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.5,
                            }}
                        >
                            {value ?? ""}
                        </AnimateNumber>
                    ) : (
                        <DecimalInput
                            id="srcAmount"
                            name="srcAmount"
                            className="p-0 m-0 text-end text-2xl truncate"
                            value={value}
                            setValue={setValue}
                            disabled={!chain || !token}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-row flex-1 gap-4">
                <div className="flex flex-row flex-1 justify-between items-center">
                    {chain && (
                        <div className="flex flex-row flex-1 justify-start items-center gap-2 font-bold text-muted-500">
                            <ChainImageInline
                                chain={chain}
                                size="xs"
                            />
                            {chain.name}
                        </div>
                    )}
                    <CurrencyAmount
                        amountFormatted="0"
                        className="justify-end text-end text-muted-500"
                    />
                </div>
            </div>
        </div>
    )
})
TokenInput.displayName = "TokenInput"