"use client"

import { createContext, useCallback } from "react"

import { DefaultUserPreferences } from "@/app/config/preferences"
import useLocalStorage from "@/app/hooks/utils/useLocalStorage"
import { isValidPreference, PreferenceType, UserPreferences, UserPreferenceValueType } from "@/app/types/preferences"
import { StorageKey } from "@/app/types/storage"

type SetPreferenceFunction = (key: PreferenceType, value: UserPreferenceValueType) => boolean
interface UserPreferencesContextType {
    preferences: UserPreferences,
    setPreference: SetPreferenceFunction,
}

export const PreferencesContext = createContext({} as UserPreferencesContextType)

const PreferencesProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const [userPreferences, setUserPreferences] = useLocalStorage({
        key: StorageKey.UserPreferences,
        initialValue: DefaultUserPreferences,
    })

    const setPreference: SetPreferenceFunction = useCallback((key: PreferenceType, value: UserPreferenceValueType) => {

        const isValid = isValidPreference(key, value)
        if (!isValid) {
            return false
        }

        setUserPreferences((prev) => ({
            ...prev,
            [key]: value,
        }))

        return true

    }, [setUserPreferences])

    const context: UserPreferencesContextType = {
        preferences: userPreferences,
        setPreference: setPreference,
    }

    return (
        <PreferencesContext.Provider value={context} >
            {children}
        </PreferencesContext.Provider>
    )
}

export default PreferencesProvider