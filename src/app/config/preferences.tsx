import { defaultCurrency } from "@/app/config/numbers"
import { defaultNetworkMode } from "@/app/config/chains"
import { PreferenceType, SlippageConfig, TokenSortType, UserPreferences } from "@/app/types/preferences"

export const DefaultUserPreferences: Required<UserPreferences> = {
    [PreferenceType.Slippage]: SlippageConfig.DefaultBps,
    [PreferenceType.Currency]: defaultCurrency,
    [PreferenceType.NetworkMode]: defaultNetworkMode,
    [PreferenceType.TokenSortType]: TokenSortType.Value,
} as const