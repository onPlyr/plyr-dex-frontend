import { formatUnits, parseUnits } from "viem"

import { bpsFormat, lgNumberFormat, mdNumberFormat, mdNumberFormatMax, numberFormats, NumberFormatType, percentFormat, smNumberFormat, smNumberFormatMax } from "@/app/config/numbers"
import { Token } from "@/app/types/tokens"

export const formatDecimalInput = (value?: string, decimals?: number) => {

    if (value === undefined || value.trim().length === 0) {
        return ""
    }

    const formatted = value.replace(/[^.\d]/g, "").replace(/^(\d*\.?)|(\d*)\.?/g, "$1$2")
    const split = formatted.split(".")

    return split.length > 1 ? `${split[0]}.${split.slice(1).join("").slice(0, decimals || 18)}` : formatted

}

export const validateDecimalString = (value?: string) => {
    const decimalFormat = /^[0-9]+(\.)?[0-9]*$/
    return value !== undefined && value.trim().length !== 0 && decimalFormat.test(value)
}

export const formattedAmountToLocale = (value?: Intl.StringNumericLiteral, type?: NumberFormatType) => {

    if (value === undefined || value.trim().length === 0) {
        return ""
    }

    const int = Math.abs(parseInt(value))
    const numberFormat = type ? numberFormats[type] : int < smNumberFormatMax ? smNumberFormat : int < mdNumberFormatMax ? mdNumberFormat : lgNumberFormat

    return numberFormat.format(value)

}

export const amountToLocale = (amount: bigint, decimals: number, type?: NumberFormatType) => {

    if (amount === BigInt(0)) {
        return "0"
    }

    const formatted = formatUnits(amount, decimals) as Intl.StringNumericLiteral
    return formattedAmountToLocale(formatted, type)

}

export const bpsToPercent = (bps: number | bigint) => {
    return bpsFormat.format(Number(bps) / 100)
}

export const getExchangeRate = (srcToken: Token, srcAmount: bigint, dstAmount: bigint) => {
    if (srcAmount === BigInt(0) || dstAmount === BigInt(0)) {
        return BigInt(0)
    }
    return (dstAmount * parseUnits("1", srcToken.decimals)) / srcAmount
}

export const getExchangeRateFormatted = (srcToken: Token, srcAmount: bigint, dstToken: Token, dstAmount: bigint, type?: NumberFormatType) => {
    if (srcAmount === BigInt(0) || dstAmount === BigInt(0)) {
        return "0"
    }
    return amountToLocale(getExchangeRate(srcToken, srcAmount, dstAmount), dstToken.decimals, type)
}

export const getPercentChangeFormatted = (srcAmount: bigint, dstAmount: bigint, decimals: number) => {
    if (srcAmount === BigInt(0) || dstAmount === BigInt(0)) {
        return "0"
    }
    return amountToLocale((parseUnits(srcAmount.toString(), decimals + 2) / dstAmount) - parseUnits("100", decimals), decimals)
}

export const getPercentDifferenceFormatted = (srcAmount: bigint, dstAmount: bigint, decimals: number) => {
    if (srcAmount === BigInt(0) || dstAmount === BigInt(0)) {
        return "0"
    }
    return percentFormat.format(formatUnits(parseUnits((dstAmount - srcAmount).toString(), decimals) / srcAmount, decimals) as Intl.StringNumericLiteral)
}

export const maxBigInt = (values: bigint[]) => {
    return values.reduce((a, b) => b > a ? b : a)
}

export const minBigInt = (values: bigint[]) => {
    return values.reduce((a, b) => b < a ? b : a)
}
