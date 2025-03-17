import { Currency } from "@/app/config/numbers"

export const NetworkMode = {
    Mainnet: "mainnet",
    Testnet: "testnet",
} as const
export type NetworkMode = (typeof NetworkMode)[keyof typeof NetworkMode]

export const PreferenceType = {
    Slippage: "slippage",
    Currency: "currency",
    NetworkMode: "networkMode",
} as const
export type PreferenceType = (typeof PreferenceType)[keyof typeof PreferenceType]

export type UserPreferenceValueType = number | Currency | NetworkMode | string
export type UserPreferenceType = number | Currency | NetworkMode

export interface UserPreferences {
    [PreferenceType.Slippage]?: number,
    [PreferenceType.Currency]?: Currency,
    [PreferenceType.NetworkMode]?: NetworkMode,
}

export const SlippageConfig = {
    DefaultBps: 10,
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

export const isValidSlippagePreference = (bps: number): bps is number => {
    return !Number.isNaN(bps) && bps >= SlippageConfig.MinBps && bps <= SlippageConfig.MaxBps
}

export const isValidCurrencyPreference = (currency: string): currency is Currency => {
    return Object.values(Currency).includes(currency as Currency)
}

export const isValidNetworkModePreference = (mode: string): mode is NetworkMode => {
    return Object.values(NetworkMode).includes(mode as NetworkMode)
}

export const isValidPreference = (key: PreferenceType, value: UserPreferenceValueType): value is UserPreferenceType => {
    if (key === PreferenceType.Slippage && isValidSlippagePreference(value as number)) {
        return true
    }
    else if (key === PreferenceType.Currency && isValidCurrencyPreference(value as string)) {
        return true
    }
    else if (key === PreferenceType.NetworkMode && isValidNetworkModePreference(value as string)) {
        return true
    }
    return false
}