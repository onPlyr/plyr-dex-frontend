import { useContext } from "react"

import { SwapHistoryContext } from "@/app/providers/SwapHistoryProvider"

const useSwapHistory = () => {
    return useContext(SwapHistoryContext)
}

export default useSwapHistory
