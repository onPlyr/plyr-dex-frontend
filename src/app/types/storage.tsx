import { UserPreferences } from "@/app/types/preferences"
import { SelectedSwapData, SwapJson } from "@/app/types/swaps"
import { FavouriteTokenData } from "@/app/types/tokens"

export enum StorageType {
    Local = "localStorage",
    Session = "sessionStorage",
}

export enum StorageDataKey {
    Preferences = "preferences",
    SwapSelection = "swap-selection",
    FavouriteTokens = "favourite-tokens",
    SwapData = "swap-data",
}

export interface StorageDataType {
    [StorageDataKey.Preferences]: UserPreferences,
    [StorageDataKey.SwapSelection]: SelectedSwapData,
    [StorageDataKey.FavouriteTokens]: FavouriteTokenData,
    [StorageDataKey.SwapData]: SwapJson[],
}
