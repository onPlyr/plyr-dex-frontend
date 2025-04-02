import { useState } from "react"

const usePrevious = <T,>(value?: T): T | undefined => {

    const [current, setCurrent] = useState(value)
    const [previous, setPrevious] = useState<T>()

    if (value !== current) {
        setPrevious(current)
        setCurrent(value)
    }

    return previous
}

export default usePrevious
