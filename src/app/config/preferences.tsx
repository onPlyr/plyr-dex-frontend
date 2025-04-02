import { defaultNetworkMode } from "@/app/config/chains"
import { Currency } from "@/app/types/currency"
import { PreferenceType, SlippageConfig, TokenSortType, ValidUserPreferences } from "@/app/types/preferences"

export const DefaultUserPreferences: ValidUserPreferences = {
    [PreferenceType.Slippage]: SlippageConfig.DefaultBps,
    [PreferenceType.Currency]: Currency.USD,
    [PreferenceType.NetworkMode]: defaultNetworkMode,
    [PreferenceType.TokenSortType]: TokenSortType.Value,
} as const
