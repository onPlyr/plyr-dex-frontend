"use client"

import { AnimateNumber } from "motion-plus/react"
import Link from "next/link"
import React from "react"
import { twMerge } from "tailwind-merge"
import { formatUnits, parseUnits } from "viem"
import { useAccount } from "wagmi"

import AccountIcon from "@/app/components/icons/AccountIcon"
import ChevronIcon from "@/app/components/icons/ChevronIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import { ChainImageInline } from "@/app/components/images/ChainImage"
import { TokenImage } from "@/app/components/images/TokenImage"
import TokenAmountValue from "@/app/components/tokens/TokenAmountValue"
import TokenBalance from "@/app/components/tokens/TokenBalance"
import Button from "@/app/components/ui/Button"
import { DecimalInput } from "@/app/components/ui/DecimalInput"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { iconSizes, MediaQueries } from "@/app/config/styling"
import { SwapQuoteConfig, TokenInputPercentOptions } from "@/app/config/swaps"
import useTokens from "@/app/hooks/tokens/useTokens"
import useMediaQuery from "@/app/hooks/utils/useMediaQuery"
import { getSwapRouteEstGasFee } from "@/app/lib/swaps"
import { CellFeeType } from "@/app/types/cells"
import { AnimatedNumberFormatOptions, NumberFormatOptions, NumberFormatType } from "@/app/types/numbers"
import { StyleDirection, StyleSize } from "@/app/types/styling"
import { SwapFeeData, SwapRoute } from "@/app/types/swaps"
import { isNativeToken, isValidTokenAmount, Token, TokenAmount } from "@/app/types/tokens"

export interface TokenInputProps extends React.ComponentPropsWithoutRef<"div"> {
    route: SwapRoute,
    value?: string,
    setValue?: (value: string) => void,
    amount?: bigint,
    feeData?: SwapFeeData,
    isDst?: boolean,
    isDisabled?: boolean,
}

export interface TokenInputPercentButtonsProps extends React.ComponentPropsWithoutRef<"div"> {
    route: SwapRoute,
    token?: Token,
    balance?: TokenAmount,
    feeData?: SwapFeeData,
    setValue?: (value: string) => void,
}

export interface TokenSelectDetailProps extends React.ComponentPropsWithoutRef<typeof Link> {
    token?: Token,
    imgSize: StyleSize,
}

const getMinTokenAmountBuffer = (route: SwapRoute, percent: number, token?: Token, balance?: TokenAmount, feeData?: SwapFeeData) => {

    if (percent !== 100 || !token || !isNativeToken(token) || !isValidTokenAmount(balance)) {
        return BigInt(0)
    }

    const estGasFee = getSwapRouteEstGasFee(route) || BigInt(0)
    const fixedFee = feeData?.[CellFeeType.FixedNative] || parseUnits((route.srcData.chain?.defaultFixedNativeFee || SwapQuoteConfig.DefaultFixedNativeFee).toString(), token.decimals)

    return estGasFee + fixedFee
}

const TokenInputPercentButtons = React.forwardRef<HTMLDivElement, TokenInputPercentButtonsProps>(({
    className,
    route,
    token,
    balance,
    feeData,
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

            const minRemainingAmount = (option.percent === 100 && getMinTokenAmountBuffer(route, option.percent, token, balance, feeData)) || BigInt(0)
            const percentageAmount = token && isValidTokenAmount(balance) && setValue && ((balance.amount * BigInt(option.percent)) / BigInt(100))
            const amount = percentageAmount && percentageAmount > minRemainingAmount ? percentageAmount - minRemainingAmount : BigInt(0)
            const amountFormatted = token && amount ? formatUnits(amount, token.decimals) : undefined

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
        {token && (
            <div className="flex flex-row flex-none font-bold">
                {token.symbol}
            </div>
        )}
        <ChevronIcon
            direction={StyleDirection.Down}
            className={twMerge("transition text-muted-500 group-hover:text-white", iconSizes.xs)}
        />
    </Link>
))
TokenSelectDetail.displayName = "TokenSelectDetail"

const TokenInput = React.forwardRef<HTMLDivElement, TokenInputProps>(({
    route,
    value,
    setValue,
    amount,
    feeData,
    isDst = false,
    isDisabled = false,
    ...props
}, ref) => {

    const { address: accountAddress, isDisconnected } = useAccount()
    const { useBalancesData: { getBalance, isInProgress: balanceIsInProgress } } = useTokens()
    const { chain, token } = isDst ? route.dstData : route.srcData

    const balance = getBalance(token)
    const xsBreakpoint = useMediaQuery(MediaQueries.XsBreakpoint)
    const smBreakpoint = useMediaQuery(MediaQueries.SmBreakpoint)
    const selectUrl = `/swap/select/${isDst ? "to" : "from"}`

    return (
        <div
            ref={ref}
            className="input-container flex flex-col flex-1 px-5 py-4 gap-3 w-full"
            {...props}
        >
            <div className="flex flex-row flex-1 gap-4">
                <div className="flex flex-row flex-none gap-3 justify-start items-center font-bold">
                    {isDst ? "To" : "From"}
                    <TokenSelectDetail
                        href={selectUrl}
                        token={token}
                        imgSize="sm"
                    />
                </div>
                <div className="flex flex-row flex-1 gap-2 justify-end items-center">
                    {accountAddress && !isDisconnected && token && (
                        <Tooltip
                            trigger=<div className="flex flex-row flex-none gap-2 items-center text-muted-500">
                                {xsBreakpoint && (
                                    <TokenBalance
                                        className="justify-end text-end"
                                        token={token}
                                        balance={balance}
                                        hideSymbol={!smBreakpoint}
                                        ignoreType={!smBreakpoint}
                                    />
                                )}
                                {balanceIsInProgress ? <LoadingIcon className={iconSizes.xs} /> : <AccountIcon className={iconSizes.xs} />}
                            </div>
                        >
                            Wallet balance:&nbsp;
                            <TokenBalance
                                token={token}
                                balance={balance}
                            />
                        </Tooltip>
                    )}
                    {!isDst && (
                        <TokenInputPercentButtons
                            route={route}
                            token={token}
                            balance={balance}
                            feeData={feeData}
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
                            decimals={token?.decimals}
                            autoFocus={!isDisabled}
                            disabled={isDisabled || !chain || !token}
                        />
                    )}
                </div>
            </div>
            <div className="flex flex-row flex-1 gap-4">
                <div className="flex flex-row flex-1 justify-between items-center">
                    <Link
                        href={selectUrl}
                        className="flex flex-row flex-none justify-start items-center gap-2 font-bold text-muted-500"
                        prefetch={true}
                    >
                        {chain ? (<>
                            <ChainImageInline
                                chain={chain}
                                size="xs"
                            />
                            {chain.name}
                        </>) : "Select token"}
                    </Link>
                </div>
                {token && (
                    <div className="flex flex-row flex-1 gap-4 text-muted-500">
                        <div className="flex flex-row flex-1 justify-end items-center gap-2">
                            <TokenAmountValue
                                token={token}
                                amount={{
                                    amount: amount,
                                    formatted: value,
                                }}
                                isNoInputValue={!(value && parseFloat(value) > 0)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
TokenInput.displayName = "TokenInput"

export default TokenInput
