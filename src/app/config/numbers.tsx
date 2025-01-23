export const numberFormatBaseOptions: Intl.NumberFormatOptions = {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
    roundingMode: "floor",
    notation: "standard",
}

export const smNumberFormatMax = 1
export const mdNumberFormatMax = 100
export const preciseNumberFormatMax = 1000000

export const smNumberFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    maximumFractionDigits: 4,
    maximumSignificantDigits: 4,
})
export const mdNumberFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    maximumFractionDigits: 4,
})
export const lgNumberFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    maximumFractionDigits: 2,
})
export const preciseNumberFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    maximumFractionDigits: 8,
})
export const exactNumberFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    maximumFractionDigits: 18,
})
export const zeroDecimalFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    minimumFractionDigits: 1,
})
export const inputDecimalFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    maximumFractionDigits: 18,
    useGrouping: false,
})

export enum NumberFormatType {
    Precise = "precise",
    Exact = "exact",
    ZeroDecimal = "zeroDecimal",
    Input = "input",
}
export const numberFormats: Record<NumberFormatType, Intl.NumberFormat> = {
    [NumberFormatType.Precise]: preciseNumberFormat,
    [NumberFormatType.Exact]: exactNumberFormat,
    [NumberFormatType.ZeroDecimal]: zeroDecimalFormat,
    [NumberFormatType.Input]: inputDecimalFormat,
}

export const percentFormat = new Intl.NumberFormat(undefined, {
    ...numberFormatBaseOptions,
    style: "percent",
    maximumFractionDigits: 2,
})
export const bpsFormat = new Intl.NumberFormat(undefined, {
    ...percentFormat,
    minimumFractionDigits: 2,
})

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
    ...numberFormatBaseOptions,
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
