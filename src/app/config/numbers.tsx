export const numberFormatBaseOptions: Intl.NumberFormatOptions = {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
    roundingMode: "floor",
    notation: "standard",
}

export const smNumberFormatMax = 1
export const mdNumberFormatMax = 100

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

export enum NumberFormatType {
    Precise = "precise",
    Exact = "exact",
}
export const numberFormats: Record<NumberFormatType, Intl.NumberFormat> = {
    [NumberFormatType.Precise]: preciseNumberFormat,
    [NumberFormatType.Exact]: exactNumberFormat,
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
