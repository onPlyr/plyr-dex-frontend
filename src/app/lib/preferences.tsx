import { createContext } from "react"

import { Currency } from "@/app/config/numbers"
import { defaultPreferences } from "@/app/config/preferences"
import { maxSlippageBps, minSlippageBps } from "@/app/config/swaps"
import { NetworkMode, PreferenceType, UserPreferencesContextType } from "@/app/types/preferences"

export const PreferencesContext = createContext({
    preferences: defaultPreferences,
} as UserPreferencesContextType)

export const isPreference = (value?: string) => {
    return value !== undefined && value.length !== 0 && Object.values(PreferenceType).includes(value as PreferenceType)
}

export const validateSlippage = (value?: number) => {
    return value !== undefined && Number.isNaN(value) !== true && value >= minSlippageBps && value <= maxSlippageBps
}

export const validateBoolean = (value?: boolean) => {
    return value === undefined || typeof(value) === "boolean"
}

export const validateCurrency = (value?: string) => {
    return value === undefined || (Object.values(Currency) as string[]).includes(value)
}

export const validateNetworkMode = (value?: string) => {
    return value === undefined || (Object.values(NetworkMode) as string[]).includes(value)
}
