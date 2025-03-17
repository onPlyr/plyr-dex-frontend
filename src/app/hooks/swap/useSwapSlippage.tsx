import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"

import { DefaultUserPreferences } from "@/app/config/preferences"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useQuoteData from "@/app/hooks/quotes/useQuoteData"
import useDebounce from "@/app/hooks/utils/useDebounce"
import { bpsToPercent } from "@/app/lib/numbers"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { isValidPreference, PreferenceType } from "@/app/types/preferences"
import { SwapQuote } from "@/app/types/swaps"

export interface UseSwapSlippageReturnType {
    slippageInput: string,
    slippageBps: number,
    setSlippageInput: (value: string) => void,
    showSlippage: boolean,
    setShowSlippage: Dispatch<SetStateAction<boolean>>,
    isValid: boolean,
    setSwapSlippage: () => void,
}

const useSwapSlippage = ({
    swap,
    setSwap,
}: {
    swap?: SwapQuote,
    setSwap: Dispatch<SetStateAction<SwapQuote | undefined>>,
}): UseSwapSlippageReturnType => {

    const { preferences, setPreference } = usePreferences()
    const { selectedQuote, useSwapQuotesData } = useQuoteData()
    const { setNotification } = useNotifications()

    const [slippageInput, setSlippageInput] = useState(((preferences[PreferenceType.Slippage] ?? DefaultUserPreferences[PreferenceType.Slippage]) / 100).toString())
    const [slippageBps, setSlippageBps] = useState(preferences[PreferenceType.Slippage] ?? DefaultUserPreferences[PreferenceType.Slippage])
    const [showSlippage, setShowSlippage] = useState(false)
    const [isValid, setIsValid] = useState(isValidPreference(PreferenceType.Slippage, slippageBps))
    const [isRefetchTriggered, setIsRefetchTriggered] = useState(false)
    const slippageInputDebounced = useDebounce(slippageInput)

    useEffect(() => {

        const slippageBps = slippageInputDebounced ? Math.floor(parseFloat(slippageInputDebounced) * 100) : undefined
        const isValid = slippageBps !== undefined && isValidPreference(PreferenceType.Slippage, slippageBps)

        if (isValid) {
            setSlippageBps(slippageBps)
        }
        setIsValid(isValid)

    }, [slippageInputDebounced])

    useEffect(() => {
        if (swap && isRefetchTriggered && !useSwapQuotesData.isInProgress) {
            setNotification({
                id: "slippage-changed",
                type: selectedQuote ? NotificationType.Success : NotificationType.Error,
                header: selectedQuote ? "Quote Updated" : "Error Updating Quote",
                body: `${selectedQuote ? "Best quote selected" : "No quotes found"} using updated max. slippage tolerance of ${bpsToPercent(slippageBps)}`,
                status: selectedQuote ? NotificationStatus.Success : NotificationStatus.Error,
            })
            setSwap(selectedQuote)
            setIsRefetchTriggered(false)
        }
    }, [useSwapQuotesData.isInProgress, isRefetchTriggered])

    const setSwapSlippage = useCallback(() => {
        if (isValid) {
            setPreference(PreferenceType.Slippage, slippageBps)
            setShowSlippage(false)
            useSwapQuotesData.refetch()
            setIsRefetchTriggered(true)
            setNotification({
                id: "slippage-changed",
                type: NotificationType.Pending,
                header: "Slippage Updated",
                body: `Refetching routes using updated max. slippage tolerance of ${bpsToPercent(slippageBps)}`,
                status: NotificationStatus.Pending,
            })
        }
    }, [setPreference, useSwapQuotesData, setNotification, slippageBps, setShowSlippage, isValid, setIsRefetchTriggered])

    return {
        slippageInput,
        slippageBps,
        setSlippageInput,
        showSlippage,
        setShowSlippage,
        isValid,
        setSwapSlippage,
    }
}

export default useSwapSlippage