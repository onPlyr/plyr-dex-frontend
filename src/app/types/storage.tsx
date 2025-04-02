export const StorageKey = {
    SwapHistory: "swap-history",
    SwapRoute: "swap-route",
    UserPreferences: "app-preferences",
    ShowIntro: "show-intro",
    CustomTokens: "custom-tokens",
    FavouriteTokens: "favourite-tokens"
} as const
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey]

export const CustomStorageEventName = {
    LocalStorage: "local-storage",
    SessionStorage: "session-storage",
} as const
export type CustomStorageEventName = (typeof CustomStorageEventName)[keyof typeof CustomStorageEventName]
export type CustomStorageEvent = StorageEvent
