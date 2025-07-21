"use client"

import { AnimatePresence, motion } from "motion/react"
import React, { useMemo } from "react"
import { twMerge } from "tailwind-merge"

import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import { Tooltip } from "@/app/components/ui/Tooltip"
import { Bold } from "@/app/components/ui/Typography"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { Currency } from "@/app/types/currency"
import { PreferenceType } from "@/app/types/preferences"
import { SwapQuotePriceImpact } from "@/app/types/swaps"

export interface PriceImpactLabelProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
    priceImpact?: SwapQuotePriceImpact,
}

export interface PriceImpactWarningProps extends Omit<React.ComponentPropsWithoutRef<typeof AlertDetail>, "type"> {
    priceImpact: SwapQuotePriceImpact,
    type?: AlertType,
}

const getPriceImpactMsg = (priceImpact: SwapQuotePriceImpact, currency: Currency) => <>
    <Bold>{priceImpact.percentage.formatted}</Bold> price impact means&nbsp;
    <Bold>
        <CurrencyAmount
            amountFormatted={priceImpact.value.formatted}
            amount={priceImpact.value.amount}
            currency={currency}
        />
        &nbsp;{priceImpact.isNegative ? "less" : "more"} {priceImpact.dstToken.symbol}
    </Bold>
    &nbsp;than the value of your {priceImpact.srcToken.symbol}.
</>

export const PriceImpactLabel = React.forwardRef<React.ComponentRef<typeof motion.div>, PriceImpactLabelProps>(({
    priceImpact,
    ...props
}, ref) => {

    const { getPreference } = usePreferences()
    const currency = useMemo(() => getPreference(PreferenceType.Currency), [getPreference])

    return (
        <AnimatePresence mode="wait">
            {priceImpact && priceImpact.value.amount && (
                <motion.div
                    ref={ref}
                    {...props}
                >
                    <Tooltip
                        trigger=<div className={twMerge("badge-label normal-case text-white", priceImpact.isNegative ? "bg-error-500" : "bg-success-500")}>
                            {priceImpact.percentage.formatted}
                        </div>
                    >
                        {getPriceImpactMsg(priceImpact, currency)}
                    </Tooltip>
                </motion.div>
            )}
        </AnimatePresence>
    )
})
PriceImpactLabel.displayName = "PriceImpactLabel"

export const PriceImpactWarning = React.forwardRef<React.ComponentRef<typeof AlertDetail>, PriceImpactWarningProps>(({
    priceImpact,
    type = AlertType.Error,
    header = "Warning: High price impact detected!",
    ...props
}, ref) => {

    const { getPreference } = usePreferences()
    const currency = useMemo(() => getPreference(PreferenceType.Currency), [getPreference])

    return (
        <AlertDetail
            ref={ref}
            type={type}
            header={header}
            msg={getPriceImpactMsg(priceImpact, currency)}
            {...props}
        />
    )
})
PriceImpactWarning.displayName = "PriceImpactWarning"