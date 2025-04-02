"use client"

import { AnimatePresence, motion } from "motion/react"
import React, { useMemo } from "react"
import { twMerge } from "tailwind-merge"

import InfoIcon from "@/app/components/icons/InfoIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import Skeleton from "@/app/components/ui/Skeleton"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { TokenPriceConfig } from "@/app/config/prices"
import { iconSizes } from "@/app/config/styling"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokens from "@/app/hooks/tokens/useTokens"
import { PreferenceType } from "@/app/types/preferences"
import { isValidTokenAmount, Token, TokenAmount } from "@/app/types/tokens"

interface InvalidTokenPriceTooltipProps extends Omit<React.ComponentPropsWithoutRef<typeof Tooltip>, "trigger"> {
    token?: Token,
    tokenSymbol?: string,
    iconClass?: string,
}

interface TokenAmountValueProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    token?: Token,
    amount?: TokenAmount,
    decimals?: number,
    emptyValue?: string,
    isNoInputValue?: boolean,
    isAmountValue?: boolean,
    loadingIconProps?: React.ComponentPropsWithoutRef<typeof motion.div>,
    priceTooltipProps?: InvalidTokenPriceTooltipProps,
}

export const InvalidTokenPriceTooltip = ({
    children,
    token,
    tokenSymbol,
    iconClass,
    ...props
}: InvalidTokenPriceTooltipProps) => (
    <Tooltip
        trigger=<InfoIcon className={twMerge("text-warning-500", iconSizes.xs, iconClass)} />
        {...props}
    >
        {children ?? `Price data unavailable for ${token?.symbol ?? tokenSymbol ?? "this token"}.`}
    </Tooltip>
)

const TokenAmountValue = React.forwardRef<React.ComponentRef<typeof motion.div>, TokenAmountValueProps>(({
    className,
    token,
    amount,
    decimals = TokenPriceConfig.Decimals,
    emptyValue = "0",
    isNoInputValue = false,
    isAmountValue = false,
    loadingIconProps = {
        initial: "hide",
        animate: "show",
        exit: "hide",
        transition: {
            type: "spring",
            duration: 0.2,
        },
        variants: {
            hide: {
                scale: 0,
                opacity: 0,
            },
            show: {
                scale: 1,
                opacity: 1,
            },
        },
    },
    priceTooltipProps,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition = {
        type: "spring",
        duration: 0.2,
    },
    variants = {
        initial: {
            y: "100%",
            opacity: 0,
        },
        animate: {
            y: 0,
            opacity: 1,
        },
        exit: {
            y: "-100%",
            opacity: 0,
        },
    },
    ...props
}, ref) => {

    const { getPreference } = usePreferences()
    const currency = useMemo(() => getPreference(PreferenceType.Currency), [getPreference])
    const { useTokenPricesData } = useTokens()
    const { getPrice, getAmountValue, isPending, isFetching } = useTokenPricesData

    const value = (isAmountValue && amount) || getAmountValue(token, amount)
    const tokenPrice = getPrice(token)
    const isValidPrice = isValidTokenAmount(tokenPrice)
    const isValidAmount = isValidTokenAmount(value)

    return (
        <motion.div
            ref={ref}
            className={twMerge("inline-flex gap-2 items-center text-muted-500 overflow-hidden", className)}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
            variants={variants}
            {...props}
        >
            <AnimatePresence mode="wait">
                {isPending || (isFetching && !isValidPrice) ? (
                    <Skeleton
                        key="in-progress"
                        className="h-4 w-16"
                        initial={initial}
                        animate={animate}
                        exit={exit}
                        transition={transition}
                        variants={variants}
                    />
                ) : (
                    <motion.div
                        key="amount-value"
                        className="contents"
                        initial={initial}
                        animate={animate}
                        exit={exit}
                        transition={transition}
                        variants={variants}
                    >
                        <AnimatePresence mode="wait">
                            {isFetching && (
                                <motion.div key="loading" {...loadingIconProps}>
                                    <LoadingIcon className={iconSizes.xs} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <CurrencyAmount
                            amountFormatted={isValidAmount ? value.formatted : emptyValue}
                            decimals={decimals}
                            currency={currency}
                        />
                        {!isNoInputValue && !isValidPrice && (
                            <InvalidTokenPriceTooltip
                                {...priceTooltipProps}
                                token={token}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
})
TokenAmountValue.displayName = "TokenAmountValue"

export default TokenAmountValue
