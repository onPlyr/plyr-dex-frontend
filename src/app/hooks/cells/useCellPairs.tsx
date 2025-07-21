import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import useApiData from "@/app/hooks/apis/useApiData"
import useApiTokenData from "@/app/hooks/apis/useApiTokenData"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getNetworkModeChainIds } from "@/app/lib/chains"
import { getDexalotPairs, getUniV2Pairs } from "@/app/lib/pairs"
import { PreferenceType } from "@/app/types/preferences"
import { CellTokenPairs } from "@/app/types/tokens"

const useCellPairs = () => {

    const { tokens } = useTokens()
    const { getPreference } = usePreferences()
    const networkMode = useMemo(() => getPreference(PreferenceType.NetworkMode), [getPreference])
    const chainIds = useMemo(() => getNetworkModeChainIds(networkMode), [networkMode])
    const { data: apiTokenData } = useApiTokenData()
    const { getApiTokenPair } = useApiData()

    const { data: uniV2Pairs, refetch: refetchUniV2Pairs } = useQuery({
        queryKey: ["uniV2Pairs", chainIds, tokens],
        queryFn: async () => getUniV2Pairs({
            chainIds: chainIds,
            tokens: tokens,
        }),
    })

    const { data: dexalotPairs, refetch: refetchDexalotPairs } = useQuery({
        queryKey: ["dexalotPairs", chainIds, tokens, apiTokenData, getApiTokenPair],
        queryFn: async () => getDexalotPairs({
            chainIds: chainIds,
            tokens: tokens,
            getApiTokenPair: getApiTokenPair,
        }),
    })

    const pairs: CellTokenPairs = useMemo(() => new Map([...uniV2Pairs ?? [], ...dexalotPairs ?? []]), [uniV2Pairs, dexalotPairs])
    const refetch = useCallback(() => {
        refetchUniV2Pairs()
        refetchDexalotPairs()
    }, [refetchUniV2Pairs, refetchDexalotPairs])

    return {
        data: pairs,
        refetch: refetch,
    }
}

export default useCellPairs