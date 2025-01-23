import { Currency } from "@/app/config/numbers"
import { ChainId } from "@/app/types/chains"

// note: slippage is bps
export enum PreferenceType {
    DarkMode = "darkMode",
    DirectRouteOnly = "directRouteOnly",
    ExcludeChains = "excludeChains",
    ExcludeChainIds = "excludeChainIds",
    Slippage = "slippage",
    Currency = "currency",
}

export interface UserPreferences {
    [PreferenceType.DarkMode]?: boolean,
    [PreferenceType.DirectRouteOnly]?: boolean,
    [PreferenceType.ExcludeChains]?: boolean,
    [PreferenceType.ExcludeChainIds]?: ChainId[],
    [PreferenceType.Slippage]?: number,
    [PreferenceType.Currency]?: Currency,
}

export type UserPreferencesContextType = {
    preferences: UserPreferences,
    setUserPreferences: (preferences: UserPreferences) => void,
    validatePreference: (key: PreferenceType, preferences: UserPreferences) => boolean,
    validateAllPreferences: (preferences: UserPreferences) => boolean,
}
