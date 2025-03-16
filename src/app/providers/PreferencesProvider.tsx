"use client"

import { useCallback, useEffect, useState } from "react"

import { Currency } from "@/app/config/numbers"
import { defaultPreferences } from "@/app/config/preferences"
import { isPreference, PreferencesContext, validateBoolean, validateCurrency, validateNetworkMode, validateSlippage } from "@/app/lib/preferences"
import { getStorageItem, isStorageAvailable, setStorageItem } from "@/app/lib/storage"
import { NetworkMode, PreferenceType, UserPreferences, UserPreferencesContextType } from "@/app/types/preferences"
import { StorageDataKey, StorageType } from "@/app/types/storage"

const PreferencesProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const storageKey = StorageDataKey.Preferences
    const storageType = StorageType.Local
    const enabled = isStorageAvailable(storageType)

    const getPreferences = useCallback(() => {
        const data = getStorageItem(storageKey, storageType)
        return data ? data as UserPreferences : undefined
    }, [storageKey, enabled, storageType])

    const setPreferences = useCallback((preferences: UserPreferences) => {
        setStorageItem(storageKey, preferences, storageType)
    }, [storageKey, enabled, storageType])

    const validatePreference = useCallback((key: PreferenceType, preferences: UserPreferences) => {
        if (isPreference(key)) {
            if (key === PreferenceType.Slippage) {
                return validateSlippage(preferences[PreferenceType.Slippage])
            }
            else if (key === PreferenceType.Currency) {
                return validateCurrency(preferences[PreferenceType.Currency])
            }
            else if (key === PreferenceType.NetworkMode) {
                return validateNetworkMode(preferences[PreferenceType.NetworkMode])
            }
            else if (key === PreferenceType.DarkMode || 
                     key === PreferenceType.DirectRouteOnly || 
                     key === PreferenceType.ExcludeChains) {
                return validateBoolean(preferences[key])
            }
        }
        return false
    }, [validateSlippage, validateBoolean, validateNetworkMode])

    const validateAllPreferences = useCallback((preferences: UserPreferences) => {
        return Object.keys(preferences).every((key) => validatePreference(key as PreferenceType, preferences) === true)
    }, [validatePreference])

    const getValidPreferenceOrDefault = useCallback((key: PreferenceType, preferences?: UserPreferences) => {
        return preferences?.[key] !== undefined && validatePreference(key, preferences) ? preferences[key] : defaultPreferences[key]
    }, [validatePreference, defaultPreferences])

    const getInitialPreferences = useCallback(() => {

        const preferences: UserPreferences = {}
        const storagePreferences = getPreferences()

        Object.values(PreferenceType).forEach((key) => {
            if (key === PreferenceType.Slippage) {
                const value = getValidPreferenceOrDefault(key, storagePreferences)
                preferences[PreferenceType.Slippage] = value !== undefined ? value as number : undefined
            }
            else if (key === PreferenceType.Currency) {
                const value = getValidPreferenceOrDefault(key, storagePreferences)
                preferences[PreferenceType.Currency] = value !== undefined ? value as Currency : undefined
            }
            else if (key === PreferenceType.NetworkMode) {
                const value = getValidPreferenceOrDefault(key, storagePreferences)
                preferences[PreferenceType.NetworkMode] = value !== undefined ? value as NetworkMode : undefined
            }
            else if (key === PreferenceType.DarkMode || key === PreferenceType.DirectRouteOnly || key === PreferenceType.ExcludeChains) {
                const value = getValidPreferenceOrDefault(key, storagePreferences)
                preferences[key] = value !== undefined ? value as boolean : undefined
            }
        })

        return preferences

    }, [storageKey, getPreferences, validatePreference, getValidPreferenceOrDefault, defaultPreferences])

    const initialPreferences = getInitialPreferences()
    const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(initialPreferences)

    // todo: add checks for validation errors and present to the user if found
    const setUserPreferences = useCallback((preferences: UserPreferences) => {
        if (validateAllPreferences(preferences)) {
            setUserPreferencesState(preferences)
            setPreferences(preferences)
        }
    }, [setUserPreferencesState, setPreferences])

    useEffect(() => {
        if (enabled) {
            const preferences = getInitialPreferences()
            setUserPreferences(preferences)
        }
    }, [enabled])

    const context: UserPreferencesContextType = {
        preferences: userPreferences,
        setUserPreferences: setUserPreferences,
        validatePreference: validatePreference,
        validateAllPreferences: validateAllPreferences,
    }

    return (
        <PreferencesContext.Provider value={context} >
            {children}
        </PreferencesContext.Provider>
    )
}

export default PreferencesProvider
