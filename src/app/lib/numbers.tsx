import { formatUnits, parseUnits } from "viem"

import { Currency, currencyFormats, currencyLabels, defaultCurrency } from "@/app/config/numbers"
import { DefaultUserPreferences } from "@/app/config/preferences"
import { TokenPriceConfig } from "@/app/config/prices"
import { NumberFormat, NumberFormatType, NumberFormatTypeLimit } from "@/app/types/numbers"
import { PreferenceType } from "@/app/types/preferences"
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
    return value?.trim() ? value.indexOf(".") > -1 ? formatPeriodSepatatedDecimalInput(value, decimals) : formatCommaSepatatedDecimalInput(value, decimals) : ""
}

export const getNumberFormat = (numValue: number, type?: NumberFormatType, withSign?: boolean) => {
    const num = Math.abs(numValue)
    if (type) {
        if ((type === NumberFormatType.Precise || type === NumberFormatType.PreciseWithSign) && num > NumberFormatTypeLimit[NumberFormatType.Precise]) {
            return NumberFormat[withSign ? NumberFormatType.LgWithSign : NumberFormatType.Lg]
        }
        return NumberFormat[type]
    }
    else {
        if (num < NumberFormatTypeLimit[NumberFormatType.Sm]) {
            return NumberFormat[withSign ? NumberFormatType.SmWithSign : NumberFormatType.Sm]
        }
        else if (num < NumberFormatTypeLimit[NumberFormatType.Md]) {
            return NumberFormat[withSign ? NumberFormatType.MdWithSign : NumberFormatType.Md]
        }
        return NumberFormat[withSign ? NumberFormatType.LgWithSign : NumberFormatType.Lg]
    }
}

// todo: update abs/max checks to use bigint rather than numbers
// note: low priority as MOST whole token amounts should be lower than Number.MAX_SAFE_INTEGER
export const formattedAmountToLocale = (value?: Intl.StringNumericLiteral, type?: NumberFormatType, withSign?: boolean) => {
    return value?.trim() ? getNumberFormat(parseInt(value), type, withSign).format(value) : ""
}

export const amountToLocale = (amount: bigint, decimals: number, type?: NumberFormatType, withSign?: boolean) => {
    return amount === BigInt(0) ? "0" : formattedAmountToLocale(formatUnits(amount, decimals) as Intl.StringNumericLiteral, type, withSign)
}

export const bpsToPercent = (bps: number | bigint) => {
    return NumberFormat[NumberFormatType.Bps].format(Number(bps) / 100 / 100)
}

export const getExchangeRate = ({
    srcToken,
    srcAmount = BigInt(0),
    dstToken,
    dstAmount = BigInt(0),
}: {
    srcToken: Token,
    srcAmount?: bigint,
    dstToken: Token,
    dstAmount?: bigint,
}) => {
    const isZero = srcAmount === BigInt(0) || dstAmount === BigInt(0)
    return {
        exchangeRate: isZero ? BigInt(0) : (dstAmount * parseUnits("1", srcToken.decimals)) / srcAmount,
        inverseRate: isZero ? BigInt(0) : (srcAmount * parseUnits("1", dstToken.decimals)) / dstAmount,
    }
}

export const getPercentChangeFormatted = (srcAmount: bigint, dstAmount: bigint, decimals: number) => {
    if (srcAmount === BigInt(0) || dstAmount === BigInt(0)) {
        return "0"
    }
    return amountToLocale((parseUnits(srcAmount.toString(), decimals + 2) / dstAmount) - parseUnits("100", decimals), decimals)
}

export const getPercentDifferenceFormatted = (srcAmount: bigint, dstAmount: bigint, decimals: number, withSign?: boolean) => {
    if (srcAmount === BigInt(0) || dstAmount === BigInt(0)) {
        return "0"
    }
    return NumberFormat[withSign ? NumberFormatType.PercentWithSign : NumberFormatType.Percent].format(formatUnits(parseUnits((dstAmount - srcAmount).toString(), decimals) / srcAmount, decimals) as Intl.StringNumericLiteral)
}

////////////////////////////////////////////////////////////////////////////////
// currency

export const getCurrencyLabel = (currency: Currency) => {
    return currencyLabels[currency]
}

export const currencyToLocale = ({
    amount,
    amountFormatted,
    decimals = TokenPriceConfig.Decimals,
    currency = DefaultUserPreferences[PreferenceType.Currency],
}: {
    amount?: bigint,
    amountFormatted?: Intl.StringNumericLiteral,
    decimals?: number,
    currency?: Currency,
}) => {

    const useCurrency = currency ?? defaultCurrency
    const useAmount = amount !== undefined ? formatUnits(amount, decimals) : amountFormatted?.trim()

    if (!useAmount) {
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
