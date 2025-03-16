import { useCallback, useEffect, useState } from "react"
import { QueryStatus } from "@tanstack/query-core"
import { useAccount } from "wagmi"

import { defaultSlippageBps } from "@/app/config/swaps"
import useApiData from "@/app/hooks/apis/useApiData"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { getSwapQuoteData } from "@/app/lib/swaps"
import { CellRouteData, CellRouteDataParameter } from "@/app/types/cells"
import { PreferenceType } from "@/app/types/preferences"
import { isValidSwapRoute, SwapQuoteData, SwapRoute } from "@/app/types/swaps"

export interface UseSwapQuotesReturnType {
    data?: SwapQuoteData,
    isInProgress: boolean,
    status: QueryStatus,
    error?: string,
    refetch: () => void,
}

const useSwapQuotes = (route?: SwapRoute): UseSwapQuotesReturnType => {

    const { address: accountAddress } = useAccount()
    const { getApiTokenPair } = useApiData()
    const { preferences } = usePreferences()
    const slippage = BigInt(preferences[PreferenceType.Slippage] || defaultSlippageBps)
    const enabled = !(!route || !isValidSwapRoute(route))

    const [swapQuoteData, setSwapQuoteData] = useState<SwapQuoteData>()
    const [cellRouteData, setCellRouteData] = useState<CellRouteData>()
    const [isInProgress, setIsInProgress] = useState(false)
    const [queryStatus, setQueryStatus] = useState<QueryStatus>("pending")
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (slippage) {
            setCellRouteData({
                [CellRouteDataParameter.SlippageBips]: slippage,
            })
        }
    }, [slippage])

    const getSwapQuotes = useCallback(async () => {

        if (!enabled) {
            return
        }

        let swapQuoteData: SwapQuoteData | undefined = undefined
        let errorMsg = ""

        try {

            setIsInProgress(true)
            setQueryStatus("pending")

            const { data, error } = await getSwapQuoteData({
                route: route,
                getApiTokenPair: getApiTokenPair,
                cellRouteData: cellRouteData,
            })

            if (error || !data) {
                throw new Error(error || "getSwapQuoteData returned no data")
            }

            swapQuoteData = data
        }

        catch (err) {
            errorMsg = `Error Fetching Routes: ${err}`
        }

        finally {
            setIsInProgress(false)
            setSwapQuoteData(swapQuoteData)
            setQueryStatus(errorMsg ? "error" : "success")
            setErrorMsg(errorMsg)
        }

    }, [enabled, route, accountAddress, getApiTokenPair, cellRouteData, setSwapQuoteData, setIsInProgress, setQueryStatus, setErrorMsg])

    useEffect(() => {
        setSwapQuoteData(undefined)
        if (enabled) {
            getSwapQuotes()
        }
    }, [enabled, route])

    return {
        data: swapQuoteData,
        isInProgress: isInProgress,
        status: queryStatus,
        error: errorMsg,
        refetch: getSwapQuotes,
    }
}

export default useSwapQuotes
