import { useEffect, useRef } from "react"

const useInterval = (callback: () => void, intervalMs?: number) => {

    const savedCallback = useRef(callback)

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {

        if (intervalMs === undefined) {
            return
        }

        const intervalId = setInterval(() => {
            savedCallback.current()
        }, intervalMs)

        return () => {
            clearInterval(intervalId)
        }
    }, [intervalMs])
}

export default useInterval
