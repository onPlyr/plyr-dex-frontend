import { useState } from "react"
import { Address, Hash } from "viem"

import { swapStatusPollIntervalMs, swapStatusPollNumRefetches } from "@/app/config/swaps"
import useAccountData from "@/app/hooks/account/useAccountData"
import useInterval from "@/app/hooks/utils/useInterval"

// todo: tidy up and remove test logging
// todo: add limit on number of swaps to query at a time, got myself rate limited
// todo: update status function to query multiple swaps at a time
// todo: move watch hook call on account history page outside of item loop so only called once for the account rather one for each swap

const useWatchSwapStatus = ({
    accountAddress,
    txid,
    _enabled = true,
}: {
    accountAddress?: Address,
    txid?: Hash,
    _enabled?: boolean,
}) => {

    const [isConfirmed, setIsConfirmed] = useState<boolean>(false)
    const [refetchNum, setRefetchNum] = useState<number>(0)

    const { history: accountHistoryData } = useAccountData()
    const { getSwapHistory, updateSwapHistoryStatus } = accountHistoryData
    const swapHistory = getSwapHistory(txid)

    const enabled = _enabled !== false && isConfirmed !== true && refetchNum <= swapStatusPollNumRefetches && accountAddress !== undefined && swapHistory !== undefined && swapHistory.status === "pending"

    console.log(">>> useWatchSwapStatus enabled: " + enabled)
    console.log(">>> useWatchSwapStatus isConfirmed: " + isConfirmed)

    useInterval(() => {
        console.log(">>> useWatchSwapStatus refetchNum: " + refetchNum)
        if (enabled) {
            updateSwapHistoryStatus(swapHistory)
        }
        if (swapHistory && swapHistory.status !== "pending") {
            setIsConfirmed(true)
        }
        setRefetchNum(refetchNum + 1)
    }, enabled ? swapStatusPollIntervalMs : undefined)

    return swapHistory
}

export default useWatchSwapStatus
