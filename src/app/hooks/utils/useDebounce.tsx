import { useEffect, useState } from "react"

// note: needs trailing comma in generic type parameter below to avoid lint issues
const useDebounce = <T,>(value: T, delayMs?: number): T => {

    const [debouncedValue, setDebouncedValue] = useState(value)
    const delay = delayMs || 300

    useEffect(() => {

        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }

    }, [value, delay])

    return debouncedValue
}

export default useDebounce
