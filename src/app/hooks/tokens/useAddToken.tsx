import { useCallback, useEffect, useState } from "react"
import { Address, getAddress } from "viem"

import { defaultNetworkMode } from "@/app/config/chains"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokens from "@/app/hooks/tokens/useTokens"
import useDebounce from "@/app/hooks/utils/useDebounce"
import { getFilteredChains } from "@/app/lib/chains"
import { getParsedError, isValidAddress } from "@/app/lib/utils"
import { Chain, ChainId } from "@/app/types/chains"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { PreferenceType } from "@/app/types/preferences"
import { Token } from "@/app/types/tokens"

export interface TokenQueryResult {
    chain: Chain,
    token?: Token,
    isExisting?: boolean,
}

type TokenQueryResultData = {
    [id in ChainId]?: TokenQueryResult
}

export interface DataStatus {
    msg: string,
    isInProgress?: boolean,
    isError?: boolean,
    isSuccess?: boolean,
}

export interface UseAddTokenReturnType {
    allChains: Chain[],
    address?: Address,
    addressStatus: DataStatus,
    tokenQueryResults: TokenQueryResultData,
    tokenQueryStatus: DataStatus,
    selectedResult?: TokenQueryResult,
    setSelectedResult: (chain?: Chain) => void,
    selectedResultStatus: DataStatus,
    addToken: () => void,
    clearInput: () => void,
}

const useAddToken = ({
    addressInput,
    setAddressInput,
    onSuccess,
    onError,
}: {
    addressInput?: string,
    setAddressInput: (value?: string) => void,
    onSuccess?: (token?: Token) => void,
    onError?: (token?: Token) => void,
}): UseAddTokenReturnType => {

    const { getToken, setCustomToken, getContractTokenData } = useTokens()
    const { setNotification } = useNotifications()
    const { preferences } = usePreferences()
    const allChains = getFilteredChains(preferences[PreferenceType.NetworkMode] ?? defaultNetworkMode).filter((chain) => !chain.isDisabled)

    const [address, setAddress] = useState<Address>()
    const addressDebounced = useDebounce(addressInput?.trim() ?? "")
    const [addressStatus, setAddressStatus] = useState<DataStatus>({
        msg: "",
    })

    const [tokenQueryResults, setTokenQueryResults] = useState<TokenQueryResultData>({})
    const [tokenQueryStatus, setTokenQueryStatus] = useState<DataStatus>({
        msg: "",
    })
    const isTokenQueryEnabled = !!address && !!addressStatus.isSuccess

    const [selectedResult, setSelectedResultState] = useState<TokenQueryResult>()
    const [selectedResultStatus, setSelectedResultStatus] = useState<DataStatus>({
        msg: "",
    })

    const setSelectedResult = useCallback((chain?: Chain) => {
        setSelectedResultState(chain && tokenQueryResults[chain.id])
    }, [tokenQueryResults, setSelectedResultState])

    useEffect(() => {

        const inProgressMsg = addressStatus.isInProgress ? addressStatus.msg : tokenQueryStatus.isInProgress ? tokenQueryStatus.msg : ""
        const errorMsg = inProgressMsg ? "" : addressStatus.isError ? addressStatus.msg : tokenQueryStatus.isError ? tokenQueryStatus.msg : !selectedResult?.token ? "Invalid token" : selectedResult.isExisting ? "Already exists" : ""
        const successMsg = inProgressMsg || errorMsg ? "" : addressStatus.isSuccess && tokenQueryStatus.isSuccess && selectedResult?.token && !selectedResult.isExisting ? `Add ${selectedResult.token.symbol}` : ""

        setSelectedResultStatus({
            msg: inProgressMsg || successMsg || errorMsg || "Error",
            isInProgress: !!inProgressMsg,
            isSuccess: !!successMsg,
            isError: !!errorMsg,
        })

    }, [addressStatus, tokenQueryStatus, selectedResult])

    useEffect(() => {

        const isInProgress = !!addressInput && addressInput !== addressDebounced
        const isValid = !isInProgress && isValidAddress(addressDebounced)
        const isError = !isInProgress && !!addressDebounced && !isValid

        setAddress(isValid ? getAddress(addressDebounced) : undefined)
        setAddressStatus({
            msg: !addressInput ? "Enter address" : isInProgress ? "Validating address" : isValid ? "Address valid" : isError ? "Invalid address" : "",
            isInProgress: isInProgress,
            isError: isError,
            isSuccess: isValid,
        })

    }, [addressInput, addressDebounced])

    const addToken = useCallback(() => {

        if (!selectedResultStatus.isSuccess || !selectedResult || !selectedResult.token || selectedResult.isExisting) {
            setNotification({
                id: "add-token-error",
                type: NotificationType.Error,
                header: `Add ${selectedResult?.token?.symbol ?? "Token"} Error`,
                body: selectedResultStatus.msg || "An unknown error occurred.",
                status: NotificationStatus.Error,
            })
            onError?.(selectedResult?.token)
            return
        }

        setCustomToken(selectedResult.token)
        setNotification({
            id: selectedResult.token.id,
            type: NotificationType.Success,
            header: `Added ${selectedResult.token.symbol}`,
            body: `${selectedResult.token.symbol} was successfully added on ${selectedResult.chain.name}.`,
            status: NotificationStatus.Success,
        })
        onSuccess?.(selectedResult.token)

    }, [onSuccess, onError, setCustomToken, setNotification, selectedResult, selectedResultStatus])

    const getCustomTokenQueryResults = useCallback(async () => {

        const results: TokenQueryResultData = {}

        let successMsg = ""
        let errorMsg = ""

        try {

            if (!address || !isTokenQueryEnabled) {
                return
            }

            setTokenQueryStatus({
                msg: "Fetching token data",
                isInProgress: true,
            })

            for (const queryChain of allChains) {

                const tokenData = getToken({
                    address: address,
                    chainId: queryChain.id,
                })
                const token = tokenData.isUnconfirmed ? await getContractTokenData(tokenData) : tokenData

                results[queryChain.id] = {
                    chain: queryChain,
                    token: token,
                    isExisting: !tokenData.isUnconfirmed,
                }
            }

            const numTokens = Object.values(results).filter((data) => !!data.token).length
            successMsg = numTokens > 0 ? `${numTokens} token${numTokens > 1 ? "s" : ""} found` : ""
            errorMsg = numTokens === 0 ? "No tokens found" : ""
        }

        catch (err) {
            errorMsg = getParsedError(err)
        }

        finally {
            setTokenQueryResults(results)
            setTokenQueryStatus({
                msg: successMsg || errorMsg || "",
                isSuccess: !!successMsg,
                isError: !!errorMsg,
            })
        }

    }, [getToken, getContractTokenData, allChains, address, isTokenQueryEnabled, setTokenQueryResults, setTokenQueryStatus])

    useEffect(() => {
        getCustomTokenQueryResults()
    }, [address, isTokenQueryEnabled])

    useEffect(() => {
        if (!tokenQueryStatus.isInProgress) {
            setSelectedResult(Object.values(tokenQueryResults).find((data) => !!data.token)?.chain)
        }
    }, [tokenQueryResults, tokenQueryStatus])

    const clearInput = useCallback(() => {
        setAddressInput("")
        setAddress(undefined)
        setSelectedResult(undefined)
    }, [setAddressInput, setAddress, setSelectedResult])

    return {
        allChains: allChains,
        address: address,
        addressStatus: addressStatus,
        tokenQueryResults: tokenQueryResults,
        tokenQueryStatus: tokenQueryStatus,
        selectedResult: selectedResult,
        setSelectedResult: setSelectedResult,
        selectedResultStatus: selectedResultStatus,
        addToken: addToken,
        clearInput: clearInput,
    }
}

export default useAddToken
