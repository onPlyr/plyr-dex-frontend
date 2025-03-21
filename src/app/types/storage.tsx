import { UserPreferences } from "@/app/types/preferences"
import { FavouriteTokenData } from "@/app/types/tokens"

export enum StorageType {
    Local = "localStorage",
    Session = "sessionStorage",
}

export enum StorageDataKey {
    Preferences = "preferences",
    // SwapSelection = "swap-selection",
    FavouriteTokens = "favourite-tokens",
    // SwapData = "swap-data",
}

export interface StorageDataType {
    [StorageDataKey.Preferences]: UserPreferences,
    // [StorageDataKey.SwapSelection]: SelectedSwapData,
    [StorageDataKey.FavouriteTokens]: FavouriteTokenData,
    // [StorageDataKey.SwapData]: SwapJson[],
}

export const CustomStorageEventName = {
    LocalStorage: "local-storage",
    SessionStorage: "session-storage",
} as const
export type CustomStorageEventName = (typeof CustomStorageEventName)[keyof typeof CustomStorageEventName]
export type CustomStorageEvent = StorageEvent

export const StorageKey = {
    SwapHistory: "swap-history",
    SwapRoute: "swap-route",
    UserPreferences: "app-preferences",
    ShowIntro: "show-intro",
    CustomTokens: "custom-tokens",
} as const
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey]