import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"

import useEventListener from "@/app/hooks/utils/useEventListener"
import { CustomStorageEvent, CustomStorageEventName, StorageKey } from "@/app/types/storage"

declare global {
    interface WindowEventMap {
        [CustomStorageEventName.LocalStorage]: CustomStorageEvent,
    }
}

const isAvailable = typeof window !== "undefined"

interface UseLocalStorageOptions<T> {
    serializer?: (value: T) => string,
    deserializer?: (value: string) => T,
}

const useLocalStorage = <T,>({
    key,
    initialValue,
    options = {},
}: {
    key: StorageKey,
    initialValue: T | (() => T),
    options?: UseLocalStorageOptions<T>,
}): [T, Dispatch<SetStateAction<T>>, () => void] => {

    const serializer = useCallback((value: T) => {
        return options.serializer?.(value) ?? JSON.stringify(value)
    }, [options])

    const deserializer = useCallback((value: string) => {

        if (options.deserializer) {
            return options.deserializer(value)
        }

        if (value === "undefined") {
            return undefined as unknown as T
        }

        let parsedValue: unknown = undefined
        const defaultValue = initialValue instanceof Function ? initialValue() : initialValue

        try {
            parsedValue = JSON.parse(value)
        }
        catch (error) {
            console.warn(`useLocalStorage error parsing json: ${error}`)
            return defaultValue
        }

        return parsedValue as T

    }, [options, initialValue])

    const readValue = useCallback((): T => {

        const useInitialValue = initialValue instanceof Function ? initialValue() : initialValue

        if (!isAvailable) {
            return useInitialValue
        }

        try {
            const value = window.localStorage.getItem(key)
            return value ? deserializer(value) : useInitialValue
        }
        catch (error) {
            console.warn(`useLocalStorage error reading value of ${key}: ${error}`)
            return useInitialValue
        }

    }, [key, initialValue, deserializer])

    const [storedValue, setStoredValue] = useState(() => readValue())

    const setValue: Dispatch<SetStateAction<T>> = useCallback(<T,>(value: T) => {

        if (!isAvailable) {
            return
        }

        try {
            const newValue = value instanceof Function ? value(readValue()) : value
            window.localStorage.setItem(key, serializer(newValue))
            setStoredValue(newValue)
            window.dispatchEvent(new StorageEvent(CustomStorageEventName.LocalStorage, { key }))
        }
        catch (error) {
            console.warn(`useLocalStorage error storing value of ${key}: ${error}`)
        }

    }, [key, serializer, readValue])

    const removeValue = useCallback(() => {
        const defaultValue = initialValue instanceof Function ? initialValue() : initialValue
        window.localStorage.removeItem(key)
        setStoredValue(defaultValue)
        window.dispatchEvent(new StorageEvent(CustomStorageEventName.LocalStorage, { key }))
    }, [key, initialValue])

    useEffect(() => {
        setStoredValue(readValue())
    }, [key])

    const handleStorageChange = useCallback((event: CustomStorageEvent) => {
        if (event.key && event.key !== key) {
            return
        }
        setStoredValue(readValue())
    }, [key, readValue])

    useEventListener("storage", handleStorageChange)
    useEventListener(CustomStorageEventName.LocalStorage, handleStorageChange)

    return [storedValue, setValue, removeValue]
}

export default useLocalStorage
