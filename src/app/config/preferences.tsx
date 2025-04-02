import { defaultCurrency } from "@/app/config/numbers"
import { defaultNetworkMode } from "@/app/config/chains"
import { PreferenceType, SlippageConfig, TokenSortType, ValidUserPreferences } from "@/app/types/preferences"

export const DefaultUserPreferences: ValidUserPreferences = {
    [PreferenceType.Slippage]: SlippageConfig.DefaultBps,
    [PreferenceType.Currency]: defaultCurrency,
    [PreferenceType.NetworkMode]: defaultNetworkMode,
    [PreferenceType.TokenSortType]: TokenSortType.Value,
} as const
