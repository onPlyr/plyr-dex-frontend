import { useContext } from "react"

import { SwapDataContext } from "@/app/providers/SwapDataProvider"

const useSwapData = () => {
    return useContext(SwapDataContext)
}

export default useSwapData
