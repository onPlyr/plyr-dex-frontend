import { createContext, useCallback, useEffect, useState } from "react"
import { Hash } from "viem"

import { getStorageItem, isStorageAvailable, setStorageItem } from "@/app/lib/storage"
import { getSwapFromJson, getSwapJsonFromSwap } from "@/app/lib/swaps"
import { StorageDataKey, StorageType } from "@/app/types/storage"
import { Swap, SwapJson } from "@/app/types/swaps"

interface SwapDataContextType {
    data: Swap[],
    pendingData: Hash[],
    getSwap: (txHash?: Hash) => Swap | undefined,
    setSwap: (swap?: Swap) => void,
    refetch: () => void,
}

export const SwapDataContext = createContext({} as SwapDataContextType)

const sortSwapData = (data: Swap[]) => {
    return data.sort((a, b) => a.timestamp && b.timestamp ? b.timestamp - a.timestamp : 0)
}

const SwapDataProvider = ({
    children,
}: {
    children: React.ReactNode,
}) => {

    const storageKey = StorageDataKey.SwapData
    const storageType = StorageType.Local
    const storageAvailable = isStorageAvailable(storageType)

    const [swapData, setSwapData] = useState<Swap[]>([])
    const [pendingSwapData, setPendingSwapData] = useState<Hash[]>([])

    const getStoredSwapData = useCallback(() => {

        const data: Swap[] = []
        const storageData = getStorageItem(storageKey, storageType)

        if (storageData) {
            for (const swapJson of (storageData as SwapJson[])) {
                const swap = getSwapFromJson(swapJson)
                if (swap) {
                    data.push(swap)
                }
            }
            sortSwapData(data)
        }

        return data

    }, [storageKey, storageType])

    useEffect(() => {
        if (storageAvailable) {
            setSwapData(getStoredSwapData())
        }
    }, [storageAvailable, getStoredSwapData])

    const getSwap = useCallback((txHash?: Hash) => {
        return txHash ? swapData.find((swap) => swap.id.toLowerCase() === txHash.toLowerCase()) : undefined
    }, [swapData])

    const setSwap = useCallback((swap?: Swap) => {
        if (swap) {
            setSwapData((prevData) => {
                return sortSwapData([
                    ...prevData.filter((data) => data.id.toLowerCase() !== swap.id.toLowerCase()),
                    swap,
                ])
            })
        }
    }, [setSwapData])

    useEffect(() => {
        if (storageAvailable && swapData.length > 0) {
            const swapJson = swapData.map((swap) => getSwapJsonFromSwap(swap)).filter((data) => data !== undefined)
            setStorageItem(storageKey, swapJson, storageType)
        }
    }, [storageKey, storageType, storageAvailable, swapData])

    useEffect(() => {
        setPendingSwapData(swapData.filter((swap) => swap.status !== "success").map((swap) => swap.id))
    }, [swapData])

    const context: SwapDataContextType = {
        data: swapData,
        pendingData: pendingSwapData,
        getSwap: getSwap,
        setSwap: setSwap,
        refetch: getStoredSwapData,
    }

    return (
        <SwapDataContext.Provider value={context} >
            {children}
        </SwapDataContext.Provider>
    )
}

export default SwapDataProvider
