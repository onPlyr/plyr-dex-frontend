export const NumberFormatType = {
    Sm: "sm",
    SmWithSign: "smWithSign",
    Md: "md",
    MdWithSign: "mdWithSign",
    Lg: "lg",
    LgWithSign: "lgWithSign",
    Precise: "precise",
    PreciseWithSign: "preciseWithSign",
    Exact: "exact",
    ZeroWithDecimal: "zeroWithDecimal",
    Input: "input",
    Percent: "percent",
    PercentWithSign: "percentWithSign",
    Bps: "bps",
} as const
export type NumberFormatType = (typeof NumberFormatType)[keyof typeof NumberFormatType]

export const BaseNumberFormatOptions: Intl.NumberFormatOptions = {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 18,
    roundingMode: "floor",
    notation: "standard",
} as const

const WithSignNumberFormatOptions: Intl.NumberFormatOptions = {
    signDisplay: "always",
} as const

const PercentNumberFormatOptions: Intl.NumberFormatOptions = {
    style: "percent",
} as const

export interface AnimatedNumberFormatOptions extends Omit<Intl.NumberFormatOptions, "notation"> {
    notation: "standard",
}

export const NumberFormatOptions: Record<NumberFormatType, Intl.NumberFormatOptions | AnimatedNumberFormatOptions> = {
    [NumberFormatType.Sm]: {
        ...BaseNumberFormatOptions,
        maximumFractionDigits: 4,
        maximumSignificantDigits: 4,
    },
    [NumberFormatType.SmWithSign]: {
        ...BaseNumberFormatOptions,
        ...WithSignNumberFormatOptions,
        maximumFractionDigits: 4,
        maximumSignificantDigits: 4,
    },
    [NumberFormatType.Md]: {
        ...BaseNumberFormatOptions,
        maximumFractionDigits: 4,
    },
    [NumberFormatType.MdWithSign]: {
        ...BaseNumberFormatOptions,
        ...WithSignNumberFormatOptions,
        maximumFractionDigits: 4,
    },
    [NumberFormatType.Lg]: {
        ...BaseNumberFormatOptions,
        maximumFractionDigits: 2,
    },
    [NumberFormatType.LgWithSign]: {
        ...BaseNumberFormatOptions,
        ...WithSignNumberFormatOptions,
        maximumFractionDigits: 2,
    },
    [NumberFormatType.Precise]: {
        ...BaseNumberFormatOptions,
        maximumFractionDigits: 8,
    },
    [NumberFormatType.PreciseWithSign]: {
        ...BaseNumberFormatOptions,
        ...WithSignNumberFormatOptions,
        maximumFractionDigits: 8,
    },
    [NumberFormatType.Exact]: {
        ...BaseNumberFormatOptions,
        maximumFractionDigits: 18,
    },
    [NumberFormatType.ZeroWithDecimal]: {
        ...BaseNumberFormatOptions,
        minimumFractionDigits: 1,
    },
    [NumberFormatType.Input]: {
        ...BaseNumberFormatOptions,
        useGrouping: false,
        notation: "standard",
    },
    [NumberFormatType.Percent]: {
        ...BaseNumberFormatOptions,
        ...PercentNumberFormatOptions,
        maximumFractionDigits: 2,
    },
    [NumberFormatType.PercentWithSign]: {
        ...BaseNumberFormatOptions,
        ...PercentNumberFormatOptions,
        ...WithSignNumberFormatOptions,
        maximumFractionDigits: 2,
    },
    [NumberFormatType.Bps]: {
        ...BaseNumberFormatOptions,
        ...PercentNumberFormatOptions,
        minimumFractionDigits: 2,
    },
} as const
export type NumberFormatOptions = (typeof NumberFormatOptions)[keyof typeof NumberFormatOptions]

export const NumberFormat: Record<NumberFormatType, Intl.NumberFormat> = {
    [NumberFormatType.Sm]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Sm]),
    [NumberFormatType.SmWithSign]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.SmWithSign]),
    [NumberFormatType.Md]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Md]),
    [NumberFormatType.MdWithSign]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.MdWithSign]),
    [NumberFormatType.Lg]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Lg]),
    [NumberFormatType.LgWithSign]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.LgWithSign]),
    [NumberFormatType.Precise]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Precise]),
    [NumberFormatType.PreciseWithSign]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.PreciseWithSign]),
    [NumberFormatType.Exact]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Exact]),
    [NumberFormatType.ZeroWithDecimal]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.ZeroWithDecimal]),
    [NumberFormatType.Input]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Input]),
    [NumberFormatType.Percent]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Percent]),
    [NumberFormatType.PercentWithSign]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.PercentWithSign]),
    [NumberFormatType.Bps]: new Intl.NumberFormat(undefined, NumberFormatOptions[NumberFormatType.Bps]),
} as const
export type NumberFormat = (typeof NumberFormat)[keyof typeof NumberFormat]

export const NumberFormatTypeLimit = {
    [NumberFormatType.Sm]: 1,
    [NumberFormatType.Md]: 100,
    [NumberFormatType.Precise]: 1000000,
} as const
export type NumberFormatTypeLimit = (typeof NumberFormatTypeLimit)[keyof typeof NumberFormatTypeLimit]
