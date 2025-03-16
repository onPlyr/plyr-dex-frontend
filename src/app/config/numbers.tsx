import { BaseNumberFormatOptions } from "@/app/types/numbers"

// todo: move to currency specific file, replace enum with const as const
export enum Currency {
    Usd = "usd",
    Eur = "eur",
    Gbp = "gbp",
}
export const defaultCurrency = Currency.Usd
export const currencyLabels: Record<Currency, string> = {
    [Currency.Usd]: "USD",
    [Currency.Eur]: "EUR",
    [Currency.Gbp]: "GBP",
}

export const currencyFormatBaseOptions: Intl.NumberFormatOptions = {
    ...BaseNumberFormatOptions,
    style: "currency",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}
export const usdFormat = new Intl.NumberFormat(undefined, {
    ...currencyFormatBaseOptions,
    currency: Currency.Usd,
})
export const eurFormat = new Intl.NumberFormat(undefined, {
    ...currencyFormatBaseOptions,
    currency: Currency.Eur,
})
export const gbpFormat = new Intl.NumberFormat(undefined, {
    ...currencyFormatBaseOptions,
    currency: Currency.Gbp,
})
export const currencyFormats: Record<Currency, Intl.NumberFormat> = {
    [Currency.Usd]: usdFormat,
    [Currency.Eur]: eurFormat,
    [Currency.Gbp]: gbpFormat,
}
