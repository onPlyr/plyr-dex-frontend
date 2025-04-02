import { useIsomorphicLayoutEffect } from "motion/react"
import { useCallback, useState } from "react"

const isAvailable = typeof window !== "undefined"

const useMediaQuery = (query: string, defaultValue?: boolean) => {

    const getMatches = useCallback((query: string) => {
        return isAvailable ? window.matchMedia(query).matches : defaultValue
    }, [defaultValue])

    const [matches, setMatches] = useState(getMatches(query))

    const handleChange = useCallback(() => {
        setMatches(getMatches(query))
    }, [query, setMatches, getMatches])

    useIsomorphicLayoutEffect(() => {

        const matchMedia = window.matchMedia(query)
        handleChange()

        // Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
        if (matchMedia.addListener) {
            matchMedia.addListener(handleChange)
        } else {
            matchMedia.addEventListener("change", handleChange)
        }

        return () => {
            if (matchMedia.removeListener) {
                matchMedia.removeListener(handleChange)
            }
            else {
                matchMedia.removeEventListener("change", handleChange)
            }
        }
    }, [query])

    return matches
}

export default useMediaQuery
