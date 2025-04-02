"use client"

import { createContext, useCallback } from "react"

import { DefaultUserPreferences } from "@/app/config/preferences"
import useLocalStorage from "@/app/hooks/utils/useLocalStorage"
import { isValidPreference, PreferenceType, UserPreferences, ValidUserPreferences } from "@/app/types/preferences"
import { StorageKey } from "@/app/types/storage"

type GetPreferenceFunction = <T extends PreferenceType = PreferenceType>(type: T) => ValidUserPreferences[T]
type GetPreferenceValueFunction = <T extends PreferenceType = PreferenceType>(type: T, data: UserPreferences) => ValidUserPreferences[T]
type SetPreferenceFunction = <T extends PreferenceType = PreferenceType>(type: T, value?: UserPreferences[T]) => boolean
interface UserPreferencesContextType {
    preferences: UserPreferences,
    getPreference: GetPreferenceFunction,
    setPreference: SetPreferenceFunction,
}

export const PreferencesContext = createContext({} as UserPreferencesContextType)

const getValidPreferenceValue: GetPreferenceValueFunction = (type, data) => isValidPreference(type, data[type]) ? data[type] : DefaultUserPreferences[type]
const preferencesSerializer = (data: UserPreferences): string => JSON.stringify(Object.fromEntries(Object.values(PreferenceType).map((type) => [type, getValidPreferenceValue(type, data)])))
const preferencesDeserializer = (data: string): ValidUserPreferences => ({
    ...DefaultUserPreferences,
    ...(JSON.parse(data) as UserPreferences),
})

const PreferencesProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const [userPreferences, setUserPreferences] = useLocalStorage({
        key: StorageKey.UserPreferences,
        initialValue: DefaultUserPreferences,
        options: {
            serializer: preferencesSerializer,
            deserializer: preferencesDeserializer,
        },
    })

    const getPreference: GetPreferenceFunction = useCallback((type) => getValidPreferenceValue(type, userPreferences), [userPreferences])
    const setPreference: SetPreferenceFunction = useCallback((type, value) => {

        const isValid = isValidPreference(type, value)
        if (!isValid) {
            return false
        }

        setUserPreferences((prev) => ({
            ...prev,
            [type]: value,
        }))

        return true

    }, [setUserPreferences])

    const context: UserPreferencesContextType = {
        preferences: userPreferences,
        getPreference: getPreference,
        setPreference: setPreference,
    }

    return (
        <PreferencesContext.Provider value={context} >
            {children}
        </PreferencesContext.Provider>
    )
}

export default PreferencesProvider
