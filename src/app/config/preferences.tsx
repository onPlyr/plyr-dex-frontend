import { Currency } from "@/app/types/currency"
import { NetworkMode, PreferenceType, SlippageConfig, TokenSortType, ValidUserPreferences } from "@/app/types/preferences"

export const DefaultUserPreferences: ValidUserPreferences = {
    [PreferenceType.Slippage]: SlippageConfig.DefaultBps,
    [PreferenceType.Currency]: Currency.USD,
    [PreferenceType.NetworkMode]: process.env.NEXT_PUBLIC_NETWORK_MODE === "mainnet" ? NetworkMode.Mainnet : NetworkMode.Testnet,
    [PreferenceType.TokenSortType]: TokenSortType.Value,
} as const
