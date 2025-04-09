import { useCallback, useEffect, useMemo, useState } from "react"
import { QueryStatus } from "@tanstack/query-core"

import { ApiProviderData } from "@/app/config/apis"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import { getApiUrl } from "@/app/lib/apis"
import { ApiProvider, ApiProviderTokenData, ApiResult, ApiRoute, ApiRouteType, ApiTokenPairData } from "@/app/types/apis"
import { PreferenceType } from "@/app/types/preferences"

export interface UseApiTokenDataReturnType {
    data: ApiProviderTokenData,
    isInProgress: boolean,
    status: QueryStatus,
    error?: string,
    refetch: () => void,
}

const useApiTokenData = (): UseApiTokenDataReturnType => {

    const { getPreference } = usePreferences()
    const networkMode = useMemo(() => getPreference(PreferenceType.NetworkMode), [getPreference])

    const [tokenData, setTokenData] = useState<ApiProviderTokenData>({})
    const [isInProgress, setIsInProgress] = useState(false)
    const [queryStatus, setQueryStatus] = useState<QueryStatus>("pending")
    const [errorMsg, setErrorMsg] = useState("")

    const getApiTokenData = useCallback(async () => {

        const tokenData: ApiProviderTokenData = {}
        let errorMsg = ""

        try {

            setIsInProgress(true)
            setQueryStatus("pending")

            for (const provider of Object.values(ApiProvider)) {

                const providerData = ApiProviderData[provider]
                if (!providerData.routes[ApiRouteType.App]?.[ApiRoute.Pairs]) {
                    continue
                }

                for (const chainId of providerData.supportedChains) {

                    const url = getApiUrl({
                        provider: provider,
                        networkMode: networkMode,
                        route: ApiRoute.Pairs,
                        type: ApiRouteType.App,
                        params: {
                            chain: chainId,
                        },
                    })

                    if (!url) {
                        continue
                    }

                    const result = await fetch(url).then((response) => response.json() as Promise<ApiResult>).then((result) => result.data ? result.data as ApiTokenPairData : undefined)
                    if (!result) {
                        continue
                    }

                    if (!tokenData[provider]) {
                        tokenData[provider] = {}
                    }

                    tokenData[provider][chainId] = result
                }
            }
        }

        catch (err) {
            errorMsg = `Error fetching api token data: ${err}`
        }

        finally {
            setIsInProgress(false)
            setTokenData(tokenData)
            setQueryStatus(errorMsg ? "error" : "success")
            setErrorMsg(errorMsg)
        }

    }, [networkMode, setTokenData, setIsInProgress, setQueryStatus, setErrorMsg])

    useEffect(() => {
        getApiTokenData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        data: tokenData,
        isInProgress: isInProgress,
        status: queryStatus,
        error: errorMsg,
        refetch: getApiTokenData,
    }
}

export default useApiTokenData