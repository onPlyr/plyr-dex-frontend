import { formatUnits, parseUnits } from "viem"

import { bpsFormat, Currency, currencyFormats, currencyLabels, defaultCurrency, lgNumberFormat, mdNumberFormat, mdNumberFormatMax, numberFormats, NumberFormatType, percentFormat, preciseNumberFormatMax, smNumberFormat, smNumberFormatMax } from "@/app/config/numbers"
import { Token } from "@/app/types/tokens"

////////////////////////////////////////////////////////////////////////////////
// formatting

export const formatPeriodSepatatedDecimalInput = (value: string, decimals?: number) => {
    const formatted = value.replace(/[^.\d]/g, "").replace(/^(\d*\.?)|(\d*)\.?/g, "$1$2")
    const split = formatted.split(".")
    return split.length > 1 ? `${split[0]}.${split.slice(1).join("").slice(0, decimals || 18)}` : formatted
}

export const formatCommaSepatatedDecimalInput = (value: string, decimals?: number) => {
    const formatted = value.replace(/[^,\d]/g, "").replace(/^(\d*\,?)|(\d*)\,?/g, "$1$2")
    const split = formatted.split(",")
    return split.length > 1 ? `${split[0]},${split.slice(1).join("").slice(0, decimals || 18)}` : formatted
}

export const formatDecimalInput = (value?: string, decimals?: number) => {
    return value === undefined || value.trim().length === 0 ? "" : value.indexOf(".") > -1 ? formatPeriodSepatatedDecimalInput(value, decimals) : formatCommaSepatatedDecimalInput(value, decimals)
}

export const getNumberFormatType = (num: number, type?: NumberFormatType) => {
    if (type) {
        return type === NumberFormatType.Precise && num > preciseNumberFormatMax ? lgNumberFormat : numberFormats[type]
    }
    return num < smNumberFormatMax ? smNumberFormat : num < mdNumberFormatMax ? mdNumberFormat : lgNumberFormat
}

// todo: update abs/max checks to use bigint rather than numbers
// note: low priority as MOST whole token amounts should be lower than Number.MAX_SAFE_INTEGER
export const formattedAmountToLocale = (value?: Intl.StringNumericLiteral, type?: NumberFormatType) => {

    if (value === undefined || value.trim().length === 0) {
        return ""
    }

    const int = Math.abs(parseInt(value))
    // const numberFormat = type ? numberFormats[type] : int < smNumberFormatMax ? smNumberFormat : int < mdNumberFormatMax ? mdNumberFormat : lgNumberFormat
    const numberFormat = getNumberFormatType(int, type)

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

////////////////////////////////////////////////////////////////////////////////
// currency

export const getCurrencyLabel = (currency: Currency) => {
    return currencyLabels[currency]
}

export const currencyToLocale = ({
    amount,
    amountFormatted,
    currency,
}: {
    amount?: bigint,
    amountFormatted?: Intl.StringNumericLiteral,
    currency?: Currency,
}) => {

    const useCurrency = currency ?? defaultCurrency
    const useAmount = amount !== undefined ? amount.toString() : amountFormatted?.trim()

    if (useAmount === undefined || useAmount.length === 0) {
        return ""
    }

    return currencyFormats[useCurrency].format(useAmount as Intl.StringNumericLiteral)
}

////////////////////////////////////////////////////////////////////////////////
// equivalent Math.functions for bigints where needed

type MathBigIntFunction = (arg: bigint) => bigint
type MathBigIntArrayFunction = (args: bigint[]) => bigint

const absBigInt: MathBigIntFunction = (arg: bigint) => {
    return arg <= BigInt(0) || arg === -BigInt(0) ? -arg : arg
}

const maxBigInt: MathBigIntArrayFunction = (args: bigint[]) => {
    return args.reduce((a, b) => b > a ? b : a)
}

const minBigInt: MathBigIntArrayFunction = (args: bigint[]) => {
    return args.reduce((a, b) => b < a ? b : a)
}

export const MathBigInt = {
    abs: absBigInt,
    min: minBigInt,
    max: maxBigInt,   
} as const
