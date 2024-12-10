import { ChainId } from "@/app/types/chains"

// note: slippage is bps
export enum PreferenceType {
    DarkMode = "darkMode",
    DirectRouteOnly = "directRouteOnly",
    ExcludeChains = "excludeChains",
    ExcludeChainIds = "excludeChainIds",
    Slippage = "slippage",
}

export interface UserPreferences {
    [PreferenceType.DarkMode]?: boolean,
    [PreferenceType.DirectRouteOnly]?: boolean,
    [PreferenceType.ExcludeChains]?: boolean,
    [PreferenceType.ExcludeChainIds]?: ChainId[],
    [PreferenceType.Slippage]?: number,
}

export type UserPreferencesContextType = {
    preferences: UserPreferences,
    setUserPreferences: (preferences: UserPreferences) => void,
    validatePreference: (key: PreferenceType, preferences: UserPreferences) => boolean,
    validateAllPreferences: (preferences: UserPreferences) => boolean,
}
