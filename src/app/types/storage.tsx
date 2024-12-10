import { UserPreferences } from "@/app/types/preferences"
import { SelectedSwapData, SwapHistoryData } from "@/app/types/swaps"
import { FavouriteTokenData } from "./tokens"

export enum StorageType {
    Local = "localStorage",
    Session = "sessionStorage",
}

export enum StorageDataKey {
    Preferences = "preferences",
    History = "account-history",
    SwapSelection = "swap-selection",
    FavouriteTokens = "favourite-tokens",
}

export interface StorageDataType {
    [StorageDataKey.Preferences]: UserPreferences,
    [StorageDataKey.History]: SwapHistoryData,
    [StorageDataKey.SwapSelection]: SelectedSwapData,
    [StorageDataKey.FavouriteTokens]: FavouriteTokenData,
}
