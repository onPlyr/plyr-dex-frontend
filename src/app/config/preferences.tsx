import { defaultCurrency } from "@/app/config/numbers"
import { defaultSlippageBps } from "@/app/config/swaps"
import { PreferenceType, UserPreferences } from "@/app/types/preferences"

export const defaultPreferences: UserPreferences = {
    [PreferenceType.Slippage]: defaultSlippageBps,
    [PreferenceType.Currency]: defaultCurrency,
}
