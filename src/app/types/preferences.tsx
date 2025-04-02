import { Currency } from "@/app/types/currency"

export const NetworkMode = {
    Mainnet: "mainnet",
    Testnet: "testnet",
} as const
export type NetworkMode = (typeof NetworkMode)[keyof typeof NetworkMode]

export const TokenSortType = {
    Value: "value",
    Symbol: "symbol",
} as const
export type TokenSortType = (typeof TokenSortType)[keyof typeof TokenSortType]

export const PreferenceType = {
    Slippage: "slippage",
    Currency: "currency",
    NetworkMode: "networkMode",
    TokenSortType: "tokenSortType",
} as const
export type PreferenceType = (typeof PreferenceType)[keyof typeof PreferenceType]

export interface ValidUserPreferences {
    [PreferenceType.Slippage]: number,
    [PreferenceType.Currency]: Currency,
    [PreferenceType.NetworkMode]: NetworkMode,
    [PreferenceType.TokenSortType]: TokenSortType,
}
export type UserPreferences = ValidUserPreferences | Partial<ValidUserPreferences>

export const SlippageConfig = {
    DefaultBps: 50,
    BpsOptions: [
        {
            bps: 10,
            percent: 0.1,
            label: "0.1%",
        },
        {
            bps: 50,
            percent: 0.5,
            label: "0.5%",
        },
        {
            bps: 100,
            percent: 1,
            label: "1%",
        },
    ],
    MinBps: 0,
    MaxBps: 10000,
} as const

export const isValidSlippagePreference = (bps: number): bps is ValidUserPreferences[typeof PreferenceType.Slippage] => {
    return !Number.isNaN(bps) && bps >= SlippageConfig.MinBps && bps <= SlippageConfig.MaxBps
}

export const isValidCurrencyPreference = (currency: string): currency is ValidUserPreferences[typeof PreferenceType.Currency] => {
    return Object.values(Currency).includes(currency as Currency)
}

export const isValidNetworkModePreference = (mode: string): mode is ValidUserPreferences[typeof PreferenceType.NetworkMode] => {
    return Object.values(NetworkMode).includes(mode as NetworkMode)
}

export const isValidTokenSortTypePreference = (type: string): type is ValidUserPreferences[typeof PreferenceType.TokenSortType] => {
    return Object.values(TokenSortType).includes(type as TokenSortType)
}

export const isValidPreference = <T extends PreferenceType = PreferenceType>(type: T, value?: UserPreferences[T]): value is ValidUserPreferences[T] => {
    if (!value) {
        return false
    }
    else if (type === PreferenceType.Slippage && isValidSlippagePreference(value as number)) {
        return true
    }
    else if (type === PreferenceType.Currency && isValidCurrencyPreference(value as string)) {
        return true
    }
    else if (type === PreferenceType.NetworkMode && isValidNetworkModePreference(value as string)) {
        return true
    }
    else if (type === PreferenceType.TokenSortType && isValidTokenSortTypePreference(value as string)) {
        return true
    }
    return false
}
